import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { COLORS, TYPOGRAPHY, SPACING, COMMON_STYLES } from '@/constants/theme';
import NothingCard from '@/components/NothingCard';
import NothingButton from '@/components/NothingButton';
import NothingInput from '@/components/NothingInput';
import ResultModal from '@/components/ResultModal';
import apiService from '@/services/api';

export default function VerifyScreen() {
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
        showModal(
          'success',
          'Proof Verified',
          'The proof has been successfully verified on the blockchain.',
          [
            { label: 'Student', value: response.metadata.studentName },
            { label: 'Threshold', value: response.metadata.threshold.toString() },
            { label: 'Result', value: response.metadata.meetsRequirement ? 'PASSED' : 'FAILED' },
            { label: 'TX Hash', value: response.txHash.substring(0, 20) + '...' },
          ]
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
    <ScrollView style={COMMON_STYLES.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Proof</Text>
        <Text style={styles.subtitle}>
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
          <NothingCard style={styles.resultCard}>
            <Text style={styles.resultTitle}>Verification Result</Text>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Student</Text>
              <Text style={styles.resultValue}>{verificationResult.metadata.studentName}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Threshold</Text>
              <Text style={styles.resultValue}>{verificationResult.metadata.threshold}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Result</Text>
              <Text style={[
                styles.resultValue,
                verificationResult.metadata.meetsRequirement ? styles.passText : styles.failText
              ]}>
                {verificationResult.metadata.meetsRequirement ? 'PASSED ✓' : 'FAILED ✗'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>TX Hash</Text>
              <Text style={styles.hashText} numberOfLines={1} ellipsizeMode="middle">
                {verificationResult.txHash}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Block</Text>
              <Text style={styles.resultValue}>{verificationResult.blockNumber}</Text>
            </View>

            <View style={styles.privacyNote}>
              <Text style={styles.privacyText}>
                Actual GPA remains private
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
    borderLeftColor: COLORS.success,
  },
  resultTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
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
    color: COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginRight: SPACING.sm,
  },
  resultValue: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
    textAlign: 'right',
  },
  passText: {
    color: COLORS.success,
  },
  failText: {
    color: COLORS.error,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  hashText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary,
    fontFamily: 'monospace',
    flex: 1,
    marginLeft: SPACING.md,
  },
  privacyNote: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 4,
  },
  privacyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray400,
    textAlign: 'center',
  },
});
