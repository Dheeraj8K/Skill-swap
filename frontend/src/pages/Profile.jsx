import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Video,
  VideoOff,
  MapPin,
  Calendar,
  Star,
  Plus,
  Trash2,
  Check,
  Award,
  Sparkles,
  Edit3
} from 'lucide-react';
import './Profile.css';

function Profile() {
  const { user, updateProfile, toggleVideoAvailability } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    headline: '',
    bio: '',
    location: '',
    skillsOffering: [],
    skillsLearning: [],
    availability: []
  });

  // New skill temp inputs
  const [newOfferSkill, setNewOfferSkill] = useState('');
  const [newOfferLevel, setNewOfferLevel] = useState('Intermediate');
  const [newLearnSkill, setNewLearnSkill] = useState('');

  // Sync state with user
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        headline: user.headline || '',
        bio: user.bio || '',
        location: user.location || '',
        skillsOffering: user.skillsOffering || [],
        skillsLearning: user.skillsLearning || [],
        availability: user.availability || []
      });

      // Load user reviews
      api.getReviews(user.id).then((res) => {
        setReviews(res.reviews || []);
      }).catch(() => {});
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOfferSkill = () => {
    if (!newOfferSkill.trim()) return;
    setFormData((prev) => ({
      ...prev,
      skillsOffering: [
        ...prev.skillsOffering,
        { name: newOfferSkill.trim(), level: newOfferLevel, category: 'General' }
      ]
    }));
    setNewOfferSkill('');
  };

  const handleRemoveOfferSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skillsOffering: prev.skillsOffering.filter((_, i) => i !== index)
    }));
  };

  const handleAddLearnSkill = () => {
    if (!newLearnSkill.trim()) return;
    setFormData((prev) => ({
      ...prev,
      skillsLearning: [
        ...prev.skillsLearning,
        { name: newLearnSkill.trim(), level: 'Beginner' }
      ]
    }));
    setNewLearnSkill('');
  };

  const handleRemoveLearnSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skillsLearning: prev.skillsLearning.filter((_, i) => i !== index)
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save profile: " + err.message);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        {savedSuccess && (
          <div className="profile-save-banner">
            <Check size={18} />
            <span>Profile successfully updated!</span>
          </div>
        )}

        {/* Profile Header Hero */}
        <div className="profile-hero-card">
          <div className="profile-hero-banner"></div>
          <div className="profile-hero-content">
            <div className="profile-avatar-stack">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"}
                alt={user?.firstName}
                className="profile-hero-avatar"
              />
              <span
                className={`profile-hero-status-dot ${user?.videoAvailable ? 'online' : 'offline'}`}
                title={user?.videoAvailable ? 'Ready for Live Video Calls' : 'Offline for calls'}
              >
                {user?.videoAvailable ? <Video size={13} /> : <VideoOff size={13} />}
              </span>
            </div>

            <div className="profile-hero-info">
              <div className="profile-hero-title-row">
                <div>
                  <h1>{user?.firstName} {user?.lastName}</h1>
                  <p className="profile-hero-headline">{user?.headline || 'Skill Swap Member'}</p>
                </div>

                <div className="profile-hero-actions">
                  <button
                    className={`btn-toggle-video-status ${user?.videoAvailable ? 'active' : ''}`}
                    onClick={toggleVideoAvailability}
                  >
                    <Video size={16} />
                    <span>{user?.videoAvailable ? 'Video Call Ready' : 'Turn On Video Ready'}</span>
                  </button>

                  <button
                    className="btn-edit-toggle"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit3 size={16} />
                    <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
                  </button>
                </div>
              </div>

              <div className="profile-meta-tags">
                <span><MapPin size={15} /> {user?.location || 'Remote'}</span>
                <span><Star size={15} className="star-amber" /> {user?.rating || '5.0'} ({reviews.length} reviews)</span>
                <span><Check size={15} /> {user?.completedSwaps || 0} Completed Swaps</span>
                <span><Calendar size={15} /> Member since 2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form OR View Details */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="profile-edit-container">
            <div className="edit-section-card">
              <h2>Basic Profile Information</h2>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Professional Headline</label>
                <input
                  type="text"
                  name="headline"
                  value={formData.headline}
                  onChange={handleInputChange}
                  placeholder="e.g. Senior Frontend Engineer @ TechCo | React & TypeScript Mentor"
                />
              </div>

              <div className="form-group">
                <label>Bio / About Me</label>
                <textarea
                  rows={4}
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell learners about your experience, background, and teaching style..."
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. San Francisco, CA or London, UK"
                />
              </div>
            </div>

            {/* Skills Offering Management */}
            <div className="edit-section-card">
              <h2>Skills You Offer to Teach</h2>
              <div className="add-skill-inline">
                <input
                  type="text"
                  placeholder="Skill name (e.g. Next.js, Figma, Python)..."
                  value={newOfferSkill}
                  onChange={(e) => setNewOfferSkill(e.target.value)}
                />
                <select
                  value={newOfferLevel}
                  onChange={(e) => setNewOfferLevel(e.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <button
                  type="button"
                  className="btn-add-skill"
                  onClick={handleAddOfferSkill}
                >
                  <Plus size={16} /> Add Skill
                </button>
              </div>

              <div className="skills-edit-chips-list">
                {formData.skillsOffering.map((s, idx) => (
                  <div key={idx} className="skill-edit-chip">
                    <span>{s.name} ({s.level || 'Intermediate'})</span>
                    <button
                      type="button"
                      className="btn-remove-chip"
                      onClick={() => handleRemoveOfferSkill(idx)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Learning Management */}
            <div className="edit-section-card">
              <h2>Skills You Want to Learn</h2>
              <div className="add-skill-inline">
                <input
                  type="text"
                  placeholder="Target skill (e.g. Docker, Rust, Public Speaking)..."
                  value={newLearnSkill}
                  onChange={(e) => setNewLearnSkill(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-add-skill"
                  onClick={handleAddLearnSkill}
                >
                  <Plus size={16} /> Add Goal
                </button>
              </div>

              <div className="skills-edit-chips-list">
                {formData.skillsLearning.map((s, idx) => (
                  <div key={idx} className="skill-edit-chip learning">
                    <span>{s.name}</span>
                    <button
                      type="button"
                      className="btn-remove-chip"
                      onClick={() => handleRemoveLearnSkill(idx)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-save-actions">
              <button
                type="button"
                className="btn-cancel-edit"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-save-edit">
                Save Profile Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-display-grid">
            {/* Left Column */}
            <div className="profile-display-main">
              {/* Bio Card */}
              <div className="profile-content-card">
                <h2>About</h2>
                <p className="profile-bio-text">
                  {user?.bio || 'Passionate about continuous peer-to-peer learning and exchanging practical skills.'}
                </p>
              </div>

              {/* Skills Split */}
              <div className="skills-two-col-box">
                <div className="profile-content-card">
                  <h2>Skills I Can Teach</h2>
                  <div className="profile-skills-pills">
                    {user?.skillsOffering?.map((skill, idx) => (
                      <div key={idx} className="profile-skill-badge">
                        <span className="skill-title">{skill.name}</span>
                        <span className="skill-lvl">{skill.level || 'Intermediate'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="profile-content-card">
                  <h2>Skills I'm Learning</h2>
                  <div className="profile-skills-pills">
                    {user?.skillsLearning?.map((skill, idx) => (
                      <div key={idx} className="profile-skill-badge learning">
                        <span className="skill-title">{skill.name}</span>
                        <span className="skill-lvl">{skill.level || 'Beginner'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews Card */}
              <div className="profile-content-card">
                <h2>Verified Community Reviews ({reviews.length})</h2>
                {reviews.length === 0 ? (
                  <p className="empty-reviews-text">No reviews received yet.</p>
                ) : (
                  <div className="profile-reviews-stream">
                    {reviews.map((r, idx) => (
                      <div key={idx} className="profile-review-bubble">
                        <div className="rev-bubble-header">
                          <img
                            src={r.reviewerAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"}
                            alt={r.reviewerName}
                            className="rev-bubble-avatar"
                          />
                          <div>
                            <strong>{r.reviewerName}</strong>
                            <div className="rev-stars-inline">
                              {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                              <span className="endorsed-skill">• {r.skill}</span>
                            </div>
                          </div>
                          <span className="rev-date-tag">{r.createdAt}</span>
                        </div>
                        <p className="rev-comment-text">"{r.comment}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Badges & Weekly Schedule */}
            <div className="profile-display-aside">
              {/* Badges */}
              <div className="profile-content-card">
                <h2>Badges & Recognition</h2>
                <div className="profile-badges-row">
                  {(user?.badges || ["Top Rated Mentor", "WebRTC Pioneer", "Super Responsive"]).map((badge, idx) => (
                    <span key={idx} className="profile-badge-chip">
                      <Award size={14} /> {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* Weekly Availability */}
              <div className="profile-content-card">
                <h2>Weekly Availability</h2>
                <div className="profile-avail-slots">
                  {(user?.availability || [
                    { day: "Monday", slots: ["06:00 PM - 07:00 PM"] },
                    { day: "Wednesday", slots: ["06:00 PM - 07:00 PM"] },
                    { day: "Saturday", slots: ["10:00 AM - 12:00 PM"] }
                  ]).map((av, idx) => (
                    <div key={idx} className="profile-day-slot">
                      <strong>{av.day}</strong>
                      <div className="slots-chip-group">
                        {av.slots?.map((slot, sIdx) => (
                          <span key={sIdx} className="slot-pill">{slot}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
