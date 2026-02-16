import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity, Switch, ActivityIndicator, TextInput } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Clipboard from 'expo-clipboard';
import { TYPOGRAPHY, SPACING } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import NothingCard from '@/components/NothingCard';
import NothingButton from '@/components/NothingButton';
import SkillTags from '@/components/SkillTags';
import SocialLinks from '@/components/SocialLinks';
import ApiService from '@/services/api';

interface Proof {
  name: string;
  gpa: number;
  verificationCode: string;
  threshold: number;
  result: boolean;
  timestamp: string;
}

interface StudentProfile {
  name: string;
  gpa: number;
  branch?: string;
  academicYear?: string;
  skills?: string[];
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  isVerified?: boolean;
  isEligible?: boolean;
  leaderboardOptIn?: boolean;
  showAnonymous?: boolean;
}

export default function ProfileScreen() {
  const { theme } = useTheme();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);
  const [showAnonymous, setShowAnonymous] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editPortfolio, setEditPortfolio] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get userId from SecureStore (set during onboarding or first proof)
      let userId = await SecureStore.getItemAsync('userId');
      
      // If no userId yet, get from userData
      if (!userId) {
        const storedData = await SecureStore.getItemAsync('userData');
        if (storedData) {
          const data = JSON.parse(storedData);
          userId = data.name.toLowerCase().replace(/\s+/g, '_'); // Generate userId from name
          if (userId) {
            await SecureStore.setItemAsync('userId', userId);
          }
        }
      }

      if (userId) {
        // Try to fetch profile from backend
        try {
          let backendProfile = await ApiService.getStudentProfile(userId);
          
          if (!backendProfile) {
            // No backend profile yet, create one from local data
            const storedData = await SecureStore.getItemAsync('userData');
            if (storedData) {
              const localProfile = JSON.parse(storedData);
              
              // Create profile in backend
              try {
                backendProfile = await ApiService.updateStudentProfile(userId, {
                  name: localProfile.name,
                  gpa: localProfile.gpa,
                  skills: localProfile.skills || [],
                  isEligible: localProfile.gpa >= 7.0 // Example threshold
                });
                
                setProfile(backendProfile);
                setLeaderboardOptIn(backendProfile.leaderboardOptIn || false);
                setShowAnonymous(backendProfile.showAnonymous || false);
              } catch (createError) {
                console.log('Could not create backend profile, using local:', createError);
                setProfile(localProfile);
              }
            }
          } else {
            setProfile(backendProfile);
            setLeaderboardOptIn(backendProfile.leaderboardOptIn || false);
            setShowAnonymous(backendProfile.showAnonymous || false);
          }
        } catch (error) {
          console.log('Error fetching backend profile:', error);
          // Fall back to local data
          const storedData = await SecureStore.getItemAsync('userData');
          if (storedData) {
            setProfile(JSON.parse(storedData));
          }
        }
      } else {
        // No userId, use local data only
        const storedData = await SecureStore.getItemAsync('userData');
        if (storedData) {
          setProfile(JSON.parse(storedData));
        }
      }
      
      // Load proof history
      const proofsStr = await SecureStore.getItemAsync('proofHistory');
      if (proofsStr) {
        setProofs(JSON.parse(proofsStr));
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleLeaderboardOptInChange = async (value: boolean) => {
    try {
      const userId = await SecureStore.getItemAsync('userId');
      if (!userId) return;

      setLeaderboardOptIn(value);
      await ApiService.updateLeaderboardOptIn(userId, value, showAnonymous);
    } catch (error) {
      console.error('Error updating leaderboard opt-in:', error);
      // Revert on error
      setLeaderboardOptIn(!value);
    }
  };

  const handleAnonymousChange = async (value: boolean) => {
    try {
      const userId = await SecureStore.getItemAsync('userId');
      if (!userId) return;

      setShowAnonymous(value);
      await ApiService.updateLeaderboardOptIn(userId, leaderboardOptIn, value);
    } catch (error) {
      console.error('Error updating anonymous setting:', error);
      // Revert on error
      setShowAnonymous(!value);
    }
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      // Entering edit mode - populate fields with current values
      setEditLinkedin(profile?.linkedinUrl || '');
      setEditGithub(profile?.githubUrl || '');
      setEditPortfolio(profile?.portfolioUrl || '');
    }
    setIsEditing(!isEditing);
  };

  const handleSaveSocialLinks = async () => {
    try {
      setSaving(true);
      const userId = await SecureStore.getItemAsync('userId');
      if (!userId || !profile) return;

      // Update profile with new social links
      const updatedProfile = await ApiService.updateStudentProfile(userId, {
        name: profile.name,
        gpa: profile.gpa,
        linkedinUrl: editLinkedin || undefined,
        githubUrl: editGithub || undefined,
        portfolioUrl: editPortfolio || undefined,
      });

      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving social links:', error);
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading profile...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Profile</Text>

        {/* Profile Header */}
        <NothingCard style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary, borderColor: theme.colors.border }]}>
              <Text style={[styles.avatarText, { color: theme.colors.background }]}>
                {profile ? getInitials(profile.name) : 'ZK'}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {profile?.name || 'Anonymous User'}
          </Text>
          
          {profile?.isVerified && (
            <View style={[styles.badge, { backgroundColor: theme.colors.success }]}>
              <Text style={styles.badgeText}>✓ Verified</Text>
            </View>
          )}
        </NothingCard>

        {/* Skills Section */}
        {profile?.skills && profile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Skills</Text>
            <NothingCard>
              <SkillTags skills={profile.skills} maxVisible={5} />
            </NothingCard>
          </View>
        )}

        {/* Social Links Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Social Links</Text>
            {!isEditing && (
              <TouchableOpacity onPress={handleEditToggle}>
                <Text style={[styles.editButton, { color: theme.colors.primary }]}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          <NothingCard>
            {isEditing ? (
              <>
                {/* Edit Mode - Text Inputs */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>LinkedIn</Text>
                  <TextInput
                    style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceVariant }]}
                    value={editLinkedin}
                    onChangeText={setEditLinkedin}
                    placeholder="https://linkedin.com/in/username"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>GitHub</Text>
                  <TextInput
                    style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceVariant }]}
                    value={editGithub}
                    onChangeText={setEditGithub}
                    placeholder="https://github.com/username"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Portfolio</Text>
                  <TextInput
                    style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceVariant }]}
                    value={editPortfolio}
                    onChangeText={setEditPortfolio}
                    placeholder="https://yourwebsite.com"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="none"
                  />
                </View>

                {/* Save/Cancel Buttons */}
                <View style={styles.editActions}>
                  <NothingButton
                    title="Cancel"
                    onPress={() => setIsEditing(false)}
                    variant="outline"
                  />
                  <NothingButton
                    title={saving ? "Saving..." : "Save"}
                    onPress={handleSaveSocialLinks}
                    variant="primary"
                    disabled={saving}
                  />
                </View>
              </>
            ) : (
              /* View Mode - Social Links Component */
              <SocialLinks
                linkedinUrl={profile?.linkedinUrl}
                githubUrl={profile?.githubUrl}
                portfolioUrl={profile?.portfolioUrl}
              />
            )}
          </NothingCard>
        </View>

        {/* Proof History */}
        {proofs.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              Proof History ({proofs.length})
            </Text>
            {proofs.map((proof, index) => (
              <NothingCard key={index} style={styles.proofCard}>
                <View style={styles.proofHeader}>
                  <Text style={[styles.proofName, { color: theme.colors.text }]} numberOfLines={1}>
                    {proof.name}
                  </Text>
                  <Text
                    style={[
                      styles.resultBadge,
                      {
                        backgroundColor: proof.result ? theme.colors.success : theme.colors.error,
                        color: proof.result ? theme.colors.background : theme.colors.white,
                      },
                    ]}
                  >
                    {proof.result ? 'PASS' : 'FAIL'}
                  </Text>
                </View>
                <View style={styles.proofDetails}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>GPA</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>{proof.gpa.toFixed(2)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>Threshold</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>{proof.threshold.toFixed(1)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>Date</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>{formatDate(proof.timestamp)}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.codeContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.primary }]}
                  onPress={() => copyToClipboard(proof.verificationCode)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.codeLabel, { color: theme.colors.textTertiary }]}>
                    VERIFICATION CODE
                  </Text>
                  <Text style={[styles.code, { color: theme.colors.primary }]}>
                    {proof.verificationCode}
                  </Text>
                  <Text style={[styles.copyHint, { color: theme.colors.textTertiary }]}>
                    {copiedCode === proof.verificationCode ? '✓ Copied!' : 'Tap to copy'}
                  </Text>
                </TouchableOpacity>
      </NothingCard>
            ))}
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Settings</Text>
          <NothingCard>
            <NothingButton
              title="Manage Data"
              onPress={() => router.push('/settings' as any)}
              variant="secondary"
              fullWidth
            />
            <NothingButton
              title="View on GitHub"
              onPress={handleOpenGitHub}
              variant="secondary"
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
          </NothingCard>
        </View>

        {/* Developer Info */}
        <View style={styles.developerSection}>
          <Text style={[styles.developerTitle, { color: theme.colors.textTertiary }]}>
            Developed by
          </Text>
          <Text style={[styles.developerName, { color: theme.colors.text }]}>
            Pradyum Mistry
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.sm,
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
    marginBottom: SPACING.sm,
  },
  badge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginTop: SPACING.xs,
  },
  badgeText: {
    color: '#000',
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.xs / 2,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
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
    marginTop: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  editButton: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  editActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
});
