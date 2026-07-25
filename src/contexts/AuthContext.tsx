'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, UserRole } from '@/types';
import { ShieldAlert } from 'lucide-react';

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
  const [concurrentLogoutAlert, setConcurrentLogoutAlert] = useState<boolean>(false);

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
          full_name: sessionUser.user_metadata?.full_name || '',
          phone: sessionUser.user_metadata?.phone || '',
          role: 'customer'
        };
        await supabase.from('users').insert(newProfile);
        return {
          id: sessionUser.id,
          email: sessionUser.email || '',
          fullName: newProfile.full_name,
          phone: newProfile.phone,
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

  const registerSessionId = async (sessionUser: any) => {
    if (typeof window === 'undefined') return;
    let sessionId = localStorage.getItem('freert_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('freert_session_id', sessionId);
    }
    const dbSessionId = sessionUser.user_metadata?.current_session_id;
    if (dbSessionId !== sessionId) {
      await supabase.auth.updateUser({ data: { current_session_id: sessionId } });
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
          await registerSessionId(session.user);
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
        await registerSessionId(session.user);
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

  // Real-time Concurrent Login Detection loop (runs in background)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        const { data: { user: sessionUser } } = await supabase.auth.getUser();
        if (sessionUser) {
          let sessionId = localStorage.getItem('freert_session_id');
          const dbSessionId = sessionUser.user_metadata?.current_session_id;
          if (dbSessionId && dbSessionId !== sessionId) {
            setConcurrentLogoutAlert(true);
            document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
            await supabase.auth.signOut();
            setUser(null);
          }
        }
      } catch (e) {
        // Network heartbeat tolerance
      }
    }, 10000); // Check every 10 seconds for concurrent login
    return () => clearInterval(interval);
  }, [user]);

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

      {concurrentLogoutAlert && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-[5px] z-[99999] flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-[#FFFCF8] border border-neutral-soft/80 max-w-sm w-full p-8 text-center shadow-2xl flex flex-col items-center gap-5 rounded-none">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-800 border border-red-100 animate-bounce">
              <ShieldAlert size={22} />
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="font-serif text-lg font-light tracking-[0.2em] text-neutral-900 uppercase">
                SESSION TERMINATED
              </h3>
              <p className="text-[9px] uppercase tracking-widest text-red-700 font-bold">
                Multiple Active Logins Detected
              </p>
            </div>

            <p className="text-[11px] text-neutral-600 leading-relaxed font-light font-sans max-w-xs">
              You have been logged out of this device because a new session was initiated on another device. FREERT restricts concurrent login sessions to protect your account's privacy and billing coordinates.
            </p>

            <button
              onClick={() => {
                setConcurrentLogoutAlert(false);
                window.location.href = '/login';
              }}
              className="w-full bg-neutral-950 text-white hover:bg-neutral-900 text-[10px] uppercase tracking-widest py-3 px-6 font-semibold transition-colors cursor-pointer rounded-none border border-neutral-950"
            >
              Return to Login
            </button>
          </div>
        </div>
      )}
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
