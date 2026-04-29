import { ObjectionAnalysis, SalesContext, SalesScript } from '../types';
import { WeeklyUpdate } from './weeklyUpdateSchema';
import {
  analyzeObjectionLocal,
  generateScript as localGenerateScript,
} from './localGenerationService';
import {
  getGemmaLoadingState,
  getGemmaStatusLabel,
  isGemmaAvailable,
  gemmaAnalyzeObjection,
  gemmaGenerateScript,
} from './gemmaService';
import type { GemmaLoadingState } from './gemmaService';

export type AIProvider = 'local' | 'gemma';

export interface AIServiceStatus {
  provider: AIProvider;
  label: string;
  isAvailable: boolean;
  gemmaState: GemmaLoadingState;
}

export function getAIStatus(): AIServiceStatus {
  const { state } = getGemmaLoadingState();

  if (isGemmaAvailable()) {
    return {
      provider: 'gemma',
      label: getGemmaStatusLabel(),
      isAvailable: true,
      gemmaState: state,
    };
  }

  return {
    provider: 'local',
    label: 'AI Ready',
    isAvailable: true,
    gemmaState: state,
  };
}

export async function generateSalesScript(
  context: SalesContext,
  weeklyData: WeeklyUpdate | null,
): Promise<SalesScript> {
  try {
    return await gemmaGenerateScript(context, weeklyData);
  } catch {
    // Keep this silent for the live rep experience.
  }

  return localGenerateScript(context, weeklyData);
}

export async function analyzeObjection(
  objection: string,
  context: SalesContext,
  script: SalesScript | null,
  selectedItems: string[],
  weeklyData: WeeklyUpdate | null,
): Promise<ObjectionAnalysis> {
  try {
    return await gemmaAnalyzeObjection(objection, context, script, selectedItems, weeklyData);
  } catch {
    // Keep this silent for the live rep experience.
  }

  return analyzeObjectionLocal(objection, context, script, selectedItems, weeklyData);
}
