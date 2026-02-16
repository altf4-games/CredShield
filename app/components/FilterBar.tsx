import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY, SPACING } from '@/constants/theme';
import FilterChip from './FilterChip';

interface FilterBarProps {
  branches: string[];
  years: string[];
  eligibilities: { value: string; label: string }[];
  selectedBranch: string | null;
  selectedYear: string | null;
  selectedEligibility: string;
  onBranchChange: (branch: string | null) => void;
  onYearChange: (year: string | null) => void;
  onEligibilityChange: (eligibility: string) => void;
}

export default function FilterBar({
  branches,
  years,
  eligibilities,
  selectedBranch,
  selectedYear,
  selectedEligibility,
  onBranchChange,
  onYearChange,
  onEligibilityChange,
}: FilterBarProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
      {/* Branch filter */}
      <View style={styles.filterSection}>
        <Text style={[styles.filterTitle, { color: theme.colors.textSecondary }]}>Branch</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <FilterChip
            label="All"
            active={selectedBranch === null}
            onPress={() => onBranchChange(null)}
          />
          {branches.map((branch) => (
            <FilterChip
              key={branch}
              label={branch}
              active={selectedBranch === branch}
              onPress={() => onBranchChange(branch)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Year filter */}
      <View style={styles.filterSection}>
        <Text style={[styles.filterTitle, { color: theme.colors.textSecondary }]}>Year</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <FilterChip
            label="All"
            active={selectedYear === null}
            onPress={() => onYearChange(null)}
          />
          {years.map((year) => (
            <FilterChip
              key={year}
              label={year}
              active={selectedYear === year}
              onPress={() => onYearChange(year)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Eligibility filter */}
      <View style={styles.filterSection}>
        <Text style={[styles.filterTitle, { color: theme.colors.textSecondary }]}>Eligibility</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {eligibilities.map((item) => (
            <FilterChip
              key={item.value}
              label={item.label}
              active={selectedEligibility === item.value}
              onPress={() => onEligibilityChange(item.value)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  filterSection: {
    marginBottom: SPACING.sm,
  },
  filterTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  chipScroll: {
    paddingHorizontal: SPACING.md,
  },
});
