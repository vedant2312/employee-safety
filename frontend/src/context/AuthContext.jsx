import { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Register organization
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/organization/register', {
        name,
        email,
        password,
      });

      const { token, ...userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  // Login organization
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/organization/login', {
        email,
        password,
      });

      const { token, ...userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  // Login employee
  const loginEmployee = async (email, password) => {
    try {
      const response = await api.post('/auth/employee/login', {
        email,
        password,
      });

      // The backend returns the employee's job title in a field also called
      // "role" (e.g. "Software Developer").  We need a separate field to
      // mark this user as an employee for the frontend's auth checks, so
      // pull the job title out as "jobRole" and set role = 'employee'.
      const { token, role: jobRole, ...rest } = response.data;

      const userData = {
        ...rest,
        jobRole,            // keep the job title under a different key
        role: 'employee',   // auth-role marker used by isEmployee / isOrganization
      };

      // Write the COMPLETE object (including role:'employee') to storage
      // so it survives a page refresh.
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    register,
    login,
    loginEmployee,
    logout,
    isAuthenticated: !!user,
    isOrganization: user && !user.employeeId,
    isEmployee: user && !!user.employeeId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};