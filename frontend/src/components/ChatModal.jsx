import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { chatAPI } from '../lib/API';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User, MessageCircle } from 'lucide-react';

const ChatModal = ({ open, onOpenChange, listing, otherUser }) => {
  const { user } = useAuth();
  const { 
    socket, 
    isConnected, 
    sendMessage, 
    sendTyping, 
    stopTyping, 
    joinListing, 
    leaveListing 
  } = useSocket();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when modal opens
  useEffect(() => {
    if (open && listing && otherUser && isConnected) {
      loadChatHistory();
      joinListing(listing._id);
      
      // Join conversation
      const messageListener = (event) => {
        const message = event.detail;
        if (message.listingId === listing._id && 
            (message.sender._id === otherUser._id || message.receiver._id === otherUser._id)) {
          setMessages(prev => [...prev, message]);
        }
      };
      
      const typingListener = (event) => {
        const { listingId, userId, typing } = event.detail;
        if (listingId === listing._id && userId === otherUser._id) {
          setOtherUserTyping(typing);
        }
      };

      window.addEventListener('new-message', messageListener);
      window.addEventListener('user-typing', typingListener);

      return () => {
        window.removeEventListener('new-message', messageListener);
        window.removeEventListener('user-typing', typingListener);
        leaveListing(listing._id);
      };
    }
  }, [open, listing, otherUser, isConnected]);

  // Clean up when modal closes
  useEffect(() => {
    if (!open && listing) {
      leaveListing(listing._id);
      setMessages([]);
      setOtherUserTyping(false);
    }
  }, [open, listing]);

  const loadChatHistory = async () => {
    if (!listing || !otherUser) return;
    
    try {
      setLoading(true);
      const response = await chatAPI.getChatHistory(listing._id, otherUser._id);
      setMessages(response.data || []);
      
      // Mark messages as read
      await chatAPI.markAsRead(listing._id, otherUser._id);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !listing || !otherUser) return;

    try {
      sendMessage(listing._id, otherUser._id, newMessage.trim());
      setNewMessage('');
      stopTyping(listing._id, otherUser._id);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (value) => {
    setNewMessage(value);
    
    if (!typing && value.trim()) {
      setTyping(true);
      sendTyping(listing._id, otherUser._id);
      
      // Stop typing after 2 seconds of inactivity
      setTimeout(() => {
        setTyping(false);
        stopTyping(listing._id, otherUser._id);
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

  if (!listing || !otherUser) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat with {otherUser.firstName} {otherUser.lastName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          {/* Listing Info */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-green-600 text-white text-sm">
                  {getInitials(otherUser.firstName, otherUser.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {otherUser.firstName} {otherUser.lastName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {otherUser.userType} • {listing.product?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {listing.location?.county}, {listing.location?.subCounty}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 mb-4">
            <div className="space-y-3 p-2">
              {loading ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => {
                  const isCurrentUser = message.sender._id === user.id;
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
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
                  <div className="bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 px-3 py-2 rounded-lg">
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

          {/* Connection Status */}
          {!isConnected && (
            <div className="text-center text-sm text-amber-600 dark:text-amber-400 mt-2">
              Reconnecting to chat server...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;