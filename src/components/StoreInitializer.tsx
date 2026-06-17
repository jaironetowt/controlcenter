'use client';

import { useEffect, useRef } from 'react';
import { useSpaceStore } from '@/stores/useSpaceStore';

/**
 * Componente invisível montado no topo da árvore que dispara o load inicial
 * (identidade + espaços + features + todos os recursos) numa ÚNICA request
 * via GET /api/bootstrap, e re-carrega ao trocar de espaço.
 * Deve ser incluído dentro do Providers.
 *
 * Fluxo multi-tenant (1 request por carga):
 * 1. No mount, bootstrapAll() carrega o espaço próprio (define selectedSpace = me.sub).
 * 2. Ao trocar de espaço, bootstrapAll(selectedSpace) recarrega tudo em 1 request.
 *    A PRIMEIRA execução do efeito de troca é pulada (useRef) para evitar
 *    o double-load no load inicial.
 */
export function StoreInitializer() {
  const selectedSpace = useSpaceStore((s) => s.selectedSpace);

  // 1. Load inicial — UMA request que hidrata todos os stores.
  useEffect(() => {
    void useSpaceStore.getState().bootstrapAll();
  }, []);

  // 2. Troca de espaço — recarrega tudo em 1 request, pulando a 1ª execução
  //    (que coincide com o selectedSpace definido pelo bootstrap inicial).
  const skipFirst = useRef(false);
  useEffect(() => {
    if (!selectedSpace) return;
    if (!skipFirst.current) {
      skipFirst.current = true;
      return;
    }
    void useSpaceStore.getState().bootstrapAll(selectedSpace);
  }, [selectedSpace]);

  return null;
}
