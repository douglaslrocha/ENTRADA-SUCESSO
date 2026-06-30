import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { safeLocalStorage } from '../utils/storage';

export interface UserProfile {
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

  const syncWithBackend = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', 'default')
        .maybeSingle();

      if (data) {
        const profile: UserProfile = {
          name: data.name || 'Usuário',
          age: data.age || '',
          bio: data.bio || '',
          avatar: data.avatar || '',
          city: data.city || '',
          ip: data.ip || '',
          lastKnownLocation: data.last_known_location || null
        };
        
        setUser(profile);
        localStorage.setItem('app_user_profile', JSON.stringify(profile));

        // Dynamic branding values
        if (data.app_custom_name) safeLocalStorage.setItem('app_custom_name', data.app_custom_name);
        if (data.app_custom_description) safeLocalStorage.setItem('app_custom_description', data.app_custom_description);
        if (data.app_custom_icon_type) safeLocalStorage.setItem('app_custom_icon_type', data.app_custom_icon_type);
        if (data.app_custom_icon_value) safeLocalStorage.setItem('app_custom_icon_value', data.app_custom_icon_value);

        // Notify App.tsx to reload favicon and title
        window.dispatchEvent(new CustomEvent('app-brand-updated'));
        console.log('[AuthContext] Profile & Branding synchronized from Supabase.');
      } else {
        // Seed default profile to Supabase if it doesn't exist
        const currentProfile = {
          name: 'Usuário',
          age: '',
          bio: '',
          avatar: '',
          city: '',
          ip: '',
          lastKnownLocation: null
        };
        await supabase.from('user_profile').insert({
          user_id: 'default',
          name: currentProfile.name,
          age: currentProfile.age,
          bio: currentProfile.bio,
          avatar: currentProfile.avatar,
          city: currentProfile.city,
          ip: currentProfile.ip,
          last_known_location: currentProfile.lastKnownLocation,
          app_custom_name: safeLocalStorage.getItem('app_custom_name') || 'Remix 1.7',
          app_custom_description: safeLocalStorage.getItem('app_custom_description') || 'Evolução Pessoal',
          app_custom_icon_type: safeLocalStorage.getItem('app_custom_icon_type') || 'default',
          app_custom_icon_value: safeLocalStorage.getItem('app_custom_icon_value') || '/pwa-icon.svg'
        });
      }
    } catch (e) {
      console.warn('[AuthContext] Error syncing profile with Supabase:', e);
    }
  };

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
    
    // Initial sync
    syncWithBackend();

    // Event listener for realtime db synchronization
    window.addEventListener('auth-profile-sync-request', syncWithBackend);
    return () => {
      window.removeEventListener('auth-profile-sync-request', syncWithBackend);
    };
  }, []);

  const login = async (email: string, password: string) => {
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

  const updateProfile = async (data: UserProfile) => {
    setUser(data);
    localStorage.setItem('app_user_profile', JSON.stringify(data));

    try {
      const { error } = await supabase
        .from('user_profile')
        .upsert({
          user_id: 'default',
          name: data.name,
          age: data.age,
          bio: data.bio,
          avatar: data.avatar,
          city: data.city,
          ip: data.ip,
          last_known_location: data.lastKnownLocation,
          updated_at: new Date().toISOString()
        });
      if (error) throw error;
      console.log('[AuthContext] Profile synced successfully with Supabase.');
    } catch (e) {
      console.warn('[AuthContext] Failed to save profile to Supabase:', e);
    }
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
