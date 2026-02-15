import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as SecureStore from 'expo-secure-store';
import { TYPOGRAPHY, SPACING } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import NothingCard from '@/components/NothingCard';
import NothingButton from '@/components/NothingButton';
import NothingInput from '@/components/NothingInput';
import ResultModal from '@/components/ResultModal';
import apiService from '@/services/api';
import { router } from 'expo-router';

export default function GenerateScreen() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState('7.0');
  const [uploadedFile, setUploadedFile] = useState<{uri: string, type: 'image' | 'pdf'} | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
    details?: { label: string; value: string }[];
  } | null>(null);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showModal('error', 'Permission Required', 'Camera access is needed to capture your transcript');
      return false;
    }
    return true;
  };

  const showModal = (type: 'success' | 'error', title: string, message: string, details?: { label: string; value: string }[]) => {
    setModalData({ type, title, message, details });
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalData?.type === 'success') {
      router.push('/(tabs)');
    }
  };

  const handleCameraCapture = async () => {
    if (!threshold) {
      showModal('error', 'Error', 'Please enter a threshold GPA');
      return;
    }

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadedFile({ uri: result.assets[0].uri, type: 'image' });
        await uploadToBackend(result.assets[0].uri, 'image');
      }
    } catch (error) {
      showModal('error', 'Error', 'Failed to capture photo');
    }
  };

  const handlePDFPick = async () => {
    if (!threshold) {
      showModal('error', 'Error', 'Please enter a threshold GPA');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadedFile({ uri: result.assets[0].uri, type: 'pdf' });
        await uploadToBackend(result.assets[0].uri, 'pdf');
      }
    } catch (error) {
      showModal('error', 'Error', 'Failed to pick PDF');
    }
  };

  const uploadToBackend = async (fileUri: string, fileType: 'image' | 'pdf') => {
    setLoading(true);
    try {
      const response = await apiService.generateProof(fileUri, fileType, parseFloat(threshold));

      console.log('Backend response:', JSON.stringify(response, null, 2));

      if (response.success && response.studentName) {
        // Store proof in history
        const newProof = {
          name: response.studentName,
          gpa: response.extractedGPA,
          verificationCode: response.verificationCode,
          threshold: response.metadata.threshold,
          result: response.metadata.meetsRequirement,
          timestamp: new Date().toISOString(),
        };
        
        // Get existing proofs
        const existingProofsStr = await SecureStore.getItemAsync('proofHistory');
        const existingProofs = existingProofsStr ? JSON.parse(existingProofsStr) : [];
        
        // Add new proof to beginning
        const updatedProofs = [newProof, ...existingProofs];
        await SecureStore.setItemAsync('proofHistory', JSON.stringify(updatedProofs));
        
        // Also update current user data for ID card
        const userData = {
          name: response.studentName,
          gpa: response.extractedGPA,
          timestamp: new Date().toISOString(),
        };
        await SecureStore.setItemAsync('userData', JSON.stringify(userData));

        showModal(
          'success',
          'Proof Generated',
          'Your zero-knowledge proof has been generated and stored on the blockchain.',
          [
            { label: 'Verification Code', value: response.verificationCode },
            { label: 'Student', value: response.studentName },
            { label: 'GPA', value: response.extractedGPA.toString() },
            { label: 'Threshold', value: response.metadata.threshold.toString() },
            { label: 'Result', value: response.metadata.meetsRequirement ? 'PASSED' : 'FAILED' },
          ]
        );
      } else {
        console.error('Invalid response structure:', response);
        showModal('error', 'Error', response.message || 'Invalid response from backend');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      showModal('error', 'Error', error.message || 'Failed to generate proof. Check backend connection.');
    } finally {
      setLoading(false);
      setUploadedFile(null);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Generate Proof</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>
          Upload your academic transcript
        </Text>

        <NothingCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Threshold GPA</Text>
          <Text style={[styles.cardDescription, { color: theme.colors.textTertiary }]}>
            Enter the minimum GPA requirement to verify against
          </Text>

          <NothingInput
            label="Threshold"
            placeholder="7.0"
            value={threshold}
            onChangeText={setThreshold}
            keyboardType="decimal-pad"
            containerStyle={styles.input}
          />
        </NothingCard>

        <NothingCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Camera Capture</Text>
          <Text style={[styles.cardDescription, { color: theme.colors.textTertiary }]}>
            Take a photo of your official academic transcript
          </Text>

          <NothingButton
            title="Open Camera"
            onPress={handleCameraCapture}
            loading={loading}
            fullWidth
            style={styles.button}
          />
        </NothingCard>

        <NothingCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>PDF Upload</Text>
          <Text style={[styles.cardDescription, { color: theme.colors.textTertiary }]}>
            Upload a PDF of your academic transcript (for emulators)
          </Text>

          <NothingButton
            title="Select PDF"
            onPress={handlePDFPick}
            loading={loading}
            variant="secondary"
            fullWidth
            style={styles.button}
          />
        </NothingCard>

        {uploadedFile && loading && (
          <View style={[styles.uploadedInfo, { backgroundColor: theme.colors.surfaceVariant, borderLeftColor: theme.colors.success }]}>
            <Text style={[styles.uploadedText, { color: theme.colors.success }]}>
              {uploadedFile.type === 'pdf' ? 'PDF' : 'Photo'} uploaded
            </Text>
            <Text style={[styles.uploadedSubtext, { color: theme.colors.textSecondary }]}>
              Processing with AI and generating ZK proof...
            </Text>
          </View>
        )}
      </View>

      {modalData && (
        <ResultModal
          visible={modalVisible}
          onClose={handleModalClose}
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
  input: {
    marginBottom: 0,
  },
  button: {
    marginTop: SPACING.md,
  },
  uploadedInfo: {
    borderRadius: 8,
    padding: SPACING.md,
    borderLeftWidth: 3,
  },
  uploadedText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.xs,
  },
  uploadedSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
});
