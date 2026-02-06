import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { COLORS, TYPOGRAPHY, SPACING, COMMON_STYLES } from '@/constants/theme';
import NothingCard from '@/components/NothingCard';
import NothingButton from '@/components/NothingButton';
import ConfirmModal from '@/components/ConfirmModal';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
    <ScrollView style={COMMON_STYLES.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your data and preferences</Text>

        <NothingCard style={styles.card}>
          <Text style={styles.cardTitle}>Data Management</Text>
          <Text style={styles.cardDescription}>
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
          <Text style={styles.cardTitle}>Storage Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>User Data</Text>
            <Text style={styles.value}>Secure Store</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Encryption</Text>
            <Text style={styles.value}>Device Keychain</Text>
          </View>
        </NothingCard>

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>⚠️ Warning</Text>
          <Text style={styles.warningText}>
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
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.xl,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
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
    borderBottomColor: COLORS.border,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  warningBox: {
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 8,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  warningTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.warning,
    marginBottom: SPACING.sm,
  },
  warningText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray400,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.sm,
  },
});
