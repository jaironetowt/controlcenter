'use client';

import { useEffect } from 'react';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { useRisksStore } from '@/stores/useRisksStore';
import { useActionItemsStore } from '@/stores/useActionItemsStore';
import { useDecisionsStore } from '@/stores/useDecisionsStore';
import { useStakeholdersStore } from '@/stores/useStakeholdersStore';
import { useFeaturesStore } from '@/stores/useFeaturesStore';

/**
 * Componente invisível montado no topo da árvore que dispara o fetch
 * inicial de todos os stores Supabase. Deve ser incluído dentro do Providers.
 */
export function StoreInitializer() {
  const fetchProjects     = useProjectsStore((s) => s.fetchProjects);
  const fetchRisks        = useRisksStore((s) => s.fetchRisks);
  const fetchItems        = useActionItemsStore((s) => s.fetchItems);
  const fetchDecisions    = useDecisionsStore((s) => s.fetchDecisions);
  const fetchStakeholders = useStakeholdersStore((s) => s.fetchStakeholders);
  const fetchFeatures     = useFeaturesStore((s) => s.fetchFeatures);

  useEffect(() => {
    fetchProjects();
    fetchRisks();
    fetchItems();
    fetchDecisions();
    fetchStakeholders();
    fetchFeatures();
  }, [fetchProjects, fetchRisks, fetchItems, fetchDecisions, fetchStakeholders, fetchFeatures]);

  return null;
}
