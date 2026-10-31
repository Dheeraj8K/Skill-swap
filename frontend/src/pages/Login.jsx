import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import './Auth.css';

function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was closed or could not be completed.');
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <Card className="auth-card">
          <div className="auth-header">
            <div className="auth-badge">
              <Sparkles size={14} /> Welcome Back
            </div>
            <h1>Sign In to LearnLoop</h1>
            <p>Exchange knowledge, grow your network, and master new skills</p>
          </div>

          {error && <div className="form-error-banner">{error}</div>}

          {/* Google Sign-In */}
          <div className="google-auth-container">
            <div className="google-btn-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                shape="pill"
                size="large"
                width="100%"
                text="signin_with"
                theme="outline"
              />
            </div>
          </div>

          <div className="auth-divider">
            <span>or sign in with email</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-remember">
              <input type="checkbox" id="remember" defaultChecked />
              <label htmlFor="remember">Keep me signed in</label>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="btn-block btn-auth-submit"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              New to LearnLoop?{' '}
              <Link to="/register" className="auth-footer-link">
                Create a free account <ArrowRight size={13} />
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Login;
