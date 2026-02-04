import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';
import NothingButton from '@/components/NothingButton';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    {
      title: 'Privacy First',
      description: 'Your academic credentials stay completely private with zero-knowledge proofs',
      icon: '🔒',
    },
    {
      title: 'Blockchain Verified',
      description: 'Every proof is verified on the blockchain with cryptographic security',
      icon: '⛓️',
    },
    {
      title: 'Camera Only',
      description: 'Built-in camera capture ensures document authenticity and prevents fakes',
      icon: '📸',
    },
  ];

  const handleComplete = async () => {
    await SecureStore.setItemAsync('onboardingCompleted', 'true');
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const currentPageData = pages[currentPage];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.page}>
          <Text style={styles.icon}>{currentPageData.icon}</Text>
          <Text style={styles.title}>{currentPageData.title}</Text>
          <Text style={styles.description}>{currentPageData.description}</Text>
        </View>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {pages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentPage && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <NothingButton
            title={currentPage === pages.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            fullWidth
          />
          {currentPage < pages.length - 1 && (
            <NothingButton
              title="Skip"
              onPress={handleSkip}
              variant="ghost"
              fullWidth
              style={styles.skipButton}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.xl,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  icon: {
    fontSize: 80,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gray400,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.base,
    maxWidth: 320,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray700,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  buttons: {
    gap: SPACING.sm,
  },
  skipButton: {
    marginTop: SPACING.sm,
  },
});
