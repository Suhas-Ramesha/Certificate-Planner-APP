import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import api from '../config/api';
import { Ionicons } from '@expo/vector-icons';

interface ProgressData {
  roadmap_topic_id: number;
  topic_name: string;
  week_number: number;
  hours_studied: number;
  completion_percentage: number;
}

interface WeeklyProgress {
  week_number: number;
  week_start_date: string;
  total_hours_studied: number;
  topics_completed: number;
}

export default function ProgressScreen() {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<number | null>(null);
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  useEffect(() => {
    if (selectedRoadmapId) {
      fetchProgress();
      fetchWeeklyProgress();
    }
  }, [selectedRoadmapId]);

  const fetchRoadmaps = async () => {
    try {
      const response = await api.get('/roadmaps');
      setRoadmaps(response.data.roadmaps);
      if (response.data.roadmaps.length > 0) {
        setSelectedRoadmapId(response.data.roadmaps[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch roadmaps:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProgress = async () => {
    if (!selectedRoadmapId) return;

    try {
      const response = await api.get(`/progress/roadmap/${selectedRoadmapId}`);
      setProgress(response.data.progress);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  const fetchWeeklyProgress = async () => {
    if (!selectedRoadmapId) return;

    try {
      const response = await api.get(`/progress/weekly/${selectedRoadmapId}`);
      setWeeklyProgress(response.data.weeklyProgress);
    } catch (error) {
      console.error('Failed to fetch weekly progress:', error);
    }
  };

  const calculateStats = () => {
    const totalHours = progress.reduce((sum, p) => sum + p.hours_studied, 0);
    const avgCompletion = progress.length > 0
      ? progress.reduce((sum, p) => sum + p.completion_percentage, 0) / progress.length
      : 0;
    const completedTopics = progress.filter((p) => p.completion_percentage === 100).length;

    return { totalHours, avgCompletion, completedTopics };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.centerContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchRoadmaps} />
        }
      >
        <Ionicons name="stats-chart-outline" size={64} color="#64748b" />
        <Text style={styles.emptyTitle}>No Progress Data</Text>
        <Text style={styles.emptyText}>
          Generate a roadmap and start tracking your learning progress.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchRoadmaps} />
      }
    >
      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={32} color="#0284c7" />
            <Text style={styles.statValue}>{stats.totalHours.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="trending-up-outline" size={32} color="#10b981" />
            <Text style={styles.statValue}>{stats.avgCompletion.toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Avg. Completion</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={32} color="#3b82f6" />
            <Text style={styles.statValue}>{stats.completedTopics}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {weeklyProgress.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Progress</Text>
            {weeklyProgress.map((wp) => (
              <View key={wp.week_number} style={styles.weekCard}>
                <Text style={styles.weekTitle}>Week {wp.week_number}</Text>
                <View style={styles.weekStats}>
                  <Text style={styles.weekStat}>
                    {wp.total_hours_studied.toFixed(1)} hours
                  </Text>
                  <Text style={styles.weekStat}>
                    {wp.topics_completed} topics completed
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Topic Progress</Text>
          {progress.length === 0 ? (
            <Text style={styles.emptyText}>No progress data yet</Text>
          ) : (
            progress.map((p) => (
              <View key={`${p.roadmap_topic_id}-${p.week_number}`} style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTopic}>{p.topic_name}</Text>
                  <Text style={styles.progressWeek}>Week {p.week_number}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${p.completion_percentage}%` }]}
                  />
                </View>
                <View style={styles.progressMeta}>
                  <Text style={styles.progressText}>
                    {p.hours_studied.toFixed(1)} hours
                  </Text>
                  <Text style={styles.progressText}>
                    {p.completion_percentage}% complete
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  weekCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  weekStats: {
    flexDirection: 'row',
    gap: 16,
  },
  weekStat: {
    fontSize: 14,
    color: '#64748b',
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTopic: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
  },
  progressWeek: {
    fontSize: 14,
    color: '#64748b',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0284c7',
    borderRadius: 4,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
  },
});
