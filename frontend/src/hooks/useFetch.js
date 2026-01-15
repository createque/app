import { useState, useCallback } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/**
 * Custom hook for making authenticated API requests
 * with automatic token refresh on 401 errors
 */
export const useFetch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAccessToken = () => localStorage.getItem('accessToken');
  const getRefreshToken = () => localStorage.getItem('refreshToken');
  
  const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };

  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Refresh the access token
  const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();
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
      return false;
    } catch (err) {
      return false;
    }
  };

  // Main fetch function with auth and retry logic
  const fetchWithAuth = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    const accessToken = getAccessToken();
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    try {
      let response = await fetch(`${API}${endpoint}`, config);

      // If 401, try to refresh token and retry
      if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {
          // Retry with new token
          const newToken = getAccessToken();
          config.headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(`${API}${endpoint}`, config);
        } else {
          // Refresh failed, clear tokens and redirect
          clearTokens();
          window.location.href = '/admin/login';
          throw new Error('Sesja wygasła. Zaloguj się ponownie.');
        }
      }

      // Handle rate limiting
      if (response.status === 429) {
        const data = await response.json();
        throw new Error(data.message || 'Zbyt wiele prób. Spróbuj ponownie później.');
      }

      // Parse response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Wystąpił błąd');
      }

      return { data, status: response.status };
    } catch (err) {
      const errorMessage = err.message || 'Błąd połączenia z serwerem';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Convenience methods
  const get = useCallback((endpoint, options = {}) => 
    fetchWithAuth(endpoint, { ...options, method: 'GET' }), [fetchWithAuth]);

  const post = useCallback((endpoint, body, options = {}) => 
    fetchWithAuth(endpoint, { 
      ...options, 
      method: 'POST', 
      body: JSON.stringify(body) 
    }), [fetchWithAuth]);

  const put = useCallback((endpoint, body, options = {}) => 
    fetchWithAuth(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: JSON.stringify(body) 
    }), [fetchWithAuth]);

  const del = useCallback((endpoint, options = {}) => 
    fetchWithAuth(endpoint, { ...options, method: 'DELETE' }), [fetchWithAuth]);

  const patch = useCallback((endpoint, body, options = {}) => 
    fetchWithAuth(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: JSON.stringify(body) 
    }), [fetchWithAuth]);

  return {
    loading,
    error,
    clearError: () => setError(null),
    fetchWithAuth,
    get,
    post,
    put,
    del,
    patch
  };
};

export default useFetch;
