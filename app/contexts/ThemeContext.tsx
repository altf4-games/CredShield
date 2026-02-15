import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeMode, createTheme } from '@/constants/theme';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@credshield_theme_preference';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [theme, setThemeObject] = useState<Theme>(createTheme('dark'));

  useEffect(() => {
    loadThemePreference();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      handleSystemThemeChange(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        applyTheme(savedTheme);
      } else {
        const systemTheme = Appearance.getColorScheme();
        applyTheme(systemTheme === 'light' ? 'light' : 'dark');
      }
    } catch (error) {
      console.log('Failed to load theme preference:', error);
      const systemTheme = Appearance.getColorScheme();
      applyTheme(systemTheme === 'light' ? 'light' : 'dark');
    }
  };

  const handleSystemThemeChange = async (colorScheme: ColorSchemeName) => {
    const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (!savedTheme) {
      applyTheme(colorScheme === 'light' ? 'light' : 'dark');
    }
  };

  const applyTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    setThemeObject(createTheme(mode));
  };

  const setTheme = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      applyTheme(mode);
    } catch (error) {
      console.log('Failed to save theme preference:', error);
      applyTheme(mode);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setTheme(newMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: themeMode === 'dark',
        themeMode,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
