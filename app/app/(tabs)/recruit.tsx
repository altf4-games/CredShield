import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY, SPACING } from '@/constants/theme';
import * as SecureStore from 'expo-secure-store';
import Swiper from 'react-native-deck-swiper';
import CandidateCard from '@/components/CandidateCard';
import NothingCard from '@/components/NothingCard';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '@/services/api';

const { height } = Dimensions.get('window');

interface Candidate {
  userId: string;
  name: string;
  gpaRange: string;
  skills?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  isEligible: boolean;
  isVerified: boolean;
}

export default function RecruitScreen() {
  const { theme } = useTheme();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef<any>(null);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const recruiterId = await SecureStore.getItemAsync('userId');
      if (!recruiterId) {
        console.error('No recruiter ID found');
        setLoading(false);
        return;
      }
      
      const data = await ApiService.getCandidates(recruiterId);
      setCandidates(data);
    } catch (error) {
      console.error('Error loading candidates:', error);
      // Keep empty array on error
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeLeft = async (cardIndex: number) => {
    try {
      const recruiterId = await SecureStore.getItemAsync('userId');
      if (!recruiterId) return;
      
      console.log('Swiped left on:', candidates[cardIndex].name);
      await ApiService.saveSwipe(recruiterId, candidates[cardIndex].userId, 'skip');
    } catch (error) {
      console.error('Error saving skip:', error);
    }
  };

  const handleSwipeRight = async (cardIndex: number) => {
    try {
      const recruiterId = await SecureStore.getItemAsync('userId');
      if (!recruiterId) return;
      
      console.log('Swiped right on:', candidates[cardIndex].name);
      await ApiService.saveSwipe(recruiterId, candidates[cardIndex].userId, 'interested');
    } catch (error) {
      console.error('Error saving interested:', error);
    }
  };

  const renderCard = (candidate: Candidate) => {
    if (!candidate) return null;
    
    return (
      <CandidateCard
        name={candidate.name}
        gpaRange={candidate.gpaRange}
        skills={candidate.skills}
        linkedinUrl={candidate.linkedinUrl}
        githubUrl={candidate.githubUrl}
        portfolioUrl={candidate.portfolioUrl}
        isEligible={candidate.isEligible}
        isVerified={candidate.isVerified}
      />
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading candidates...
          </Text>
        </View>
      </View>
    );
  }

  if (candidates.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <View style={styles.emptyContainer}>
            <NothingCard style={styles.emptyCard}>
              <Ionicons name="people-outline" size={64} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                No Candidates Available
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>
                Check back later for new candidates
              </Text>
            </NothingCard>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Instructions */}
        <View style={styles.instructions}>
          <View style={styles.instructionRow}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.error} />
            <Text style={[styles.instructionText, { color: theme.colors.textSecondary }]}>
              Swipe left to skip
            </Text>
          </View>
          <View style={styles.instructionRow}>
            <Text style={[styles.instructionText, { color: theme.colors.textSecondary }]}>
              Swipe right for interested
            </Text>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.success} />
          </View>
        </View>

        {/* Card Swiper */}
        <View style={styles.swiperContainer}>
          <Swiper
            ref={swiperRef}
            cards={candidates}
            renderCard={renderCard}
            onSwipedLeft={handleSwipeLeft}
            onSwipedRight={handleSwipeRight}
            onSwipedAll={() => {
              console.log('All cards swiped');
              setCandidates([]);
            }}
            cardIndex={currentIndex}
            backgroundColor="transparent"
            stackSize={3}
            stackSeparation={15}
            overlayLabels={{
              left: {
                title: 'SKIP',
                style: {
                  label: {
                    backgroundColor: theme.colors.error,
                    color: theme.colors.white,
                    fontSize: TYPOGRAPHY.fontSize.xl,
                    fontWeight: TYPOGRAPHY.fontWeight.bold,
                    padding: SPACING.md,
                    borderRadius: 8,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                    marginTop: 60,
                    marginRight: 40,
                  },
                },
              },
              right: {
                title: 'INTERESTED',
                style: {
                  label: {
                    backgroundColor: theme.colors.success,
                    color: theme.colors.white,
                    fontSize: TYPOGRAPHY.fontSize.xl,
                    fontWeight: TYPOGRAPHY.fontWeight.bold,
                    padding: SPACING.md,
                    borderRadius: 8,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 60,
                    marginLeft: 40,
                  },
                },
              },
            }}
            animateOverlayLabelsOpacity
            animateCardOpacity
            swipeBackCard={false}
            verticalSwipe={false}
            cardVerticalMargin={0}
            cardHorizontalMargin={0}
          />
        </View>

        {/* Counter */}
        <View style={styles.counter}>
          <Text style={[styles.counterText, { color: theme.colors.textSecondary }]}>
            {candidates.length - currentIndex} remaining
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  instructions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  instructionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  swiperContainer: {
    flex: 1,
    marginBottom: SPACING.md,
  },
  counter: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  counterText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    textAlign: 'center',
  },
});
