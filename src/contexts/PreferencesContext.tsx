import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dbHelpers } from '../services/idb';

interface Preferences {
  theme: 'light' | 'dark';
  pageSize: number;
  language: string;
  offlineMode: boolean;
}

interface PreferencesContextType {
  preferences: Preferences;
  updatePreferences: (updates: Partial<Preferences>) => Promise<void>;
  isLoading: boolean;
}

const defaultPreferences: Preferences = {
  theme: 'dark',
  pageSize: 20,
  language: 'en-US',
  offlineMode: false,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Also save to localStorage for immediate next visit
    localStorage.setItem('theme', preferences.theme);
  }, [preferences.theme]);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      
      // Try to load from IndexedDB first
      const stored = await dbHelpers.getPreference('user-preferences');
      
      if (stored) {
        setPreferences({ ...defaultPreferences, ...stored });
      } else {
        // Fall back to localStorage for theme
        const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (storedTheme) {
          setPreferences(prev => ({ ...prev, theme: storedTheme }));
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      
      // Fall back to localStorage
      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (storedTheme) {
        setPreferences(prev => ({ ...prev, theme: storedTheme }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<Preferences>) => {
    try {
      const newPreferences = { ...preferences, ...updates };
      
      // Update state immediately for responsive UI
      setPreferences(newPreferences);
      
      // Save to IndexedDB
      await dbHelpers.setPreference('user-preferences', newPreferences);
      
      // Track analytics
      await dbHelpers.trackEvent('preferences_updated', { 
        changes: Object.keys(updates),
        values: updates 
      });
      
    } catch (error) {
      console.error('Failed to save preferences:', error);
      // Revert state on error
      setPreferences(preferences);
    }
  };

  const value: PreferencesContextType = {
    preferences,
    updatePreferences,
    isLoading,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}