# Student Frontend Resilience Design

## Goal

학생 화면에서 공고·신청 폼·상담·알림·인증·프로필 이미지의 비동기 경쟁 상태와 오류 상태를 실제 사용자 흐름에 맞게 분리하고, 학생 프론트 변경만으로 회귀 가능하게 만든다.

## Scope and constraints

- 수정 대상은 학생 페이지와 학생이 사용하는 `feature`, `entity`, `widget`, `shared` 프론트 코드다.
- 선생님 페이지 소스와 백엔드 소스는 수정하지 않는다.
- 기존 endpoint, HTTP method, request payload, session/reissue 계약은 유지한다.
- 공통 프론트 변경은 학생 흐름을 우선 검증하고, 선생님 화면의 인증·탭 사용에 미치는 영향도 회귀 테스트로 확인한다.
- 각 독립 영역은 회귀 테스트를 먼저 RED로 만든 뒤 최소 구현하고 별도 커밋한다.

## Backend contract findings

- 공고/폼/상담/알림 endpoint와 신청 payload는 현재 프론트 계약과 일치한다.
- `401`은 인증이 없거나 만료된 요청이고 `403`은 권한 부족으로 사용된다. 프론트는 `403`만으로 세션을 삭제하면 안 된다.
- `POST /auth/email/password-reset-code`는 미가입 이메일에도 현재 `204`를 반환한다. 따라서 학생 프론트만으로 미가입 계정과 발송 성공을 구분할 수 없다. 발송 실패를 모두 미가입으로 표시하는 문제는 프론트에서 일반 오류/status 기반 표시로 고치되, 미가입 구분 자체는 백엔드 계약 변경 대기 항목으로 보고한다.

## Design

### 1. Recruit and form linking

`useRecruitList`는 `loading`, `items`, `error`를 빈 결과와 구분하고 retry를 노출한다. `RecruitPage`는 error 상태에서 empty copy를 렌더링하지 않는다.

`useRecruitDetail`는 공고 본문과 신청 폼 목록을 독립적으로 관리한다. `recruit.formId`가 있으면 동일 ID의 폼만 연결하고, 폼 목록 조회가 실패하면 공고 본문은 유지한 채 폼 영역에 오류와 retry를 표시한다. `formId`가 없으면 회사명/폼 제목 유사도 매칭을 사용하지 않고, 연결 폼을 확인할 수 없다는 정확한 안내를 표시한다.

### 2. Student form detail

`SubmitForm`의 본문 조회와 제출내역 조회를 각각 상태로 관리한다. 본문이 성공하고 제출내역만 실패하면 본문과 입력 UI는 표시하되, 제출내역 확인 전까지 submit/resubmit action은 disabled 상태로 유지한다. 제출내역 retry는 본문 재조회와 독립적으로 실행한다.

조회·파일 업로드·제출 작업은 `formId`와 요청 버전을 캡처한다. route가 A에서 B로 바뀌거나 컴포넌트가 unmount되면 A의 응답은 B의 state를 변경하지 않는다. 파일 업로드 중 route 전환도 같은 guard를 적용한다. route adapter에서 실제 `/forms/[id]` 전환을 재현하는 계약 테스트를 추가한다.

### 3. Consultation availability and profile reservations

`useConsultationAvailability`에 availability 상태(`idle | loading | success | error`)와 retry를 추가한다. slot status API가 error이면 해당 날짜의 모든 period를 선택 불가로 유지하고 retry를 제공한다. 성공 응답에서만 서버 unavailable period를 반영한다.

프로필 예약 조회는 course/common을 독립 요청으로 실행하고 각 성공 결과를 보존한다. 한쪽 실패는 다른 쪽 예약을 제거하지 않으며, 오류와 retry는 실패한 범위를 표시한다.

취소 dialog의 target이 실시간 재조회로 사라지면 dialog를 닫고 상태 변경 안내를 한 번 표시한다. 선택 날짜가 다음 달로 자동 이동하면 `ConsultationForm`의 calendar month도 선택 날짜의 월로 동기화한다.

### 4. Notifications

알림 목록 상태와 SSE 수신 처리는 provider가 소유한다. notification ID를 dedupe key로 사용해 동일 이벤트의 toast 중복을 막고, 새 SSE 알림은 열린 panel 목록에도 즉시 반영한다.

목록 요청은 page/request version을 관리해 늦은 응답이 최신 목록을 덮어쓰지 못하게 한다. 초기 조회와 retry 오류는 panel 내부에서 error copy와 retry button으로 표시하며, empty copy와 동시에 렌더링하지 않는다.

### 5. Signup and password reset

이메일 field가 바뀌면 verification code, sent flag, countdown, resend cooldown, 관련 오류를 즉시 초기화한다. 이후 사용자가 새 이메일에 대해 다시 발송한다.

비밀번호 재설정 code 발송 실패는 현재 backend가 제공한 `ApiError.status`와 메시지를 보존해 서버 오류·네트워크 오류를 일반 오류로 표시한다. 미가입 계정 전용 문구는 backend가 구분 계약을 제공할 때만 적용한다.

### 6. Profile avatar identity

avatar cache key는 현재 session의 stable identity로 계산한다. session 변경/logout 이벤트에서 이전 image state와 진행 중 request를 무효화하고, 새 session 기준으로 cache/profile을 다시 읽는다.

upload 시작 시 user key와 session identity를 캡처하고, 완료 시 현재 session이 동일한 경우에만 화면과 cache를 갱신한다. 다른 계정으로 전환된 뒤 늦게 도착한 이전 upload 응답은 무시한다.

### 7. Shared auth and tabs

`createAuthenticatedRequest`는 원 요청의 `401`에 대해 refresh를 시도하고 refresh 실패가 인증 만료일 때만 session을 정리한다. 원 요청 `403`은 권한 오류로 전달하되 session은 유지한다. 기존 login/reissue 흐름과 학생·선생님 보호 라우트에 회귀 테스트를 추가한다.

`SegmentedTabs`는 tab semantics를 유지하면서 roving focus, `Home`/`End`, 좌우 화살표 이동, `tabIndex`, `aria-controls`, `onKeyDown`을 제공한다. 기존 click API와 시각적 스타일은 유지한다.

## Test strategy

- 공고: list error/empty exclusivity, retry, exact `formId`, no fuzzy fallback, detail form retry.
- 폼: route form ID switch, form-only success/submission-only failure, submission retry disabled gate, stale upload/submit response.
- 상담: slot status error/success/retry, independent course/common reservations, stale cancel target, automatic month sync.
- 알림: duplicate SSE ID, panel list injection, list retry, stale page response.
- 인증/프로필: email reset state, status-based reset error, 401/403 session policy, avatar identity guard.
- 공통: keyboard interaction and ARIA contract for `SegmentedTabs`.
- Final gate: typecheck, full contract harness, FSD/convention checks, changed-file lint, production build.

## Deferred backend item

The frontend will not invent an “unregistered account” result for password-reset code delivery. Because the current backend returns `204` for an unknown email, precise unregistered-versus-success messaging requires a backend response contract change and remains explicitly pending.
