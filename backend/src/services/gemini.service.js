import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/env.js';
import logger from '../utils/logger.js';

const genAI = new GoogleGenerativeAI(config.gemini?.apiKey || '');

/**
 * Get AI-enhanced device analysis from Gemini
 * @param {Object} device - Device data
 * @param {Object} deathClock - Death clock calculation result
 * @returns {Object} AI analysis with insights
 */
export const getDeviceAnalysis = async (device, deathClock) => {
  try {
    if (!config.gemini?.apiKey) {
      logger.warn('Gemini API key not configured, skipping AI analysis');
      return null;
    }

    const model = genAI.getGenerativeModel({ model: config.gemini?.model || 'gemini-2.0-flash' });

    const prompt = `You are an e-waste management expert. Analyze this device and provide insights:

Device: ${device.name} (${device.brand} ${device.model || ''})
Category: ${device.category}
Age: ${deathClock.ageInYears} years
Health Score: ${deathClock.healthScore}/100
Status: ${deathClock.status}
Remaining Life: ${deathClock.remainingDays} days (${deathClock.remainingYears} years)
Condition: ${device.condition}
Usage: ${device.usageHoursPerDay} hours/day

Provide a brief analysis (3-4 sentences) covering:
1. Current device health assessment
2. Key factors affecting its lifespan
3. Recommended actions for the user
4. Environmental impact if recycled now vs later

Keep it concise and actionable.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      aiInsight: text,
      model: 'gemini-2.0-flash',
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Gemini AI analysis failed:', error.message);
    return null;
  }
};

/**
 * Get AI-powered recycling recommendations
 * @param {Object} device - Device data
 * @returns {Object} AI recommendations
 */
export const getRecyclingRecommendations = async (device) => {
  try {
    if (!config.gemini?.apiKey) {
      return null;
    }

    const model = genAI.getGenerativeModel({ model: config.gemini?.model || 'gemini-2.0-flash' });

    const prompt = `You are an e-waste recycling advisor. For this device:
Device: ${device.name} (${device.brand} ${device.model || ''})
Category: ${device.category}
Condition: ${device.condition}

Provide 3-5 specific, actionable recycling tips in bullet points.
Focus on: data security, maximum value recovery, environmental benefit.
Keep each point under 20 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      recommendations: text,
      model: 'gemini-2.0-flash',
    };
  } catch (error) {
    logger.error('Gemini recommendations failed:', error.message);
    return null;
  }
};

/**
 * Get AI impact summary
 * @param {Array} devices - List of devices
 * @returns {Object} AI-generated impact summary
 */
export const getImpactSummary = async (devices) => {
  try {
    if (!config.gemini?.apiKey) {
      return null;
    }

    const model = genAI.getGenerativeModel({ model: config.gemini?.model || 'gemini-2.0-flash' });

    const deviceList = devices.map(d => `- ${d.name} (${d.category}, ${d.condition})`).join('\n');

    const prompt = `You are an environmental impact analyst. Summarize the positive environmental impact of tracking these ${devices.length} devices for responsible recycling:

${deviceList}

Write a motivating 2-3 sentence summary about their contribution to sustainability.
Include specific environmental benefits (CO2 reduction, resource conservation).
Make it inspiring and actionable.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      summary: text,
      model: 'gemini-2.0-flash',
    };
  } catch (error) {
    logger.error('Gemini impact summary failed:', error.message);
    return null;
  }
};

export default genAI;
