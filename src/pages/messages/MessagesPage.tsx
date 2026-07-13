import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../components/ui/Avatar';
import { User } from '../../types';
import api from '../../lib/api';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (!user) return null;

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center animate-fade-in">
        <p className="text-gray-500">Loading contacts...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
      <div className="h-full overflow-y-auto">
        <div className="py-4 px-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Messages</h2>

          {users.length > 0 ? (
            <div className="space-y-1">
              {users.map(otherUser => (
                <div
                  key={otherUser.id}
                  className="px-4 py-3 flex items-center cursor-pointer hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  onClick={() => navigate(`/chat/${otherUser.id}`)}
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
                  <div className="text-xs text-gray-400">
                    Click to chat
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <h2 className="text-xl font-medium text-gray-900">No contacts yet</h2>
              <p className="text-gray-600 text-center mt-2">
                Connect with entrepreneurs and investors to start conversations
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
