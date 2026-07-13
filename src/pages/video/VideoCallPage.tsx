import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Users, Copy, Monitor, MessageSquare, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

type CallView = 'lobby' | 'prejoin' | 'incall';

export const VideoCallPage: React.FC = () => {
  const { user } = useAuth();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const [callView, setCallView] = useState<CallView>('lobby');
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [localStreamRef, setLocalStream] = useState<MediaStream | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Call timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (callView === 'incall') {
      setCallDuration(0);
      interval = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callView]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      localStreamRef?.getTracks().forEach(t => t.stop());
    };
  }, [localStreamRef]);

  // Attach stream to video element when entering call
  useEffect(() => {
    if (callView === 'incall' && localVideoRef.current && localStreamRef) {
      localVideoRef.current.srcObject = localStreamRef;
    }
  }, [callView, localStreamRef]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startNewCall = async () => {
    setIsStarting(true);
    const newRoomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setRoomId(newRoomId);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
      setIsVideoOn(true);
      setIsAudioOn(true);
    } catch {
      // Camera denied - proceed without video
      setIsVideoOn(false);
      setIsAudioOn(false);
      toast('Proceeding without camera. You can enable it later.', { icon: '' });
    }

    setCallView('prejoin');
    setIsStarting(false);
  };

  const joinExistingCall = async () => {
    if (!joinRoomId.trim()) {
      toast.error('Please enter a room ID');
      return;
    }
    setIsStarting(true);
    setRoomId(joinRoomId);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
      setIsVideoOn(true);
      setIsAudioOn(true);
    } catch {
      setIsVideoOn(false);
      setIsAudioOn(false);
      toast('Proceeding without camera. You can enable it later.', { icon: '' });
    }

    setCallView('prejoin');
    setIsStarting(false);
  };

  const joinRoom = () => {
    setCallView('incall');
    toast.success('You joined the call');
  };

  const endCall = () => {
    localStreamRef?.getTracks().forEach(t => t.stop());
    setLocalStream(null);
    setCallView('lobby');
    setRoomId('');
    setIsAudioOn(true);
    setIsVideoOn(true);
    setCallDuration(0);
  };

  const toggleAudio = () => {
    localStreamRef?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsAudioOn(!isAudioOn);
  };

  const toggleVideo = () => {
    localStreamRef?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsVideoOn(!isVideoOn);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success('Room ID copied');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // ========== LOBBY VIEW ==========
  if (callView === 'lobby') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Video Calls</h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Start or join a video call with other users</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Start New Call</h2>
            </CardHeader>
            <CardBody className="space-y-4 flex flex-col flex-1">
              <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-gray-800 rounded-lg flex-1">
                <div className="text-center">
                  <Video size={40} className="mx-auto text-primary-500 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Create a room and invite others</p>
                </div>
              </div>
              <Button leftIcon={<Video size={18} />} fullWidth onClick={startNewCall} isLoading={isStarting}>
                Start Call
              </Button>
            </CardBody>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Join Existing Call</h2>
            </CardHeader>
            <CardBody className="space-y-4 flex flex-col flex-1">
              <div className="flex-1" />
              <Input
                label="Room ID"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Paste room ID here"
              />
              <Button leftIcon={<Users size={18} />} onClick={joinExistingCall} fullWidth isLoading={isStarting}>
                Join Call
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // ========== PRE-JOIN VIEW (Lobby with camera preview) ==========
  if (callView === 'prejoin') {
    return (
      <div className="animate-fade-in">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Ready to join?</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              {/* Camera Preview */}
              <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
                {localStreamRef && isVideoOn ? (
                  <video
                    ref={previewVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-3xl font-bold text-white">{user?.name?.charAt(0)}</span>
                      </div>
                      <p className="text-gray-400 dark:text-gray-500 text-sm">Camera is off</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                  <span className="bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {user?.name}
                  </span>
                </div>
              </div>

              {/* Pre-join controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={toggleAudio}
                  className={`p-4 rounded-full transition-colors ${
                    isAudioOn ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {isAudioOn ? <Mic size={24} /> : <MicOff size={24} />}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-colors ${
                    isVideoOn ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                </button>
              </div>

              {/* Room info */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                <span>Room: {roomId}</span>
                <button onClick={copyRoomId} className="text-primary-600 hover:text-primary-700">
                  <Copy size={14} />
                </button>
              </div>

              {/* Join / Cancel */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={endCall} fullWidth>
                  Cancel
                </Button>
                <Button onClick={joinRoom} leftIcon={<Phone size={18} />} fullWidth>
                  Join Now
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // ========== IN-CALL VIEW (Full screen like Zoom/Skype) ==========
  return (
    <div ref={containerRef} className="fixed inset-0 bg-gray-900 flex flex-col z-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white font-medium">Nexus Meeting</span>
          <span className="text-gray-400 dark:text-gray-500 text-sm">{formatDuration(callDuration)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyRoomId}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-gray-300 text-sm transition-colors"
          >
            <Copy size={14} />
            <span className="hidden sm:inline">Copy Invite</span>
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* Main video area */}
      <div className="flex-1 relative p-4">
        {/* Remote video placeholder (large) */}
        <div className="w-full h-full bg-gray-800 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={40} className="text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-lg">Waiting for others to join...</p>
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm mt-2">Share room ID: <span className="font-mono text-gray-300">{roomId}</span></p>
          </div>
        </div>

        {/* Self view (pip - bottom right) */}
        <div className="absolute bottom-6 right-6 w-48 h-36 sm:w-56 sm:h-40 bg-gray-900 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {!isVideoOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">{user?.name?.charAt(0)}</span>
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-2">
            <span className="bg-black/60 text-white px-2 py-0.5 rounded text-xs">
              You
            </span>
          </div>
        </div>
      </div>

      {/* Bottom control bar */}
      <div className="flex items-center justify-center gap-3 px-6 py-5 bg-gray-900/80 backdrop-blur-sm">
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full transition-all ${
            isAudioOn
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          title={isAudioOn ? 'Mute' : 'Unmute'}
        >
          {isAudioOn ? <Mic size={22} /> : <MicOff size={22} />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-all ${
            isVideoOn
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          title={isVideoOn ? 'Stop Video' : 'Start Video'}
        >
          {isVideoOn ? <Video size={22} /> : <VideoOff size={22} />}
        </button>

        <button
          className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all"
          title="Share Screen"
        >
          <Monitor size={22} />
        </button>

        <button
          className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all"
          title="Chat"
        >
          <MessageSquare size={22} />
        </button>

        <button
          className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all"
          title="Participants"
        >
          <Users size={22} />
        </button>

        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all ml-4"
          title="End Call"
        >
          <PhoneOff size={22} />
        </button>
      </div>
    </div>
  );
};
