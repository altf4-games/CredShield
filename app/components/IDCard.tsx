import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '@/constants/theme';

interface IDCardProps {
  name: string;
  gpa: number;
  verified?: boolean;
}

export default function IDCard({ name, gpa, verified = true }: IDCardProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.surfaceVariant, COLORS.surface]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Card Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>CredShield</Text>
          {verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>VERIFIED</Text>
            </View>
          )}
        </View>

        {/* Name */}
        <Text style={styles.label}>NAME</Text>
        <Text style={styles.name}>{name}</Text>

        {/* GPA */}
        <View style={styles.gpaSection}>
          <View>
            <Text style={styles.label}>GPA</Text>
            <Text style={styles.gpa}>{gpa.toFixed(2)}</Text>
          </View>
          <View style={styles.chip}>
            <View style={styles.chipLine} />
            <View style={styles.chipLine} />
            <View style={styles.chipLine} />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>ZERO-KNOWLEDGE PROOF</Text>
          <Text style={styles.footerDot}>•</Text>
          <Text style={styles.footerText}>BLOCKCHAIN VERIFIED</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1.586, // Credit card ratio
  },
  card: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.white,
    letterSpacing: 1,
  },
  verifiedBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  verifiedText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.background,
    letterSpacing: 1,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray600,
    letterSpacing: 1.5,
    marginBottom: SPACING.xs / 2,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
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
    color: COLORS.primary,
  },
  chip: {
    gap: 4,
  },
  chipLine: {
    width: 40,
    height: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray600,
    letterSpacing: 1,
  },
  footerDot: {
    color: COLORS.gray600,
  },
});
