import { create } from 'zustand';
import { SalesContext, SalesScript, ObjectionAnalysis } from '../types';
import { loadWeeklyUpdate, generateScript, analyzeObjectionLocal, WeeklyUpdateSource } from '../services/localGenerationService';
import {
  generateObjectionEnhancement,
  generateScriptEnhancement,
  mergeObjectionEnhancement,
  mergeScriptEnhancement,
} from '../services/aiEnhancementService';
import { WeeklyUpdate } from '../services/weeklyUpdateSchema';
import { resetRotation } from '../services/rotationService';
import { getSessionStats, trackIntentUsed, trackObjectionAnalyzed, trackPlanGenerated } from '../services/sessionTracker';
import { isAbortError } from '../services/networkUtils';

export interface SalesState {
  context: SalesContext;
  script: SalesScript | null;
  loading: boolean;
  error: string | null;
  
  selectedObjections: string[];
  objectionResult: ObjectionAnalysis | null;
  analyzing: boolean;
  selectedGamePlanItems: string[];
  
  enhancingPlan: boolean;
  enhancingObjection: boolean;

  weeklyData: WeeklyUpdate | null;
  weeklySource: WeeklyUpdateSource;
  weeklyLoaded: boolean;

  // Actions
  setContext: (context: SalesContext | ((prev: SalesContext) => SalesContext)) => void;
  setScript: (script: SalesScript | null) => void;
  setError: (error: string | null) => void;
  setSelectedObjections: (objs: string[] | ((prev: string[]) => string[])) => void;
  setObjectionResult: (res: ObjectionAnalysis | null) => void;
  setSelectedGamePlanItems: (items: string[]) => void;
  
  refreshWeeklyData: (signal?: AbortSignal) => Promise<{ data: WeeklyUpdate | null; source: WeeklyUpdateSource } | null>;
  ensureWeeklyDataLoaded: (signal?: AbortSignal) => Promise<WeeklyUpdate | null>;
  
  handleGenerate: (overrideContext?: SalesContext) => Promise<void>;
  handleAnalyzeObjection: () => Promise<void>;
  cancelInFlightRequests: () => void;
  reset: () => void;
}

const defaultContext: SalesContext = {
  age: 'Not Specified',
  region: 'Not Specified',
  zipCode: '',
  product: ['Phone'],
  purchaseIntent: 'exploring',
  currentCarrier: 'Not Specified',
  totalLines: undefined,
  familyCount: undefined,
  currentPlatform: 'Not Specified',
  desiredPlatform: 'Not Specified',
  hintAvailable: undefined
};

// Internal refs for debouncing and canceling
let lastGenerateTime = 0;
let planRequestId = 0;
let objectionRequestId = 0;
let planRequestAbort: AbortController | null = null;
let objectionRequestAbort: AbortController | null = null;

