import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Clipboard from 'expo-clipboard';
import { TYPOGRAPHY, SPACING } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import NothingCard from '@/components/NothingCard';
import NothingButton from '@/components/NothingButton';
import { router } from 'expo-router';

interface Proof {
  name: string;
  gpa: number;
  verificationCode: string;
  threshold: number;
  result: boolean;
  timestamp: string;
}

export default function ProfileScreen() {
  const { theme } = useTheme();
  const [userData, setUserData] = useState<{name: string, gpa: number} | null>(null);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadUserData = async () => {
    try {
      const storedData = await SecureStore.getItemAsync('userData');
      if (storedData) {
        const data = JSON.parse(storedData);
        setUserData(data);
      } else {
        setUserData(null);
      }
      
      // Load proof history
      const proofsStr = await SecureStore.getItemAsync('proofHistory');
      if (proofsStr) {
        const proofsData = JSON.parse(proofsStr);
        setProofs(proofsData);
      } else {
        setProofs([]);
      }
    } catch (error) {
      console.log('No user data found');
      setUserData(null);
      setProofs([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com/altf4-games/CredShield');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const copyToClipboard = async (code: string) => {
    await Clipboard.setStringAsync(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Profile</Text>

        <NothingCard style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary, borderColor: theme.colors.border }]}>
              <Text style={[styles.avatarText, { color: theme.colors.background }]}>
                {userData ? getInitials(userData.name) : 'ZK'}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {userData ? userData.name : 'No Proof Generated'}
          </Text>
          <Text style={[styles.userSubtitle, { color: theme.colors.textTertiary }]}>Zero-Knowledge Identity</Text>
        </NothingCard>

        {proofs.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Proof History ({proofs.length})</Text>
            {proofs.map((proof, index) => (
              <NothingCard key={index} style={styles.proofCard}>
                <View style={styles.proofHeader}>
                  <Text style={[styles.proofName, { color: theme.colors.text }]}>{proof.name}</Text>
                  <Text style={[
                    styles.resultBadge,
                    { backgroundColor: proof.result ? theme.colors.success : theme.colors.error, color: proof.result ? theme.colors.background : theme.colors.text }
                  ]}>
                    {proof.result ? 'PASSED' : 'FAILED'}
                  </Text>
                </View>
                
                <View style={styles.proofDetails}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>GPA</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>{proof.gpa.toFixed(2)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>GPA</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>{proof.threshold.toFixed(2)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>Generated</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>{formatDate(proof.timestamp)}</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.codeContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.primary }]}
                  onPress={() => copyToClipboard(proof.verificationCode)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.codeLabel, { color: theme.colors.textTertiary }]}>VERIFICATION CODE</Text>
                  <Text style={[styles.code, { color: theme.colors.primary }]}>{proof.verificationCode}</Text>
                  <Text style={[styles.copyHint, { color: theme.colors.textSecondary }]}>
                    {copiedCode === proof.verificationCode ? 'Copied!' : 'Tap to copy'}
                  </Text>
                </TouchableOpacity>
              </NothingCard>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Settings</Text>
          <NothingButton
            title="Manage Data"
            onPress={() => router.push('/settings')}
            variant="secondary"
            fullWidth
          />
        </View>

        <View style={styles.developerSection}>
          <Text style={[styles.developerTitle, { color: theme.colors.textTertiary }]}>Developed by</Text>
          <Text style={[styles.developerName, { color: theme.colors.text }]}>Pradyum Mistry</Text>
          
          <NothingButton
            title="Open GitHub"
            onPress={handleOpenGitHub}
            variant="outline"
            fullWidth
            style={styles.githubButton}
          />
          
          <NothingButton
            title="View Contract on Etherscan"
            onPress={() => Linking.openURL('https://sepolia.etherscan.io/address/0xBa23c88ef61DF6b8fCD11759AC503DE13D94F0Ed')}
            variant="outline"
            fullWidth
            style={styles.contractButton}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.black,
    marginBottom: SPACING.xl,
  },
  profileCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.black,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  userSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
  },
  proofCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  proofHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  proofName: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginRight: SPACING.sm,
  },
  resultBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: 4,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    letterSpacing: 1,
  },
  proofDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  codeContainer: {
    borderRadius: 8,
    padding: SPACING.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    letterSpacing: 1.5,
    marginBottom: SPACING.xs,
  },
  code: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.black,
    letterSpacing: 4,
    marginBottom: SPACING.xs,
  },
  copyHint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  developerSection: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  developerTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: SPACING.xs,
  },
  developerName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.lg,
  },
  githubButton: {
    marginTop: SPACING.sm,
  },
  contractButton: {
    marginTop: SPACING.md,
  },
});
