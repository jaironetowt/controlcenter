import { create } from 'zustand';
import { getUserSettings, putUserSettings } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FeatureKey = 'internalHealth' | 'riskMatrix' | 'stakeholderGrid';

export interface FeatureMeta {
  label: string;
  description: string;
  comingSoon?: boolean;
}

export const FEATURE_META: Record<FeatureKey, FeatureMeta> = {
  riskMatrix: {
    label: 'Risk Matrix',
    description: 'Probability × Impact matrix visualisation on the Risk Log page.',
  },
  stakeholderGrid: {
    label: 'Stakeholder Influence Grid',
    description: 'Influence × Interest quadrant grid on the Stakeholders page.',
  },
  internalHealth: {
    label: 'Internal Health badge',
    description: 'Calculated health indicator derived from open risks and overdue action items.',
    comingSoon: true,
  },
};

export type FeaturesMap = Record<FeatureKey, boolean>;

export const DEFAULT_FEATURES: FeaturesMap = {
  internalHealth:  false,
  riskMatrix:      true,
  stakeholderGrid: true,
};

// ─── Store ────────────────────────────────────────────────────────────────────

interface FeaturesStore {
  features: FeaturesMap;
  loading: boolean;
  error: string | null;
  fetchFeatures: () => Promise<void>;
  setFeature: (key: FeatureKey, enabled: boolean) => Promise<void>;
}

export const useFeaturesStore = create<FeaturesStore>()((set, get) => ({
  features: DEFAULT_FEATURES,
  loading:  false,
  error:    null,

  fetchFeatures: async () => {
    set({ loading: true, error: null });
    try {
      // The worker resolves the current user from the gizmos SSO session.
      const stored = await getUserSettings();
      set({
        features: { ...DEFAULT_FEATURES, ...(stored as Partial<FeaturesMap>) },
        loading:  false,
      });
    } catch (e) {
      // Fall back to defaults — never block the UI on settings.
      set({ loading: false, error: e instanceof Error ? e.message : String(e) });
    }
  },

  setFeature: async (key, enabled) => {
    const next = { ...get().features, [key]: enabled };

    // Optimistic
    set({ features: next });

    try {
      await putUserSettings(next);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      get().fetchFeatures();
    }
  },
}));
