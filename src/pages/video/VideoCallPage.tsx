import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, Users, Copy, Settings } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const VideoCallPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isInCall, setIsInCall] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      const newRoomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setRoomId(newRoomId);
      setIsInCall(true);
      toast.success('Camera and microphone enabled');
    } catch {
      toast.error('Could not access camera or microphone');
    }
  };

  const joinCall = async () => {
    if (!joinRoomId.trim()) {
      toast.error('Please enter a room ID');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setRoomId(joinRoomId);
      setIsInCall(true);
      toast.success('Joined call');
    } catch {
      toast.error('Could not access camera or microphone');
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setIsInCall(false);
    setRoomId('');
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioOn(!isAudioOn);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success('Room ID copied to clipboard');
  };

  if (!isInCall) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Calls</h1>
          <p className="text-gray-600">Start or join a video call with other users</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Start New Call</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-gray-600">Create a new video call room and invite others to join.</p>
              <Button leftIcon={<Video size={18} />} onClick={startCall} fullWidth>
                Start Call
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Join Existing Call</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Room ID"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Enter room ID"
              />
              <Button leftIcon={<Users size={18} />} onClick={joinCall} fullWidth>
                Join Call
              </Button>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Recent Calls</h2>
          </CardHeader>
          <CardBody>
            <div className="text-center py-8">
              <Video size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No recent calls</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Call</h1>
          <p className="text-gray-600">Room: {roomId}</p>
        </div>
        <Button variant="outline" leftIcon={<Copy size={18} />} onClick={copyRoomId}>
          Copy Room ID
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardBody className="p-0">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ minHeight: '400px' }}
                />
                {!isVideoOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <VideoOff size={64} className="text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                  <span className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    You ({user?.name})
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Participants</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">Host</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Controls</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex gap-3">
                <Button
                  variant={isAudioOn ? 'primary' : 'outline'}
                  leftIcon={isAudioOn ? <Mic size={18} /> : <MicOff size={18} />}
                  onClick={toggleAudio}
                  className="flex-1"
                >
                  {isAudioOn ? 'Mute' : 'Unmute'}
                </Button>
                <Button
                  variant={isVideoOn ? 'primary' : 'outline'}
                  leftIcon={isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
                  onClick={toggleVideo}
                  className="flex-1"
                >
                  {isVideoOn ? 'Stop Video' : 'Start Video'}
                </Button>
              </div>
              <Button
                variant="danger"
                leftIcon={<Phone size={18} />}
                onClick={endCall}
                fullWidth
              >
                End Call
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
