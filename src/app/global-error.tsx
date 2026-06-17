'use client';

// ─── Global error boundary (Next App Router) ────────────────────────────────────
// Captura erros que escapam do root layout. Substitui o documento inteiro, então
// renderiza seu próprio <html>/<body> e NÃO depende do MantineProvider.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#F4F4F5' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            style={{
              maxWidth: 460,
              background: '#fff',
              border: '1px solid #E4E4E7',
              borderRadius: 12,
              padding: 28,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: '#18181B', marginBottom: 8 }}>
              Algo deu errado
            </div>
            <p style={{ fontSize: 13, color: '#71717A', lineHeight: 1.5, margin: '0 0 18px' }}>
              A tela encontrou um erro inesperado. Você pode tentar de novo — seus
              dados não foram perdidos.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => reset()}
                style={{
                  background: '#3E77FC',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Tentar de novo
              </button>
              <button
                onClick={() => { window.location.href = '/global'; }}
                style={{
                  background: '#fff',
                  color: '#3F3F46',
                  border: '1px solid #D4D4D8',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Voltar ao início
              </button>
            </div>
            {error?.digest && (
              <div style={{ fontSize: 11, color: '#A1A1AA', marginTop: 16 }}>
                ref: {error.digest}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
