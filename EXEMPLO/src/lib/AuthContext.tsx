import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserProfile {
  name: string;
  age: string;
  bio: string;
  avatar: string;
  city: string;
  ip: string;
  lastKnownLocation: {
    latitude: number;
    longitude: number;
    timestamp: number;
  } | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: UserProfile) => void;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem('app_auth_state');
    const storedUser = localStorage.getItem('app_user_profile');
    
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser({
        name: 'Usuário',
        age: '',
        bio: '',
        avatar: '',
        city: '',
        ip: '',
        lastKnownLocation: null
      });
    }
    
    setIsReady(true);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulating validation
    if (email.trim() && password.trim()) {
      setIsAuthenticated(true);
      localStorage.setItem('app_auth_state', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('app_auth_state');
  };

  const updateProfile = (data: UserProfile) => {
    setUser(data);
    localStorage.setItem('app_user_profile', JSON.stringify(data));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateProfile, isReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
