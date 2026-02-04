import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '@/constants/theme';

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
  return (
    <View style={[
      styles.card,
      !noPadding && { padding: SPACING[padding] },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
