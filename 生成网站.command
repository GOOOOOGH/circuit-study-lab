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
"$CIRCUIT_NODE" scripts/run.mjs build
CIRCUIT_RESULT=$?
echo "构建结束，退出码：$CIRCUIT_RESULT。按任意键关闭。"
read -k 1
exit "$CIRCUIT_RESULT"
