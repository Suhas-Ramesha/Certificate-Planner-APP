import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';

interface UserProfile {
  id: number;
  background?: string;
  current_skills?: string[];
  learning_goals?: string;
  time_availability_hours_per_week?: number;
  preferred_learning_style?: string;
  target_industry?: string;
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    background: '',
    current_skills: [] as string[],
    learning_goals: '',
    time_availability_hours_per_week: '10',
    preferred_learning_style: '',
    target_industry: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const profileData = response.data.profile;
      setProfile(profileData);
      if (profileData) {
        setFormData({
          background: profileData.background || '',
          current_skills: profileData.current_skills || [],
          learning_goals: profileData.learning_goals || '',
          time_availability_hours_per_week: String(profileData.time_availability_hours_per_week || 10),
          preferred_learning_style: profileData.preferred_learning_style || '',
          target_industry: profileData.target_industry || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.current_skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        current_skills: [...formData.current_skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      current_skills: formData.current_skills.filter((s) => s !== skill),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/users/profile', {
        ...formData,
        time_availability_hours_per_week: parseInt(formData.time_availability_hours_per_week) || 10,
      });
      setEditing(false);
      fetchProfile();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchProfile} />
      }
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </View>
        <Text style={styles.name}>{user?.name || user?.email?.split('@')[0] || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {!editing && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditing(true)}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Content */}
      <View style={styles.content}>
        {editing ? (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Background</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.background}
                onChangeText={(text) => setFormData({ ...formData, background: text })}
                placeholder="Tell us about your background..."
                placeholderTextColor={colors.placeholder}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Current Skills</Text>
              <View style={styles.skillInputRow}>
                <TextInput
                  style={[styles.input, styles.skillInput]}
                  value={skillInput}
                  onChangeText={setSkillInput}
                  placeholder="Add a skill"
                  placeholderTextColor={colors.placeholder}
                  onSubmitEditing={addSkill}
                />
                <TouchableOpacity style={styles.addButton} onPress={addSkill}>
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.skillsContainer}>
                {formData.current_skills.map((skill) => (
                  <TouchableOpacity
                    key={skill}
                    style={styles.skillTag}
                    onPress={() => removeSkill(skill)}
                  >
                    <Text style={styles.skillText}>{skill}</Text>
                    <Text style={styles.removeSkill}>×</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Learning Goals</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.learning_goals}
                onChangeText={(text) => setFormData({ ...formData, learning_goals: text })}
                placeholder="What do you want to achieve?"
                placeholderTextColor={colors.placeholder}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Hours/Week</Text>
                <TextInput
                  style={styles.input}
                  value={formData.time_availability_hours_per_week}
                  onChangeText={(text) =>
                    setFormData({ ...formData, time_availability_hours_per_week: text })
                  }
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor={colors.placeholder}
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Learning Style</Text>
                <TextInput
                  style={styles.input}
                  value={formData.preferred_learning_style}
                  onChangeText={(text) =>
                    setFormData({ ...formData, preferred_learning_style: text })
                  }
                  placeholder="Visual, Auditory..."
                  placeholderTextColor={colors.placeholder}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Target Industry</Text>
              <TextInput
                style={styles.input}
                value={formData.target_industry}
                onChangeText={(text) => setFormData({ ...formData, target_industry: text })}
                placeholder="e.g., Software Development..."
                placeholderTextColor={colors.placeholder}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setEditing(false);
                  fetchProfile();
                }}
              >
                <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="book-outline" size={24} color={colors.primary} />
                <Text style={styles.infoTitle}>Background</Text>
              </View>
              <Text style={styles.infoText}>
                {profile?.background || 'Not specified'}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="flag-outline" size={24} color={colors.primary} />
                <Text style={styles.infoTitle}>Learning Goals</Text>
              </View>
              <Text style={styles.infoText}>
                {profile?.learning_goals || 'Not specified'}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="construct-outline" size={24} color={colors.primary} />
                <Text style={styles.infoTitle}>Current Skills</Text>
              </View>
              <View style={styles.skillsContainer}>
                {profile?.current_skills && profile.current_skills.length > 0 ? (
                  profile.current_skills.map((skill) => (
                    <View key={skill} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.infoText}>No skills added yet</Text>
                )}
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="time-outline" size={28} color={colors.primary} />
                <Text style={styles.statValue}>
                  {profile?.time_availability_hours_per_week || 0}
                </Text>
                <Text style={styles.statLabel}>Hours/Week</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="school-outline" size={28} color={colors.primary} />
                <Text style={styles.statValue}>
                  {profile?.preferred_learning_style || 'N/A'}
                </Text>
                <Text style={styles.statLabel}>Learning Style</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="business-outline" size={28} color={colors.primary} />
                <Text style={styles.statValue} numberOfLines={1}>
                  {profile?.target_industry || 'N/A'}
                </Text>
                <Text style={styles.statLabel}>Industry</Text>
              </View>
            </View>
          </View>
        )}
      </View>
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
  },
  header: {
    backgroundColor: colors.surface,
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.inputText,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  skillInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  skillInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.isDark ? colors.surface : '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skillText: {
    color: colors.primary,
    fontSize: 14,
  },
  removeSkill: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileInfo: {
    gap: 16,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
