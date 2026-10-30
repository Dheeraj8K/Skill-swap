import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { Video, Sparkles, Shield, Heart } from 'lucide-react';
import './Layout.css';

function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer-wrap">
        <div className="container footer-container">
          <div className="footer-brand-col">
            <div className="footer-logo">
              <span className="logo-sparkle">⚡</span>
              <span className="brand-title">LearnLoop</span>
            </div>
            <p className="footer-desc">
              The premier open exchange platform for peer-to-peer knowledge sharing and live video mentorship.
            </p>
            <div className="footer-security-tag">
              <Shield size={14} className="text-green" /> 100% Encrypted Video & Zero Fee Barter
            </div>
          </div>

          <div className="footer-links-col">
            <h4>Explore Marketplace</h4>
            <Link to="/users?category=Development">Engineering & Code</Link>
            <Link to="/users?category=Design">UI/UX & Product Design</Link>
            <Link to="/users?category=AI+%26+Data">AI, PyTorch & Data</Link>
            <Link to="/users?videoOnly=true">Live Video Ready Mentors</Link>
          </div>

          <div className="footer-links-col">
            <h4>Platform</h4>
            <Link to="/dashboard">Learning Dashboard</Link>
            <Link to="/requests">Swap Requests</Link>
            <Link to="/messages">Direct Messages</Link>
            <Link to="/profile">My Skills Profile</Link>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="container bottom-bar-inner">
            <span>&copy; {new Date().getFullYear()} LearnLoop Inc. All rights reserved.</span>
            <span className="footer-love">
              Crafted for collaborative lifelong learners <Heart size={13} className="text-red" />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
