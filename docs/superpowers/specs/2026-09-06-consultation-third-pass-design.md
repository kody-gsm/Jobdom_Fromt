# 상담 신청 3차 개선 설계

## 목표

학생 상담 신청 UX를 참고 이미지 구조에 맞게 재구성하고, 신청/승인 상태를 백엔드 실제 상태와 일치시킨다.

이번 범위는 다음 요구를 모두 포함한다.

1. `수업 담당 선생님의 허가를 먼저 받아주세요.` 같은 혼란 문구 제거
2. 학생 상담 신청 화면의 강조색을 Jobdam main color `#02C551` 계열로 통일
3. validation error 발생 시 해당 입력/선택 영역을 빨간 테두리로 표시하고 자동 스크롤 + 포커스
4. 참고 이미지처럼 상담 내용과 일정 예약을 분리한 레이아웃으로 변경
5. 학생 신청은 즉시 확정이 아니라 `WAITING` 상태이고, 선생님 승인 후 `RESERVED`가 되어야 함

## 현재 확인된 구조

백엔드는 이미 상담 생성 시 `WAITING`, 선생님 승인 시 `RESERVED`, 거절 시 `CANCEL`로 상태를 관리한다.

- 학생 신청: `POST /student/course`, `POST /student/common`
- 선생님 승인: `PATCH /teacher/{kind}/allow/{id}`
- 승인된 예약 조회: `GET /teacher/{kind}`
- 대기 신청 조회: `GET /teacher/{kind}/pending`
- 선생님 목록: `GET /student/teachers`

현재 프론트의 핵심 문제는 선생님 페이지가 pending API를 읽지 않고, 학생 신청 payload에 실제 `teacherId`가 포함되지 않는 점이다.

## 화면 구조

데스크톱에서는 상담 신청 본문을 2열로 배치한다.

- 왼쪽: 상담 내용 작성
  - 상담 제목
  - 구체적인 고민 내용
  - 글자 수
- 오른쪽: 일정 예약
  - 상담 유형
  - 선생님 선택
  - 날짜 선택
  - 교시 선택
  - 취소 / 상담 신청 버튼

모바일에서는 같은 순서를 유지한 단일 열로 자연스럽게 쌓는다.

참고 이미지의 정보 구조와 밀도는 따르되, 기존 Jobdam Student UI의 헤더/카드/타이포그래피 체계는 유지한다.

## 색상 정책

학생 상담 신청의 선택/활성/주요 버튼은 `#02C551`을 기준으로 한다.
기존 학생 상담 화면에 남아 있는 `#10243E`, `#1B3555` 계열의 선택 강조는 제거한다.
Teacher/Admin 전역 스타일과 TeacherPage 전체 디자인은 이번 색상 정리의 대상이 아니다.

## Validation error UX

검증 결과는 단순 메시지 문자열만 반환하지 않고 화면 대상도 함께 식별할 수 있게 한다.

대상은 다음 다섯 가지로 제한한다.

- `title`
- `content`
- `teacher`
- `date`
- `period`

에러 발생 시 처리 순서는 고정한다.

1. 해당 영역에 error state 설정
2. 해당 input/textarea/group에 빨간 테두리 표시
3. `scrollIntoView({ behavior: "smooth", block: "center" })`
4. 입력 요소는 직접 `focus()`, 선택 그룹은 첫 활성 버튼으로 focus
5. 기존 toast error 메시지는 유지

사용자가 문제 필드를 수정하거나 선택하면 해당 필드의 error state만 즉시 해제한다.
서버 에러 중 날짜/교시 충돌로 명확히 판별 가능한 경우 일정 영역으로 이동한다. 그 외 서버 에러는 toast만 표시한다.

## 혼란 문구 정책

`수업 담당 선생님의 허가를 먼저 받아주세요.` 문구는 삭제한다.
학생이 별도 행동을 해야 하는 것처럼 오해시키는 보조 문구는 추가하지 않는다.

## 예약 상태와 교시 표시

