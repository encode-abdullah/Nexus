import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Users, Plus, Check, X, Video, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from 'date-fns';

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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    participantEmail: ''
  });

  useEffect(() => { fetchMeetings(); }, []);

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

  // Calendar calculations
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(m => isSameDay(new Date(m.startTime), date));
  };

  const selectedDateMeetings = selectedDate ? getMeetingsForDate(selectedDate) : [];
  const pendingMeetings = meetings.filter(m => m.status === 'pending');
  const acceptedMeetings = meetings.filter(m => m.status === 'accepted');

  if (loading) {
    return <div className="text-center py-12"><p className="text-gray-500">Loading meetings...</p></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meetings</h1>
          <p className="text-gray-600 dark:text-gray-400">Schedule and manage your meetings</p>
        </div>
        <div className="flex gap-3">
          <div className="flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 text-sm font-medium ${view === 'calendar' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
            >
              <Calendar size={16} className="inline mr-1" /> Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 text-sm font-medium ${view === 'list' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
            >
              <Clock size={16} className="inline mr-1" /> List
            </button>
          </div>
          <Button leftIcon={<Plus size={18} />} onClick={() => setShowCreateModal(true)}>
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Pending Meetings */}
      {pendingMeetings.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Pending Invitations</h2>
            <Badge variant="warning">{pendingMeetings.length}</Badge>
          </CardHeader>
          <CardBody className="space-y-4">
            {pendingMeetings.map(meeting => (
              <div key={meeting._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-full">
                    <Calendar size={20} className="text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{meeting.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(meeting.startTime), 'MMM d, yyyy h:mm a')} - {format(new Date(meeting.endTime), 'h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" leftIcon={<Check size={16} />} onClick={() => handleStatusUpdate(meeting._id, 'accepted')}>Accept</Button>
                  <Button size="sm" variant="outline" leftIcon={<X size={16} />} onClick={() => handleStatusUpdate(meeting._id, 'rejected')}>Reject</Button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <ChevronLeft size={20} className="text-gray-700 dark:text-gray-300" />
                </button>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">{format(currentMonth, 'MMMM yyyy')}</h2>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <ChevronRight size={20} className="text-gray-700 dark:text-gray-300" />
                </button>
              </CardHeader>
              <CardBody className="p-0">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">{day}</div>
                  ))}
                </div>
                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((day, idx) => {
                    const dayMeetings = getMeetingsForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const today = isToday(day);

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedDate(day)}
                        className={`min-h-[80px] p-2 border-b border-r border-gray-100 dark:border-gray-700 cursor-pointer transition-colors
                          ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                          ${isSelected ? 'bg-primary-50 dark:bg-primary-900/30 ring-2 ring-primary-500' : ''}
                          ${today ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      >
                        <div className={`text-sm font-medium mb-1 ${today ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-gray-900 dark:text-gray-200'}`}>
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-1">
                          {dayMeetings.slice(0, 2).map(m => (
                            <div
                              key={m._id}
                              className={`text-xs px-1.5 py-0.5 rounded truncate ${
                                m.status === 'accepted' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                m.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {m.title}
                            </div>
                          ))}
                          {dayMeetings.length > 2 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">+{dayMeetings.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Selected date detail */}
          <div>
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a date'}
                </h2>
              </CardHeader>
              <CardBody>
                {selectedDate ? (
                  selectedDateMeetings.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No meetings on this day</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateMeetings.map(m => (
                        <div key={m._id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">{m.title}</h3>
                            <Badge variant={getStatusColor(m.status) as any} size="sm">{m.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(m.startTime), 'h:mm a')} - {format(new Date(m.endTime), 'h:mm a')}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {m.status === 'pending' && (
                              <>
                                <Button size="sm" onClick={() => handleStatusUpdate(m._id, 'accepted')}>Accept</Button>
                                <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(m._id, 'rejected')}>Reject</Button>
                              </>
                            )}
                            {m.status === 'accepted' && m.meetingLink && (
                              <Button size="sm" leftIcon={<Video size={14} />}>Join</Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => handleDeleteMeeting(m._id)}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 text-center py-4">Click a date on the calendar to see meetings</p>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">All Meetings</h2>
            <Badge variant="primary">{meetings.length}</Badge>
          </CardHeader>
          <CardBody className="space-y-4">
            {meetings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No meetings yet</p>
              </div>
            ) : (
              meetings.map(meeting => (
                <div key={meeting._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${
                      meeting.status === 'accepted' ? 'bg-green-50 dark:bg-green-900/30' :
                      meeting.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/30' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {meeting.status === 'accepted' ?
                        <Video size={20} className="text-green-600 dark:text-green-400" /> :
                        <Calendar size={20} className={meeting.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'} />
                      }
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{meeting.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(meeting.startTime), 'MMM d, yyyy h:mm a')} - {format(new Date(meeting.endTime), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(meeting.status) as any}>{meeting.status}</Badge>
                    {meeting.status === 'pending' && (
                      <>
                        <Button size="sm" leftIcon={<Check size={14} />} onClick={() => handleStatusUpdate(meeting._id, 'accepted')}>Accept</Button>
                        <Button size="sm" variant="outline" leftIcon={<X size={14} />} onClick={() => handleStatusUpdate(meeting._id, 'rejected')}>Reject</Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleDeleteMeeting(meeting._id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      )}

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Schedule Meeting</h2>
            <div className="space-y-4">
              <Input label="Meeting Title" value={newMeeting.title} onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })} placeholder="e.g., Investment Discussion" />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={3} value={newMeeting.description} onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })} placeholder="Meeting agenda..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Time" type="datetime-local" value={newMeeting.startTime} onChange={(e) => setNewMeeting({ ...newMeeting, startTime: e.target.value })} />
                <Input label="End Time" type="datetime-local" value={newMeeting.endTime} onChange={(e) => setNewMeeting({ ...newMeeting, endTime: e.target.value })} />
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
