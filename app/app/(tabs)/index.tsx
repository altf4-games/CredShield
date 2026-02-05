import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { COLORS, TYPOGRAPHY, SPACING, COMMON_STYLES } from '@/constants/theme';
import NothingCard from '@/components/NothingCard';
import NothingButton from '@/components/NothingButton';
import IDCard from '@/components/IDCard';
import StatusDot from '@/components/StatusDot';
import { router } from 'expo-router';
import apiService from '@/services/api';

export default function HomeScreen() {
  const [userData, setUserData] = useState<{name: string, gpa: number, verificationCode?: string} | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);

  const loadUserData = async () => {
    try {
      const storedData = await SecureStore.getItemAsync('userData');
      if (storedData) {
        const data = JSON.parse(storedData);
        setUserData(data);
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.log('No stored data');
      setUserData(null);
    }
  };

  const checkBackendHealth = async () => {
    const isHealthy = await apiService.checkHealth();
    setBackendOnline(isHealthy);
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      checkBackendHealth();
    }, [])
  );

  return (
    <ScrollView style={COMMON_STYLES.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>CredShield</Text>
          <Text style={styles.subtitle}>Zero-Knowledge Proof System</Text>
        </View>

        {/* ID Card - Show only if user data exists */}
        {userData && (
          <View style={styles.cardSection}>
            <IDCard 
              name={userData.name}
              gpa={userData.gpa}
              verified={true}
            />
          </View>
        )}

        {/* Status Card */}
        <NothingCard style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <StatusDot status={backendOnline ? "active" : "inactive"} size={12} />
            <Text style={styles.statusText}>
              {backendOnline ? 'System Online' : 'Backend Offline'}
            </Text>
          </View>
          <Text style={styles.statusSubtext}>
            {backendOnline 
              ? 'Backend connected • Ready to generate proofs'
              : 'Check backend server connection'
            }
          </Text>
        </NothingCard>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <NothingCard style={styles.actionCard}>
            <Text style={styles.cardTitle}>Generate Proof</Text>
            <Text style={styles.cardDescription}>
              Capture your academic document and generate a zero-knowledge proof
            </Text>
            <NothingButton 
              title="Start" 
              onPress={() => router.push('/(tabs)/generate')}
              style={styles.actionButton}
            />
          </NothingCard>

          <NothingCard style={styles.actionCard}>
            <Text style={styles.cardTitle}>Verify Proof</Text>
            <Text style={styles.cardDescription}>
              Enter verification code to check a proof on the blockchain
            </Text>
            <NothingButton 
              title="Verify" 
              onPress={() => router.push('/(tabs)/verify')}
              variant="secondary"
              style={styles.actionButton}
            />
          </NothingCard>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  cardSection: {
    marginBottom: SPACING.xl,
  },
  statusCard: {
    marginBottom: SPACING.xl,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  statusSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray400,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
  },
  actionCard: {
    marginBottom: SPACING.md,
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
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.sm,
    marginBottom: SPACING.md,
  },
  actionButton: {
    marginTop: SPACING.sm,
  },
});
