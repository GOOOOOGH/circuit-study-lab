#!/bin/zsh
cd "${0:A:h}" || exit 1
CIRCUIT_NODE="$(command -v node)"
if [[ -z "$CIRCUIT_NODE" ]]; then
  CIRCUIT_NODE="${HOME}/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
fi
if [[ ! -x "$CIRCUIT_NODE" ]]; then
  echo "未找到 Node.js。请安装 Node.js 20.19+ 或 22.12+ 后重试。"
  read -k 1
  exit 1
fi
exec "$CIRCUIT_NODE" scripts/run.mjs dev
