# Frontend Contract Map

## 목적

이 문서는 FSD 재구축 전에 현재 Jobdam 프론트엔드가 제공하는 사용자 기능, route, API, validation, session 동작을 고정하는 기준선이다.

Student 영역은 이 계약을 유지하면 UI, component, hook, state, 함수 구조를 재작성할 수 있다. Teacher 영역은 아래 계약과 현재 디자인/동작을 유지한 채 FSD 구조로만 이전한다.

## Source of truth

우선순위는 다음과 같다.

1. 실제 Backend API 계약
2. `scripts/api-contract-check.ts`와 기존 regression check
3. 현재 실행 코드의 사용자 동작
4. 이 문서

서로 충돌하면 추측하지 않고 실제 서버/기존 구현을 확인한 뒤 계약을 갱신한다.

## Route contract

| Route | 영역 | 현재 계약 |
| --- | --- | --- |
| `/` | Student | Hero 애니메이션 후 서비스 목록 표시. 진로상담, 일반상담, 취업공고로 이동 가능 |
| `/login` | Auth | 로그인, 아이디 저장, 저장 세션 복원, role별 redirect |
| `/signup` | Auth | GSM 이메일 인증코드 발송, 3분 만료, 회원가입 후 `/login` 이동 |
| `/forgot-password` | Auth | 이메일 인증코드 발송, 3분 만료, 새 비밀번호 설정 후 `/login` 이동 |
| `/admin` | Admin | ADMIN 전용. 학생 정보 동기화 실행 |
| `/counsel` | Student | 진로/일반 상담 신청. `type=general`이면 일반상담 탭으로 시작 |
| `/forms` | Student | 공개 신청 폼 목록 조회 |
| `/forms/[id]` | Student | 폼 조회, 필수 응답 검증, 최초 제출, 기존 제출 결과 조회 |
| `/profile` | Student | 사용자 정보, 상담 예약/기록 조회, 예약 취소, 기록 상세/로컬 메모 UI |
| `/recruit` | Student | 공개 취업공고 목록 조회. 401이면 로그인 안내 |
| `/recruit/[id]` | Student | 공고 상세 조회, 신청 폼 이동, 신청 링크 복사 |
| `/recruit/[id]/apply` | Student | 현재 `/forms`로 redirect만 수행 |
| `/room` | Legacy | 현재 빈 route. 신규 기능으로 간주하지 않는다 |
| `/teacher` | Teacher | 기존 상담 일정/예약 승인 UI. 현재 course 상담 조회 중심 |
| `/teacher/forms` | Teacher | 폼 생성/수정/공개/마감, 학생 화면/응답 목록 이동 |
| `/teacher/forms/[id]/submissions` | Teacher | 폼 제출 목록 및 제출 상세 조회 |
| `/teacher/recruit` | Teacher | 공고 이미지 분석, 공고 수정/공개, 지원 폼/지원자 연결 대시보드 |
| `/test` | Dev | 기존 UI component 확인용 화면. 제품 기능 계약이 아님 |

## Auth contract

### Login

- 이메일과 비밀번호가 모두 있어야 제출할 수 있다.
- 로그인 API 성공 후 session role에 따라 이동한다.
  - `ADMIN` → `/admin`
  - `TEACHER` → `/teacher`
  - 그 외 → `/`
- 로그인 화면 진입 시 기억된 session이 있으면 같은 role 규칙으로 자동 이동한다.
- 아이디 저장을 끄면 remember-login preference를 제거한다.
### Signup

- 이메일은 `s`로 시작하는 `@gsm.hs.kr` 주소여야 한다.
- 인증코드는 숫자 6자리다.
- 인증코드 발송 후 180초 타이머를 사용한다.
- 인증코드가 만료되면 제출할 수 없다.
- 비밀번호는 영문, 숫자, 특수문자를 포함하고 10자 이상이어야 한다.
- 비밀번호 확인 값이 일치해야 한다.
- 성공 시 `/login`으로 이동한다.

### Password reset

- Signup과 같은 GSM 이메일 규칙과 비밀번호 규칙을 사용한다.
- 인증코드는 숫자 6자리이며 180초 후 만료된다.
- 성공 시 `/login`으로 이동한다.

## Session contract

Storage key는 기존 동작 호환을 위해 계약으로 취급한다.

