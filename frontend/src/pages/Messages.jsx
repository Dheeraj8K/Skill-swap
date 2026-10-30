import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import UserProfileModal from '../components/modals/UserProfileModal';
import SendRequestModal from '../components/modals/SendRequestModal';
import {
  MessageSquare,
  Video,
  Send,
  User,
  Search,
  Sparkles,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import './Messages.css';

function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state for viewing other user's profile & proposing swap
  const [profileModalUser, setProfileModalUser] = useState(null);
  const [profileReviews, setProfileReviews] = useState([]);
  const [requestModalUser, setRequestModalUser] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch all users to create conversation list
  useEffect(() => {
    async function loadConversations() {
      try {
        const res = await api.getUsers();
        setConversations(res.users);

        // Check if navigated with a specific user selected in location.state
        const targetUserId = location.state?.targetUserId;
        if (targetUserId) {
          const found = res.users.find(u => u.id === targetUserId);
          if (found) setSelectedUser(found);
          else if (res.users.length > 0) setSelectedUser(res.users[0]);
        } else if (res.users.length > 0) {
          setSelectedUser(res.users[0]);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, [location.state]);

  // Fetch messages when selectedUser changes
  useEffect(() => {
    if (!selectedUser) return;

    async function loadMessages() {
      try {
        const res = await api.getMessages(selectedUser.id);
        setMessages(res.messages);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    }

    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const textToSend = newMessage;
    setNewMessage('');

    try {
      const res = await api.sendMessage(selectedUser.id, textToSend);
      setMessages(prev => [...prev, res.chatMessage]);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleLaunchVideo = () => {
    if (!selectedUser) return;
    const roomId = `room_direct_${Date.now()}`;
    navigate(`/room/${roomId}?partner=${encodeURIComponent(selectedUser.firstName + ' ' + selectedUser.lastName)}&avatar=${encodeURIComponent(selectedUser.avatar)}&skill=${encodeURIComponent(selectedUser.skillsOffering?.[0]?.name || 'LearnLoop Swap')}`);
  };

  // Open User Profile Modal
  const handleOpenProfile = async (targetUser) => {
    setProfileModalUser(targetUser);
    try {
      const res = await api.getReviews(targetUser.id);
      setProfileReviews(res.reviews || []);
    } catch (e) {
      setProfileReviews([]);
    }
  };

  const filteredConversations = conversations.filter(c =>
    (c.firstName + ' ' + c.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.skillsOffering?.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="messages-page">
      {toastMessage && (
        <div className="messages-toast-banner">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="messages-layout-card">
        {/* Sidebar: User List */}
        <div className="messages-sidebar">
          <div className="sidebar-header">
            <h2><MessageSquare size={20} /> Messages</h2>
            <div className="search-input-wrap">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search mentors or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="conversations-list">
            {loading ? (
              <div className="loading-state">Loading chats...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="empty-state">
                <p>No other users registered yet.</p>
                <small>Invite peers to join and swap skills!</small>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = selectedUser?.id === c.id;
                return (
                  <div
                    key={c.id}
                    className={`convo-item ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedUser(c)}
                  >
                    <div className="convo-avatar-wrap">
                      <img src={c.avatar} alt={c.firstName} className="convo-avatar" />
                      {c.videoAvailable && (
                        <span className="online-dot" title="Available for Instant Video Call"></span>
                      )}
                    </div>
                    <div className="convo-details">
                      <div className="convo-name-row">
                        <span className="convo-name">{c.firstName} {c.lastName}</span>
                        {c.videoAvailable && (
                          <span className="video-tiny-pill">
                            <Video size={10} /> Call Ready
                          </span>
                        )}
                      </div>
                      <span className="convo-skill">
                        {c.skillsOffering?.[0]?.name || c.headline || 'LearnLoop Member'}
                      </span>
                    </div>

                    <button
                      className="btn-quick-profile-inspect"
                      title="View Profile Details"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProfile(c);
                      }}
                    >
                      <User size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Thread */}
        <div className="messages-chat-pane">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                {/* Clickable User Meta -> Opens Profile Modal */}
                <div
                  className="chat-user-meta clickable"
                  onClick={() => handleOpenProfile(selectedUser)}
                  title="Click to view full profile, skills & availability"
                >
                  <div className="chat-avatar-wrap">
                    <img src={selectedUser.avatar} alt={selectedUser.firstName} className="chat-avatar" />
                    {selectedUser.videoAvailable && <span className="online-dot"></span>}
                  </div>
                  <div>
                    <h3 className="chat-user-name">
                      {selectedUser.firstName} {selectedUser.lastName}
                      <span className="view-profile-hint">View Profile ↗</span>
                    </h3>
                    <p className="chat-user-sub">
                      ⭐ {selectedUser.rating} • {selectedUser.headline || selectedUser.location}
                    </p>
                  </div>
                </div>

                <div className="chat-header-actions">
                  {/* View Profile Button */}
                  <button
                    className="btn-view-peer-profile"
                    onClick={() => handleOpenProfile(selectedUser)}
                    title="View full profile, skills, and availability"
                  >
                    <User size={16} />
                    <span>View Profile</span>
                  </button>

                  {/* Video Call Button */}
                  <button
                    className={`btn-video-call-now ${selectedUser.videoAvailable ? 'highlight' : ''}`}
                    onClick={handleLaunchVideo}
                    title="Start Live Video Session with this user"
                  >
                    <Video size={17} />
                    <span>Start Video Call</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="messages-history">
                {messages.length === 0 ? (
                  <div className="empty-history-notice">
                    <Sparkles size={28} className="sparkle-icon" />
                    <h4>Start a conversation with {selectedUser.firstName}!</h4>
                    <p>Discuss swap goals, propose a topic, or view their profile and skills.</p>
                    <button
                      className="btn-inspect-profile-prompt"
                      onClick={() => handleOpenProfile(selectedUser)}
                    >
                      <User size={15} /> View {selectedUser.firstName}'s Skills & Schedule
                    </button>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMine = m.from === user?.id;
                    return (
                      <div key={m.id} className={`msg-row ${isMine ? 'mine' : 'theirs'}`}>
                        <div className="msg-bubble">
                          <p className="msg-text">{m.text}</p>
                          <span className="msg-time">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSend} className="chat-input-footer">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${selectedUser.firstName}... (press Enter to send)`}
                />
                <button type="submit" disabled={!newMessage.trim()} className="btn-send-msg">
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <User size={48} className="empty-icon" />
              <h3>Select a person to begin exchanging skills</h3>
              <p>Or browse registered members in the marketplace.</p>
              <button
                className="btn-browse-nav-fallback"
                onClick={() => navigate('/users')}
              >
                Browse Mentors
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Profile Modal */}
      {profileModalUser && (
        <UserProfileModal
          user={profileModalUser}
          reviews={profileReviews}
          onClose={() => setProfileModalUser(null)}
          onRequestSwap={(target) => {
            setProfileModalUser(null);
            setRequestModalUser(target);
          }}
          onStartChat={(target) => {
            setProfileModalUser(null);
            setSelectedUser(target);
          }}
        />
      )}

      {/* Propose Swap Modal */}
      {requestModalUser && (
        <SendRequestModal
          targetUser={requestModalUser}
          onClose={() => setRequestModalUser(null)}
          onSuccess={() => {
            setRequestModalUser(null);
            setToastMessage('🎉 LearnLoop swap request sent successfully!');
            setTimeout(() => setToastMessage(''), 3500);
          }}
        />
      )}
    </div>
  );
}

export default Messages;
