import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, Users, Calendar, Building2, MapPin, UserCircle, FileText, DollarSign, Send } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { createCollaborationRequest, getRequestsFromInvestor } from '../../data/collaborationRequests';
import { Entrepreneur } from '../../types';
import api from '../../lib/api';

export const EntrepreneurProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [entrepreneur, setEntrepreneur] = useState<Entrepreneur | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        const response = await api.get(`/users/${id}`);
        setEntrepreneur(response.data.user);
      } catch {
        setEntrepreneur(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
      </div>
    );
  }

  if (!entrepreneur || entrepreneur.role !== 'entrepreneur') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Entrepreneur not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">The entrepreneur profile you're looking for doesn't exist or has been removed.</p>
        <Link to="/dashboard/investor">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const isCurrentUser = currentUser?.id === entrepreneur._id;
  const isInvestor = currentUser?.role === 'investor';

  const hasRequestedCollaboration = isInvestor && id
    ? getRequestsFromInvestor(currentUser!.id).some(req => req.entrepreneurId === id)
    : false;

  const handleSendRequest = () => {
    if (isInvestor && currentUser && id) {
      createCollaborationRequest(
        currentUser.id,
        id,
        `I'm interested in learning more about ${entrepreneur.startupName} and would like to explore potential investment opportunities.`
      );
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardBody className="sm:flex sm:items-start sm:justify-between p-6">
          <div className="sm:flex sm:space-x-6">
            <Avatar
              src={entrepreneur.avatarUrl}
              alt={entrepreneur.name}
              size="xl"
              status={entrepreneur.isOnline ? 'online' : 'offline'}
              className="mx-auto sm:mx-0"
            />

            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{entrepreneur.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center sm:justify-start mt-1">
                <Building2 size={16} className="mr-1" />
                Founder at {entrepreneur.startupName}
              </p>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                <Badge variant="primary">{entrepreneur.industry}</Badge>
                <Badge variant="gray">
                  <MapPin size={14} className="mr-1" />
                  {entrepreneur.location}
                </Badge>
                <Badge variant="accent">
                  <Calendar size={14} className="mr-1" />
                  Founded {entrepreneur.foundedYear}
                </Badge>
                <Badge variant="secondary">
                  <Users size={14} className="mr-1" />
                  {entrepreneur.teamSize} team members
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
            {!isCurrentUser && (
              <>
                <Link to={`/chat/${entrepreneur._id}`}>
                  <Button variant="outline" leftIcon={<MessageCircle size={18} />}>
                    Message
                  </Button>
                </Link>

                {isInvestor && (
                  <Button
                    leftIcon={<Send size={18} />}
                    disabled={hasRequestedCollaboration}
                    onClick={handleSendRequest}
                  >
                    {hasRequestedCollaboration ? 'Request Sent' : 'Request Collaboration'}
                  </Button>
                )}
              </>
            )}

            {isCurrentUser && (
              <Link to="/settings">
                <Button variant="outline" leftIcon={<UserCircle size={18} />}>
                  Edit Profile
                </Button>
              </Link>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">About</h2>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700 dark:text-gray-300">{entrepreneur.bio}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Startup Overview</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">Problem Statement</h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    {entrepreneur?.pitchSummary?.split('.')[0]}.
                  </p>
                </div>
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">Solution</h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{entrepreneur.pitchSummary}</p>
                </div>
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">Market Opportunity</h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    The {entrepreneur.industry} market is experiencing significant growth, with a projected CAGR of 14.5% through 2027.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Team</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">{entrepreneur.teamSize} members</span>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                  <Avatar src={entrepreneur.avatarUrl} alt={entrepreneur.name} size="md" className="mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{entrepreneur.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Founder & CEO</p>
                  </div>
                </div>
                {entrepreneur.teamSize > 1 && (
                  <div className="flex items-center justify-center p-3 border border-dashed border-gray-200 dark:border-gray-700 rounded-md">
                    <p className="text-sm text-gray-500 dark:text-gray-400">+ {entrepreneur.teamSize - 1} more team members</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Funding</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Current Round</span>
                  <div className="flex items-center mt-1">
                    <DollarSign size={18} className="text-accent-600 mr-1" />
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{entrepreneur.fundingNeeded}</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Documents</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-md mr-3">
                    <FileText size={18} className="text-primary-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Pitch Deck</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Updated 2 months ago</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </div>

              {!isCurrentUser && isInvestor && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Request access to detailed documents and financials by sending a collaboration request.
                  </p>
                  {!hasRequestedCollaboration ? (
                    <Button className="mt-3 w-full" onClick={handleSendRequest}>
                      Request Collaboration
                    </Button>
                  ) : (
                    <Button className="mt-3 w-full" disabled>
                      Request Sent
                    </Button>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
