'use client';

import { Loader } from '@mantine/core';

// ─── ViewState ──────────────────────────────────────────────────────────────
//
// Estado padrão reutilizável para as views de conteúdo: surfacia loading,
// error e empty de forma consistente. Use antes de renderizar a lista:
//
//   <ViewState loading={loading} error={error} isEmpty={items.length === 0}
//              emptyMessage="Nenhum risco ainda">
//     <Lista />
//   </ViewState>
//
// Quando não há loading, nem error, nem empty, renderiza os children.

interface ViewStateProps {
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  /** Mensagem amigável exibida quando a lista está vazia. */
  emptyMessage: string;
  /** Conteúdo real (a lista) — exibido quando não há loading/error/empty. */
  children: React.ReactNode;
  /** Tamanho vertical do padding das mensagens (padrão py-12). */
  className?: string;
}

export function ViewState({
  loading,
  error,
  isEmpty,
  emptyMessage,
  children,
  className = 'py-12',
}: ViewStateProps) {
  // Erro tem prioridade — não esconder falha atrás de loading/empty.
  if (error) {
    return (
      <div className={`flex items-center justify-center text-center ${className}`}>
        <p className="text-[13px] text-red-500">
          Não foi possível carregar — tente recarregar a página.
        </p>
      </div>
    );
  }

  // Carregando e ainda sem dados: mostra spinner.
  if (loading && isEmpty) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Loader size="sm" color="gray" />
      </div>
    );
  }

  // Sem loading, sem erro, lista vazia: estado vazio amigável.
  if (isEmpty) {
    return (
      <div className={`flex items-center justify-center text-center ${className}`}>
        <p className="text-[13px] text-zinc-400">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}
