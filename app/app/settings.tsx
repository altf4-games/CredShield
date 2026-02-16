import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { TYPOGRAPHY, SPACING } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import NothingCard from '@/components/NothingCard';
import NothingButton from '@/components/NothingButton';
import ConfirmModal from '@/components/ConfirmModal';
import { router } from 'expo-router';
import ApiService from '@/services/api';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);
  const [showAnonymous, setShowAnonymous] = useState(false);

  // Load leaderboard settings on mount
  useFocusEffect(
    useCallback(() => {
      loadLeaderboardSettings();
    }, [])
  );

  const loadLeaderboardSettings = async () => {
    try {
      const userId = await SecureStore.getItemAsync('userId');
      if (!userId) return;

      const profile = await ApiService.getStudentProfile(userId);
      if (profile) {
        setLeaderboardOptIn(profile.leaderboardOptIn || false);
        setShowAnonymous(profile.showAnonymous || false);
      }
    } catch (error) {
      console.error('Error loading leaderboard settings:', error);
    }
  };

  const handleLeaderboardOptInChange = async (value: boolean) => {
    try {
      const userId = await SecureStore.getItemAsync('userId');
      if (!userId) return;

      setLeaderboardOptIn(value);
      await ApiService.updateLeaderboardOptIn(userId, value, showAnonymous);
    } catch (error) {
      console.error('Error updating leaderboard opt-in:', error);
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
      setShowAnonymous(!value);
    }
  };

  const handleClearCache = async () => {
    try {
      await SecureStore.deleteItemAsync('userData');
      await SecureStore.deleteItemAsync('proofHistory');
      await SecureStore.deleteItemAsync('onboardingCompleted');
      setShowConfirm(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>Manage your data and preferences</Text>

        {/* Leaderboard Settings */}
        <NothingCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Leaderboard Settings</Text>
          <Text style={[styles.cardDescription, { color: theme.colors.textTertiary }]}>
            Control your leaderboard visibility and privacy
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Join Leaderboard
              </Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textTertiary }]}>
                Appear on the public leaderboard
              </Text>
            </View>
            <Switch
              value={leaderboardOptIn}
              onValueChange={handleLeaderboardOptInChange}
              trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          </View>

          {leaderboardOptIn && (
            <View style={[styles.settingRow, { marginTop: SPACING.md, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: SPACING.md }]}>
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  Show Anonymously
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textTertiary }]}>
                  Display only your initials
                </Text>
              </View>
              <Switch
                value={showAnonymous}
                onValueChange={handleAnonymousChange}
                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>
          )}
        </NothingCard>

        {/* Data Management */}
        <NothingCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Data Management</Text>
          <Text style={[styles.cardDescription, { color: theme.colors.textTertiary }]}>
            Clear all locally stored proofs and user information
          </Text>

          <NothingButton
            title="Clear All Data"
            onPress={() => setShowConfirm(true)}
            variant="outline"
            fullWidth
            style={styles.button}
          />
        </NothingCard>

        <NothingCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Storage Info</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.textTertiary }]}>User Data</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>Secure Store</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.textTertiary }]}>Encryption</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>Device Keychain</Text>
          </View>
        </NothingCard>

        <View style={[styles.warningBox, { backgroundColor: theme.colors.surfaceVariant, borderLeftColor: theme.colors.warning }]}>
          <Text style={[styles.warningTitle, { color: theme.colors.warning }]}>⚠️ Warning</Text>
          <Text style={[styles.warningText, { color: theme.colors.textSecondary }]}>
            Clearing data will remove all proofs and user information from this device.This action cannot be undone.
          </Text>
        </View>

        <ConfirmModal
          visible={showConfirm}
          title="Clear All Data"
          message="This will permanently delete all your proofs and user data from this device. This action cannot be undone."
          confirmText="Clear Data"
          cancelText="Cancel"
          onConfirm={handleClearCache}
          onCancel={() => setShowConfirm(false)}
          destructive
        />

        <ConfirmModal
          visible={showSuccess}
          title="Success"
          message="All data has been cleared successfully."
          confirmText="OK"
          cancelText=""
          onConfirm={() => {
            setShowSuccess(false);
            router.replace('/(tabs)');
          }}
          onCancel={() => {}}
        />
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
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginBottom: SPACING.xl,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginBottom: SPACING.lg,
  },
  button: {
    marginTop: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  warningBox: {
    borderRadius: 8,
    padding: SPACING.md,
    borderLeftWidth: 3,
  },
  warningTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.sm,
  },
  warningText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.sm,
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
});
