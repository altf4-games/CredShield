import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { TYPOGRAPHY, SPACING } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import NothingCard from '@/components/NothingCard';
import NothingButton from '@/components/NothingButton';
import NothingInput from '@/components/NothingInput';
import ResultModal from '@/components/ResultModal';
import apiService from '@/services/api';

export default function VerifyScreen() {
  const { theme } = useTheme();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
    details?: { label: string; value: string }[];
  } | null>(null);

  const showModal = (type: 'success' | 'error', title: string, message: string, details?: { label: string; value: string }[]) => {
    setModalData({ type, title, message, details });
    setModalVisible(true);
  };

  const handleVerify = async () => {
    if (!code) {
      showModal('error', 'Error', 'Please enter a verification code');
      return;
    }

    if (code.length !== 8) {
      showModal('error', 'Error', 'Verification code must be 8 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.verifyProof(code);

      if (response.success && response.verified) {
        setVerificationResult(response);
        
        const details = [
          { label: 'Student', value: response.metadata.studentName },
          { label: 'Threshold', value: response.metadata.threshold.toString() },
          { label: 'Result', value: response.metadata.verified ? 'VERIFIED ✓' : 'FAILED ✗' },
        ];
        
        // Add timestamp if available
        if (response.metadata.timestamp) {
          details.push({ 
            label: 'Verified On', 
            value: new Date(response.metadata.timestamp).toLocaleDateString() 
          });
        }
        
        showModal(
          'success',
          'Proof Verified',
          'The proof has been successfully verified on the blockchain.',
          details
        );
      } else {
        showModal('error', 'Verification Failed', response.message || 'Invalid or expired code');
        setVerificationResult(null);
      }
    } catch (error: any) {
      showModal('error', 'Error', error.message || 'Failed to verify proof');
      setVerificationResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Verify Proof</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>
          Enter the 8-character verification code
        </Text>

        <NothingCard style={styles.card}>
          <View style={styles.codeInputContainer}>
            <NothingInput
              label="Verification Code"
              placeholder="A1B2C3D4"
              value={code}
              onChangeText={(text) => setCode(text.toUpperCase())}
              maxLength={8}
              autoCapitalize="characters"
              containerStyle={styles.input}
            />
          </View>

          <NothingButton
            title={loading ? 'Verifying...' : 'Verify on Blockchain'}
            onPress={handleVerify}
            loading={loading}
            fullWidth
            style={styles.button}
          />
        </NothingCard>

        {verificationResult && (
          <NothingCard style={[styles.resultCard, { borderLeftColor: theme.colors.success }]}>
            <Text style={[styles.resultTitle, { color: theme.colors.text }]}>Verification Result</Text>
            
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: theme.colors.textTertiary }]}>Student</Text>
              <Text style={[styles.resultValue, { color: theme.colors.text }]}>{verificationResult.metadata.studentName}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: theme.colors.textTertiary }]}>Threshold</Text>
              <Text style={[styles.resultValue, { color: theme.colors.text }]}>{verificationResult.metadata.threshold}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: theme.colors.textTertiary }]}>Result</Text>
              <Text style={[
                styles.resultValue,
                { color: verificationResult.metadata.verified ? theme.colors.success : theme.colors.error }
              ]}>
                {verificationResult.metadata.verified ? 'VERIFIED ✓' : 'FAILED ✗'}
              </Text>
            </View>

            {verificationResult.metadata.timestamp && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: theme.colors.textTertiary }]}>Verified On</Text>
                  <Text style={[styles.resultValue, { color: theme.colors.text }]}>
                    {new Date(verificationResult.metadata.timestamp).toLocaleString()}
                  </Text>
                </View>
              </>
            )}

            <View style={[styles.privacyNote, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={[styles.privacyText, { color: theme.colors.textSecondary }]}>
                Actual GPA remains private. Only threshold verification is disclosed.
              </Text>
            </View>
          </NothingCard>
        )}
      </View>

      {modalData && (
        <ResultModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          type={modalData.type}
          title={modalData.title}
          message={modalData.message}
          details={modalData.details}
        />
      )}
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
    marginBottom: SPACING.xl,
  },
  codeInputContainer: {
    marginBottom: SPACING.md,
  },
  input: {
    marginBottom: 0,
  },
  button: {
    marginTop: SPACING.md,
  },
  resultCard: {
    borderLeftWidth: 3,
  },
  resultTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.lg,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  resultLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginRight: SPACING.sm,
  },
  resultValue: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    marginVertical: SPACING.md,
  },
  hashText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: 'monospace',
    flex: 1,
    marginLeft: SPACING.md,
  },
  privacyNote: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    borderRadius: 4,
  },
  privacyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: 'center',
  },
});
