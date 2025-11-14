import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { chatAPI } from '../lib/API';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Search, User, Send, ArrowLeft, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLocation, useNavigate } from 'react-router-dom';

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    socket, 
    isConnected, 
    sendMessage, 
    sendTyping, 
    stopTyping, 
    joinListing, 
    leaveListing 
  } = useSocket();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle navigation state from marketplace
  useEffect(() => {
    if (location.state?.startConversation) {
      const { listingId, otherUserId, listing } = location.state;
      
      // Look for an existing conversation with this listing and user
      const existingConversation = conversations.find(conv =>
        conv.listingId === listingId &&
        conv.otherUser._id === otherUserId
      );
      
      if (existingConversation) {
        // Select the existing conversation
        setSelectedConversation(existingConversation);
      } else {
        // Create a conversation object using the listing data from marketplace
        const newConversation = {
          listingId: listingId,
          otherUser: listing?.userId || {
            _id: otherUserId,
            firstName: 'User',
            lastName: '',
            userType: 'user'
          },
          listing: {
            'product.name': listing?.product?.name || 'Product Listing',
            'location.county': listing?.location?.county || '',
            'location.subCounty': listing?.location?.subCounty || ''
          },
          lastMessage: null,
          unreadCount: 0,
          isNew: true // Flag to indicate this is a new conversation
        };
        
        setSelectedConversation(newConversation);
      }
      
      // Clear the navigation state
      navigate('/messages', { replace: true });
    }
  }, [location, navigate, conversations]);
  
  

  // Set up real-time messaging for selected conversation
  useEffect(() => {
    if (selectedConversation && isConnected) {
      loadChatHistory();
      joinListing(selectedConversation.listingId);
      
      const messageListener = (event) => {
        const message = event.detail;
        if (message.listingId === selectedConversation.listingId && 
            (message.sender._id === selectedConversation.otherUser._id || 
             message.receiver._id === selectedConversation.otherUser._id)) {
          setMessages(prev => [...prev, message]);
        }
      };
      
      const typingListener = (event) => {
        const { listingId, userId, typing } = event.detail;
        if (listingId === selectedConversation.listingId && userId === selectedConversation.otherUser._id) {
          setOtherUserTyping(typing);
        }
      };

      window.addEventListener('new-message', messageListener);
      window.addEventListener('user-typing', typingListener);

      return () => {
        window.removeEventListener('new-message', messageListener);
        window.removeEventListener('user-typing', typingListener);
        leaveListing(selectedConversation.listingId);
      };
    }
  }, [selectedConversation, isConnected]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const API = import.meta.env.VITE_API_URI || 'http://localhost:5000';
      
      const response = await fetch(`${API}/api/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        setError('Failed to load conversations');
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = async () => {
    if (!selectedConversation) return;
    
    try {
      setMessagesLoading(true);
      const response = await chatAPI.getChatHistory(
        selectedConversation.listingId, 
        selectedConversation.otherUser._id
      );
      setMessages(response.data || []);
      
      // Mark messages as read
      await chatAPI.markAsRead(selectedConversation.listingId, selectedConversation.otherUser._id);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
    setOtherUserTyping(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      sendMessage(
        selectedConversation.listingId, 
        selectedConversation.otherUser._id, 
        newMessage.trim()
      );
      setNewMessage('');
      stopTyping(selectedConversation.listingId, selectedConversation.otherUser._id);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (value) => {
    setNewMessage(value);
    
    if (!typing && value.trim() && selectedConversation) {
      setTyping(true);
      sendTyping(selectedConversation.listingId, selectedConversation.otherUser._id);
      
      // Stop typing after 2 seconds of inactivity
      setTimeout(() => {
        setTyping(false);
        stopTyping(selectedConversation.listingId, selectedConversation.otherUser._id);
      }, 2000);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatConversationTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      conversation.listing['product.name']?.toLowerCase().includes(searchLower) ||
      conversation.otherUser.firstName?.toLowerCase().includes(searchLower) ||
      conversation.otherUser.lastName?.toLowerCase().includes(searchLower) ||
      conversation.lastMessage?.message?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg text-gray-700 dark:text-gray-300">Loading your messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 h-[calc(100vh-120px)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        
        {/* Conversations Sidebar */}
        <div className={`lg:col-span-1 ${selectedConversation ? 'hidden lg:block' : 'block'}`}>
          <Card className="h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <MessageCircle className="h-5 w-5" />
                Messages
                {filteredConversations.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filteredConversations.length}
                  </Badge>
                )}
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100%-120px)]">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {searchTerm ? 'No matching conversations' : 'No conversations yet'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm 
                        ? 'Try adjusting your search terms' 
                        : 'Start a conversation by contacting a seller or buyer from the marketplace'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 p-4">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.listingId}
                        onClick={() => handleSelectConversation(conversation)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation?.listingId === conversation.listingId
                            ? 'bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {getInitials(conversation.otherUser.firstName, conversation.otherUser.lastName)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {conversation.listing['product.name'] || 'Product Listing'}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            with {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                          </p>
                          
                          {conversation.lastMessage && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                              {conversation.lastMessage.message}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                          {conversation.lastMessage && (
                            formatConversationTime(conversation.lastMessage.timestamp)
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className={`lg:col-span-2 ${!selectedConversation ? 'hidden lg:block' : 'block'}`}>
          {selectedConversation ? (
            <Card className="h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden p-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-green-600 text-white">
                      {getInitials(selectedConversation.otherUser.firstName, selectedConversation.otherUser.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {selectedConversation.otherUser.firstName} {selectedConversation.otherUser.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedConversation.otherUser.userType} • {selectedConversation.listing['product.name']}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {selectedConversation.listing['location.county']}, {selectedConversation.listing['location.subCounty']}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span className="text-xs">Connected</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600">
                        <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
                        <span className="text-xs">Connecting...</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messagesLoading ? (
                      <div className="text-center text-gray-500">Loading messages...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isCurrentUser = message.sender._id === user._id;
                        return (
                          <div
                            key={message._id}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isCurrentUser
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isCurrentUser ? 'text-green-100' : 'text-gray-500'
                                }`}
                              >
                                {formatTime(message.sentAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    {otherUserTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t border-gray-200 dark:border-gray-600 p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        value={newMessage}
                        onChange={(e) => handleTyping(e.target.value)}
                        placeholder={isConnected ? "Type a message..." : "Connecting..."}
                        disabled={!isConnected}
                        className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || !isConnected}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Choose a conversation from the sidebar to start chatting
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Messages;