- access token: `jobdam_access_token`
- session: `jobdam_session`
- remember flag: `jobdam_remember_login`
- remembered email: `jobdam_remembered_email`
- remember-login=true면 session/access token을 `localStorage`에 저장한다.
- remember-login=false면 `sessionStorage`에 저장하고 remember preference를 제거한다.
- role은 access token JWT payload의 `role`을 읽어 `ADMIN`, `TEACHER`, `STUDENT`로 해석한다.
- 인증된 request는 access token이 있으면 `Authorization: Bearer <token>`을 붙인다.
- 401 발생 시 refresh token이 있으면 reissue를 한 번 시도하고 원 요청을 한 번 재시도한다.
- reissue 후에도 401이면 session을 정리한다.
- 502/503/504 또는 plain `Internal Server Error` 500은 `백엔드 서버에 연결할 수 없습니다.`로 해석한다.

## Consultation contract

### Student

- 상담 종류는 `course`(진로)와 `common`(일반) 두 종류다.
- 제목, 내용, 날짜, 교시는 필수다.
- 진로상담은 선생님 선택도 필수다.
- 진로상담 제목은 API 요청 시 `[선생님] 제목` 형태로 전송한다.
- 진로상담은 현재 upcoming course 예약이 하나라도 있으면 중복 신청을 막는다.
- 날짜 선택지는 오늘부터 평일 기준 5일을 만든다.
- 진로상담 선생님은 현재 `임경원`, `김권예소`, `정윤기` 3명을 사용한다.
- 임경원 선생님은 1~9교시, 나머지 두 선생님은 점심/저녁시간 선택지를 사용한다.
- 일반상담은 1~4교시, 점심시간, 5~7교시를 사용한다.
- 신청 성공 후 입력값을 유지하며 성공 toast를 표시한다.
- 취소는 입력을 초기화하고 `/`로 이동한다.

### Profile

- course/common 전체와 upcoming 값을 조합해 예약과 기록을 구분한다.
- 예약 취소 시 원래 consultation kind와 id로 변환해 cancel API를 호출한다.
- 현재 상담 기록의 `myMemo` 저장은 프론트 state만 갱신하며 별도 Backend API가 없다.
## Recruit and form contract

### Recruit

- 공개 공고 목록은 `/recruit`에서 조회한다.
- 공고 상세는 `/recruit/{id}`에서 조회한다.
- 상세 화면의 신청 버튼은 현재 `/forms`로 이동한다.
- `/recruit/[id]/apply`도 현재 `/forms`로 redirect한다.
- 공고 상세에서는 `${origin}/recruit/{id}/apply` 링크를 clipboard에 복사한다.

### Student forms

- 공개 폼 목록을 조회하고 각 폼의 질문 수를 표시한다.
- 폼 상세 진입 시 폼과 내 기존 제출을 함께 조회한다.
- 내 제출 조회의 404는 "미제출" 상태로 취급한다.
- 필수 질문 중 값이 없는 첫 질문을 찾아 제출을 막는다.
- 빈 응답은 API payload에서 제외한다.
- text/date/number 답변은 `textValue`, 선택형 답변은 `optionIds`로 전송한다.
- 이미 제출한 상태에서는 입력 UI 대신 기존 제출 결과를 표시한다.
- 제출 API 409는 `이미 제출한 폼입니다.`로 표현한다.

## Admin contract

- `/admin`은 session이 없으면 `/login`으로 이동한다.
- ADMIN이 아닌 경우 TEACHER는 `/teacher`, STUDENT는 `/`로 이동한다.
- 학생 동기화는 `syncedCount`를 받아 최근 실행 결과에 표시한다.
- 401/403은 관리자 계정 필요 오류로 표현한다.
## Teacher contract

Teacher는 Student rebuild와 다르게 behavior-preserving migration 대상이다.

- `/teacher`는 session name을 선생님 이름으로 사용한다.
- 현재 course 상담을 조회해 날짜+교시 slot에 승인된 예약을 표시한다.
- course 상담 승인 API를 호출할 수 있다.
- 현재 선생님별 교시와 임경원 선생님 시간표 하드코딩을 migration 중 임의 변경하지 않는다.
- standalone 상담 메모는 현재 Backend 저장 없이 성공 alert/state reset만 수행한다.
- `/teacher/forms`는 폼 목록/상세 조회, 생성, 수정, 공개, 마감 기능을 유지한다.
- 폼 공유 시 `/forms/{id}` URL을 clipboard에 복사한다.
- `/teacher/forms/[id]/submissions`는 제출 목록과 제출 상세를 조회한다.
- `/teacher/recruit`는 공고 이미지 분석, draft 수정, publish, 학생 공고 화면 이동을 유지한다.
- recruit dashboard의 공고-폼 연결은 현재 회사명과 폼 제목을 normalize한 임시 문자열 매칭이다.
- Backend에 recruitId 연결 계약이 생기기 전까지 이 임시 매칭 의미를 임의 변경하지 않는다.

