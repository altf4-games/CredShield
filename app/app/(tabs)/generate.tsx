import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, TYPOGRAPHY, SPACING, COMMON_STYLES } from '@/constants/theme';
import NothingCard from '@/components/NothingCard';
import NothingButton from '@/components/NothingButton';

export default function GenerateScreen() {
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to capture your transcript');
      return false;
    }
    return true;
  };

  const handleCameraCapture = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
        // TODO: Upload to backend
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          Alert.alert('Coming Soon', 'Backend integration in progress');
        }, 2000);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  return (
    <ScrollView style={COMMON_STYLES.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Generate Proof</Text>
        <Text style={styles.subtitle}>
          Capture your academic transcript
        </Text>

        <NothingCard style={styles.card}>
          <Text style={styles.cardTitle}>Camera Capture</Text>
          <Text style={styles.cardDescription}>
            Take a photo of your official academic transcript for verification
          </Text>

          <NothingButton
            title="Open Camera"
            onPress={handleCameraCapture}
            loading={loading}
            fullWidth
            style={styles.button}
          />

          {photo && (
            <Text style={styles.note}>
              Photo captured ✓ Processing...
            </Text>
          )}
        </NothingCard>
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
    marginTop: SPACING.md,
  },
  note: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
