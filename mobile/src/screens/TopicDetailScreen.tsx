import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import api from '../config/api';
import { Ionicons } from '@expo/vector-icons';

interface Topic {
  id: number;
  topic_name: string;
  description: string;
  estimated_hours: number;
  prerequisites: string[];
}

interface Resource {
  id: number;
  title: string;
  channel_name: string;
  video_id?: string;
  playlist_id?: string;
  resource_type: string;
  thumbnail_url?: string;
}

export default function TopicDetailScreen() {
  const route = useRoute();
  const { topicId } = route.params as { topicId: number };
  const [topic, setTopic] = useState<Topic | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingResources, setLoadingResources] = useState(false);

  useEffect(() => {
    fetchTopicDetails();
  }, [topicId]);

  const fetchTopicDetails = async () => {
    setLoading(true);
    try {
      // Fetch resources
      const resourcesResponse = await api.get(`/youtube/topic/${topicId}`);
      if (resourcesResponse.data.resources.length === 0) {
        // Search for resources
        setLoadingResources(true);
        await api.get(`/youtube/search/${topicId}?maxResults=5`);
        const updated = await api.get(`/youtube/topic/${topicId}`);
        setResources(updated.data.resources);
        setLoadingResources(false);
      } else {
        setResources(resourcesResponse.data.resources);
      }
    } catch (error) {
      console.error('Failed to fetch topic details:', error);
    } finally {
      setLoading(false);
    }
  };

  const openResource = (resource: Resource) => {
    const url = resource.resource_type === 'playlist'
      ? `https://www.youtube.com/playlist?list=${resource.playlist_id}`
      : `https://www.youtube.com/watch?v=${resource.video_id}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {topic && (
          <>
            <View style={styles.topicHeader}>
              <Text style={styles.topicTitle}>{topic.topic_name}</Text>
              <Text style={styles.topicDescription}>{topic.description}</Text>
              <View style={styles.topicMeta}>
                <Text style={styles.metaText}>
                  {topic.estimated_hours} hours
                </Text>
                {topic.prerequisites && topic.prerequisites.length > 0 && (
                  <Text style={styles.metaText}>
                    Prerequisites: {topic.prerequisites.join(', ')}
                  </Text>
                )}
              </View>
            </View>
          </>
        )}

        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>Learning Resources</Text>
          {loadingResources ? (
            <ActivityIndicator size="small" color="#0284c7" />
          ) : resources.length === 0 ? (
            <Text style={styles.emptyText}>No resources available</Text>
          ) : (
            resources.map((resource) => (
              <TouchableOpacity
                key={resource.id}
                style={styles.resourceCard}
                onPress={() => openResource(resource)}
              >
                <Ionicons
                  name={resource.resource_type === 'playlist' ? 'list' : 'play-circle'}
                  size={24}
                  color="#0284c7"
                />
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceTitle} numberOfLines={2}>
                    {resource.title}
                  </Text>
                  <Text style={styles.resourceChannel}>
                    {resource.channel_name}
                  </Text>
                </View>
                <Ionicons name="open-outline" size={20} color="#64748b" />
              </TouchableOpacity>
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
  },
  content: {
    padding: 16,
  },
  topicHeader: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  topicTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  topicDescription: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 12,
  },
  topicMeta: {
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#64748b',
  },
  resourcesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    padding: 20,
  },
  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  resourceChannel: {
    fontSize: 14,
    color: '#64748b',
  },
});
