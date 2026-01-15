import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePersonalizedRoadmap(userProfile) {
  const {
    background,
    current_skills,
    learning_goals,
    time_availability_hours_per_week,
    preferred_learning_style,
    target_industry
  } = userProfile;

  const prompt = `You are an expert learning advisor. Create a personalized study roadmap based on the following user profile:

Background: ${background || 'Not specified'}
Current Skills: ${current_skills?.join(', ') || 'None specified'}
Learning Goals: ${learning_goals || 'Not specified'}
Time Available: ${time_availability_hours_per_week} hours per week
Learning Style: ${preferred_learning_style || 'Not specified'}
Target Industry: ${target_industry || 'Not specified'}

Create a comprehensive, structured learning roadmap with the following format:
1. A clear title for the roadmap
2. A brief description
3. A list of topics/modules in order, each with:
   - Topic name
   - Description
   - Estimated hours to complete
   - Prerequisites (if any)
   - Learning objectives

The roadmap should be realistic based on the time availability and should progress from foundational concepts to advanced topics.

Return the response as a JSON object with this structure:
{
  "title": "Roadmap title",
  "description": "Brief description",
  "estimated_duration_weeks": number,
  "topics": [
    {
      "topic_name": "Topic name",
      "description": "Topic description",
      "estimated_hours": number,
      "prerequisites": ["prereq1", "prereq2"],
      "learning_objectives": ["objective1", "objective2"]
    }
  ]
}

IMPORTANT: Return ONLY valid JSON, no additional text or markdown formatting.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using gpt-4o-mini which is available and cost-effective
      messages: [
        {
          role: "system",
          content: "You are an expert learning advisor who creates personalized, structured study roadmaps. Always return valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }, // Force JSON response
    });

    const content = completion.choices[0].message.content;
    
    // Extract JSON from the response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating roadmap:', error);
    throw new Error('Failed to generate personalized roadmap');
  }
}

export async function recommendCertifications(userProfile, roadmapTopics) {
  const {
    learning_goals,
    target_industry,
    current_skills
  } = userProfile;

  const topicsList = roadmapTopics.map(t => t.topic_name).join(', ');

  const prompt = `Based on the user's learning goals, target industry, and roadmap topics, recommend relevant certifications.

User Profile:
- Learning Goals: ${learning_goals || 'Not specified'}
- Target Industry: ${target_industry || 'Not specified'}
- Current Skills: ${current_skills?.join(', ') || 'None'}
- Roadmap Topics: ${topicsList}

Recommend 3-5 relevant certifications with:
- Certification name
- Provider (e.g., AWS, Google, Microsoft, etc.)
- Brief description
- Difficulty level (beginner, intermediate, advanced)
- Estimated study hours
- Why it's relevant to the user's goals
- Priority (1-5, where 5 is highest priority)

Return as JSON object with a "certifications" array:
{
  "certifications": [
    {
      "name": "Certification name",
      "provider": "Provider name",
      "description": "Description",
      "difficulty_level": "beginner|intermediate|advanced",
      "estimated_study_hours": number,
      "recommendation_reason": "Why it's relevant",
      "priority": number
    }
  ]
}

IMPORTANT: Return ONLY valid JSON, no additional text or markdown formatting.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using gpt-4o-mini which is available and cost-effective
      messages: [
        {
          role: "system",
          content: "You are a certification advisor. Recommend relevant certifications based on user goals and learning path. Always return valid JSON array."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" }, // Force JSON response
    });

    const content = completion.choices[0].message.content;
    
    // Try to parse as JSON object first
    try {
      const parsed = JSON.parse(content);
      // If it has certifications array, return it
      if (parsed.certifications && Array.isArray(parsed.certifications)) {
        return parsed.certifications;
      }
      // If it's already an array, return it
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return parsed;
    } catch (e) {
      // Fallback: try to extract array from text
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response from AI');
    }
  } catch (error) {
    console.error('Error recommending certifications:', error);
    throw new Error('Failed to recommend certifications');
  }
}
