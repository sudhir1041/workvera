import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api'; 
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate(); 

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        // Temporarily set header for this one call, apiClient interceptor will handle subsequent
        try {
          const response = await apiClient.get('/auth/users/me/', {
            headers: { 'Authorization': `Token ${storedToken}` } 
          });
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user with stored token', error);
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
          // No need to delete default header here if interceptor handles it
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []); 

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/token/login/', { email, password });
      const { auth_token } = response.data;
      localStorage.setItem('authToken', auth_token);
      setToken(auth_token);
      // Interceptor will add token to subsequent requests
      const userResponse = await apiClient.get('/auth/users/me/');
      setUser(userResponse.data);
      return userResponse.data; 
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      await apiClient.post('/auth/users/', userData);
    } catch (error) {
      console.error('Signup failed:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Interceptor handles adding the token for this request
      await apiClient.post('/auth/token/logout/');
    } catch (error) {
      console.error('Logout failed on server:', error.response?.data || error.message);
    } finally {
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
      // Interceptor will no longer add token as it's removed from localStorage
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
