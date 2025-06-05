import axios from 'axios';

// Ensure your backend API URL is correctly set here or in an environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Interceptor to handle 401 errors (e.g., token expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors, e.g., redirect to login
      // This depends on how you want to manage session expiry.
      console.warn('Unauthorized request or token expired. Interceptor caught 401.');
      // localStorage.removeItem('authToken'); // AuthContext should handle this
      // window.location.href = '/login'; // Or use useNavigate if accessible here
    }
    return Promise.reject(error);
  }
);

export default apiClient;
