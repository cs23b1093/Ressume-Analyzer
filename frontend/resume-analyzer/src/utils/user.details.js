import { useState, useEffect } from 'react';

function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
      fetch('http://localhost:3000/api/v1/user/auth/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('AccessToken') || ''
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

    return { isAuthenticated, isLoading, user };
  }

export default useAuth;