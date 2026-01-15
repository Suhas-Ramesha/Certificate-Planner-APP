import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Theme {
  isDark: boolean;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    primaryLight: string;
    border: string;
    error: string;
    errorBackground: string;
    success: string;
    inputBackground: string;
    inputText: string;
    placeholder: string;
  };
  toggleTheme: () => void;
}

const lightTheme = {
  isDark: false,
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    primary: '#0284c7',
    primaryLight: '#0ea5e9',
    border: '#cbd5e1',
    error: '#dc2626',
    errorBackground: '#fee2e2',
    success: '#10b981',
    inputBackground: '#ffffff',
    inputText: '#0f172a',
    placeholder: '#94a3b8',
  },
};

const darkTheme = {
  isDark: true,
  colors: {
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    primary: '#0ea5e9',
    primaryLight: '#38bdf8',
    border: '#334155',
    error: '#f87171',
    errorBackground: '#7f1d1d',
    success: '#34d399',
    inputBackground: '#1e293b',
    inputText: '#f1f5f9',
    placeholder: '#64748b',
  },
};

const ThemeContext = createContext<Theme | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ ...theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
