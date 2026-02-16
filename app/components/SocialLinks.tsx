import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY, SPACING } from '@/constants/theme';

interface SocialLinksProps {
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export default function SocialLinks({ linkedinUrl, githubUrl, portfolioUrl }: SocialLinksProps) {
  const { theme } = useTheme();

  const hasLinks = linkedinUrl || githubUrl || portfolioUrl;

  if (!hasLinks) {
    return (
      <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>
        No social links added yet
      </Text>
    );
  }

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Error opening link:', err));
  };

  return (
    <View style={styles.container}>
      {linkedinUrl && (
        <TouchableOpacity
          style={[styles.linkButton, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
          onPress={() => openLink(linkedinUrl)}
          activeOpacity={0.7}
        >
          <Ionicons name="logo-linkedin" size={20} color={theme.colors.primary} />
          <Text style={[styles.linkText, { color: theme.colors.text }]}>LinkedIn</Text>
          <Ionicons name="open-outline" size={16} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      )}

      {githubUrl && (
        <TouchableOpacity
          style={[styles.linkButton, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
          onPress={() => openLink(githubUrl)}
          activeOpacity={0.7}
        >
          <Ionicons name="logo-github" size={20} color={theme.colors.primary} />
          <Text style={[styles.linkText, { color: theme.colors.text }]}>GitHub</Text>
          <Ionicons name="open-outline" size={16} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      )}

      {portfolioUrl && (
        <TouchableOpacity
          style={[styles.linkButton, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
          onPress={() => openLink(portfolioUrl)}
          activeOpacity={0.7}
        >
          <Ionicons name="globe-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.linkText, { color: theme.colors.text }]}>Portfolio</Text>
          <Ionicons name="open-outline" size={16} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  linkText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontStyle: 'italic',
  },
});
