import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Não autenticado — usar defaults sem erro
      set({ loading: false });
      return;
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('features')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      set({ loading: false, error: error.message });
      return;
    }

    if (data?.features) {
      set({
        features: { ...DEFAULT_FEATURES, ...(data.features as Partial<FeaturesMap>) },
        loading:  false,
      });
    } else {
      // Primeira vez — criar registro com defaults
      await supabase.from('user_settings').upsert({
        user_id:  user.id,
        features: DEFAULT_FEATURES,
      });
      set({ features: DEFAULT_FEATURES, loading: false });
    }
  },

  setFeature: async (key, enabled) => {
    const next = { ...get().features, [key]: enabled };

    // Optimistic
    set({ features: next });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, features: next });

    if (error) {
      set({ error: error.message });
      get().fetchFeatures();
    }
  },
}));
