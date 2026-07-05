import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Check, X, Video, Trash2 } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Meeting {
  _id: string;
  title: string;
  description: string;
  participants: Array<{ _id: string; name: string; email: string; avatarUrl: string }>;
  startTime: string;
  endTime: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  meetingLink?: string;
}

export const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    participantEmail: ''
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await api.get('/meetings');
      setMeetings(response.data.meetings);
    } catch {
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async () => {
    if (!newMeeting.title || !newMeeting.startTime || !newMeeting.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await api.post('/meetings', {
        title: newMeeting.title,
        description: newMeeting.description,
        startTime: newMeeting.startTime,
        endTime: newMeeting.endTime,
        participants: []
      });
      toast.success('Meeting created successfully');
      setShowCreateModal(false);
      setNewMeeting({ title: '', description: '', startTime: '', endTime: '', participantEmail: '' });
      fetchMeetings();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create meeting');
    }
  };

  const handleStatusUpdate = async (meetingId: string, status: string) => {
    try {
      await api.put(`/meetings/${meetingId}/status`, { status });
      toast.success(`Meeting ${status}`);
      fetchMeetings();
    } catch {
      toast.error('Failed to update meeting');
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    try {
      await api.delete(`/meetings/${meetingId}`);
      toast.success('Meeting deleted');
      fetchMeetings();
    } catch {
      toast.error('Failed to delete meeting');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'cancelled': return 'gray';
      default: return 'gray';
    }
  };

  const pendingMeetings = meetings.filter(m => m.status === 'pending');
  const acceptedMeetings = meetings.filter(m => m.status === 'accepted');
  const pastMeetings = meetings.filter(m => m.status === 'rejected' || m.status === 'cancelled');

  if (loading) {
    return <div className="text-center py-12"><p className="text-gray-500">Loading meetings...</p></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600">Schedule and manage your meetings</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setShowCreateModal(true)}>
          Schedule Meeting
        </Button>
      </div>

      {/* Pending Meetings */}
      {pendingMeetings.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Pending Invitations</h2>
            <Badge variant="warning">{pendingMeetings.length}</Badge>
          </CardHeader>
          <CardBody className="space-y-4">
            {pendingMeetings.map(meeting => (
              <div key={meeting._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-50 rounded-full">
                    <Calendar size={20} className="text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{meeting.title}</h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(meeting.startTime), 'MMM d, yyyy h:mm a')} - {format(new Date(meeting.endTime), 'h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" leftIcon={<Check size={16} />} onClick={() => handleStatusUpdate(meeting._id, 'accepted')}>
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" leftIcon={<X size={16} />} onClick={() => handleStatusUpdate(meeting._id, 'rejected')}>
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Upcoming Meetings */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Upcoming Meetings</h2>
          <Badge variant="success">{acceptedMeetings.length}</Badge>
        </CardHeader>
        <CardBody className="space-y-4">
          {acceptedMeetings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No upcoming meetings</p>
            </div>
          ) : (
            acceptedMeetings.map(meeting => (
              <div key={meeting._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-full">
                    <Video size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{meeting.title}</h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(meeting.startTime), 'MMM d, yyyy h:mm a')} - {format(new Date(meeting.endTime), 'h:mm a')}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Users size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500">{meeting.participants.length} participants</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {meeting.meetingLink && (
                    <Button size="sm" leftIcon={<Video size={16} />}>
                      Join
                    </Button>
                  )}
                  <Button size="sm" variant="outline" leftIcon={<Trash2 size={16} />} onClick={() => handleDeleteMeeting(meeting._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      {/* Past/Cancelled */}
      {pastMeetings.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Past Meetings</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {pastMeetings.map(meeting => (
              <div key={meeting._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg opacity-60">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Calendar size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{meeting.title}</h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(meeting.startTime), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusColor(meeting.status) as any}>{meeting.status}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Schedule Meeting</h2>
            <div className="space-y-4">
              <Input
                label="Meeting Title"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                placeholder="e.g., Investment Discussion"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  rows={3}
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                  placeholder="Meeting agenda..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Time"
                  type="datetime-local"
                  value={newMeeting.startTime}
                  onChange={(e) => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
                />
                <Input
                  label="End Time"
                  type="datetime-local"
                  value={newMeeting.endTime}
                  onChange={(e) => setNewMeeting({ ...newMeeting, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={handleCreateMeeting}>Create Meeting</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
