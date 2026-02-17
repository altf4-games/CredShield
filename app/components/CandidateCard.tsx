import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY, SPACING } from '@/constants/theme';
import NothingCard from '@/components/NothingCard';

interface CandidateCardProps {
  name: string;
  gpaRange: string;
  skills?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  isEligible: boolean;
  isVerified: boolean;
}

export default function CandidateCard({
  name,
  gpaRange,
  skills = [],
  linkedinUrl,
  githubUrl,
  portfolioUrl,
  isEligible,
  isVerified,
}: CandidateCardProps) {
  const { theme } = useTheme();

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const openLink = (url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <NothingCard style={{ ...styles.container, backgroundColor: theme.colors.surface }}>
      {/* Header with Avatar */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary }]}>
          <Text style={[styles.initials, { color: theme.colors.primary }]}>
            {getInitials(name)}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.colors.text }]}>{name}</Text>
            {isVerified && (
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            )}
          </View>
          <View style={styles.gpaRow}>
            <Text style={[styles.gpaLabel, { color: theme.colors.textSecondary }]}>CGPA Range</Text>
            <Text style={[styles.gpaValue, { color: theme.colors.primary }]}>{gpaRange}</Text>
          </View>
        </View>
      </View>

      {/* Eligibility Badge */}
      {isEligible && (
        <View style={[styles.badge, { backgroundColor: theme.colors.success + '20', borderColor: theme.colors.success }]}>
          <Ionicons name="ribbon" size={16} color={theme.colors.success} />
          <Text style={[styles.badgeText, { color: theme.colors.success }]}>Placement Eligible</Text>
        </View>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>SKILLS</Text>
          <View style={styles.skillsContainer}>
            {skills.map((skill, index) => (
              <View key={index} style={[styles.skillChip, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
                <Text style={[styles.skillText, { color: theme.colors.text }]}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Social Links */}
      {(linkedinUrl || githubUrl || portfolioUrl) && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>LINKS</Text>
          <View style={styles.linksContainer}>
            {linkedinUrl && (
              <TouchableOpacity
                style={[styles.linkButton, { backgroundColor: '#0077B5' + '15', borderColor: '#0077B5' }]}
                onPress={() => openLink(linkedinUrl)}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-linkedin" size={20} color="#0077B5" />
                <Text style={[styles.linkText, { color: '#0077B5' }]}>LinkedIn</Text>
              </TouchableOpacity>
            )}
            {githubUrl && (
              <TouchableOpacity
                style={[styles.linkButton, { backgroundColor: theme.colors.textSecondary + '15', borderColor: theme.colors.textSecondary }]}
                onPress={() => openLink(githubUrl)}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-github" size={20} color={theme.colors.text} />
                <Text style={[styles.linkText, { color: theme.colors.text }]}>GitHub</Text>
              </TouchableOpacity>
            )}
            {portfolioUrl && (
              <TouchableOpacity
                style={[styles.linkButton, { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary }]}
                onPress={() => openLink(portfolioUrl)}
                activeOpacity={0.7}
              >
                <Ionicons name="globe-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.linkText, { color: theme.colors.primary }]}>Portfolio</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </NothingCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xl,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  initials: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  gpaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  gpaLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  gpaValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: SPACING.lg,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  skillChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
  },
  skillText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  linksContainer: {
    gap: SPACING.sm,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  linkText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
