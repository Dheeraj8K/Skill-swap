import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  MessageSquare,
  FileText,
  Copy,
  Check,
  Users,
  Shield,
  Volume2,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import './VideoRoom.css';

function VideoRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Parse query params for partner info if navigated from request
  const queryParams = new URLSearchParams(location.search);
  const partnerName = queryParams.get('partner') || 'Exchange Partner';
  const partnerAvatar = queryParams.get('avatar') || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
  const swapSkill = queryParams.get('skill') || 'Skill Exchange Session';

  // Video & Audio state
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Active side panel: 'chat', 'notes', or null
  const [activePanel, setActivePanel] = useState('chat');

  // Chat messages
  const [messages, setMessages] = useState([
    {
      id: 'init_1',
      senderName: 'LearnLoop Bot',
      message: `Welcome to your peer session for ${swapSkill}! Video and end-to-end encrypted peer audio are active.`,
      timestamp: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Shared Notes
  const [sharedNotes, setSharedNotes] = useState(
    `# 📝 ${swapSkill} - Session Notes\n\n- Key Concepts Covered:\n  1. Architecture fundamentals\n  2. Real-world best practices\n  3. Questions & Next Steps\n\n(Type here to collaborate live!)`
  );

  // Call timer
  const [seconds, setSeconds] = useState(0);
  const [copied, setCopied] = useState(false);

  // Participants
  const [remoteParticipants, setRemoteParticipants] = useState([
    {
      socketId: 'simulated_peer',
      userId: 'usr_partner',
      userName: partnerName,
      userAvatar: partnerAvatar,
      isAudioMuted: false,
      isVideoOff: false
    }
  ]);

  // DOM Refs
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize Media Stream
  useEffect(() => {
    let stream = null;

    async function startMedia() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Could not access webcam/mic directly:", err.message);
        setCameraError(err.message);
      }
    }

    startMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Socket.IO Setup
  useEffect(() => {
    const socketServer = import.meta.env.VITE_SOCKET_URL || 
      (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : "http://localhost:3000");
    const socket = io(socketServer);
    socketRef.current = socket;

    socket.emit('join-room', {
      roomId,
      userId: user?.id || 'guest',
      userName: user ? `${user.firstName} ${user.lastName}` : 'Guest Swapper',
      userAvatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    });

    socket.on('user-connected', (peer) => {
      setRemoteParticipants(prev => {
        const exists = prev.some(p => p.socketId === peer.socketId);
        return exists ? prev : [...prev, peer];
      });
      setMessages(prev => [
        ...prev,
        {
          id: 'sys_' + Date.now(),
          senderName: 'System',
          message: `${peer.userName} has entered the room.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    });

    socket.on('new-call-message', (cmsg) => {
      setMessages(prev => [...prev, cmsg]);
    });

    socket.on('shared-notes-updated', ({ notes }) => {
      setSharedNotes(notes);
    });

    socket.on('user-disconnected', ({ userName }) => {
      setMessages(prev => [
        ...prev,
        {
          id: 'sys_' + Date.now(),
          senderName: 'System',
          message: `${userName || 'Participant'} has left the room.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, user]);

  // Audio Toggle
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    } else {
      setIsAudioMuted(!isAudioMuted);
    }
  };

  // Video Toggle
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    } else {
      setIsVideoOff(!isVideoOff);
    }
  };

  // Screen Share Toggle
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        screenStream.getVideoTracks()[0].onended = () => {
          if (localStreamRef.current && localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
          setIsScreenSharing(false);
        };
      } else {
        if (localStreamRef.current && localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
        setIsScreenSharing(false);
      }
    } catch (e) {
      console.warn("Screen sharing canceled:", e.message);
    }
  };

  // Copy Room Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Send In-call Chat Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const payload = {
      roomId,
      message: chatInput.trim(),
      senderName: user ? `${user.firstName} ${user.lastName}` : 'You',
      senderAvatar: user?.avatar
    };

    socketRef.current?.emit('send-call-message', payload);
    setChatInput('');
  };

  // Update Notes
  const handleNotesChange = (e) => {
    const val = e.target.value;
    setSharedNotes(val);
    socketRef.current?.emit('update-shared-notes', { roomId, notes: val });
  };

  // End Call
  const handleEndCall = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // Navigate back to requests with completion celebration
    setTimeout(() => {
      navigate('/requests?finished=true');
    }, 600);
  };

  // Format Timer: MM:SS
  const formatTime = (totalSec) => {
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="video-room-container">
      {/* Top Floating Header */}
      <header className="room-header">
        <div className="room-header-left">
          <div className="session-pill">
            <span className="live-dot"></span>
            <strong>LIVE SESSION</strong>
          </div>
          <span className="room-topic">{swapSkill}</span>
          <div className="room-security-badge">
            <Shield size={13} /> Encrypted P2P
          </div>
        </div>

        <div className="room-header-center">
          <div className="call-timer-badge">
            {formatTime(seconds)}
          </div>
        </div>

        <div className="room-header-right">
          <button className="btn-room-action" onClick={handleCopyLink} title="Share Call Invite">
            {copied ? <Check size={16} className="text-green" /> : <Copy size={16} />}
            <span>{copied ? 'Link Copied!' : 'Invite Link'}</span>
          </button>
        </div>
      </header>

      {/* Main Grid: Video Feeds + Side Panel */}
      <div className="room-main-layout">
        {/* Videos Area */}
        <div className={`video-stage ${activePanel ? 'with-sidebar' : 'full'}`}>
          <div className="video-grid-mosaic">
            {/* Remote Peer Stream (Exchange Partner) */}
            <div className="video-card remote-card">
              <div className="video-overlay-top">
                <span className="peer-label">
                  <Volume2 size={14} /> {partnerName}
                </span>
                <span className="skill-exchange-tag">Teaching / Learning</span>
              </div>

              {/* Simulated / Real Remote Video */}
              <div className="simulated-peer-stream">
                <img
                  src={partnerAvatar}
                  alt={partnerName}
                  className="peer-display-avatar"
                />
                <div className="simulated-peer-bg-gradient"></div>
                <div className="audio-wave-anim">
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
              </div>

              <div className="video-overlay-bottom">
                <span className="connection-quality">🟢 HD 1080p • 60fps</span>
              </div>
            </div>

            {/* Local User Stream */}
            <div className="video-card local-card">
              <div className="video-overlay-top">
                <span className="peer-label">
                  {user ? `${user.firstName} (You)` : 'You'}
                </span>
                {isAudioMuted && <span className="muted-indicator"><MicOff size={12} /> Muted</span>}
              </div>

              {/* Real Video or Placeholder */}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`local-video-element ${isVideoOff ? 'hidden' : ''}`}
              />

              {(isVideoOff || cameraError) && (
                <div className="video-off-placeholder">
                  <img
                    src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                    alt="You"
                    className="placeholder-avatar"
                  />
                  <p className="placeholder-text">Camera Off</p>
                </div>
              )}

              <div className="video-overlay-bottom">
                <span className="status-badge-self">
                  {isScreenSharing ? '🖥️ Sharing Screen' : 'Local Camera'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Panel (Live Chat or Shared Notes) */}
        {activePanel && (
          <aside className="room-sidebar">
            <div className="sidebar-tab-header">
              <button
                className={`sidebar-tab ${activePanel === 'chat' ? 'active' : ''}`}
                onClick={() => setActivePanel('chat')}
              >
                <MessageSquare size={16} /> Chat ({messages.length})
              </button>
              <button
                className={`sidebar-tab ${activePanel === 'notes' ? 'active' : ''}`}
                onClick={() => setActivePanel('notes')}
              >
                <FileText size={16} /> Shared Notes
              </button>
            </div>

            {/* In-Call Live Chat */}
            {activePanel === 'chat' && (
              <div className="in-call-chat">
                <div className="chat-messages-container">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`chat-bubble ${m.senderName === (user ? `${user.firstName} ${user.lastName}` : 'You') ? 'mine' : 'theirs'}`}
                    >
                      <div className="chat-bubble-header">
                        <strong>{m.senderName}</strong>
                        <span>{m.timestamp}</span>
                      </div>
                      <p className="chat-bubble-text">{m.message}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="chat-input-bar">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Send a message or code link..."
                  />
                  <button type="submit" disabled={!chatInput.trim()}>
                    Send
                  </button>
                </form>
              </div>
            )}

            {/* In-Call Shared Notes & Code Notepad */}
            {activePanel === 'notes' && (
              <div className="in-call-notes">
                <div className="notes-tip">
                  <Sparkles size={14} /> Shared Real-time Notebook — both participants see updates live!
                </div>
                <textarea
                  className="notes-editor"
                  value={sharedNotes}
                  onChange={handleNotesChange}
                  placeholder="Drop lesson notes, code snippets, git repos, or questions here..."
                />
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <footer className="room-controls-bar">
        <div className="controls-group">
          <button
            className={`control-circle-btn ${isAudioMuted ? 'danger' : 'default'}`}
            onClick={toggleAudio}
            title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            className={`control-circle-btn ${isVideoOff ? 'danger' : 'default'}`}
            onClick={toggleVideo}
            title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
          >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>

          <button
            className={`control-circle-btn ${isScreenSharing ? 'active-share' : 'default'}`}
            onClick={toggleScreenShare}
            title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
          >
            <Monitor size={20} />
          </button>
        </div>

        <div className="controls-group">
          <button
            className={`control-rect-btn ${activePanel === 'chat' ? 'active' : ''}`}
            onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
          >
            <MessageSquare size={18} />
            <span>Chat</span>
          </button>

          <button
            className={`control-rect-btn ${activePanel === 'notes' ? 'active' : ''}`}
            onClick={() => setActivePanel(activePanel === 'notes' ? null : 'notes')}
          >
            <FileText size={18} />
            <span>Notes</span>
          </button>

          <button className="control-leave-btn" onClick={handleEndCall}>
            <PhoneOff size={20} />
            <span>End Call</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

export default VideoRoom;
