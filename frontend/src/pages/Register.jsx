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
    setError('Google sign-up was closed or could not be completed.');
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
        headline: formData.headline || 'LearnLoop Member',
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
            <h1>Create Your LearnLoop Account</h1>
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
