import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import SendRequestModal from '../components/modals/SendRequestModal';
import UserProfileModal from '../components/modals/UserProfileModal';
import {
  Search,
  Video,
  Star,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import './BrowseUsers.css';

const CATEGORIES = [
  'All',
  'Development',
  'Design',
  'AI & Data',
  'DevOps',
  'Writing',
  'Creative'
];

function BrowseUsers() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [videoOnly, setVideoOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [targetUserForRequest, setTargetUserForRequest] = useState(null);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);
  const [detailReviews, setDetailReviews] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.q = searchTerm;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (videoOnly) params.videoOnly = 'true';

      const res = await api.getUsers(params);
      setUsers(res.users);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedCategory, videoOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  // Open User Profile Modal & fetch reviews
  const handleOpenDetail = async (user) => {
    setSelectedUserForDetail(user);
    try {
      const res = await api.getReviews(user.id);
      setDetailReviews(res.reviews);
    } catch (e) {
      setDetailReviews([]);
    }
  };

  const handleRequestSuccess = () => {
    setTargetUserForRequest(null);
    setToastMessage('🎉 LearnLoop Swap Request Sent! Check your Requests tab.');
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleStartChat = (user) => {
    setSelectedUserForDetail(null);
    navigate('/messages', { state: { targetUserId: user.id } });
  };

  return (
    <div className="browse-users-page">
      <div className="container">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="global-toast-banner">
            <CheckCircle size={18} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Hero Header */}
        <div className="browse-header-section">
          <div className="browse-badge">
            <Sparkles size={15} /> Peer Learning Marketplace
          </div>
          <h1>Find Mentors & LearnLoop Partners</h1>
          <p className="browse-subtitle">
            Connect with verified peers. Learn anything by exchanging the skills you already possess.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="search-form-card">
            <div className="search-field">
              <Search size={20} className="search-field-icon" />
              <input
                type="text"
                placeholder="Search by name, skill (e.g. React, Python, Figma), or topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Video Call Available Filter Toggle */}
            <label className={`video-filter-toggle ${videoOnly ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={videoOnly}
                onChange={(e) => setVideoOnly(e.target.checked)}
              />
              <Video size={16} />
              <span>Video Ready Now</span>
            </label>

            <button type="submit" className="btn-search-submit">
              Search
            </button>
          </form>

          {/* Category Filter Chips */}
          <div className="category-chips-row">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Users Count & Current Filter Info */}
        <div className="results-status-bar">
          <span>Showing <strong>{users.length}</strong> matching mentors</span>
          {videoOnly && (
            <span className="filter-pill-active">
              🟢 Filtered: Ready for Instant Video Call
            </span>
          )}
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="loading-grid-spinner">
            <div className="spinner-circle"></div>
            <p>Finding compatible learning partners...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="no-results-card">
            <Sparkles size={36} className="empty-sparkle" />
            <h3>No matching learning partners found</h3>
            <p>Try searching for a different skill or clear your filters.</p>
            <button
              className="btn-clear-filters"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setVideoOnly(false);
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="users-cards-grid">
            {users.map((user) => (
              <div key={user.id} className="user-profile-card">
                {/* Top Status */}
                <div className="user-card-top">
                  <div className="avatar-container">
                    <img src={user.avatar} alt={user.firstName} className="card-avatar" />
                    {user.videoAvailable && (
                      <span className="online-video-dot" title="Available for Video Call">
                        <Video size={12} />
                      </span>
                    )}
                  </div>

                  <div className="user-top-meta">
                    <div className="rating-pill">
                      <Star size={13} className="star-fill" />
                      <span>{user.rating}</span>
                      <small>({user.reviewCount || 0})</small>
                    </div>

                    {user.videoAvailable && (
                      <span className="video-status-chip">
                        <span className="pulse-circle"></span> Video Ready
                      </span>
                    )}
                  </div>
                </div>

                {/* Identity */}
                <div className="user-card-identity">
                  <h3 className="card-user-name">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="card-headline">{user.headline}</p>
                  <span className="card-location">
                    <MapPin size={13} /> {user.location}
                  </span>
                </div>

                {/* Skills Offered */}
                <div className="card-skills-section">
                  <span className="section-label">Can Teach You:</span>
                  <div className="skills-badge-list">
                    {user.skillsOffering?.slice(0, 3).map((skill, sIdx) => (
                      <span key={sIdx} className="skill-chip-teaching">
                        {skill.name}
                        {skill.level && <small>{skill.level}</small>}
                      </span>
                    ))}
                    {user.skillsOffering?.length > 3 && (
                      <span className="skill-chip-more">
                        +{user.skillsOffering.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Skills Learning */}
                <div className="card-skills-section">
                  <span className="section-label">Wants to Learn:</span>
                  <div className="skills-badge-list">
                    {user.skillsLearning?.slice(0, 2).map((skill, sIdx) => (
                      <span key={sIdx} className="skill-chip-learning">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="card-actions-row">
                  <button
                    className="btn-view-details"
                    onClick={() => handleOpenDetail(user)}
                  >
                    View Profile
                  </button>
                  <button
                    className="btn-propose-swap"
                    onClick={() => setTargetUserForRequest(user)}
                  >
                    Propose Swap <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {targetUserForRequest && (
        <SendRequestModal
          targetUser={targetUserForRequest}
          onClose={() => setTargetUserForRequest(null)}
          onSuccess={handleRequestSuccess}
        />
      )}

      {selectedUserForDetail && (
        <UserProfileModal
          user={selectedUserForDetail}
          reviews={detailReviews}
          onClose={() => setSelectedUserForDetail(null)}
          onRequestSwap={(user) => {
            setSelectedUserForDetail(null);
            setTargetUserForRequest(user);
          }}
          onStartChat={handleStartChat}
        />
      )}
    </div>
  );
}

export default BrowseUsers;
