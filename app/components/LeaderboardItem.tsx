import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY, SPACING } from '@/constants/theme';

interface LeaderboardItemProps {
  rank: number;
  displayName: string;
  branch?: string;
  academicYear?: string;
  gpaRange: string;
  isEligible: boolean;
}

const getRankEmoji = (rank: number): string => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return '';
};

export default function LeaderboardItem({
  rank,
  displayName,
  branch,
  academicYear,
  gpaRange,
  isEligible,
}: LeaderboardItemProps) {
  const { theme } = useTheme();
  const rankEmoji = getRankEmoji(rank);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      {/* Rank */}
      <View style={styles.rankContainer}>
        {rankEmoji ? (
          <Text style={styles.rankEmoji}>{rankEmoji}</Text>
        ) : (
          <Text style={[styles.rankNumber, { color: theme.colors.primary }]}>#{rank}</Text>
        )}
      </View>

      {/* Student Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
          {displayName}
        </Text>
        {branch && academicYear && (
          <Text style={[styles.details, { color: theme.colors.textTertiary }]}>
            {branch} • {academicYear}
          </Text>
        )}
      </View>

      {/* GPA Range */}
      <View style={styles.gpaContainer}>
        <Text style={[styles.gpaRange, { color: theme.colors.primary }]}>{gpaRange}</Text>
        {isEligible && (
          <View style={[styles.badge, { backgroundColor: theme.colors.success }]}>
            <Text style={styles.badgeText}>✓</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankEmoji: {
    fontSize: 24,
  },
  rankNumber: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.black,
  },
  infoContainer: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.xs / 2,
  },
  details: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gpaContainer: {
    alignItems: 'flex-end',
  },
  gpaRange: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.black,
    marginBottom: SPACING.xs / 2,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: TYPOGRAPHY.fontWeight.black,
  },
});
