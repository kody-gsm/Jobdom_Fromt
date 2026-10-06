# 사용자 활동 기록 연동 계약

현재 작업은 프론트엔드만 구현했다. 아래 세 API는 백엔드에 아직 없으며, 서버 구현·배포 후 `NEXT_PUBLIC_ACTIVITY_API_ENABLED=true`를 설정하고 프론트를 다시 빌드해야 기록 전송과 조회가 활성화된다. 기본값은 비활성화이며, 관리자 화면에 연결 대기 상태를 표시한다. 로컬 저장 데이터나 예시 데이터를 실제 여러 사용자의 기록으로 표시하지 않는다.

## 기록 범위

- 로그인한 사용자의 접근이 허용된 페이지 방문. 동일 사용자·페이지의 인증 재발급이나 React effect 재실행은 중복 방문으로 세지 않는다. 다른 페이지를 거쳐 돌아오면 새 방문이다.
- 기존 인증 요청이 성공한 뒤 상담 신청·취소·승인·거절·시간 설정, 폼 제출·수정·생성·공개·마감·삭제, 지원자 확정·취소, 공고 생성·분석·수정·공개·삭제, 배너 저장, 프로필 이미지 변경, 학생 동기화.
- 수치: 기간 내 활동 사용자 수, 페이지 방문 수, 성공한 작업 수, 사용자별 방문·작업 수. 상세 이력에는 성공한 API 작업의 응답 시간(ms)을 표시한다.
- 경로는 허용된 route만 기록하며 query/hash를 제거한다. 인증 페이지, 비밀번호, 토큰, 상담 내용, 폼 답변, 파일 내용은 기록 payload에 넣지 않는다. 로그인·로그아웃 자체, 외부 배너 링크 클릭, 페이지 체류 시간은 현재 기록 범위에 없다.
- 전송은 부가 통계이며 실패해도 원래 작업과 인증 상태를 바꾸지 않는다. 자동 재전송·브라우저 보관 큐는 없고, 전송에 실패한 기록은 누락될 수 있다. 활성화 이전의 행동을 복원하지 않는다. 금융/평가/보안 감사용 수치로 사용하려면 해당 행동을 서버에서도 검증·기록해야 한다.

## 공통 권한 및 날짜

기본 API prefix는 기존 `/backend`를 따른다. 모든 요청에 기존 Bearer 토큰을 사용한다.

- `POST /activity/events`: 인증 필수. 사용자 id·이름·역할은 서버가 JWT 인증 정보로 결정한다. 클라이언트가 임의 사용자 id를 보내도 신뢰하지 않는다.
- `GET /admin/activity/**`: 서버에서도 ADMIN만 허용해야 한다. 프론트의 route guard만으로 권한을 보장하지 않는다.
- 조회 `from`, `to`는 `YYYY-MM-DD`, 한국 시간(Asia/Seoul) 기준 시작일 00:00 이상, 종료일 다음 날 00:00 미만이다. 기본 최근 7일. 응답 시간은 UTC 또는 offset을 포함한 ISO 8601이다.
- 페이지는 0부터 시작하고 `size=20`. 서버는 페이지 크기와 검색어 길이(최대 100자), 날짜 범위, enum, 사용자 id를 검증한다.

## 기록 저장 — 예정 API

`POST /activity/events` → `204 No Content`

```json
{
  "eventId": "239765c0-d55b-48ac-ae5f-c02db0e0cf6c",
  "type": "FORM_SUBMITTED",
  "path": "/student/form/12/submission",
  "occurredAt": "2026-10-01T01:00:00.000Z",
  "durationMs": 180
}
```

`type`의 허용 값과 한글 명칭은 `src/fsd/entities/user/model/activity.ts`의 `ACTIVITY_LABELS`가 정의한다. 서버에서도 enum 및 type별 경로를 검증한다. `PAGE_VIEW`의 `durationMs`는 null이며, 작업 응답 시간은 0 이상의 정수다. `eventId`와 인증 사용자 조합으로 중복 저장을 방지한다. `occurredAt`과 응답 시간은 브라우저 관측 값이므로 서버 수신 시각도 별도로 보관하는 것을 권장한다.

## 사용자별 요약 — 예정 API

`GET /admin/activity/users?from=2026-09-25&to=2026-10-01&query=1101&role=STUDENT&page=0&size=20`

`query`(이름 또는 학번 부분 검색), `role`은 선택이다. 조건에 맞는 활동 사용자를 최근 활동 내림차순, 동률이면 userId 순으로 반환한다. summary는 현재 페이지가 아닌 **전체 조회 조건**의 합계다.

```json
{
  "summary": { "activeUsers": 1, "pageViews": 5, "actions": 2 },
  "users": {
    "items": [{
      "userId": 4, "name": "홍길동", "studentNumber": "1101", "role": "STUDENT",
      "pageViews": 5, "actions": 2, "lastActiveAt": "2026-10-01T01:00:00Z"
    }],
    "page": 0, "totalPages": 1, "totalElements": 1
  }
}
```

`role`: STUDENT / TEACHER / WEE_TEACHER / ADMIN. 학번이 없는 사용자는 `studentNumber: ""`. 결과가 없으면 세 summary 값은 0, items는 빈 배열, totalPages와 totalElements는 0이다.

## 사용자 상세 이력 — 예정 API

`GET /admin/activity/users/4/events?from=2026-09-25&to=2026-10-01&type=FORM_SUBMITTED&page=0&size=20`

`type`은 선택이다. 해당 사용자와 기간·활동 종류에 맞는 기록을 최신순, 동률이면 id 순으로 반환한다. 경로에 query/hash를 포함하지 않는다.

```json
{
  "items": [{
    "id": "239765c0-d55b-48ac-ae5f-c02db0e0cf6c",
    "type": "FORM_SUBMITTED", "path": "/student/form/12/submission",
    "occurredAt": "2026-10-01T01:00:00Z", "durationMs": 180
  }],
  "page": 0, "totalPages": 1, "totalElements": 1
}
```

401/403은 관리자 인증 오류, 404/405/501은 연결 대기로 표시한다. 그 외 오류는 재조회할 수 있고 조회 실패를 0건으로 처리하지 않는다. 서버 저장과 실제 여러 사용자 간 통합 조회는 이 세 API를 구현한 뒤 검증해야 한다.
