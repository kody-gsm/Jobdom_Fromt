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
- `POST /backend/auth/email/signup-code`
- `POST /backend/auth/signup`
- `POST /backend/auth/password/reset`

## Discord student IDs

- 관리자 화면의 `학생 ID 저장`은 기존 Bearer 인증으로 `POST /admin/discord/members/sync`를 호출하며 요청 body는 없다.
- 서버는 Discord 닉네임의 학번·이름을 학생 정보와 비교해 Discord 사용자 ID를 저장하고, 매칭되지 않는 기존 ID를 정리한다. DataGSM 학생 정보 동기화와는 별도 기능이다.
- DB 반영 후 응답은 `{ scannedMembers: number, linkedStudents: number, updatedStudents: number }`이다. 각각 조회한 Discord 회원 수, 연결된 학생 수, ID가 갱신·정리된 학생 수이며 0 이상의 정수다.
- 실행 중 중복 요청을 막고 성공 수치와 한국 시간 기준 완료 시각을 표시한다. 401/403은 관리자 권한 안내, 그 외 실패는 오류와 재시도를 제공한다.

## Form attachment download

- 학생의 제출 내역과 교사의 응답 조회 화면은 답변의 `fileId`로 `GET /form/file/{fileId}`를 요청한다. 공유 클라이언트가 API base(`/backend` 등)를 붙인다.
- 기존 Bearer 인증과 401 토큰 재발급을 사용한다. 응답의 `fileDownloadUrl`을 외부 링크로 직접 열지 않는다.
- 성공 응답은 Blob으로 읽어 답변의 `fileName`으로 저장한다. 기본 JSON/text 응답과 오류 파싱은 유지한다.
- 다운로드 중 중복 요청을 막고, 권한 부족·파일 없음·네트워크 실패는 오류로 표시하여 재시도할 수 있게 한다.

## Refactoring API code

큰 `api.ts`를 분리하는 것은 허용하지만 외부 동작은 유지한다. `shared/api`는 HTTP 기반 책임을, `features/<feature>/api`는 도메인 endpoint 책임을 갖는다.

## Mismatch handling

명세와 실제 서버/기존 구현이 충돌하면 추측으로 맞추지 않는다. 차이를 보고하고 contract 변경은 별도 승인 대상으로 둔다.
