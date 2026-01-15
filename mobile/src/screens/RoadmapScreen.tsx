import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import api from '../config/api';
import { Ionicons } from '@expo/vector-icons';
import RoadmapLoading from '../components/RoadmapLoading';

interface Roadmap {
  id: number;
  title: string;
  description: string;
  estimated_duration_weeks: number;
  topics: Topic[];
}

interface Topic {
  id: number;
  topic_name: string;
  description: string;
  estimated_hours: number;
  order_index: number;
}

export default function RoadmapScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const styles = createStyles(colors);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const response = await api.get('/roadmaps');
      const roadmapsData = response.data.roadmaps;

      if (roadmapsData.length > 0) {
        const fullRoadmap = await api.get(`/roadmaps/${roadmapsData[0].id}`);
        setSelectedRoadmap(fullRoadmap.data.roadmap);
        setRoadmaps(roadmapsData);
      }
    } catch (error) {
      console.error('Failed to fetch roadmaps:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateRoadmap = async () => {
    setGenerating(true);
    try {
      const response = await api.post('/roadmaps/generate');
      const newRoadmap = response.data.roadmap;
      setSelectedRoadmap(newRoadmap);
      setRoadmaps([newRoadmap, ...roadmaps]);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  if (generating) {
    return <RoadmapLoading />;
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  if (!selectedRoadmap && roadmaps.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.centerContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchRoadmaps} />
        }
      >
        <Ionicons name="book-outline" size={64} color="#0284c7" />
        <Text style={styles.emptyTitle}>No Roadmap Yet</Text>
        <Text style={styles.emptyText}>
          Generate your personalized learning roadmap to get started.
        </Text>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={generateRoadmap}
          disabled={generating}
        >
          <Ionicons name="sparkles" size={20} color="#fff" />
          <Text style={styles.generateButtonText}>Generate Roadmap</Text>
        </TouchableOpacity>
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
      {!selectedRoadmap && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateRoadmap}
            disabled={generating}
          >
            <Text style={styles.generateButtonText}>
              Generate New Roadmap
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedRoadmap && (
        <View style={styles.content}>
          <View style={styles.roadmapHeader}>
            <Text style={styles.roadmapTitle}>{selectedRoadmap.title}</Text>
            <Text style={styles.roadmapDescription}>
              {selectedRoadmap.description}
            </Text>
            <View style={styles.roadmapMeta}>
              <Text style={styles.metaText}>
                {selectedRoadmap.estimated_duration_weeks} weeks
              </Text>
              <Text style={styles.metaText}>
                {selectedRoadmap.topics?.length || 0} topics
              </Text>
            </View>
          </View>

          {selectedRoadmap.topics?.map((topic) => (
            <TouchableOpacity
              key={topic.id}
              style={styles.topicCard}
              onPress={() =>
                navigation.navigate('TopicDetail', { topicId: topic.id } as never)
              }
            >
              <View style={styles.topicHeader}>
                <View style={styles.topicNumber}>
                  <Text style={styles.topicNumberText}>{topic.order_index}</Text>
                </View>
                <View style={styles.topicContent}>
                  <Text style={styles.topicName}>{topic.topic_name}</Text>
                  <Text style={styles.topicDescription} numberOfLines={2}>
                    {topic.description}
                  </Text>
                  <Text style={styles.topicHours}>
                    {topic.estimated_hours} hours
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#64748b" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  header: {
    padding: 16,
  },
  generateButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  roadmapHeader: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roadmapTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  roadmapDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  roadmapMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  topicCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topicNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.isDark ? colors.surface : '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  topicNumberText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  topicContent: {
    flex: 1,
  },
  topicName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  topicHours: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
});
