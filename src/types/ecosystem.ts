// Types for device-ecosystem-matrix.json

export interface EcosystemMatrix {
  metadata: {
    version: string;
    updatedDate: string;
    updatedBy: string;
    validUntil: string;
    notes: string;
    updateCadence: string;
  };
  demographics: Record<DemographicKey, DemographicSection>;
  crossDemographicProducts: {
    protection360: CrossDemoProduct;
    tLife: CrossDemoProduct;
  };
  supportIntentAccessories: SupportIntentAccessories;
  rotationConfig: RotationConfig;
}

export type DemographicKey = '18-24' | '25-34' | '35-54' | '55+';

export interface DemographicSection {
  label: string;
  profile: string;
  trustLanguage: string;
  avoidLanguage: string;
  smartphones: DeviceEntry[];
  tablets: DeviceEntry[];
  wearables: DeviceEntry[];
  iotProducts: IoTEntry[];
  accessories: AccessoryCategoryEntry[];
}

export interface DeviceEntry {
  device: string;
  why: string;
  pitchVariations: [string, string, string];
}

export interface IoTEntry {
  product: string;
  why: string;
  pitchVariations: [string, string, string];
}

export interface AccessoryCategoryEntry {
  category: string;
  items: string[];
  why: string;
  pitchVariations: [string, string, string];
}

export interface CrossDemoProduct {
  alwaysPitch?: boolean;
  alwaysMention?: boolean;
  pitchByDemo: Record<DemographicKey, string>;
}

export interface SupportIntentAccessories {
  description: string;
  appliesToIntents: string[];
  tone: string;
  toneGuidance: string;
  items: SupportAccessoryItem[];
  repGuidance: {
    maxMentions: number;
    rule: string;
    billingAngle: string;
    doNot: string;
    demographicFallback: string;
    surfaceIn: string;
  };
}

export interface SupportAccessoryItem {
  product: string;
  price: string;
  commission: string;
  pitchVariations: [string, string, string];
  bestFor: DemographicKey[];
  naturalTransition: string;
}

export interface RotationConfig {
  maxConsecutiveRepeats: number;
  variationSelectionMethod: string;
  weightDecayPerShow: number;
  resetWeightsAfterAllShown: boolean;
}
