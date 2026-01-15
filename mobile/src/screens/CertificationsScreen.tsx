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
import api from '../config/api';
import { Ionicons } from '@expo/vector-icons';

interface Certification {
  id: number;
  name: string;
  provider: string;
  description: string;
  difficulty_level: string;
  estimated_study_hours: number;
  recommendation_reason: string;
  priority: number;
  status: string;
  website_url?: string;
}

export default function CertificationsScreen() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const response = await api.get('/certifications/recommended');
      setCertifications(response.data.certifications);
      setErrorMessage('');
    } catch (error: any) {
      const status = error.response?.status;
      const backendMessage = error.response?.data?.error;
      if (status === 400) {
        setErrorMessage(backendMessage || 'Generate a roadmap first to get recommendations.');
      } else if (status === 503) {
        setErrorMessage(backendMessage || 'Recommendations are temporarily unavailable. Please try again later.');
      } else {
        setErrorMessage('Unable to load certifications. Please try again.');
        console.error('Failed to fetch certifications:', error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/certifications/${id}/status`, { status });
      setCertifications((certs) =>
        certs.map((cert) => (cert.id === id ? { ...cert, status } : cert))
      );
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'in_progress':
        return 'time';
      case 'skipped':
        return 'close-circle';
      default:
        return 'trophy';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'in_progress':
        return '#3b82f6';
      case 'skipped':
        return '#64748b';
      default:
        return '#0284c7';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  if (certifications.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.centerContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchCertifications} />
        }
      >
        <Ionicons name="trophy-outline" size={64} color="#64748b" />
        <Text style={styles.emptyTitle}>No Certifications Yet</Text>
        <Text style={styles.emptyText}>
          {errorMessage || 'Generate a roadmap first to get personalized certification recommendations.'}
        </Text>
        {errorMessage ? (
          <Text style={styles.emptyHint}>
            If you already have a roadmap, try again later.
          </Text>
        ) : null}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchCertifications} />
      }
    >
      <View style={styles.content}>
        {certifications
          .sort((a, b) => b.priority - a.priority)
          .map((cert) => (
            <View key={cert.id} style={styles.certCard}>
              <View style={styles.certHeader}>
                <Ionicons
                  name={getStatusIcon(cert.status) as any}
                  size={24}
                  color={getStatusColor(cert.status)}
                />
                <View style={styles.certTitleContainer}>
                  <Text style={styles.certName}>{cert.name}</Text>
                  <Text style={styles.certProvider}>{cert.provider}</Text>
                </View>
              </View>

              <Text style={styles.certDescription}>{cert.description}</Text>

              <View style={styles.certMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Difficulty</Text>
                  <Text style={styles.metaValue}>{cert.difficulty_level}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Hours</Text>
                  <Text style={styles.metaValue}>{cert.estimated_study_hours}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Priority</Text>
                  <Text style={styles.metaValue}>{cert.priority}/5</Text>
                </View>
              </View>

              <View style={styles.reasonBox}>
                <Text style={styles.reasonText}>{cert.recommendation_reason}</Text>
              </View>

              <View style={styles.certActions}>
                {cert.website_url && (
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => {
                      // Open URL in browser
                    }}
                  >
                    <Ionicons name="open-outline" size={16} color="#0284c7" />
                    <Text style={styles.linkButtonText}>Learn More</Text>
                  </TouchableOpacity>
                )}
                <View style={styles.statusSelector}>
                  <Text style={styles.statusLabel}>Status:</Text>
                  <View style={styles.statusButtons}>
                    {['recommended', 'in_progress', 'completed', 'skipped'].map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusButton,
                          cert.status === status && styles.statusButtonActive,
                        ]}
                        onPress={() => updateStatus(cert.id, status)}
                      >
                        <Text
                          style={[
                            styles.statusButtonText,
                            cert.status === status && styles.statusButtonTextActive,
                          ]}
                        >
                          {status.replace('_', ' ')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          ))}
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
  emptyHint: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    padding: 16,
  },
  certCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  certHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  certTitleContainer: {
    flex: 1,
  },
  certName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  certProvider: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  certDescription: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 12,
  },
  certMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  reasonBox: {
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  reasonText: {
    fontSize: 14,
    color: '#0c4a6e',
  },
  certActions: {
    gap: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  linkButtonText: {
    color: '#0284c7',
    fontSize: 14,
    fontWeight: '500',
  },
  statusSelector: {
    gap: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  statusButtonActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  statusButtonText: {
    fontSize: 12,
    color: '#64748b',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
});
