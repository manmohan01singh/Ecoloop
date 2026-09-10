import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/env.js';
import logger from '../utils/logger.js';

const genAI = new GoogleGenerativeAI(config.gemini?.apiKey || '');

const getModel = () => genAI.getGenerativeModel({ 
  model: config.gemini?.model || 'gemini-3.8-flash',
  generationConfig: {
    maxOutputTokens: 200,
    temperature: 0.3,
  }
});

const callGemini = async (prompt) => {
  const result = await Promise.race([
    getModel().generateContent(prompt),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
  ]);
  return (await result.response).text();
};

export const getDeviceAnalysis = async (device, deathClock) => {
  try {
    if (!config.gemini?.apiKey) return null;

    const prompt = `Analyze this e-waste device in 2-3 sentences max:
${device.name} ${device.brand || ''} ${device.model || ''}, ${device.category}, age ${deathClock.ageInYears}yrs, health ${deathClock.healthScore}%, condition ${device.condition}.
Give: health assessment, key lifespan factor, one action user should take.`;

    const text = await callGemini(prompt);
    return { aiInsight: text, model: config.gemini.model, generatedAt: new Date().toISOString() };
  } catch (error) {
    logger.error('Gemini analysis failed:', error.message);
    return null;
  }
};

export const getRecyclingRecommendations = async (device) => {
  try {
    if (!config.gemini?.apiKey) return null;

    const prompt = `Give 3 short recycling tips (one line each) for: ${device.name} ${device.brand || ''} ${device.model || ''}, ${device.category}, condition: ${device.condition}. Focus: data wipe, value recovery, eco benefit.`;

    const text = await callGemini(prompt);
    return { recommendations: text, model: config.gemini.model };
  } catch (error) {
    logger.error('Gemini recommendations failed:', error.message);
    return null;
  }
};

export const getImpactSummary = async (devices) => {
  try {
    if (!config.gemini?.apiKey) return null;

    const prompt = `In 2 sentences, summarize the environmental impact of responsibly recycling ${devices.length} devices. Be specific about CO2 and resources saved.`;

    const text = await callGemini(prompt);
    return { summary: text, model: config.gemini.model };
  } catch (error) {
    logger.error('Gemini impact summary failed:', error.message);
    return null;
  }
};

export default genAI;
