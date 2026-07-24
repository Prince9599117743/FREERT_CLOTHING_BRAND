'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateProfile: (fullName: string, phone: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (sessionUser: any) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();
      
      if (!profile) {
        // Self-healing: Insert profile record
        const newProfile = {
          id: sessionUser.id,
          email: sessionUser.email || '',
          full_name: sessionUser.user_metadata?.full_name || 'Customer Profile',
          role: 'customer'
        };
        await supabase.from('users').insert(newProfile);
        return {
          id: sessionUser.id,
          email: sessionUser.email || '',
          fullName: newProfile.full_name,
          phone: '',
          role: 'customer' as UserRole,
          createdAt: sessionUser.created_at,
          updatedAt: sessionUser.created_at
        };
      }

      return {
        id: sessionUser.id,
        email: sessionUser.email || '',
        fullName: profile?.full_name || sessionUser.user_metadata?.full_name || '',
        phone: profile?.phone || '',
        role: profile?.role || (sessionUser.app_metadata?.role as UserRole) || 'customer',
        createdAt: sessionUser.created_at,
        updatedAt: sessionUser.updated_at || sessionUser.created_at,
      };
    } catch {
      return {
        id: sessionUser.id,
        email: sessionUser.email || '',
        fullName: sessionUser.user_metadata?.full_name || '',
        phone: '',
        role: (sessionUser.app_metadata?.role as UserRole) || 'customer',
        createdAt: sessionUser.created_at,
        updatedAt: sessionUser.updated_at || sessionUser.created_at,
      };
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const uProfile = await fetchProfile(session.user);
        setUser(uProfile);
      }
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  useEffect(() => {
    // Check active session on mount
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Set edge validation cookie
          document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=604800; SameSite=Lax; Secure`;
          const uProfile = await fetchProfile(session.user);
          setUser(uProfile);
        } else {
          document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
        }
      } catch (err) {
        console.error('Session retrieve failure:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=604800; SameSite=Lax; Secure`;
        const uProfile = await fetchProfile(session.user);
        setUser(uProfile);
      } else {
        document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (fullName: string, phone: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('users')
      .upsert({ 
        id: user.id, 
        email: user.email, 
        full_name: fullName, 
        phone,
        role: user.role
      }, { onConflict: 'id' });
    if (error) throw error;
    setUser(prev => prev ? { ...prev, fullName, phone } : null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be wrapped in AuthProvider context scope.');
  }
  return context;
};
