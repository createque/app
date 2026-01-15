import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get stored tokens
  const getTokens = () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    return { accessToken, refreshToken };
  };

  // Store tokens
  const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };

  // Clear tokens
  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Fetch current user
  const fetchUser = useCallback(async () => {
    const { accessToken } = getTokens();
    if (!accessToken) {
      setLoading(false);
      return null;
    }

    try {
      const response = await fetch(`${API}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return userData;
      } else if (response.status === 401) {
        // Try to refresh token
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return fetchUser();
        }
        clearTokens();
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  // Refresh access token
  const refreshAccessToken = async () => {
    const { refreshToken } = getTokens();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data.access_token, data.refresh_token);
        return true;
      }
    } catch (err) {
      console.error('Error refreshing token:', err);
    }
    return false;
  };

  // Login
  const login = async (email, password, rememberMe = false) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          remember_me: rememberMe
        })
      });

      const data = await response.json();

      if (response.ok) {
        setTokens(data.access_token, data.refresh_token);
        await fetchUser();
        return { success: true };
      } else {
        const errorMsg = data.detail || 'Błędne dane logowania';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = 'Błąd połączenia z serwerem';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    const { accessToken } = getTokens();
    
    try {
      if (accessToken) {
        await fetch(`${API}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    try {
      const response = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      return { success: response.ok, message: data.message };
    } catch (err) {
      console.error('Password reset request error:', err);
      return { success: false, message: 'Błąd połączenia z serwerem' };
    }
  };

  // Reset password with token
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, new_password: newPassword })
      });

      const data = await response.json();
      return { 
        success: response.ok, 
        message: data.message || data.detail 
      };
    } catch (err) {
      console.error('Password reset error:', err);
      return { success: false, message: 'Błąd połączenia z serwerem' };
    }
  };

  // Initialize auth state
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!user) return;

    // Refresh token every 14 minutes (before 15 min expiry)
    const interval = setInterval(() => {
      refreshAccessToken();
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    requestPasswordReset,
    resetPassword,
    refreshUser: fetchUser,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
