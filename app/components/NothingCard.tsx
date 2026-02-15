import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BORDER_RADIUS, SPACING } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface NothingCardProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof SPACING;
  noPadding?: boolean;
}

export default function NothingCard({ 
  children, 
  style,
  padding = 'md',
  noPadding = false,
}: NothingCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[
      styles.card,
      { 
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      },
      !noPadding && { padding: SPACING[padding] },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
});
