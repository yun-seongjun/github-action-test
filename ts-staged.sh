#!/usr/bin/env sh

# 실패시, 정의되지않은 변수 사용시 종료
set -eu

# [ -n "${log:-}" ] && rm -f "$log" log가 존재하면 임시로그 삭제
cleanup() { [ -n "${log:-}" ] && rm -f "$log"; }

yarn lint-staged

# log="$(mktemp)" 임시파일 생성 후 경로 문자열
# trap cleanup EXIT INT TERM 스크립트가 종료되거나, 강제 중단하거나, 프로세 종료요청이 왔을때 cleanup 실행
# yarn workspaces run type-inspect 모든 워크스페이스에서 type-inspect 실행
# -s yarn로그 최소
# >"$log" 2>&1 로그를 log파일에 기록
log="$(mktemp)"
trap cleanup EXIT INT TERM
if yarn workspaces run -s type-inspect >"$log" 2>&1; then
  echo "✓ Type check OK"
  exit 0
fi

# awk -v IGNORECASE=1 정규식 매칭 대소문자 무시
# $0 ~ /error TS[0-9]+:/ { print "• " $0 } 문자열이 정규식(/error TS[0-9]+:/)에 매칭되는지
# /error TS[0-9]+:/ error TS 뒤에 숫자, 마지막 ":" 포함되어있는지
# { print "• " $0 } 통과한 줄에 "• " 붙여서 출력
# | sed 's/^/ /' 각줄 맨 앞에 스페이스2칸 추가
echo "── Error Summary Start ──"
awk -v IGNORECASE=1 '$0 ~ /error TS[0-9]+:/ { print "• " $0 }' "$log" | sed 's/^/  /'
echo "── Error Summary End ──"
exit 1
