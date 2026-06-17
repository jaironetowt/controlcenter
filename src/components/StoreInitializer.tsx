'use client';

import { useEffect } from 'react';
import { useSpaceStore } from '@/stores/useSpaceStore';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { useRisksStore } from '@/stores/useRisksStore';
import { useActionItemsStore } from '@/stores/useActionItemsStore';
import { useDecisionsStore } from '@/stores/useDecisionsStore';
import { useStakeholdersStore } from '@/stores/useStakeholdersStore';
import { useFeaturesStore } from '@/stores/useFeaturesStore';

/**
 * Componente invisível montado no topo da árvore que dispara o fetch
 * inicial de identidade/espaços e, em seguida, de todos os stores Supabase.
 * Deve ser incluído dentro do Providers.
 *
 * Fluxo multi-tenant:
 * 1. No mount, carrega me + spaces (define selectedSpace default = me.sub).
 * 2. Sempre que selectedSpace estiver definido (ou mudar), re-busca todos
 *    os resources do espaço selecionado.
 */
export function StoreInitializer() {
  const selectedSpace = useSpaceStore((s) => s.selectedSpace);

  // 1. Carrega identidade + espaços uma vez no mount.
  useEffect(() => {
    void useSpaceStore.getState().fetchSpaces();
  }, []);

  // 2. (Re)busca todos os resources sempre que o espaço selecionado mudar.
  useEffect(() => {
    if (!selectedSpace) return;

    void useProjectsStore.getState().fetchProjects();
    void useRisksStore.getState().fetchRisks();
    void useActionItemsStore.getState().fetchItems();
    void useDecisionsStore.getState().fetchDecisions();
    void useStakeholdersStore.getState().fetchStakeholders();
    void useFeaturesStore.getState().fetchFeatures();
  }, [selectedSpace]);

  return null;
}
