import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('skillswap_token'));
  const [loading, setLoading] = useState(true);

  // Initialize user from stored token
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        setUser(res.user);
      } catch (err) {
        console.warn("Session token expired or invalid:", err.message);
        localStorage.removeItem('skillswap_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('skillswap_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    localStorage.setItem('skillswap_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const loginWithGoogle = async (credentialOrProfile) => {
    const payload = typeof credentialOrProfile === 'string'
      ? { credential: credentialOrProfile }
      : { profile: credentialOrProfile };

    const res = await api.googleAuth(payload);
    localStorage.setItem('skillswap_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('skillswap_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await api.updateProfile(profileData);
    setUser(res.user);
    return res.user;
  };

  const toggleVideoAvailability = async () => {
    try {
      const res = await api.toggleVideoAvailability();
      setUser(prev => prev ? { ...prev, videoAvailable: res.videoAvailable } : null);
      return res.videoAvailable;
    } catch (err) {
      console.error("Failed to toggle video availability:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        toggleVideoAvailability
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
