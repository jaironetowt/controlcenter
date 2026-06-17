#!/usr/bin/env bash
# ─── Deploy do Project Management Center no gizmos.run ───────────────────────────
# Um comando: lê a key do .env.deploy (gitignored), builda o static export,
# monta o bundle FORA do repo (pra o gizmos CLI não esbarrar no .gitignore de out/),
# copia worker.ts + wrangler.toml + migrations/, e faz o push.
#
# Uso:  npm run deploy        (ou: bash scripts/deploy.sh)
# Pré:  colar a GIZMOS_API_KEY em .env.deploy uma única vez.
set -euo pipefail

# raiz do projeto (este script vive em scripts/)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# ── 1. carregar a key do .env.deploy ──────────────────────────────────────────
if [ ! -f .env.deploy ]; then
  echo "✗ .env.deploy não encontrado. Crie com:  GIZMOS_API_KEY=gzm_..." >&2
  exit 1
fi
set -a; source .env.deploy; set +a
if [ -z "${GIZMOS_API_KEY:-}" ] || [[ "${GIZMOS_API_KEY}" == COLE_* ]]; then
  echo "✗ GIZMOS_API_KEY vazia ou placeholder em .env.deploy. Cole a key e rode de novo." >&2
  exit 1
fi

# ── 2. localizar o CLI gizmos ─────────────────────────────────────────────────
GIZMOS_BIN="$(command -v gizmos || true)"
[ -z "$GIZMOS_BIN" ] && [ -x "$HOME/.local/bin/gizmos" ] && GIZMOS_BIN="$HOME/.local/bin/gizmos"
if [ -z "$GIZMOS_BIN" ]; then
  echo "✗ CLI 'gizmos' não encontrado (instale: curl -fsSL https://gizmos.run/skills/install.sh | bash)" >&2
  exit 1
fi

# ── 3. build do static export ─────────────────────────────────────────────────
echo "▸ build (next export)…"
npm run build

# ── 4. montar bundle fora do repo (out/ é gitignored; o CLI usa git ls-files) ──
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
cp -R out/. "$STAGE"/
cp worker.ts wrangler.toml "$STAGE"/
cp -r migrations "$STAGE"/migrations

# ── 5. push ───────────────────────────────────────────────────────────────────
echo "▸ deploy…"
GIZMOS_API_KEY="$GIZMOS_API_KEY" "$GIZMOS_BIN" push "$@" "$STAGE"