학생 화면에서 사용 가능한 교시를 프론트 하드코딩만으로 판단하지 않는다.

백엔드에 학생이 조회 가능한 예약 불가 슬롯 API를 추가한다. 이 API는 선택한 선생님에 대해 다음 상태만 예약 불가로 반환한다.

- `RESERVED`
- `LOCKED`

`WAITING`은 아직 선생님 승인 전이므로 다른 학생의 신청만으로 슬롯 전체를 확정 차단하지 않는다.

학생 UI 규칙:

- 예약 불가 슬롯: 비활성화 + `예약 불가` 텍스트 표시
- 예약 가능한 슬롯: 별도 `예약 가능` 텍스트 표시 안 함
- 현재 선택 슬롯: 초록색 선택 스타일만 적용하고 `선택됨` 텍스트 표시 안 함

선생님 승인 직후 해당 슬롯이 `RESERVED`가 되므로 이후 학생 조회에서 자동으로 예약 불가로 반영된다.

## 선생님 선택과 신청 payload

선생님 목록은 `GET /student/teachers`의 실제 `id`, `name`을 사용한다.
프론트의 표시용 이름 상수만으로 teacher를 식별하지 않는다.

학생 신청 payload에는 반드시 `teacherId`를 포함한다.
일반 상담도 백엔드 계약상 담당 선생님이 필요하므로 동일한 선생님 선택 데이터 모델을 사용한다.
학생 폼의 선생님 모델은 하드코딩된 이름 union 대신 `{ id, name }` 옵션을 기준으로 바꾼다.

## 신청 → 승인 데이터 흐름

학생이 신청 버튼을 눌렀다고 예약이 확정된 것으로 표현하지 않는다.

1. 학생이 제목/내용/선생님/날짜/교시를 선택
2. `POST /student/{kind}` 호출
3. 백엔드는 예약을 `WAITING`으로 생성하고 담당 선생님에게 알림 전송
4. 학생 UI는 `상담 신청 요청을 보냈습니다`라고 안내
5. 선생님 페이지는 `GET /teacher/{kind}/pending`으로 WAITING 신청을 조회
6. 선생님이 승인하면 `PATCH /teacher/{kind}/allow/{id}` 호출
7. 백엔드는 해당 예약을 `RESERVED`로 변경하고 학생에게 승인 알림 전송
8. 이후 학생의 확정 상담/홈 예정 상담에는 `RESERVED`만 확정 예약으로 표현

학생 예약 응답에는 상태를 포함해 `WAITING`, `RESERVED`, `CANCEL`을 구분 가능하게 한다.
홈의 `예정 상담`은 `RESERVED`만 사용하고, 프로필 예약 목록은 `WAITING`을 `승인 대기`로 구분해 표시한다.

## 선생님 페이지 pending 연결

현재 TeacherPage는 승인 목록만 읽고 `requestData`를 빈 배열로 초기화한다. 이를 수정해 승인 목록과 대기 목록을 각각 읽는다.

- `GET /teacher/{kind}` → 승인 슬롯
- `GET /teacher/{kind}/pending` → 승인 대기 신청

pending 응답에는 승인 판단에 필요한 `reservation_id`, `name`, `student_number`, `title`, `content`, `date`, `period`를 포함한다.
승인 버튼은 기존 `/allow/{id}` 계약을 그대로 사용한다.

## 예약 불가 슬롯 API

학생 화면이 실제 예약 상태를 추측하지 않도록 백엔드에 학생용 조회 API를 추가한다.

예시 계약:

`GET /student/{kind}/unavailable?teacherId={id}`

응답은 최소 정보만 반환한다.

```json
[
  { "date": "2026-09-07", "period": "3교시" }
]
```

조회 대상은 해당 선생님의 `RESERVED`와 `LOCKED` 상태다.
`CANCEL`, `WAITING`, `AUTO`는 예약 불가 목록에 포함하지 않는다.

이 API는 학생 인증으로 접근 가능해야 하며, 다른 학생의 이름/상담 내용 같은 개인정보는 반환하지 않는다.

