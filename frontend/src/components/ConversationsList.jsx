import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { chatAPI } from '../lib/API';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User } from 'lucide-react';

const ConversationsList = ({ onSelectConversation }) => {
  const { notifications } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConversations();
    
    // Set up event listeners for real-time updates
    const messageListener = () => {
      loadConversations(); // Refresh conversations when new message arrives
    };
    
    window.addEventListener('new-message', messageListener);
    
    return () => {
      window.removeEventListener('new-message', messageListener);
    };
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getConversations();
      setConversations(response.data || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">Loading conversations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Conversations
          {conversations.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {conversations.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {conversations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No conversations yet</p>
              <p className="text-sm">Start chatting with buyers or sellers</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <div
                  key={`${conversation.listingId}-${conversation.otherUser._id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => onSelectConversation(conversation)}
                >
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {getInitials(conversation.otherUser.firstName, conversation.otherUser.lastName)}
                    </div>
                  </div>
                  
                  {/* Conversation Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(conversation.lastMessage.sentAt)}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conversation.listing['product.name']}
                      </p>
                      <div className="flex items-center gap-2">
                        {conversation.otherUser.userType === 'farmer' && (
                          <Badge variant="outline" className="text-xs">
                            Seller
                          </Badge>
                        )}
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-green-600 text-white text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {conversation.lastMessage.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ConversationsList;