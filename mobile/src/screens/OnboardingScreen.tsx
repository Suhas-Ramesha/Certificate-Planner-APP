import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import {
  BACKGROUND_SUGGESTIONS,
  LEARNING_GOAL_SUGGESTIONS,
  SKILL_SUGGESTIONS,
  INDUSTRY_SUGGESTIONS,
  LEARNING_STYLE_OPTIONS,
  getRecommendedSkills,
} from '../utils/suggestions';

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    background: '',
    current_skills: [] as string[],
    learning_goals: '',
    time_availability_hours_per_week: '10',
    preferred_learning_style: '',
    target_industry: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendedSkills, setRecommendedSkills] = useState<string[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  
  const styles = createStyles(colors);

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

  // Update skill recommendations when form data changes
  useEffect(() => {
    if (
      formData.background ||
      formData.learning_goals ||
      formData.target_industry
    ) {
      const recommendations = getRecommendedSkills(
        formData.background,
        formData.learning_goals,
        formData.target_industry,
        formData.current_skills
      );
      setRecommendedSkills(recommendations);
      setShowRecommendations(recommendations.length > 0);
    } else {
      setShowRecommendations(false);
    }
  }, [formData.background, formData.learning_goals, formData.target_industry, formData.current_skills]);

  const addRecommendedSkill = (skill: string) => {
    if (!formData.current_skills.includes(skill)) {
      setFormData({
        ...formData,
        current_skills: [...formData.current_skills, skill],
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      await api.post('/users/profile', {
        ...formData,
        time_availability_hours_per_week: parseInt(formData.time_availability_hours_per_week) || 10,
      });
      navigation.navigate('Dashboard' as never);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>
          Help us create a personalized learning roadmap
        </Text>
      </View>

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
          <View style={styles.suggestionsContainer}>
            {BACKGROUND_SUGGESTIONS.slice(0, 4).map((bg) => (
              <TouchableOpacity
                key={bg}
                style={[
                  styles.suggestionChip,
                  formData.background === bg && styles.suggestionChipActive,
                ]}
                onPress={() => setFormData({ ...formData, background: bg })}
              >
                <Text
                  style={[
                    styles.suggestionText,
                    formData.background === bg && styles.suggestionTextActive,
                  ]}
                >
                  {bg}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current Skills</Text>
          <View style={styles.skillInputRow}>
            <TextInput
              style={[styles.input, styles.skillInput]}
              value={skillInput}
              onChangeText={(text) => {
                setSkillInput(text);
                setShowSkillSuggestions(text.length > 0);
              }}
              placeholder="Add a skill"
              placeholderTextColor={colors.placeholder}
              onSubmitEditing={addSkill}
              onFocus={() => setShowSkillSuggestions(true)}
            />
            <TouchableOpacity style={styles.addButton} onPress={addSkill}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          {showSkillSuggestions && skillInput.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {SKILL_SUGGESTIONS.filter((skill) =>
                skill.toLowerCase().includes(skillInput.toLowerCase())
              )
                .slice(0, 5)
                .map((skill) => (
                  <TouchableOpacity
                    key={skill}
                    style={styles.suggestionChip}
                    onPress={() => {
                      setSkillInput(skill);
                      addSkill();
                      setSkillInput('');
                      setShowSkillSuggestions(false);
                    }}
                  >
                    <Text style={styles.suggestionText}>{skill}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}
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
          {showRecommendations && recommendedSkills.length > 0 && (
            <View style={styles.recommendationsContainer}>
              <View style={styles.recommendationsHeader}>
                <Ionicons name="sparkles" size={16} color={colors.primary} />
                <Text style={styles.recommendationsTitle}>Recommended Skills</Text>
              </View>
              <View style={styles.suggestionsContainer}>
                {recommendedSkills.map((skill) => (
                  <TouchableOpacity
                    key={skill}
                    style={[
                      styles.recommendationChip,
                      formData.current_skills.includes(skill) && styles.recommendationChipDisabled,
                    ]}
                    onPress={() => addRecommendedSkill(skill)}
                    disabled={formData.current_skills.includes(skill)}
                  >
                    <Text
                      style={[
                        styles.recommendationText,
                        formData.current_skills.includes(skill) && styles.recommendationTextDisabled,
                      ]}
                    >
                      + {skill}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
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
          <View style={styles.suggestionsContainer}>
            {LEARNING_GOAL_SUGGESTIONS.slice(0, 4).map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.suggestionChip,
                  formData.learning_goals === goal && styles.suggestionChipActive,
                ]}
                onPress={() => setFormData({ ...formData, learning_goals: goal })}
              >
                <Text
                  style={[
                    styles.suggestionText,
                    formData.learning_goals === goal && styles.suggestionTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {goal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
            <View style={styles.suggestionsContainer}>
              {LEARNING_STYLE_OPTIONS.slice(0, 3).map((style) => (
                <TouchableOpacity
                  key={style}
                  style={[
                    styles.suggestionChip,
                    formData.preferred_learning_style === style && styles.suggestionChipActive,
                  ]}
                  onPress={() => setFormData({ ...formData, preferred_learning_style: style })}
                >
                  <Text
                    style={[
                      styles.suggestionText,
                      formData.preferred_learning_style === style && styles.suggestionTextActive,
                    ]}
                  >
                    {style}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
          <View style={styles.suggestionsContainer}>
            {INDUSTRY_SUGGESTIONS.slice(0, 4).map((industry) => (
              <TouchableOpacity
                key={industry}
                style={[
                  styles.suggestionChip,
                  formData.target_industry === industry && styles.suggestionChipActive,
                ]}
                onPress={() => setFormData({ ...formData, target_industry: industry })}
              >
                <Text
                  style={[
                    styles.suggestionText,
                    formData.target_industry === industry && styles.suggestionTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {industry}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Profile & Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  form: {
    width: '100%',
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
  errorContainer: {
    backgroundColor: colors.errorBackground,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionChipActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  suggestionText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  suggestionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  recommendationsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.isDark ? colors.surface : '#e0f2fe',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  recommendationChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  recommendationChipDisabled: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    opacity: 0.5,
  },
  recommendationText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  recommendationTextDisabled: {
    color: colors.textSecondary,
  },
});
