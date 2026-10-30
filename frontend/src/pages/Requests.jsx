import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Card from '../components/common/Card';
import ReviewModal from '../components/modals/ReviewModal';
import UserProfileModal from '../components/modals/UserProfileModal';
import {
  Video,
  Clock,
  Calendar,
  Check,
  X,
  MessageSquare,
  Sparkles,
  ArrowRightLeft,
  Star,
  CheckCircle2,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import './Requests.css';

function Requests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedRequestForReview, setSelectedRequestForReview] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Profile modal state
  const [profileModalUser, setProfileModalUser] = useState(null);
  const [profileReviews, setProfileReviews] = useState([]);

  // Check if redirected after ending a video call
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('finished') === 'true') {
      setToastMessage('🎉 Video Session Completed! Please leave a review for your partner.');
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch (e) {}
    }
  }, [location.search]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await api.getRequests();
      setRequests(res.requests);
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await api.updateRequestStatus(requestId, newStatus);
      await loadRequests();
      setToastMessage(`Request marked as ${newStatus}!`);
      setTimeout(() => setToastMessage(''), 3000);

      if (newStatus === 'completed') {
        const req = requests.find(r => r.id === requestId);
        if (req) setSelectedRequestForReview(req);
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleJoinVideo = (req) => {
    const isSender = req.senderId === user?.id;
    const partnerName = isSender ? req.receiverName : req.senderName;
    const partnerAvatar = isSender ? req.receiverAvatar : req.senderAvatar;

    navigate(
      `/room/${req.roomId || 'room_' + req.id}?partner=${encodeURIComponent(partnerName)}&avatar=${encodeURIComponent(partnerAvatar)}&skill=${encodeURIComponent(req.skillOffering)}`
    );
  };

  const handleOpenPartnerProfile = async (partnerId) => {
    try {
      const res = await api.getUserById(partnerId);
      setProfileModalUser(res.user);
      setProfileReviews(res.reviews || []);
    } catch (err) {
      console.error("Could not fetch user profile:", err);
    }
  };

  const filteredRequests = requests.filter(
    (req) => filter === 'all' || req.status === filter
  );

  return (
    <div className="requests-page">
      <div className="container">
        {toastMessage && (
          <div className="requests-toast-alert">
            <CheckCircle2 size={18} />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="requests-header-box">
          <div>
            <h1>LearnLoop Requests & Sessions</h1>
            <p>Manage your incoming and outgoing peer learning proposals</p>
          </div>

          <button
            className="btn-new-swap-nav"
            onClick={() => navigate('/users')}
          >
            <Sparkles size={16} /> Explore New Mentors
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="filter-pills-row">
          {['all', 'pending', 'accepted', 'completed', 'declined'].map((tab) => (
            <button
              key={tab}
              className={`filter-pill-btn ${filter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="count-tag">
                {tab === 'all'
                  ? requests.length
                  : requests.filter((r) => r.status === tab).length}
              </span>
            </button>
          ))}
        </div>

        {/* List of Requests */}
        {loading ? (
          <div className="loading-state-block">
            <div className="loading-spinner"></div>
            <p>Loading your exchange sessions...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-requests-card">
            <ArrowRightLeft size={42} className="empty-arrow" />
            <h3>No {filter !== 'all' ? filter : ''} swap requests found</h3>
            <p>Ready to level up your skills? Browse peers and propose a session!</p>
            <button
              className="btn-browse-empty"
              onClick={() => navigate('/users')}
            >
              Browse Available Peers
            </button>
          </div>
        ) : (
          <div className="requests-cards-stack">
            {filteredRequests.map((req) => {
              const isSender = req.senderId === user?.id;
              const partnerId = isSender ? req.receiverId : req.senderId;
              const partnerName = isSender ? req.receiverName : req.senderName;
              const partnerAvatar = isSender ? req.receiverAvatar : req.senderAvatar;

              return (
                <div key={req.id} className={`swap-request-card status-${req.status}`}>
                  {/* Top Bar */}
                  <div className="req-card-top">
                    <div
                      className="req-partner-identity clickable"
                      onClick={() => handleOpenPartnerProfile(partnerId)}
                      title="Click to view partner's profile and skills"
                    >
                      <img src={partnerAvatar} alt={partnerName} className="req-avatar" />
                      <div>
                        <h3>
                          {partnerName}
                          <span className="partner-profile-link">View Profile ↗</span>
                        </h3>
                        <span className="req-role-tag">
                          {isSender ? 'Outgoing proposal sent by you' : 'Incoming proposal received'}
                        </span>
                      </div>
                    </div>

                    <div className="req-top-badges">
                      <span className={`status-pill pill-${req.status}`}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Swap Visualizer */}
                  <div className="swap-visualizer-box">
                    <div className="swap-skill-item offering">
                      <span className="swap-label">
                        {isSender ? 'You Teach' : 'They Teach'}
                      </span>
                      <strong className="swap-name">{req.skillOffering}</strong>
                    </div>

                    <div className="swap-exchange-icon">
                      <ArrowRightLeft size={20} />
                    </div>

                    <div className="swap-skill-item receiving">
                      <span className="swap-label">
                        {isSender ? 'You Learn' : 'They Learn'}
                      </span>
                      <strong className="swap-name">{req.skillRequesting}</strong>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="req-meta-details">
                    <span><Clock size={14} /> Duration: {req.duration || '45 mins'}</span>
                    <span><Calendar size={14} /> Slot: {req.scheduledDate}</span>
                  </div>

                  {/* Message Quote */}
                  {req.message && (
                    <blockquote className="req-message-quote">
                      "{req.message}"
                    </blockquote>
                  )}

                  {/* Action Buttons */}
                  <div className="req-actions-panel">
                    {/* Pending state */}
                    {req.status === 'pending' && (
                      <>
                        {!isSender ? (
                          <>
                            <button
                              className="btn-action-accept"
                              onClick={() => handleUpdateStatus(req.id, 'accepted')}
                            >
                              <Check size={16} /> Accept Proposal
                            </button>
                            <button
                              className="btn-action-decline"
                              onClick={() => handleUpdateStatus(req.id, 'declined')}
                            >
                              <X size={16} /> Decline
                            </button>
                          </>
                        ) : (
                          <span className="waiting-pill">
                            ⏳ Waiting for {partnerName} to accept...
                          </span>
                        )}
                      </>
                    )}

                    {/* Accepted state */}
                    {req.status === 'accepted' && (
                      <div className="accepted-action-group">
                        <button
                          className="btn-action-video pulse-ready"
                          onClick={() => handleJoinVideo(req)}
                          title="Enter the live video call room with your peer"
                        >
                          <Video size={17} />
                          <span>Enter Video Call Room</span>
                        </button>

                        <button
                          className="btn-action-msg"
                          onClick={() => navigate('/messages', { state: { targetUserId: partnerId } })}
                        >
                          <MessageSquare size={16} /> Chat
                        </button>

                        <button
                          className="btn-action-complete"
                          onClick={() => handleUpdateStatus(req.id, 'completed')}
                        >
                          <Check size={16} /> Mark Completed
                        </button>
                      </div>
                    )}

                    {/* Completed state */}
                    {req.status === 'completed' && (
                      <div className="completed-action-group">
                        <span className="completed-check-badge">
                          <CheckCircle2 size={16} /> Swap Completed
                        </span>
                        <button
                          className="btn-action-review"
                          onClick={() => setSelectedRequestForReview(req)}
                        >
                          <Star size={16} /> Leave Review & Rating
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRequestForReview && (
        <ReviewModal
          swapRequest={selectedRequestForReview}
          onClose={() => setSelectedRequestForReview(null)}
          onSuccess={() => {
            setSelectedRequestForReview(null);
            setToastMessage('🌟 Thank you! Your review has been submitted.');
            setTimeout(() => setToastMessage(''), 3000);
          }}
        />
      )}

      {/* Partner User Profile Modal */}
      {profileModalUser && (
        <UserProfileModal
          user={profileModalUser}
          reviews={profileReviews}
          onClose={() => setProfileModalUser(null)}
          onRequestSwap={() => setProfileModalUser(null)}
          onStartChat={(target) => {
            setProfileModalUser(null);
            navigate('/messages', { state: { targetUserId: target.id } });
          }}
        />
      )}
    </div>
  );
}

export default Requests;
