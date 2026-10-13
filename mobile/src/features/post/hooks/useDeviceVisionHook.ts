import { useState, useCallback } from 'react';

export interface DeviceVisionAnalysisResult {
  suggestedCategory?: string;
  suggestedBrand?: string;
  suggestedModel?: string;
  confidence?: number;
}

export interface UseDeviceVisionReturn {
  isConfigured: boolean;
  isAnalyzing: boolean;
  statusMessage: string;
  analyzeImage: (imageUri: string) => Promise<DeviceVisionAnalysisResult | null>;
}

/**
 * Interface for AI computer vision inspection services.
 * In Phase 2, no external paid vision API is configured.
 * This hook maintains an honest, clean interface for future vision providers
 * without simulating or fabricating artificial diagnoses.
 */
export const useDeviceVisionHook = (): UseDeviceVisionReturn => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Honest declaration of AI vision availability
  const isConfigured = false;
  const statusMessage =
    'AI Vision inspection integration available for future service provider. Manual hardware specification is active.';

  const analyzeImage = useCallback(
    async (_imageUri: string): Promise<DeviceVisionAnalysisResult | null> => {
      // Intentionally returns null when no real AI backend is configured
      // to avoid fabricating fake diagnostic claims.
      return null;
    },
    []
  );

  return {
    isConfigured,
    isAnalyzing,
    statusMessage,
    analyzeImage,
  };
};
