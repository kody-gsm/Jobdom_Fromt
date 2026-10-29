# API Contract Rules

## Source of truth

기존 Backend 명세와 `scripts/api-contract-check.ts`를 현재 프론트엔드의 실행 가능한 API 계약으로 취급한다.

## Protected contract

명시적 사용자 승인 없이 다음을 변경하지 않는다.

- endpoint path
- HTTP method
- request field 이름과 의미
- 인증 헤더와 세션/reissue 방식
- 성공/실패를 해석하는 기존 의미

## Currently guarded examples

- `GET /backend/recruit`
- `GET /backend/form`
- `POST /backend/teacher/banner`
- `GET /backend/teacher/banner`
- `GET /backend/student/banner`
- `GET /backend/student/course`
- `GET /backend/teacher/common`
- `POST /backend/admin/students/sync`
- `POST /backend/admin/discord/members/sync`
- `GET /backend/admin/statistics/api`
- `POST /backend/auth/email/signup-code`
- `POST /backend/auth/signup`
- `POST /backend/auth/password/reset`

## Teacher form edits

- 교사는 기존 `PATCH /teacher/form/{id}`로 초안·공개·마감 폼의 제목과 설명을 수정한다. 상태와 마감일은 이 저장 요청에서 변경하지 않는다.
- `GET /teacher/form/{id}/submission`으로 응답이 없는지 확인한 경우에만 질문 편집을 허용한다. 확인 중·조회 실패·응답 존재 시에는 질문을 잠그고 제목·설명만 수정할 수 있다.
- 수정할 질문이 없으면 `questions`를 생략하여 기존 질문·선택지 ID와 학생 답변을 유지한다. 응답 없는 폼의 질문 변경은 전체 질문 목록을 보낸다. 신규 폼 생성에는 질문 목록이 필수다.
- 조회 실패는 재조회할 수 있으며, 선택을 바꾼 뒤 도착한 이전 조회 결과는 무시한다. 저장 실패와 동시 제출로 인한 409에서는 입력을 유지한다.
- 응답이 생겨 질문 변경을 저장할 수 없으면 기존 질문으로 되돌리거나 응답 여부를 다시 확인하도록 안내한다. 잠긴 질문의 미저장 변경을 제목·설명 저장에서 임의로 버리지 않는다.

## Discord student IDs

- 관리자 화면의 `학생 ID 저장`은 기존 Bearer 인증으로 `POST /admin/discord/members/sync`를 호출하며 요청 body는 없다.
- 서버는 Discord 닉네임의 학번·이름을 학생 정보와 비교해 Discord 사용자 ID를 저장하고, 매칭되지 않는 기존 ID를 정리한다. DataGSM 학생 정보 동기화와는 별도 기능이다.
- DB 반영 후 응답은 `{ scannedMembers: number, linkedStudents: number, updatedStudents: number }`이다. 각각 조회한 Discord 회원 수, 연결된 학생 수, ID가 갱신·정리된 학생 수이며 0 이상의 정수다.
- 실행 중 중복 요청을 막고 성공 수치와 한국 시간 기준 완료 시각을 표시한다. 401/403은 관리자 권한 안내, 그 외 실패는 오류와 재시도를 제공한다.

## Recruit publish with linked form

- 교사 공고 화면의 `폼 작성 후 공개`는 공고를 저장(`POST /teacher/recruit` 또는 `PATCH /teacher/recruit/{id}`)한 뒤 응답의 `formId`로 `/teacher/forms?formId={formId}`를 연다. 공고 화면에서 직접 공개하지 않는다.
- 폼 화면은 `GET /teacher/recruit`로 `formId`가 같은 공고를 찾는다. 초안 폼이 초안 공고에 연결되어 있으면 `공고와 함께 공개`로 표시하고 디스코드 알림 채널 선택을 보여준다.
- 채널 목록은 `GET /api/notices/channels`의 `[{ id: string, name: string, categoryName: string | null }]`을 카테고리별로 표시한다. 기본값은 `기본 공지 채널만`이며, 목록 조회 실패 시 재시도를 제공하고 기본 공지 채널로만 공개할 수 있다.
- 공개 시 폼 수정 내용을 먼저 저장(`PATCH /teacher/form/{id}`)한 뒤 body 없이 `POST /teacher/recruit/{recruitId}/publish`를 호출한다. 서버는 공고와 연결 폼을 함께 공개하고 기본 공지 채널(`DISCORD_BOT_CHANNEL_ID`)로 공고 알림을 보낸다.
- 채널을 골랐으면 공개 성공 후 `POST /api/notices/send`에 `{ channelId, title, content, field, link }`를 보내 선택 채널에도 알린다. 내용은 서버 공고 알림과 같은 형식(`{회사명} 공고`, 요약 또는 기본 문구, 분야 또는 `미정`, `/recruit/{id}` 링크)이다. 채널 ID는 JavaScript 안전 정수 범위를 넘으므로 문자열로 보낸다.
- 선택 채널 발송이 실패해도 공고·폼 공개는 유지하고 발송 실패를 안내한다.
- 공고에 연결되지 않았거나 공고가 이미 공개된 폼은 기존 `POST /teacher/form/{id}/publish`를 사용한다.
- 2026-10-26 기준 백엔드 공고 공개 API는 채널을 받지 않아 기본 공지 채널 발송을 끌 수 없다. 따라서 다른 채널을 고르면 기본 채널과 선택 채널에 각각 게시된다. 선택 채널 메시지 ID는 저장하지 않으므로 이후 공고 수정은 기본 채널 메시지에만 반영된다.

