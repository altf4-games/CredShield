import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, COMMON_STYLES } from '@/constants/theme';
import NothingCard from '@/components/NothingCard';
import NothingButton from '@/components/NothingButton';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const userName = 'John Doe'; // TODO: Get from secure storage
  const proofCount = 0; // TODO: Get from storage

  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com/altf4-games/CredShield');
  };

  const handleOpenSettings = () => {
    router.push('/settings' as any);
  };

  return (
    <ScrollView style={COMMON_STYLES.container}>
      <View style={styles.content}>
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userName.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userSubtext}>Zero-Knowledge Identity</Text>
        </View>

        {/* Stats */}
        <NothingCard style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Generated Proofs</Text>
            <Text style={styles.statValue}>{proofCount}</Text>
          </View>
        </NothingCard>

        {/* Settings Button */}
        <NothingButton
          title="Settings"
          onPress={handleOpenSettings}
          variant="secondary"
          fullWidth
          style={styles.settingsButton}
        />

        {/* About Section */}
        <NothingCard style={styles.card}>
          <Text style={styles.cardTitle}>About CredShield</Text>
          <Text style={styles.cardDescription}>
            Zero-knowledge proof system for privacy-preserving academic credential verification.
          </Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Version</Text>
            <Text style={styles.value}>1.0.0</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Backend</Text>
            <Text style={styles.value}>Circom + Groth16</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Blockchain</Text>
            <Text style={styles.value}>Ethereum</Text>
          </View>
        </NothingCard>

        {/* How It Works */}
        <NothingCard style={styles.card}>
          <Text style={styles.cardTitle}>How It Works</Text>
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Capture your academic transcript with camera
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                AI extracts GPA and generates zero-knowledge proof
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Share verification code while keeping GPA private
              </Text>
            </View>
          </View>
        </NothingCard>

        {/* Developer */}
        <View style={styles.developerSection}>
          <Text style={styles.developerTitle}>Developed by</Text>
          <Text style={styles.developerName}>Pradyum Mistry</Text>
          
          <NothingButton
            title="Open GitHub"
            onPress={handleOpenGitHub}
            variant="outline"
            fullWidth
            style={styles.githubButton}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Built with Privacy First Design
          </Text>
          <Text style={styles.footerSubtext}>
            Dark AMOLED • Minimal • Secure
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
  },
  userSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.background,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  userSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsCard: {
    marginBottom: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gray400,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.primary,
  },
  settingsButton: {
    marginBottom: SPACING.xl,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  cardDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.sm,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  stepContainer: {
    gap: SPACING.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceVariant,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  stepText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray400,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.sm,
    paddingTop: 4,
  },
  developerSection: {
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  developerTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  developerName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  githubButton: {
    marginTop: SPACING.sm,
  },
  footer: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.xs,
  },
  footerSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray600,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
