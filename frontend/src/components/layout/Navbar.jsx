import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  Users,
  LayoutDashboard,
  ArrowRightLeft,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, toggleVideoAvailability } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar-wrapper">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="logo-icon-box">
            <span className="logo-lightning">⚡</span>
          </div>
          <div className="logo-text-group">
            <span className="brand-name">SkillSwap</span>
            <span className="brand-tag">Peer Mentorship</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="nav-links-menu">
          <li>
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/users" className={`nav-link ${isActive('/users') ? 'active' : ''}`}>
              <Users size={16} /> Browse Mentors
            </Link>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/requests"
                  className={`nav-link ${isActive('/requests') ? 'active' : ''}`}
                >
                  <ArrowRightLeft size={16} /> Requests
                </Link>
              </li>
              <li>
                <Link
                  to="/messages"
                  className={`nav-link ${isActive('/messages') ? 'active' : ''}`}
                >
                  <MessageSquare size={16} /> Messages
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Right Auth / User Area */}
        <div className="nav-right-actions">
          {isAuthenticated ? (
            <div className="user-nav-dropdown-wrap">
              {/* Live Video Indicator Pill */}
              <button
                className={`nav-video-pill ${user?.videoAvailable ? 'online' : 'offline'}`}
                onClick={toggleVideoAvailability}
                title="Toggle your availability for instant video calls"
              >
                <span className="pill-dot"></span>
                <span className="pill-text">
                  {user?.videoAvailable ? 'Video Ready' : 'Video Offline'}
                </span>
              </button>

              {/* Profile Trigger */}
              <button
                className="user-profile-trigger"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <img
                  src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80"}
                  alt={user?.firstName}
                  className="nav-user-avatar"
                />
                <span className="nav-user-name">{user?.firstName}</span>
                <ChevronDown size={14} className="chevron-icon" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div
                  className="profile-dropdown-menu"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="dropdown-user-header">
                    <strong>{user?.firstName} {user?.lastName}</strong>
                    <span>{user?.email}</span>
                  </div>

                  <div className="dropdown-divider"></div>

                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <User size={15} /> My Profile & Skills
                  </Link>

                  <Link
                    to="/dashboard"
                    className="dropdown-item"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <LayoutDashboard size={15} /> Learning Dashboard
                  </Link>

                  <div className="dropdown-divider"></div>

                  <button className="dropdown-item logout-btn" onClick={handleLogout}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-action-buttons">
              <Link to="/login" className="btn-nav-login">
                Sign In
              </Link>
              <Link to="/register" className="btn-nav-signup">
                Get Started Free
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <Link
            to="/"
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/users"
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Browse Mentors
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/requests"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Requests
              </Link>
              <Link
                to="/messages"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Messages
              </Link>
              <Link
                to="/profile"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile & Skills
              </Link>
              <button className="mobile-logout-btn" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <div className="mobile-auth-links">
              <Link
                to="/login"
                className="btn-nav-login"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-nav-signup"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
