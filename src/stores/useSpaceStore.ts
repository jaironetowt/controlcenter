import { create } from 'zustand';
import { getSpaces, bootstrap } from '@/lib/api';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { useRisksStore } from '@/stores/useRisksStore';
import { useActionItemsStore } from '@/stores/useActionItemsStore';
import { useDecisionsStore } from '@/stores/useDecisionsStore';
import { useStakeholdersStore } from '@/stores/useStakeholdersStore';
import { useFeaturesStore } from '@/stores/useFeaturesStore';
import type { Me as ApiMe, SpaceRow } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Me {
  sub: string;
  email: string;
}

export interface Space {
  ownerSub: string;
  ownerEmail: string;
  role: 'owner' | 'viewer';
}

interface SpaceStore {
  me: Me | null;
  spaces: Space[];
  /** owner_sub of the currently selected space (null until first fetch). */
  selectedSpace: string | null;
  loading: boolean;
  error: string | null;

  /** GET /api/spaces; sets me + spaces; defaults selectedSpace to me.sub. */
  fetchSpaces: () => Promise<void>;
  /** Select a space by its owner_sub. */
  selectSpace: (ownerSub: string) => void;
  /**
   * Sets me + spaces from an already-fetched bootstrap payload (sem rede).
   * Se selectedSpace ainda for null, define para me.sub.
   */
  applyBootstrap: (me: ApiMe, spaces: SpaceRow[]) => void;
  /**
   * Orquestra o load inicial (ou troca de espaço) numa ÚNICA request:
   * GET /api/bootstrap -> hidrata todos os stores. Sem fan-out sequencial.
   */
  bootstrapAll: (space?: string) => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────
//
// The foundation only exposes state + actions. The resource stores read the
// current space via useSpaceStore.getState().selectedSpace and check write
// permission via canEdit() (selectedSpace === me.sub). The StoreInitializer
// (next phase) is responsible for reloading the resource stores when the
// selection changes — this store deliberately does NOT trigger those reloads.

export const useSpaceStore = create<SpaceStore>()((set, get) => ({
  me: null,
  spaces: [],
  selectedSpace: null,
  loading: false,
  error: null,

  fetchSpaces: async () => {
    set({ loading: true, error: null });
    try {
      const { me, spaces } = await getSpaces();
      const mapped: Space[] = spaces.map((s) => ({
        ownerSub: s.owner_sub,
        ownerEmail: s.owner_email,
        role: s.role,
      }));
      // Keep a valid selection: preserve the current one if it still exists,
      // otherwise default to the caller's own space (me.sub).
      const current = get().selectedSpace;
      const stillValid = current != null && mapped.some((s) => s.ownerSub === current);
      set({
        me,
        spaces: mapped,
        selectedSpace: stillValid ? current : me.sub,
        loading: false,
      });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : String(e) });
    }
  },

  selectSpace: (ownerSub) => set({ selectedSpace: ownerSub }),

  applyBootstrap: (me, spaces) => {
    const mapped: Space[] = spaces.map((s) => ({
      ownerSub: s.owner_sub,
      ownerEmail: s.owner_email,
      role: s.role,
    }));
    // Mantém uma seleção válida: preserva a atual se ainda existir, senão
    // (ou se nunca selecionada) cai no espaço próprio (me.sub).
    const current = get().selectedSpace;
    const stillValid = current != null && mapped.some((s) => s.ownerSub === current);
    set({
      me,
      spaces: mapped,
      selectedSpace: stillValid ? current : me.sub,
      loading: false,
      error: null,
    });
  },

  bootstrapAll: async (space) => {
    set({ loading: true, error: null });
    try {
      const payload = await bootstrap(space);
      // Identidade/espaços primeiro (define selectedSpace se necessário).
      get().applyBootstrap(payload.me, payload.spaces);
      // Hidrata cada store a partir das linhas já buscadas (sem rede).
      useProjectsStore.getState().hydrate(payload.data.projects);
      useRisksStore.getState().hydrate(payload.data.risks);
      useActionItemsStore.getState().hydrate(payload.data.action_items);
      useDecisionsStore.getState().hydrate(payload.data.decisions);
      useStakeholdersStore.getState().hydrate(payload.data.stakeholders);
      useFeaturesStore.getState().hydrate(payload.features);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      set({ loading: false, error: message });
      // Propaga o erro para os stores de recurso para refletir na UI.
      useProjectsStore.setState({ loading: false, error: message });
      useRisksStore.setState({ loading: false, error: message });
      useActionItemsStore.setState({ loading: false, error: message });
      useDecisionsStore.setState({ loading: false, error: message });
      useStakeholdersStore.setState({ loading: false, error: message });
      useFeaturesStore.setState({ loading: false, error: message });
    }
  },
}));

/**
 * True when the caller may write to the selected space (they own it).
 * Reads live state via getState() so resource stores can call it imperatively;
 * components may also subscribe with
 *   useSpaceStore((s) => s.selectedSpace === s.me?.sub)
 */
export function canEdit(): boolean {
  const { selectedSpace, me } = useSpaceStore.getState();
  return me != null && selectedSpace === me.sub;
}
