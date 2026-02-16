import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY, SPACING } from '@/constants/theme';

interface SkillTagsProps {
  skills: string[];
  maxVisible?: number;
}

export default function SkillTags({ skills, maxVisible = 5 }: SkillTagsProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  if (!skills || skills.length === 0) {
    return (
      <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>
        No skills added yet
      </Text>
    );
  }

  const displayedSkills = expanded ? skills : skills.slice(0, maxVisible);
  const hasMore = skills.length > maxVisible;

  return (
    <View>
      <View style={styles.tagsContainer}>
        {displayedSkills.map((skill, index) => (
          <View
            key={index}
            style={[styles.tag, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
          >
            <Text style={[styles.tagText, { color: theme.colors.text }]}>{skill}</Text>
          </View>
        ))}
      </View>
      {hasMore && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.toggleButton}>
          <Text style={[styles.toggleText, { color: theme.colors.primary }]}>
            {expanded ? 'Show Less' : `Show ${skills.length - maxVisible} More`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontStyle: 'italic',
  },
  toggleButton: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  toggleText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