## API endpoint contract

아래 path는 `NEXT_PUBLIC_API_BASE_URL` 기본값 `/backend` 뒤에 붙는다.

| Method | Path | 사용 목적 |
| --- | --- | --- |
| POST | `/auth/login` | 로그인 |
| POST | `/auth/signup` | 회원가입 |
| POST | `/auth/email/signup-code` | 회원가입 인증코드 발송 |
| POST | `/auth/email/password-reset-code` | 비밀번호 재설정 인증코드 발송 |
| POST | `/auth/password/reset` | 비밀번호 재설정 |
| POST | `/auth/reissue` | access token 재발급 |
| POST | `/auth/logout` | refresh token 로그아웃 |
| GET | `/student/{course|common}` | 학생 상담 조회 |
| POST | `/student/{course|common}` | 학생 상담 신청 |
| PATCH | `/student/{course|common}/cancel/{id}` | 학생 상담 취소 |
| GET | `/teacher/{course|common}` | 교사 상담 조회 |
| PATCH | `/teacher/{course|common}/allow/{id}` | 교사 상담 승인 |
| POST | `/teacher/{course|common}/lock` | 상담 slot 잠금 |
| GET | `/teacher` | teacher id 조회 |
| POST | `/admin/students/sync` | 학생 정보 동기화 |
| GET | `/recruit` | 공개 공고 목록 |
| GET | `/recruit/{id}` | 공개 공고 상세 |
| GET | `/teacher/recruit` | 교사 공고 목록 |
| POST | `/teacher/recruit/analyze` | 이미지 기반 공고 분석(FormData `image`) |
| PATCH | `/teacher/recruit/{id}` | 공고 수정 |
| POST | `/teacher/recruit/{id}/publish` | 공고 공개 |
| GET | `/form` | 공개 폼 목록 |
| GET | `/form/{id}` | 공개 폼 상세 |
| GET | `/teacher/form` | 교사 폼 목록 |
| GET | `/teacher/form/{id}` | 교사 폼 상세 |
| POST | `/teacher/form` | 폼 생성 |
| PATCH | `/teacher/form/{id}` | 폼 수정 |
| POST | `/teacher/form/{id}/publish` | 폼 공개 |
| POST | `/teacher/form/{id}/close` | 폼 마감 |
| POST | `/student/form/{id}/submission` | 학생 폼 제출 |
| GET | `/student/form/{id}/submission` | 내 제출 조회 |
| GET | `/teacher/form/{id}/submission` | 폼 제출 목록 |
| GET | `/teacher/form/{formId}/submission/{submissionId}` | 폼 제출 상세 |

## Request payloads that must remain compatible

### Signup

```json
{ "email": "s123@gsm.hs.kr", "password": "Password!1", "verificationCode": "123456" }
```

### Password reset

```json
{ "email": "s123@gsm.hs.kr", "verificationCode": "123456", "newPassword": "Password!2" }
```

### Consultation

```json
{ "title": "제목", "content": "내용", "date": "YYYY-MM-DD", "period": "4교시" }
```

### Form submission

```json
{ "answers": [{ "questionId": 1, "textValue": "답변" }, { "questionId": 2, "optionIds": [3] }] }
```
## Existing executable regression coverage

현재 다음 check를 FSD migration의 기존 회귀 기준으로 사용한다.

- `api-contract-check.ts`
- `auth-error-message-check.ts`
- `auth-page-errors-check.ts`
- `auth-route-guard-check.ts`
- `auth-session-storage-check.ts`
- `auth-validation-policy-check.ts`
- `backend-config-check.ts`
- `counsel-cancel-routing-check.ts`
- `form-answers-check.ts`
- `home-logo-check.ts`
- `home-stage-transition-check.ts`
- `login-validation-check.ts`
- `remember-login-check.ts`
- `remember-login-restore-check.ts`
- `student-home-logo-check.ts`

spacing-only check는 디자인 재작성 시 기능 계약으로 승격하지 않는다.

## Migration notes

- Student UI의 현재 Tailwind class, inline style, component 분할 방식은 보존 계약이 아니다.
- 현재 함수 이름과 state 구조도 Student 영역에서는 보존 계약이 아니다.
- `/room`의 빈 화면과 `/test`의 component showcase를 새로운 제품 기능으로 확대 해석하지 않는다.
- Profile의 local-only `myMemo`는 실제 Backend 저장 기능으로 오해하지 않는다.
- Recruit apply route는 현재 전용 지원 flow가 아니라 `/forms` redirect다.
- Teacher의 하드코딩/임시 매칭은 이상적인 구조가 아니어도 migration PR에서는 동작 보존이 우선이다.
