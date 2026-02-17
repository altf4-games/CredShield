import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { TYPOGRAPHY, SPACING } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import NothingCard from '@/components/NothingCard';
import NothingButton from '@/components/NothingButton';
import IDCard from '@/components/IDCard';
import StatusDot from '@/components/StatusDot';
import ModeToggle from '@/components/ModeToggle';
import { router } from 'expo-router';
import apiService from '@/services/api';

export default function HomeScreen() {
  const { theme } = useTheme();
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
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>CredShield</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>Zero-Knowledge Proof System</Text>
        </View>

        {userData && (
          <View style={styles.cardSection}>
            <IDCard 
              name={userData.name}
              gpa={userData.gpa}
              verified={true}
            />
          </View>
        )}

        <NothingCard style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <StatusDot status={backendOnline ? "active" : "inactive"} size={12} />
            <Text style={[styles.statusText, { color: theme.colors.text }]}>
              {backendOnline ? 'System Online' : 'Backend Offline'}
            </Text>
          </View>
          <Text style={[styles.statusSubtext, { color: theme.colors.textTertiary }]}>
            {backendOnline 
              ? 'Backend connected • Ready to generate proofs'
              : 'Check backend server connection'
            }
          </Text>
        </NothingCard>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Quick Actions</Text>
          
          {/* Mode Toggle */}
          <ModeToggle />
          
          <NothingCard style={styles.actionCard}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Generate Proof</Text>
            <Text style={[styles.cardDescription, { color: theme.colors.textTertiary }]}>
              Capture your academic document and generate a zero-knowledge proof
            </Text>
            <NothingButton 
              title="Start" 
              onPress={() => router.push('/(tabs)/generate')}
              style={styles.actionButton}
            />
          </NothingCard>

          <NothingCard style={styles.actionCard}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Verify Proof</Text>
            <Text style={[styles.cardDescription, { color: theme.colors.textTertiary }]}>
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
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: TYPOGRAPHY.fontWeight.black,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
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
  },
  statusSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
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
  actionCard: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.sm,
    marginBottom: SPACING.md,
  },
  actionButton: {
    marginTop: SPACING.sm,
  },
});

