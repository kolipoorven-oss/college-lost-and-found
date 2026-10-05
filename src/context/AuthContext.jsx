import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('campus_token') || null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch current user if token exists
  const fetchCurrentUser = async (jwtToken) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setUnreadCount(data.unreadMessagesCount || 0);
      } else {
        // Token expired or invalid
        logout();
      }
    } catch (err) {
      console.error('Failed to verify token:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (identifier, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });

    let data;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error('Unable to connect to authentication server. Please try again.');
    }

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem('campus_token', data.token);
    setToken(data.token);
    setUser(data.user);
    fetchCurrentUser(data.token);
    return data.user;
  };

  const register = async (userData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    let data;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error('Unable to connect to registration server. Please try again.');
    }

    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    localStorage.setItem('campus_token', data.token);
    setToken(data.token);
    setUser(data.user);
    fetchCurrentUser(data.token);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('campus_token');
    setToken(null);
    setUser(null);
    setUnreadCount(0);
  };

  // Quick demo switch for evaluation & presentations
  const quickLogin = async (roleType) => {
    const demoCredentials = {
      student: { identifier: 'alex.rivers@college.edu', password: 'College@123' },
      student2: { identifier: 'priya.sharma@college.edu', password: 'College@123' },
      staff: { identifier: 'marcus.vance@college.edu', password: 'College@123' },
      admin: { identifier: 'admin@college.edu', password: 'College@123' }
    };

    const creds = demoCredentials[roleType] || demoCredentials.student;
    return await login(creds.identifier, creds.password);
  };

  const refreshUser = () => {
    if (token) {
      fetchCurrentUser(token);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      unreadCount,
      login,
      register,
      logout,
      quickLogin,
      refreshUser
    }}>
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
