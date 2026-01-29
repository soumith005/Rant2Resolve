
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  // Updated login to return the user object in the promise result
  login: (email: string, pass: string) => Promise<{ success: boolean; user?: User; message?: string }>;
  register: (userData: Omit<User, 'id'>) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loading: boolean;
  // Added missing admin management features
  users: User[];
  createUser: (userData: Omit<User, 'id'>) => Promise<{ success: boolean; message?: string }>;
  deleteUser: (id: string) => Promise<{ success: boolean; message?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Load active user from storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('r2r_active_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Fetch all users for admin dashboard
  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.role === 'ADMIN') {
        try {
          // Assuming an endpoint exists to fetch all users for management
          const response = await api.get('/auth/users');
          if (response.success) {
            setUsers(response.data.map((u: any) => ({ ...u, id: u._id || u.id })));
          }
        } catch (error) {
          console.error('Failed to fetch users', error);
        }
      } else {
        setUsers([]);
      }
    };
    fetchUsers();
  }, [user]);

  // Handle user login
  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.success) {
        const userData = { ...response.user, id: response.user.id || response.user._id };
        setUser(userData);
        localStorage.setItem('r2r_token', response.token);
        localStorage.setItem('r2r_active_user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, message: 'Invalid response' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  // Handle user registration
  const register = async (userData: Omit<User, 'id'>) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.success) {
        return { success: true };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  // Admin: create a new user account
  const createUser = async (userData: Omit<User, 'id'>) => {
    const result = await register(userData);
    if (result.success && user?.role === 'ADMIN') {
      try {
        const response = await api.get('/auth/users');
        if (response.success) {
          setUsers(response.data.map((u: any) => ({ ...u, id: u._id || u.id })));
        }
      } catch (e) {
        console.error('Refresh users failed', e);
      }
    }
    return result;
  };

  // Admin: delete a user account
  const deleteUser = async (id: string) => {
    try {
      // Assuming a delete endpoint exists
      await api.post(`/auth/users/${id}/delete`, {});
      setUsers(prev => prev.filter(u => u.id !== id));
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  // User: update personal password
  const updatePassword = async (newPassword: string) => {
    try {
      // Assuming a profile update endpoint exists
      await api.patch('/auth/profile/password', { password: newPassword });
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  // Handle logout
  const logout = () => {
    setUser(null);
    setUsers([]);
    localStorage.removeItem('r2r_active_user');
    localStorage.removeItem('r2r_token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      users, 
      login, 
      register, 
      createUser, 
      deleteUser, 
      updatePassword, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
