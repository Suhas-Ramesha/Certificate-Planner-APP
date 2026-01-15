import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const loadingMessages = [
  'Analyzing your learning goals and background...',
  'Creating a personalized study path just for you...',
  'Curating the best topics based on your skills...',
  'Optimizing your learning timeline...',
  'Almost ready! Finalizing your roadmap...'
];

export default function RoadmapLoading() {
  const { colors } = useTheme();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const messageInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Animated Icon */}
        <View style={styles.iconWrapper}>
          <View style={styles.iconGlow} />
          <View style={styles.iconContainer}>
            <Ionicons name="sparkles" size={48} color="#fff" />
          </View>
        </View>

        {/* Main Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.mainTitle}>
            Generating Your Personalized Roadmap
          </Text>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.subMessage}>
              {loadingMessages[currentMessageIndex]}
            </Text>
          </Animated.View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${Math.min(progress, 95)}%` }
                ]} 
              />
            </View>
          </View>
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressLabel}>Creating your roadmap...</Text>
            <Text style={styles.progressPercent}>
              {Math.round(Math.min(progress, 95))}%
            </Text>
          </View>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="target" size={16} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>
              Tailored to your specific goals and background
            </Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="book" size={16} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>
              Structured learning path with clear milestones
            </Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="flash" size={16} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>
              Optimized timeline based on your availability
            </Text>
          </View>
        </View>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>
            This may take 30-60 seconds...
          </Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 32,
  },
  iconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    opacity: 0.3,
    top: -2,
    left: -2,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  progressSection: {
    width: '100%',
    marginBottom: 24,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.isDark ? colors.surface : '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});
