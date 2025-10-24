import { useState, useEffect } from 'react';

function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
      const token = localStorage.getItem('AccessToken');
      fetch('http://localhost:3000/api/v1/user/auth/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include', // Important: include cookies for authentication
      })
      .then(res => res.json())
      .then(data => {
        console.log('Auth check response:', data);
        if (data.success) {
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(error => {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
    }, []);

    const login = (tokens) => {
      localStorage.setItem('AccessToken', tokens.accessToken);
      localStorage.setItem('RefreshToken', tokens.refreshToken);
      // Optionally trigger a re-check
      window.location.reload(); // Simple way to refresh auth state
    };

    const logout = () => {
      localStorage.removeItem('AccessToken');
      localStorage.removeItem('RefreshToken');
      setIsAuthenticated(false);
      setUser(null);
    };

    return { isAuthenticated, isLoading, user, login, logout };
  }

export default useAuth;
