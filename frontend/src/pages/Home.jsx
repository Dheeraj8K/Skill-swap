import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import {
  Video,
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  CheckCircle,
  Code,
  Palette,
  Cpu,
  Globe,
  MessageSquare,
  Award
} from 'lucide-react';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [heroSearch, setHeroSearch] = useState('');

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/users?q=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/users');
    }
  };

  const steps = [
    {
      step: '01',
      title: 'List Your Skills',
      description: 'Highlight what you excel at (e.g. React, UX, Python, Music) and what you are eager to learn next.',
      icon: <Award className="step-icon text-indigo" />
    },
    {
      step: '02',
      title: 'Match & Propose Swap',
      description: 'Find a peer with complementary skills, propose a 30-60 minute exchange, and agree on a time slot.',
      icon: <Users className="step-icon text-pink" />
    },
    {
      step: '03',
      title: 'Join Live Video & Exchange',
      description: 'Connect face-to-face in encrypted video rooms with real-time shared notes, code sharing, and review feedback.',
      icon: <Video className="step-icon text-green" />
    }
  ];

  const valueProps = [
    {
      icon: <Video size={24} className="vp-icon text-green" />,
      title: 'Integrated HD Video Calling',
      desc: 'No Zoom links or third-party apps required. Jump into private video rooms with screen sharing and live collaborative scratchpads in one click.'
    },
    {
      icon: <ShieldCheck size={24} className="vp-icon text-indigo" />,
      title: 'Zero Financial Cost',
      desc: 'A true knowledge barter economy. Give 45 minutes of what you know to receive 45 minutes of what you want to master.'
    },
    {
      icon: <Star size={24} className="vp-icon text-amber" />,
      title: 'Verified Reviews & Trust',
      desc: 'Transparent peer ratings and skill endorsements ensure high-quality exchanges and genuine mentor dedication.'
    },
    {
      icon: <Sparkles size={24} className="vp-icon text-purple" />,
      title: 'Smart Skill Compatibility',
      desc: 'Our engine matches your teaching strengths with mentors who desire your skillset and possess what you seek.'
    }
  ];

  const popularSkills = [
    'React & Next.js',
    'Python & AI',
    'Figma & UI/UX',
    'AWS DevOps',
    'TypeScript',
    'Music Production',
    'Technical Writing'
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-badge">
            <span className="live-radar-dot"></span>
            <span>Over 1,400+ Mentors Online & Ready for Video Swaps</span>
          </div>

          <h1 className="hero-headline">
            Master Any Skill by <br />
            <span className="gradient-text">Teaching What You Already Know.</span>
          </h1>

          <p className="hero-subtext">
            SkillSwap is the community barter platform where developers, designers, and creators exchange expertise 1-on-1 through live video sessions. No subscriptions, zero fees.
          </p>

          {/* Interactive Hero Search */}
          <form onSubmit={handleHeroSearch} className="hero-search-box">
            <Search size={22} className="hero-search-icon" />
            <input
              type="text"
              placeholder="What do you want to learn? (e.g. React, Python, UI Design, Ableton)..."
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
            />
            <button type="submit" className="btn-hero-search">
              Find Partners <ArrowRight size={16} />
            </button>
          </form>

          {/* Popular Skill Pills */}
          <div className="hero-tags-row">
            <span className="tags-label">Trending Swaps:</span>
            {popularSkills.map((sk) => (
              <button
                key={sk}
                type="button"
                className="hero-tag-pill"
                onClick={() => navigate(`/users?q=${encodeURIComponent(sk)}`)}
              >
                {sk}
              </button>
            ))}
          </div>

          <div className="hero-action-buttons">
            <Link to={isAuthenticated ? "/dashboard" : "/register"}>
              <Button variant="primary" className="btn-large shadow-glow">
                {isAuthenticated ? "Go to Dashboard" : "Start Swapping Free"}
              </Button>
            </Link>
            <Link to="/users">
              <Button variant="secondary" className="btn-large">
                <Video size={18} /> Browse Video-Ready Mentors
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Ribbon */}
      <section className="metrics-ribbon">
        <div className="container">
          <div className="metrics-grid">
            <div className="metric-item">
              <strong className="metric-number">12,500+</strong>
              <span className="metric-label">Skills Swapped</span>
            </div>
            <div className="metric-item">
              <strong className="metric-number">100%</strong>
              <span className="metric-label">Free Peer Exchanges</span>
            </div>
            <div className="metric-item">
              <strong className="metric-number">4.9 / 5.0</strong>
              <span className="metric-label">Average Session Rating</span>
            </div>
            <div className="metric-item">
              <strong className="metric-number">HD Video</strong>
              <span className="metric-label">Direct In-Browser Calls</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works (3 Steps) */}
      <section className="steps-section">
        <div className="container">
          <div className="section-header-center">
            <span className="section-eyebrow">Seamless Process</span>
            <h2>How SkillSwap Works</h2>
            <p>Three straightforward steps to learn from genuine practitioners.</p>
          </div>

          <div className="steps-grid">
            {steps.map((s, idx) => (
              <div key={idx} className="step-card">
                <div className="step-number-tag">{s.step}</div>
                <div className="step-icon-wrap">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Propositions / Features */}
      <section className="features-section">
        <div className="container">
          <div className="section-header-center">
            <span className="section-eyebrow">Engineered for Success</span>
            <h2>Why Learn on SkillSwap?</h2>
            <p>Say goodbye to overpriced courses. Experience real-time human feedback.</p>
          </div>

          <div className="value-props-grid">
            {valueProps.map((vp, idx) => (
              <div key={idx} className="vp-card">
                <div className="vp-icon-circle">{vp.icon}</div>
                <h3>{vp.title}</h3>
                <p>{vp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Spotlight Banner */}
      <section className="spotlight-section">
        <div className="container">
          <div className="spotlight-card">
            <div className="spotlight-content">
              <span className="spotlight-badge">
                <Video size={14} /> Built-in Video Studio
              </span>
              <h2>Practice Hands-on With Your Peer Partner</h2>
              <p>
                Every accepted swap gives you access to a private, WebRTC-powered virtual room. Code together, sketch architectures, share screens, and build meaningful professional relationships.
              </p>
              <div className="spotlight-check-list">
                <span><CheckCircle size={16} className="text-green" /> Real-time collaborative notepad</span>
                <span><CheckCircle size={16} className="text-green" /> Screen sharing & live mic/camera toggles</span>
                <span><CheckCircle size={16} className="text-green" /> End-of-call rating & verified testimonials</span>
              </div>
              <Link to="/users">
                <button className="btn-spotlight-action">
                  Explore Ready Mentors <ArrowRight size={16} />
                </button>
              </Link>
            </div>

            <div className="spotlight-visual">
              <div className="mock-call-card">
                <div className="mock-call-header">
                  <div className="mock-dots"><span></span><span></span><span></span></div>
                  <span className="mock-title">Active Video Exchange: React ↔ Python</span>
                </div>
                <div className="mock-call-body">
                  <div className="mock-video-tile">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120" alt="Sarah" />
                    <span>Sarah (React)</span>
                  </div>
                  <div className="mock-video-tile">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120" alt="Mike" />
                    <span>Mike (Python)</span>
                  </div>
                </div>
                <div className="mock-call-footer">
                  <span className="mock-live-badge">🟢 Connected (42:15)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-inner-card">
            <h2>Ready to Expand Your Skillset?</h2>
            <p>Join our thriving community of makers, engineers, and creatives today.</p>
            <div className="cta-btns">
              <Link to="/register">
                <button className="btn-cta-primary">
                  Create Your Free Profile <ArrowRight size={16} />
                </button>
              </Link>
              <Link to="/users">
                <button className="btn-cta-secondary">
                  Browse Community
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
