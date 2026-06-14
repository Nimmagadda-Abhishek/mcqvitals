import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  approvalStatus: 'unknown',
  isApproved: false,
  loading: true,
  login: () => {},
  register: () => {},
  logout: () => {},
  getProfile: () => {}
});


export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
        // Fetch fresh profile in the background to sync subscription status
        api.auth.getProfile().then(data => {
            setUser(prev => {
                const newUser = { ...prev, ...data };
                localStorage.setItem('user', JSON.stringify(newUser));
                return newUser;
            });
        }).catch(err => console.error("Background profile fetch failed", err));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const deriveApproval = (u) => {
    if (!u) return { approvalStatus: 'unknown', isApproved: false };

    if (typeof u.approved === 'boolean') {
      return { approvalStatus: u.approved ? 'approved' : 'pending', isApproved: u.approved };
    }
    if (typeof u.isApproved === 'boolean') {
      return { approvalStatus: u.isApproved ? 'approved' : 'pending', isApproved: u.isApproved };
    }
    if (typeof u.approvalStatus === 'string') {
      const s = u.approvalStatus.toLowerCase();
      return { approvalStatus: s, isApproved: s === 'approved' };
    }
    if (typeof u.status === 'string') {
      const s = u.status.toLowerCase();
      if (s === 'pending' || s === 'approved') {
        return { approvalStatus: s, isApproved: s === 'approved' };
      }
    }

    if (typeof u.role === 'string') {
      if (u.role === 'admin') return { approvalStatus: 'approved', isApproved: true };
      if (u.role === 'pending') return { approvalStatus: 'pending', isApproved: false };
    }

    return { approvalStatus: 'unknown', isApproved: u.role === 'admin' };
  };

  const { approvalStatus, isApproved } = deriveApproval(user);


  const login = async (email, password) => {
    try {
      let deviceId = localStorage.getItem('app_device_id');
      if (!deviceId) {
        deviceId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('app_device_id', deviceId);
      }

      const data = await api.auth.login({ email, password, deviceId });
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      setUser(data);
      setIsLoggedIn(true);
      return { success: true };
    } catch (error) {
      // Pass the whole error object or message/flags if we have deviceMismatch
      return { success: false, message: error.message, errorData: error };
    }
  };


  const register = async (name, email, password) => {
    try {
      const data = await api.auth.register({ name, email, password });
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      setUser(data);
      setIsLoggedIn(true);
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };


  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
  };

  const getProfile = async () => {
    try {
      const data = await api.auth.getProfile();
      setUser(prev => {
        const newUser = { ...prev, ...data };
        localStorage.setItem('user', JSON.stringify(newUser));
        return newUser;
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch profile', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      user,
      approvalStatus,
      isApproved,
      loading,
      login,
      register,
      logout,
      getProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
