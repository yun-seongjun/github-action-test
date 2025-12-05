#!/usr/bin/env sh

# 실패시, 정의되지않은 변수 사용시 종료
set -eu

# git rev-parse --show-toplevel git 정보 파싱 후, 현재 작업중인 최상위 폴더 경로 문자열로
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

# awk 텍스트를 줄 단위로 읽어 조건(/\.tsx?$/)에 맞으면 액션({print}) 실행
# BEGIN{IGNORECASE=1} 입력전 정규식 매칭시 대소문자 무시 설정
only_ts() { awk 'BEGIN{IGNORECASE=1} /\.tsx?$/ {print}'; }

# rm -f "$log" 임시로그 삭제
cleanup() { rm -f "$log"; }

# 1) lint-staged
yarn lint-staged

# 2) 변경 파일 수집: 인덱스 → 없으면 워킹트리(수정+신규)
# git diff --cached staged된 변경사항 기준 diff
# --name-only -z 내용이 아닌 이름만, NUL문자(\0) 구분 출력
# --diff-filter=ACMR A:추가된 파일, C:복사된 파일, M:수정된 파일, R:이름/경로가 변경된 파일 만 필터링 (대문자는 포함, 소문자는 제외)
# tr '\0' '\n' NUL문자(\0)을 줄바꿈(\n)으로 변경
# sed '/^$/d' 빈줄 삭제
# sort -u 정렬 및 중복제거
# 위의 작업을 한 내용을 changed에 저장
changed="$(git diff --cached --name-only --diff-filter=ACMR -z | tr '\0' '\n' | only_ts | sed '/^$/d' | sort -u)"

# "${changed:-}" 만약 존재하지않아도 빈 문자열로 치환
# -z 문자열 길이가 0이면 true
# git ls-files -m 수정했지만 아직 추가되지않은 파일들
# git ls-files --others --exclude-standard ignore되지않고 새로 생성된 파일들
# 2>/dev/null || true 에러 메시지 무시, 명령 실패해도 성공처리 (파일이 존재하지않아도 성공)
[ -z "${changed:-}" ] && changed="$(
  {
    git ls-files -m 2>/dev/null || true;
    git ls-files --others --exclude-standard 2>/dev/null || true;
  } \
  | only_ts | sed '/^$/d' | sort -u
)"

# exit 0 스크립트 종료
[ -z "${changed:-}" ] && { echo "no staged ts/tsx"; exit 0; }

# printf ' - %s\n' $changed " - " + 문자열 하나 + 줄바꿈
echo "🔎 TS/TSX changes:"
printf ' - %s\n' $changed

# 3) 변경 파일 basename들로 요약 필터 패턴 준비
# printf '%s\n' $changed changed를 공백을 줄바꿈으로 한줄씩 출력
# sed 's/[].[^$*+?{}()|/]/\\&/g' 특수문자 이스케이프
# paste -sd '|' - 여러줄을 한줄로 합치되, 구분자를 "|"
pattern="$(printf '%s\n' $changed | sed 's/[].[^$*+?{}()|/]/\\&/g' | paste -sd '|' -)"
[ -z "$pattern" ] && pattern='.*'

# 4) 타입체크 실행 (Yarn v1). 로그만 캡처, 화면엔 요약만
# log="$(mktemp)" 임시파일 생성 후 경로 문자열
# trap cleanup EXIT INT TERM 스크립트가 종료되거나, 강제 중단하거나, 프로세 종료요청이 왔을때 cleanup 실행
# yarn workspaces run type-inspect 모든 워크스페이스에서 type-inspect 실행
# -s yarn로그 최소
# >"$log" 2>&1 로그를 log파일에 기록
# 성공 시 log파일 삭제 후 종료
log="$(mktemp)"
trap cleanup EXIT INT TERM
if yarn workspaces run -s type-inspect >"$log" 2>&1; then
  echo "✓ Type check OK"
  rm -f "$log"
  exit 0
fi

# -v pattern="$pattern pattern을 awk 에서 pattern로 전달
# $0 ~ /error TS[0-9]+:/ TS에러줄만 체크
# $0 ~ pattern 해당줄에 pattern 체크
# { print "• " $0 } 통과한 줄에 "• " 붙여서 출력
# | sed 's/^/ /' 각줄 맨 앞에 스페이스2칸 추가
echo "── Error Summary (changed files only) ──"
awk -v IGNORECASE=1 -v pattern="$pattern" '$0 ~ /error TS[0-9]+:/ && $0 ~ pattern { print "• " $0 }' "$log" | sed 's/^/  /' || true
exit 1
