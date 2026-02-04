import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '@/constants/theme';

interface StatusDotProps {
  status: 'active' | 'inactive' | 'success' | 'error' | 'warning';
  size?: number;
  animated?: boolean;
}

export default function StatusDot({ 
  status, 
  size = 8,
  animated = true,
}: StatusDotProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated || status === 'inactive') return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, [animated, status]);

  const getColor = () => {
    switch (status) {
      case 'active':
        return COLORS.primary;
      case 'success':
        return COLORS.success;
      case 'error':
        return COLORS.error;
      case 'warning':
        return COLORS.warning;
      case 'inactive':
        return COLORS.gray700;
      default:
        return COLORS.gray700;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: getColor(),
            transform: animated && status !== 'inactive' ? [{ scale: pulseAnim }] : undefined,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    // Dynamic styles applied above
  },
});
