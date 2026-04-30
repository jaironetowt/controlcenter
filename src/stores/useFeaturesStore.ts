import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FeatureKey = 'internalHealth' | 'externalHealth' | 'riskMatrix' | 'stakeholderGrid';

export interface FeatureMeta {
  label: string;
  description: string;
}

export const FEATURE_META: Record<FeatureKey, FeatureMeta> = {
  internalHealth: {
    label: 'Internal Health badge',
    description: 'Calculated health indicator derived from open risks and overdue action items.',
  },
  externalHealth: {
    label: 'External Health badge',
    description: 'Manually set health status shown to external stakeholders on project cards and header.',
  },
  riskMatrix: {
    label: 'Risk Matrix',
    description: 'Probability × Impact matrix visualisation on the Risk Log page.',
  },
  stakeholderGrid: {
    label: 'Stakeholder Influence Grid',
    description: 'Influence × Interest quadrant grid on the Stakeholders page.',
  },
};

export type FeaturesMap = Record<FeatureKey, boolean>;

export const DEFAULT_FEATURES: FeaturesMap = {
  internalHealth: true,
  externalHealth: true,
  riskMatrix: true,
  stakeholderGrid: true,
};

// ─── Store ────────────────────────────────────────────────────────────────────

interface FeaturesStore {
  features: FeaturesMap;
  setFeature: (key: FeatureKey, enabled: boolean) => void;
}

export const useFeaturesStore = create<FeaturesStore>()(
  persist(
    (set) => ({
      features: DEFAULT_FEATURES,
      setFeature: (key, enabled) =>
        set((s) => ({ features: { ...s.features, [key]: enabled } })),
    }),
    {
      name: 'cc-features',
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<FeaturesStore>),
        features: {
          ...DEFAULT_FEATURES,
          ...((persisted as Partial<FeaturesStore>)?.features ?? {}),
        },
      }),
    },
  ),
);
