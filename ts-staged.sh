#!/usr/bin/env sh
set -eu

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

only_ts() { awk 'BEGIN{IGNORECASE=1} /\.tsx?$/ {print}'; }

# 1) lint-staged
yarn lint-staged

# 2) 변경 파일 수집: 인덱스 → 없으면 워킹트리(수정+신규)
changed="$(
  git diff --cached --name-only -z | tr '\0' '\n' | only_ts | sed '/^$/d' | sort -u
)"
[ -z "${changed:-}" ] && changed="$(
  { git ls-files -m 2>/dev/null || true; git ls-files --others --exclude-standard 2>/dev/null || true; } \
  | only_ts | sed '/^$/d' | sort -u
)"
[ -z "${changed:-}" ] && { echo "no staged ts/tsx"; exit 0; }

echo "🔎 TS/TSX changes:"
printf ' - %s\n' $changed

# 3) 변경 파일 basename들로 요약 필터 패턴 준비
pat="$(printf '%s\n' $changed  | sed 's/[].[^$*+?{}()|/]/\\&/g' | paste -sd '|' -)"
[ -z "$pat" ] && pat='.*'

# 4) 타입체크 실행 (Yarn v1). 로그만 캡처, 화면엔 요약만
log="$(mktemp)"
if yarn workspaces run -s type-inspect >"$log" 2>&1; then
  echo "✓ Type check OK"
  rm -f "$log"
  exit 0
fi

echo "── Error Summary (changed files only) ──"
awk -v IGNORECASE=1 -v pat="$pat" '
  $0 ~ /error TS[0-9]+:/ && $0 ~ pat { print "• " $0 }
' "$log" | sed 's/^/  /' || true

rm -f "$log"
exit 1