## 일반/진로 상담의 선생님 선택

백엔드가 두 상담 종류 모두 `teacherId`를 요구하므로 일반 상담과 진로 상담 모두 실제 선생님 선택을 제공한다.
진로 상담은 선택한 선생님에 따라 가능한 교시 목록이 달라질 수 있다.
일반 상담은 기존 일반 상담 교시 목록을 유지하되, 선택한 선생님의 예약 불가 상태는 동일하게 적용한다.

## 승인 시 슬롯 충돌 처리

같은 선생님/날짜/교시에 여러 `WAITING` 신청이 존재할 수 있다. 선생님이 한 건을 승인할 때는 트랜잭션 안에서 같은 슬롯의 기존 `RESERVED`/`LOCKED`를 다시 확인한다.

- 이미 `RESERVED` 또는 `LOCKED`가 있으면 승인 실패
- 승인 성공 시 선택한 신청만 `RESERVED`
- 같은 슬롯의 나머지 `WAITING` 신청은 `CANCEL`로 전환해 중복 승인 가능성을 제거
- 자동 취소된 학생에게는 거절/마감 의미의 기존 상담 알림 체계를 사용

이 규칙으로 프론트의 `예약 불가` 표시와 실제 승인 결과가 일치한다.

## TeacherPage 상담 종류 처리

5번 요구는 일반/진로 상담 모두에 적용한다. TeacherPage 전체 디자인을 갈아엎지는 않고 기존 예약 관리 영역에 상담 종류 전환만 추가한다.

- `진로 상담` → `course`
- `일반 상담` → `common`
- 활성 종류에 따라 approved + pending 목록을 다시 조회
- 승인 시 `approveConsultation(activeKind, reservationId)` 사용

기존 취업 공고/폼/관리자 영역은 변경하지 않는다.

## 테스트 전략

프론트는 TDD로 다음 계약을 먼저 RED로 만든다.

- validation message → error target 매핑
- error target에 빨간 테두리와 focus target이 존재
- `scrollIntoView` + `focus` 처리
- 문제 값을 수정하면 해당 error target 해제
- 혼란 문구 미포함
- 학생 상담 신청의 선택/submit main color 사용
- `예약 불가`만 상태 텍스트로 노출하고 `예약 가능`, `선택됨` 미노출
- 실제 `teacherId`가 신청 payload에 포함
- TeacherPage가 pending API를 호출
- 학생 확정 상담에서 `WAITING`을 확정으로 취급하지 않음

백엔드는 다음 동작을 단위/통합 테스트한다.

- 생성 시 `WAITING`
- 승인 시 `RESERVED`
- pending endpoint는 `WAITING`만 반환
- approved endpoint는 `RESERVED`만 반환
- unavailable endpoint는 `RESERVED + LOCKED`만 반환
- 동일 슬롯 중복 승인 차단 및 나머지 WAITING 정리
- unavailable 응답에는 개인정보가 없음

최종 프론트 검증은 `harness:contracts`와 전체 17-step harness/build를 사용한다.
백엔드는 기존 Gradle 테스트 전체를 실행한다.

## 명시적 비범위

- Teacher/Admin 전체 리디자인
- 상담 승인 상태 머신 자체를 다른 모델로 교체
- 알림 시스템 구조 변경
- 상담 메모 기능 개편
- 이미지의 `예약 가능`, `선택됨` 텍스트 복제

## 완료 기준

학생 신청 화면은 참고 이미지와 같은 2열 정보 구조를 사용하고 main color로 통일되어야 한다.
잘못된 제출은 첫 오류 영역을 빨간 테두리로 표시하고 그 위치로 이동해 포커스해야 한다.
학생의 제출은 `WAITING`으로 남고, 선생님 페이지에서 승인된 뒤에만 `RESERVED` 확정 상담으로 나타나야 한다.
학생 일정에는 실제 `RESERVED`/`LOCKED` 슬롯만 `예약 불가`로 표시되어야 한다.
프론트 전체 harness와 백엔드 전체 테스트가 모두 통과해야 한다.
