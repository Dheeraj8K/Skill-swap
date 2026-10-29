import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Video,
  VideoOff,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Star,
  Users,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  Calendar,
  Clock
} from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
  const { user, toggleVideoAvailability } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoToggling, setVideoToggling] = useState(false);
  const [copiedRoom, setCopiedRoom] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getRequests();
        setRequests(res.requests);
      } catch (e) {
        console.error("Dashboard requests error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggleVideo = async () => {
    setVideoToggling(true);
    try {
      await toggleVideoAvailability();
    } catch (e) {
      alert("Could not update video status");
    } finally {
      setVideoToggling(false);
    }
  };

  const handleInstantRoom = () => {
    const roomId = `room_instant_${Math.random().toString(36).substring(2, 8)}`;
    const url = `${window.location.origin}/room/${roomId}?partner=Peer&skill=Instant+Session`;
    navigator.clipboard.writeText(url);
    setCopiedRoom(true);
    setTimeout(() => setCopiedRoom(false), 2500);
  };

  const acceptedSessions = requests.filter((r) => r.status === 'accepted');
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const completedCount = requests.filter((r) => r.status === 'completed').length;

  const stats = [
    {
      label: 'Skills Offered',
      value: user?.skillsOffering?.length || '4',
      icon: <BookOpen className="stat-svg text-indigo" />,
      sub: 'Ready to teach'
    },
    {
      label: 'Skills Learning',
      value: user?.skillsLearning?.length || '3',
      icon: <GraduationCap className="stat-svg text-pink" />,
      sub: 'Active learning goals'
    },
    {
      label: 'Completed Swaps',
      value: user?.completedSwaps || completedCount || '15',
      icon: <CheckCircle2 className="stat-svg text-green" />,
      sub: 'Verified exchanges'
    },
    {
      label: 'Community Rating',
      value: `${user?.rating || '4.9'} / 5.0`,
      icon: <Star className="stat-svg text-amber" />,
      sub: `Based on ${user?.reviewCount || 24} reviews`
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Welcome Hero Banner */}
        <div className="dashboard-hero-card">
          <div className="hero-left-content">
            <div className="hero-avatar-wrap">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"}
                alt={user?.firstName}
                className="hero-avatar"
              />
              {user?.videoAvailable && <span className="online-beacon"></span>}
            </div>

            <div>
              <div className="hero-title-row">
                <h1>Welcome back, {user?.firstName || 'Swapper'}!</h1>
                <span className="hero-role-pill">Verified Member</span>
              </div>
              <p className="hero-bio-line">
                {user?.headline || 'Full-Stack Developer & Knowledge Sharer'} • {user?.location || 'Remote'}
              </p>
            </div>
          </div>

          {/* Live Video Availability Switch */}
          <div className="hero-video-toggle-card">
            <div className="toggle-info">
              <span className="toggle-title">Instant Video Calling</span>
              <span className="toggle-desc">
                {user?.videoAvailable
                  ? '🟢 Available for direct video calls'
                  : '⚪ Marked unavailable for calls'}
              </span>
            </div>

            <button
              className={`btn-video-availability ${user?.videoAvailable ? 'active' : ''}`}
              onClick={handleToggleVideo}
              disabled={videoToggling}
            >
              {user?.videoAvailable ? (
                <>
                  <Video size={16} /> Online
                </>
              ) : (
                <>
                  <VideoOff size={16} /> Offline
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="dashboard-kpi-card">
              <div className="kpi-icon-wrap">{stat.icon}</div>
              <div className="kpi-info">
                <span className="kpi-value">{stat.value}</span>
                <span className="kpi-label">{stat.label}</span>
                <span className="kpi-sub">{stat.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Sections */}
        <div className="dashboard-grid-sections">
          {/* Left Column: Upcoming Video Sessions & Pending Requests */}
          <div className="dashboard-left-col">
            {/* Accepted & Ready Video Calls */}
            <div className="dashboard-card-section">
              <div className="section-title-bar">
                <div className="title-with-badge">
                  <Video size={18} className="text-green" />
                  <h2>Upcoming Video Swap Sessions ({acceptedSessions.length})</h2>
                </div>
                <Link to="/requests" className="section-link">View all</Link>
              </div>

              {acceptedSessions.length === 0 ? (
                <div className="empty-section-notice">
                  <Calendar size={32} className="text-slate" />
                  <p>No active scheduled sessions yet.</p>
                  <Link to="/users" className="btn-empty-action">
                    Browse Mentors & Request Swap
                  </Link>
                </div>
              ) : (
                <div className="sessions-list">
                  {acceptedSessions.map((s) => {
                    const isSender = s.senderId === user?.id;
                    const partnerName = isSender ? s.receiverName : s.senderName;
                    const partnerAvatar = isSender ? s.receiverAvatar : s.senderAvatar;

                    return (
                      <div key={s.id} className="session-item-row">
                        <img src={partnerAvatar} alt={partnerName} className="session-avatar" />
                        <div className="session-details">
                          <strong>{partnerName}</strong>
                          <span className="session-skill">
                            Exchange: {s.skillOffering} ↔ {s.skillRequesting}
                          </span>
                          <span className="session-time">
                            <Clock size={12} /> {s.scheduledDate} ({s.duration || '45m'})
                          </span>
                        </div>

                        <button
                          className="btn-join-session-now"
                          onClick={() =>
                            navigate(
                              `/room/${s.roomId || 'room_' + s.id}?partner=${encodeURIComponent(partnerName)}&avatar=${encodeURIComponent(partnerAvatar)}&skill=${encodeURIComponent(s.skillOffering)}`
                            )
                          }
                        >
                          <Video size={15} /> Join Call
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending Requests Feed */}
            <div className="dashboard-card-section">
              <div className="section-title-bar">
                <h2>Pending Swap Proposals ({pendingRequests.length})</h2>
                <Link to="/requests" className="section-link">Manage</Link>
              </div>

              {pendingRequests.length === 0 ? (
                <p className="no-pending-text">No pending proposals waiting for response.</p>
              ) : (
                <div className="pending-feed">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="pending-feed-item">
                      <div className="pending-feed-info">
                        <strong>{req.senderName === `${user?.firstName} ${user?.lastName}` ? `To: ${req.receiverName}` : `From: ${req.senderName}`}</strong>
                        <p>{req.skillOffering} for {req.skillRequesting}</p>
                      </div>
                      <Link to="/requests" className="btn-review-proposal">
                        Review <ArrowRight size={14} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Instant Video Link & Quick Actions */}
          <div className="dashboard-right-col">
            {/* Quick Video Call Generator */}
            <div className="instant-call-promo-card">
              <div className="instant-badge">
                <Sparkles size={14} /> Instant Room
              </div>
              <h3>Launch Ad-Hoc Video Call</h3>
              <p>
                Need an immediate 1-on-1 swap or troubleshooting call? Generate an instant encrypted room link.
              </p>

              <button className="btn-generate-instant-room" onClick={handleInstantRoom}>
                {copiedRoom ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedRoom ? 'Room Link Copied to Clipboard!' : 'Copy Instant Call Link'}</span>
              </button>
            </div>

            {/* Quick Navigation Card */}
            <div className="dashboard-card-section">
              <h2>Quick Actions</h2>
              <div className="quick-actions-nav-list">
                <Link to="/users" className="quick-action-nav-item">
                  <Users size={18} />
                  <div>
                    <strong>Browse Marketplace</strong>
                    <span>Find tutors and exchange partners</span>
                  </div>
                  <ArrowRight size={15} className="nav-arrow" />
                </Link>

                <Link to="/messages" className="quick-action-nav-item">
                  <MessageSquare size={18} />
                  <div>
                    <strong>Direct Messages</strong>
                    <span>Chat and share notes with partners</span>
                  </div>
                  <ArrowRight size={15} className="nav-arrow" />
                </Link>

                <Link to="/profile" className="quick-action-nav-item">
                  <BookOpen size={18} />
                  <div>
                    <strong>Edit Skills & Availability</strong>
                    <span>Update what you teach and your hours</span>
                  </div>
                  <ArrowRight size={15} className="nav-arrow" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
