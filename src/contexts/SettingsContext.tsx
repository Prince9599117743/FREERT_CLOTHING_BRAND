'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSiteSettings } from '@/services/database';

interface SettingsContextType {
  settings: Record<string, string>;
  loading: boolean;
  reloadSettings: () => Promise<void>;
  getSetting: (key: string, fallback: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await getSiteSettings();
      setSettings(data || {});
    } catch (err) {
      console.error('Failed to fetch site settings in SettingsProvider:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const getSetting = (key: string, fallback: string): string => {
    return settings[key] !== undefined ? settings[key] : fallback;
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, reloadSettings: fetchSettings, getSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
