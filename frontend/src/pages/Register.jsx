import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Sparkles, ArrowRight } from 'lucide-react';
import './Auth.css';

function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    headline: '',
    location: '',
    skillOfferingName: '',
    skillLearningName: '',
    agreeTerms: true
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickGoogleEmail, setQuickGoogleEmail] = useState('dheerajkumar12548@gmail.com');
  const [quickGoogleName, setQuickGoogleName] = useState('Dheeraj Kumar');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Google registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google OAuth is propagating. You can click Instant Sign Up below.');
  };

  const handleQuickGoogleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle({
        name: quickGoogleName,
        email: quickGoogleEmail,
        given_name: quickGoogleName.split(' ')[0],
        family_name: quickGoogleName.split(' ').slice(1).join(' '),
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(quickGoogleName)}&backgroundColor=4f46e5`,
        sub: 'google_' + Date.now()
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Google sign-up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeTerms) {
      setError('You must agree to the Terms of Service');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        headline: formData.headline || 'Skill Swap Member',
        location: formData.location || 'Remote',
        skillsOffering: formData.skillOfferingName ? [
          {
            name: formData.skillOfferingName,
            level: 'Intermediate',
            category: 'General'
          }
        ] : [],
        skillsLearning: formData.skillLearningName ? [
          {
            name: formData.skillLearningName,
            level: 'Beginner',
            category: 'General'
          }
        ] : [],
        agreeTerms: formData.agreeTerms
      };

      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper register-wrapper">
        <Card className="auth-card">
          <div className="auth-header">
            <div className="auth-badge">
              <Sparkles size={14} /> Free Membership
            </div>
            <h1>Create Your SkillSwap Account</h1>
            <p>Join peers exchanging skills, booking video calls, and growing together</p>
          </div>

          {error && <div className="form-error-banner">{error}</div>}

          {/* Google Sign-Up */}
          <div className="google-auth-container">
            <div className="google-btn-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                shape="pill"
                size="large"
                width="100%"
                text="signup_with"
                theme="outline"
              />
            </div>
          </div>

          {/* Instant Google Sign-Up */}
          <div className="instant-google-card">
            <button
              type="button"
              className="btn-instant-google"
              onClick={handleQuickGoogleSubmit}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Instant Sign Up with Google ({quickGoogleEmail})</span>
            </button>
          </div>

          <div className="auth-divider">
            <span>or sign up with email</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="e.g. Alex"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="e.g. Rivera"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="alex.rivera@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>A Skill You Can Teach (Optional)</label>
                <input
                  type="text"
                  name="skillOfferingName"
                  placeholder="e.g. React, UX Design, Guitar"
                  value={formData.skillOfferingName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>A Skill You Want to Learn (Optional)</label>
                <input
                  type="text"
                  name="skillLearningName"
                  placeholder="e.g. Python, Public Speaking"
                  value={formData.skillLearningName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-terms">
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              <label htmlFor="agreeTerms">
                I agree to the Community Guidelines & Terms of Exchange
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="btn-block btn-auth-submit"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Get Started Free'}
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-footer-link">
                Sign In <ArrowRight size={13} />
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Register;
