import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface IDCardProps {
  name: string;
  gpa: number;
  verified?: boolean;
}

export default function IDCard({ name, gpa, verified = true }: IDCardProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.surfaceVariant, theme.colors.surface]}
        style={[styles.card, { borderColor: theme.colors.border }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={[styles.logo, { color: theme.colors.text }]}>CredShield</Text>
          {verified && (
            <View style={[styles.verifiedBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.verifiedText, { color: theme.colors.background }]}>VERIFIED</Text>
            </View>
          )}
        </View>

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>NAME</Text>
        <Text style={[styles.name, { color: theme.colors.text }]}>{name}</Text>

        <View style={styles.gpaSection}>
          <View>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>GPA</Text>
            <Text style={[styles.gpa, { color: theme.colors.primary }]}>{gpa.toFixed(2)}</Text>
          </View>
          <View style={styles.chip}>
            <View style={[styles.chipLine, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.chipLine, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.chipLine, { backgroundColor: theme.colors.primary }]} />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>ZERO-KNOWLEDGE PROOF</Text>
          <Text style={[styles.footerDot, { color: theme.colors.textSecondary }]}>•</Text>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>BLOCKCHAIN VERIFIED</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1.586,
  },
  card: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logo: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.black,
    letterSpacing: 1,
  },
  verifiedBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  verifiedText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    letterSpacing: 1,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    letterSpacing: 1.5,
    marginBottom: SPACING.xs / 2,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  gpaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  gpa: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: TYPOGRAPHY.fontWeight.black,
  },
  chip: {
    gap: 4,
  },
  chipLine: {
    width: 40,
    height: 6,
    borderRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    letterSpacing: 1,
  },
  footerDot: {
  },
});
