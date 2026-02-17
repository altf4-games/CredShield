import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserMode } from '@/contexts/UserModeContext';
import { TYPOGRAPHY, SPACING } from '@/constants/theme';

export default function ModeToggle() {
  const { theme } = useTheme();
  const { userMode, setUserMode, isRecruiter } = useUserMode();

  const handleToggle = () => {
    setUserMode(isRecruiter ? 'student' : 'recruiter');
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
      onPress={handleToggle}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Ionicons
          name={isRecruiter ? 'briefcase' : 'school'}
          size={20}
          color={theme.colors.primary}
        />
        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Mode
          </Text>
          <Text style={[styles.mode, { color: theme.colors.text }]}>
            {isRecruiter ? 'Recruiter' : 'Student'}
          </Text>
        </View>
        <Ionicons
          name="swap-horizontal"
          size={20}
          color={theme.colors.primary}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  mode: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});
