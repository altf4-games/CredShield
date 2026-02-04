import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { COLORS, TYPOGRAPHY, SPACING, COMMON_STYLES } from '@/constants/theme';
import NothingCard from '@/components/NothingCard';
import NothingButton from '@/components/NothingButton';
import NothingInput from '@/components/NothingInput';

export default function VerifyScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter a verification code');
      return;
    }

    if (code.length !== 8) {
      Alert.alert('Error', 'Verification code must be 8 characters');
      return;
    }

    setLoading(true);
    // TODO: Connect to backend API
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Proof verified! (Coming soon)');
    }, 2000);
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
});
