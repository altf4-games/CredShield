import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { router, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { COLORS } from '@/constants/theme';

export default function RootLayout() {
  const segments = useSegments();

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
      <StatusBar style="light" backgroundColor={COLORS.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: COLORS.background,
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
              backgroundColor: COLORS.background,
            },
            headerTintColor: COLORS.white,
          }} 
        />
      </Stack>
    </>
  );
}
