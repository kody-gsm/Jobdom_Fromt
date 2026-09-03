# Refactoring Rules

## Definition

이 프로젝트에서 리팩터링은 기존 사용자 기능과 Backend 계약을 유지하면서 내부 구조를 개선하는 작업이다.

## Allowed

- 컴포넌트 분리와 재구성
- custom hook 추출
- 순수 domain 함수 추출
- API 코드를 domain별 모듈로 분리
- 기존 디자인을 새로운 design system으로 교체
- 타입과 이름 개선
- 테스트 가능한 구조로 이동

## Forbidden without explicit approval

- `app/teacher/**` 수정
- endpoint/method/payload/auth 변경
- 기존 기능 삭제 또는 UX 의미 변경
- 무관한 영역의 대규모 정리
- 새 상태관리/API/폼 라이브러리 추가

## Migration rule

화면 또는 feature 하나씩 vertical slice로 교체한다. 기존 동작을 contract로 고정하고 새 구현이 동일 동작을 만족한 뒤 기존 코드를 제거한다.

## Scope rule

한 PR에 여러 독립 feature를 섞지 않는다. 작업 범위 밖 문제를 발견하면 별도 작업 후보로 기록하고 현재 변경에 끼워 넣지 않는다.