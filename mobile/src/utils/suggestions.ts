// Common suggestions for onboarding form (Mobile)

export const BACKGROUND_SUGGESTIONS = [
  'Computer Science Student',
  'Software Engineer',
  'Web Developer',
  'Data Scientist',
  'DevOps Engineer',
  'UI/UX Designer',
  'Product Manager',
  'Recent Graduate',
  'Career Changer',
  'Self-taught Developer',
]

export const LEARNING_GOAL_SUGGESTIONS = [
  'Master Full-Stack Development',
  'Learn Cloud Computing',
  'Become a Data Scientist',
  'Get Certified in DevOps',
  'Learn Machine Learning & AI',
  'Master Frontend Development',
  'Learn Backend Development',
  'Become a Mobile App Developer',
  'Learn Cybersecurity',
  'Master Database Management',
]

export const SKILL_SUGGESTIONS = [
  'JavaScript', 'Python', 'Java', 'TypeScript', 'React', 'Node.js',
  'AWS', 'Docker', 'PostgreSQL', 'MongoDB', 'Git', 'Kubernetes',
  'React Native', 'Flutter', 'TensorFlow', 'Pandas', 'Express',
]

export const INDUSTRY_SUGGESTIONS = [
  'Software Development',
  'Web Development',
  'Mobile App Development',
  'Data Science',
  'Machine Learning & AI',
  'Cloud Computing',
  'DevOps',
  'Cybersecurity',
]

export const LEARNING_STYLE_OPTIONS = [
  'Visual',
  'Auditory',
  'Reading/Writing',
  'Kinesthetic',
  'Mixed',
]

// Skill recommendations based on selections
export function getRecommendedSkills(
  background: string,
  learningGoals: string,
  targetIndustry: string,
  currentSkills: string[]
): string[] {
  const recommendations: string[] = []
  const lowerBackground = background.toLowerCase()
  const lowerGoals = learningGoals.toLowerCase()
  const lowerIndustry = targetIndustry.toLowerCase()

  // Based on background
  if (lowerBackground.includes('student') || lowerBackground.includes('graduate')) {
    recommendations.push('Git', 'GitHub', 'JavaScript', 'Python')
  }
  if (lowerBackground.includes('web') || lowerBackground.includes('frontend')) {
    recommendations.push('React', 'HTML', 'CSS', 'JavaScript', 'TypeScript')
  }
  if (lowerBackground.includes('data')) {
    recommendations.push('Python', 'Pandas', 'NumPy', 'SQL', 'Jupyter')
  }

  // Based on learning goals
  if (lowerGoals.includes('full-stack') || lowerGoals.includes('full stack')) {
    recommendations.push('React', 'Node.js', 'PostgreSQL', 'Express', 'MongoDB')
  }
  if (lowerGoals.includes('cloud') || lowerGoals.includes('aws') || lowerGoals.includes('azure')) {
    recommendations.push('AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD')
  }
  if (lowerGoals.includes('data science') || lowerGoals.includes('data scientist')) {
    recommendations.push('Python', 'Pandas', 'NumPy', 'TensorFlow', 'Jupyter', 'SQL')
  }
  if (lowerGoals.includes('machine learning') || lowerGoals.includes('ai')) {
    recommendations.push('Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'NumPy')
  }
  if (lowerGoals.includes('devops')) {
    recommendations.push('Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux')
  }
  if (lowerGoals.includes('frontend')) {
    recommendations.push('React', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS', 'Next.js')
  }
  if (lowerGoals.includes('backend')) {
    recommendations.push('Node.js', 'PostgreSQL', 'Express', 'REST APIs', 'MongoDB')
  }
  if (lowerGoals.includes('mobile')) {
    recommendations.push('React Native', 'Flutter', 'iOS Development', 'Android Development')
  }

  // Based on target industry
  if (lowerIndustry.includes('web') || lowerIndustry.includes('software')) {
    recommendations.push('JavaScript', 'React', 'Node.js', 'PostgreSQL')
  }
  if (lowerIndustry.includes('data')) {
    recommendations.push('Python', 'SQL', 'Pandas', 'NumPy', 'Jupyter')
  }
  if (lowerIndustry.includes('cloud')) {
    recommendations.push('AWS', 'Docker', 'Kubernetes', 'Terraform')
  }
  if (lowerIndustry.includes('mobile')) {
    recommendations.push('React Native', 'Flutter', 'Swift', 'Kotlin')
  }

  // Filter out skills already in currentSkills and remove duplicates
  const uniqueRecommendations = Array.from(
    new Set(recommendations.filter(skill => !currentSkills.includes(skill)))
  )

  return uniqueRecommendations.slice(0, 6) // Return top 6 recommendations for mobile
}
