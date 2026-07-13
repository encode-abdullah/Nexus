import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Message } from '../../types';
import api from '../../lib/api';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data.users.filter((u: User) => u.id !== user?.id));
      } catch {
        // fallback empty
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchUsers();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectUser = async (otherUser: User) => {
    setSelectedUser(otherUser);
    setMessages([]);
    setNewMessage('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedUser) return;

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      receiverId: selectedUser.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage('');
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center animate-fade-in">
        <p className="text-gray-500">Loading contacts...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fade-in flex">
      {/* Contacts sidebar */}
      <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 border-r border-gray-200`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {users.map(otherUser => (
                <div
                  key={otherUser.id}
                  className={`px-4 py-3 flex items-center cursor-pointer transition-colors duration-200 ${
                    selectedUser?.id === otherUser.id
                      ? 'bg-primary-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectUser(otherUser)}
                >
                  <Avatar
                    src={otherUser.avatarUrl}
                    alt={otherUser.name}
                    size="md"
                    status={otherUser.isOnline ? 'online' : 'offline'}
                    className="mr-3 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{otherUser.name}</h3>
                    <p className="text-xs text-gray-500 capitalize">{otherUser.role}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center px-4">
              <MessageCircle size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No contacts yet</p>
              <p className="text-sm text-gray-400 mt-1">Connect with others to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat panel */}
      <div className={`${selectedUser ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="border-b border-gray-200 px-4 py-3 flex items-center gap-3">
              <button
                className="md:hidden p-1 hover:bg-gray-100 rounded"
                onClick={() => setSelectedUser(null)}
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <Avatar
                src={selectedUser.avatarUrl}
                alt={selectedUser.name}
                size="sm"
                status={selectedUser.isOnline ? 'online' : 'offline'}
              />
              <div>
                <h3 className="text-sm font-medium text-gray-900">{selectedUser.name}</h3>
                <p className="text-xs text-gray-500">
                  {selectedUser.isOnline ? 'Online' : 'Last seen recently'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.length > 0 ? (
                <div className="space-y-3">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                          msg.senderId === user.id
                            ? 'bg-primary-600 text-white rounded-br-md'
                            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${msg.senderId === user.id ? 'text-primary-200' : 'text-gray-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="bg-gray-200 p-4 rounded-full mb-3">
                    <MessageCircle size={28} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No messages yet</p>
                  <p className="text-xs text-gray-400 mt-1">Send a message to start the conversation</p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-3">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  fullWidth
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newMessage.trim()}
                  className="rounded-full p-2 w-10 h-10 flex items-center justify-center flex-shrink-0"
                >
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
            <div className="bg-gray-200 p-6 rounded-full mb-4">
              <MessageCircle size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-700">Select a conversation</h2>
            <p className="text-gray-500 mt-1 text-sm">Choose a contact from the list to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};