## Role tutorial completion

- 학생·교사·Wee 교사는 로그인 후 보호된 화면에 들어올 때 기존 Bearer 인증으로 `GET /auth/tutorial`을 호출해 `{ tutorialCompleted: boolean }`을 확인한다. 관리자와 로그인·회원가입·비밀번호 찾기 화면은 대상이 아니다.
- `tutorialCompleted`가 `false`이면 역할별 튜토리얼을 필수로 표시한다. 건너뛰기는 없고 마지막 단계의 `잡담 시작하기`에서 요청 body 없이 `PATCH /auth/tutorial/complete`를 호출한다.
- 완료 응답의 `tutorialCompleted`가 `true`일 때만 튜토리얼을 닫는다. 저장 실패 시 튜토리얼을 유지하고 오류와 재시도를 제공하며, 저장 중 중복 요청을 막는다.
- 완료 여부는 계정 단위 서버 상태만 사용하며 브라우저 저장소에 기록하지 않는다. 완료가 확인된 계정은 같은 탭에서 다시 조회하지 않는다.
- 상태 조회가 실패하면 서비스 이용을 막지 않고 튜토리얼 없이 화면을 표시하며, 다음 진입 때 다시 조회한다.

## Admin API statistics

- 관리자 화면의 `API 호출 통계`는 기존 Bearer 인증으로 `GET /admin/statistics/api?from=YYYY-MM-DD&to=YYYY-MM-DD`를 호출한다. 기본 기간은 한국 시간 기준 최근 30일이며, 시작일이 종료일보다 늦거나 366일을 넘으면 요청하지 않는다.
- 응답은 `{ from, to, totalCalls, errorCalls, averageDurationMs, daily: [{ date, calls, errorCalls }], endpoints: [{ method, route, status, calls, averageDurationMs }] }`이다. 오류 호출은 HTTP 4xx·5xx이며 `endpoints`는 호출 수 내림차순이다.
- 서버는 호출이 있던 날짜만 `daily`로 내려주므로 화면은 빈 날짜를 0으로 채워 일별 차트를 그린다. 인증 실패나 매핑되지 않은 요청은 `UNMATCHED` 경로로 집계된다.
- 401/403은 관리자 권한 안내, 그 외 실패는 오류와 재조회를 제공한다. 형식이 맞지 않는 응답은 오류로 처리한다.

## Form attachment download

- 학생의 제출 내역과 교사의 응답 조회 화면은 답변의 `fileId`로 `GET /form/file/{fileId}`를 요청한다. 공유 클라이언트가 API base(`/backend` 등)를 붙인다.
- 기존 Bearer 인증과 401 토큰 재발급을 사용한다. 응답의 `fileDownloadUrl`을 외부 링크로 직접 열지 않는다.
- 성공 응답은 Blob으로 읽어 답변의 `fileName`으로 저장한다. 기본 JSON/text 응답과 오류 파싱은 유지한다.
- 다운로드 중 중복 요청을 막고, 권한 부족·파일 없음·네트워크 실패는 오류로 표시하여 재시도할 수 있게 한다.

## Student form list metadata

- 2026-10-30 확인한 backend `develop`의 `GET /form`은 초안을 제외한 공개·마감 폼을 반환하며, 각 항목의 `submitted: boolean`으로 현재 학생의 제출 여부를 제공한다. `GET /form/{id}`도 마감 폼을 조회할 수 있고, 마감 후 제출 제한은 유지된다.
- 프론트는 `submitted`가 있으면 항목별 제출 조회를 생략한다. 배포 시점 차이로 필드가 없으면 기존 `GET /student/form/{id}/submission`을 제한된 동시 수로 조회하되 목록 첫 표시를 막지 않는다. 실패를 미제출로 단정하지 않는다.

## Frontend request lifetime and cache

- 인증 GET은 계정의 access token과 URL을 키로 30초 재사용하고 진행 중 요청을 공유한다. caller signal, Blob, `cache: "no-store"` 요청은 공유하지 않는다.
- 명시적인 새로고침·상담 변경 이벤트·재시도는 `no-store`로 이전 값을 무효화하고 서버를 다시 조회한다.
- `invalidateCache`는 프론트 내부 URL prefix 목록이며 fetch나 서버로 전송하지 않는다. 변경 API는 영향을 받는 조회만 무효화하고, 빈 목록은 캐시를 유지한다. 지정하지 않은 변경 API는 기존 전체 무효화를 유지한다.
- 캐시는 최대 100개 값을 보관하며 조회/저장 시 만료 값을 제거한다. 무효화 전에 시작한 요청은 뒤늦게 캐시를 채우지 않는다.
- 기본 요청 제한은 30초, FormData 업로드·Blob 다운로드는 120초다. `timeoutMs`로 개별 조정할 수 있으며 응답 본문 수신까지 포함한다. timeout/사용자 취소는 각각 `REQUEST_TIMEOUT`/`REQUEST_ABORTED` 코드의 status 0 오류다.
- 한 호출자의 취소가 다른 소비자의 공유 GET을 중단하지 않도록, signal을 가진 요청은 캐시 공유에서 제외한다.

## Refactoring API code

큰 `api.ts`를 분리하는 것은 허용하지만 외부 동작은 유지한다. `shared/api`는 HTTP 기반 책임을, `features/<feature>/api`는 도메인 endpoint 책임을 갖는다.

## Mismatch handling

명세와 실제 서버/기존 구현이 충돌하면 추측으로 맞추지 않는다. 차이를 보고하고 contract 변경은 별도 승인 대상으로 둔다.
