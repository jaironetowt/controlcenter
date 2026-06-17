'use client';

import { Component, type ReactNode } from 'react';

// ─── Component-level error boundary ─────────────────────────────────────────────
// Pega erros de render no subtree do app (dentro do MantineProvider) sem derrubar
// o documento inteiro. O global-error.tsx é o último recurso; este dá uma queda
// mais suave, mantendo o shell vivo.

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Mantém visível no console pra debug; sem telemetria externa (portal passivo).
    console.error('[ErrorBoundary]', error);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-[#F4F4F5] p-6">
          <div className="max-w-md rounded-xl border border-zinc-200 bg-white p-7 shadow-sm">
            <div className="mb-2 text-[15px] font-semibold text-zinc-900">
              Esta tela encontrou um erro
            </div>
            <p className="mb-5 text-[13px] leading-relaxed text-zinc-500">
              Algo quebrou ao renderizar. Seus dados estão salvos — tente recarregar.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={this.handleReset}
                className="rounded-lg bg-blue-500 px-4 py-2 text-[13px] font-medium text-white hover:bg-blue-600"
              >
                Tentar de novo
              </button>
              <button
                onClick={() => { window.location.reload(); }}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Recarregar
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