export const useSalesStore = create<SalesState>((set, get) => ({
  context: defaultContext,
  script: null,
  loading: false,
  error: null,

  selectedObjections: [],
  objectionResult: null,
  analyzing: false,
  selectedGamePlanItems: [],

  enhancingPlan: false,
  enhancingObjection: false,

  weeklyData: null,
  weeklySource: 'placeholder',
  weeklyLoaded: false,

  setContext: (ctx) => set((state) => ({ 
    context: typeof ctx === 'function' ? ctx(state.context) : ctx 
  })),
  setScript: (script) => set({ script }),
  setError: (error) => set({ error }),
  setSelectedObjections: (objs) => set((state) => ({
    selectedObjections: typeof objs === 'function' ? objs(state.selectedObjections) : objs
  })),
  setObjectionResult: (objectionResult) => set({ objectionResult }),
  setSelectedGamePlanItems: (selectedGamePlanItems) => set({ selectedGamePlanItems }),

  refreshWeeklyData: async (signal?: AbortSignal) => {
    const { data, source } = await loadWeeklyUpdate({ signal });
    if (signal?.aborted) return null;
    set({ weeklyData: data, weeklySource: source, weeklyLoaded: true });
    return { data, source };
  },

  ensureWeeklyDataLoaded: async (signal?: AbortSignal) => {
    const { weeklyLoaded, weeklyData, refreshWeeklyData } = get();
    if (weeklyLoaded && weeklyData) return weeklyData;

    const loaded = await refreshWeeklyData(signal);
    if (!loaded) {
      throw new Error('Weekly data could not be loaded.');
    }
    return loaded.data;
  },

  cancelInFlightRequests: () => {
    planRequestAbort?.abort();
    planRequestAbort = null;
    objectionRequestAbort?.abort();
    objectionRequestAbort = null;
  },

  handleGenerate: async (overrideContext?: SalesContext) => {
    const state = get();
    const now = Date.now();
    if (now - lastGenerateTime < 1000) return;
    lastGenerateTime = now;

    planRequestAbort?.abort();
    const controller = new AbortController();
    planRequestAbort = controller;

    const ctx = overrideContext || state.context;
    const requestId = ++planRequestId;
    let localResult: SalesScript | null = null;
    objectionRequestId++;
    
    set({
      loading: true,
      enhancingPlan: false,
      enhancingObjection: false,
      error: null,
      script: null,
      objectionResult: null,
      selectedObjections: [],
      selectedGamePlanItems: []
    });

    try {
      const resolvedWeeklyData = await state.ensureWeeklyDataLoaded(controller.signal);
      if (controller.signal.aborted || planRequestId !== requestId) return;

      const result = generateScript(ctx, resolvedWeeklyData);
      localResult = result;
      set({ script: result });
      
      if (!overrideContext) {
        try {
          trackPlanGenerated();
        } catch (trackingError) {
          console.warn('Plan tracking failed, but the game plan was built.', trackingError);
        }
      }

      set({ enhancingPlan: true });
      
      // Async enhancement
      void (async () => {
        try {
          const enhancement = await generateScriptEnhancement(ctx, result, resolvedWeeklyData, { signal: controller.signal });
          if (!enhancement || controller.signal.aborted || planRequestId !== requestId) return;

          set((s) => ({
            script: s.script ? mergeScriptEnhancement(s.script, enhancement) : s.script
          }));
        } catch (enhancementError) {
          if (!isAbortError(enhancementError) && import.meta.env.DEV) {
            console.warn('AI plan enhancement failed, but the local plan is still available.', enhancementError);
          }
        } finally {
          if (!controller.signal.aborted && planRequestId === requestId) {
            set({ enhancingPlan: false });
          }
        }
      })();
    } catch (err) {
      if (isAbortError(err)) return;
      if (planRequestId !== requestId) return;
      if (!localResult) {
        set({ error: "Couldn't build your game plan. Try again, and if it keeps happening refresh the app." });
      } else {
        console.warn('Game plan fallback hit a recoverable issue after local content was already ready.', err);
      }
      if (import.meta.env.DEV) {
        console.error(err);
      }
      set({ enhancingPlan: false });
    } finally {
      if (!controller.signal.aborted && planRequestId === requestId) {
        set({ loading: false });
      }
      if (planRequestAbort === controller) {
        planRequestAbort = null;
      }
    }
  },

  handleAnalyzeObjection: async () => {
    const state = get();
    if (state.selectedObjections.length === 0) return;

    objectionRequestAbort?.abort();
    const controller = new AbortController();
    objectionRequestAbort = controller;

    const requestId = ++objectionRequestId;
    let localResult: ObjectionAnalysis | null = null;
    
    set({ analyzing: true, enhancingObjection: false, error: null });
    
    try {
      const resolvedWeeklyData = await state.ensureWeeklyDataLoaded(controller.signal);
      if (controller.signal.aborted || objectionRequestId !== requestId) return;

      const result = analyzeObjectionLocal(
        state.selectedObjections.join(', '),
        state.context,
        state.script,
        state.selectedGamePlanItems,
        resolvedWeeklyData,
      );
      localResult = result;
      set({ objectionResult: result });
      
      try {
        trackObjectionAnalyzed(state.selectedObjections);
      } catch (trackingError) {
        console.warn('Objection tracking failed, but the analysis was built.', trackingError);
      }

      set({ enhancingObjection: true });
      
      // Async enhancement
      void (async () => {
        try {
          const enhancement = await generateObjectionEnhancement(
            state.selectedObjections.join(', '),
            state.context,
            result,
            resolvedWeeklyData,
            { signal: controller.signal },
          );

          if (!enhancement || controller.signal.aborted || objectionRequestId !== requestId) return;

          set((s) => ({
            objectionResult: s.objectionResult ? mergeObjectionEnhancement(s.objectionResult, enhancement) : s.objectionResult
          }));
        } catch (enhancementError) {
          if (!isAbortError(enhancementError) && import.meta.env.DEV) {
            console.warn('AI objection enhancement failed, but the local analysis is still available.', enhancementError);
          }
        } finally {
          if (!controller.signal.aborted && objectionRequestId === requestId) {
            set({ enhancingObjection: false });
          }
        }
      })();
    } catch (err) {
      if (isAbortError(err)) return;
      if (objectionRequestId !== requestId) return;
      if (!localResult) {
        set({ error: "Couldn't analyze that objection. Try selecting fewer concerns or reset." });
      } else {
        console.warn('Objection fallback hit a recoverable issue after local analysis was already ready.', err);
      }
      if (import.meta.env.DEV) {
        console.error(err);
      }
      set({ enhancingObjection: false });
    } finally {
      if (!controller.signal.aborted && objectionRequestId === requestId) {
        set({ analyzing: false });
      }
      if (objectionRequestAbort === controller) {
        objectionRequestAbort = null;
      }
    }
  },

  reset: () => {
    get().cancelInFlightRequests();
    planRequestId++;
    objectionRequestId++;
    set({
      loading: false,
      analyzing: false,
      enhancingPlan: false,
      enhancingObjection: false,
      script: null,
      objectionResult: null,
      selectedObjections: [],
      selectedGamePlanItems: [],
      context: defaultContext,
      error: null
    });
    resetRotation();
  }
}));
