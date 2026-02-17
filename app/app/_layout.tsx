import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { router, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { UserModeProvider } from '@/contexts/UserModeContext';

function RootLayoutContent() {
  const segments = useSegments();
  const { theme, isDark } = useTheme();

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const completed = await SecureStore.getItemAsync('onboardingCompleted');
      const inOnboarding = segments[0] === 'onboarding';
      
      if (!completed && !inOnboarding) {
        router.replace('/onboarding');
      } else if (completed && inOnboarding) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.log('Onboarding check error:', error);
    }
  };

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
          animation: 'none',
        }}
      >
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="settings" 
          options={{ 
            headerShown: true,
            headerTitle: '',
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTintColor: theme.colors.text,
          }} 
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <UserModeProvider>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </UserModeProvider>
  );
}
