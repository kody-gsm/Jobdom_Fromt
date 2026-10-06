# 학생 상담 상세·수정 및 신청 폼 제출 필터 구현 계획

> 작업 브랜치: `feat/student-consultation-details-form-filter`
> 기준 커밋: `31a3dc4` (`origin/main`)
> 범위: 학생 프론트엔드만

## 1. 상담 데이터 모델과 API 계약 반영

- `StudentReservation`에 상담 상세 표시용 필드를 추가한다.
- 상담 종류와 예약 ID를 안전하게 전달할 수 있도록 목록 아이템 모델을 정리한다.
- `createConsultationApi`에 course/common 수정 함수를 추가하고 최신 백엔드 `CreateDTO` 계약(`title`, `content`, `category`, `date`, `period`, `teacherId`)을 그대로 전송한다.
- API 오류를 기존 `ApiError` 흐름에 맞춰 사용자 메시지로 연결한다.
- 먼저 API와 모델의 단위 테스트를 작성해 WAITING 수정 요청과 상태별 동작을 고정한다.

## 2. 공통 상담 상세·수정 UI 구현

- 재사용 가능한 상담 상세 모달 컴포넌트를 만든다.
- 읽기 모드에는 유형, 선생님, 날짜, 교시, 분야, 제목, 내용을 표시한다.
- `WAITING`에서만 제목·분야·내용 입력 컨트롤을 표시한다.
- 저장 중 중복 제출을 막고, 성공 시 최신 상담 값을 부모에게 전달한다.
- 로딩·오류·취소·저장 성공 상태를 테스트한다.

## 3. 대시보드와 마이페이지 연결

- `SummaryActionCard`에 본문 선택 콜백을 추가하되 기존 취소 버튼 이벤트와 분리한다.
- 대시보드 미리보기·전체 보기 카드에 상세 모달을 연결한다.
- 마이페이지 상담 카드에 동일한 상세 모달을 연결한다.
- 저장 또는 외부 상태 변경 후 각 목록 캐시를 갱신한다.
- 기존 취소 확인 모달과의 이벤트 충돌 회귀 테스트를 추가한다.

## 4. 신청 폼 제출 여부 수집

- 폼 목록 모델에 프론트 전용 `submitted` 상태를 추가한다.
- 폼 목록을 받은 뒤 기존 `getMySubmission`을 폼별로 조회한다.
- 404는 미제출로 처리하고, 기타 오류는 전체 목록을 실패시키지 않도록 별도 상태로 보관한다.
- 컴포넌트 언마운트 이후 응답이 상태를 덮어쓰지 않도록 요청 수명과 최신성 검사를 둔다.

## 5. 제출 여부 필터와 카드 표시

- `FormListFilter`에 `SUBMITTED`를 추가한다.
- 기존 마감 상태 및 검색 조건과 함께 필터링되도록 순수 함수 테스트를 먼저 작성한다.
- 필터 메뉴에 `내가 제출한 폼`을 추가하고 기본값은 `ALL`로 유지한다.
- 제출 완료 배지와 `응답 확인` CTA를 추가한다.
- 로딩 중·빈 결과·개별 조회 실패 상태의 문구를 검증한다.

## 6. 검증

- 관련 단위 테스트를 먼저 실행한다.
- TypeScript 검사와 린트/빌드 검증을 실행한다.
- 기존 계약·준비 상태 하네스를 실행한다.
- 상담 상세, 대시보드, 마이페이지, 폼 필터의 변경 파일을 재검토한다.
- 최신 백엔드의 상담 수정 API 계약 의존성을 PR 본문에 명시한다.

## 예상 변경 파일

- `src/fsd/entities/consultation/**`
- `src/fsd/shared/ui/SummaryActionCard.tsx`
- `src/fsd/widgets/home-services/**`
- `src/fsd/widgets/profile-consultations/**`
- `src/fsd/pages/profile/**`
- `src/fsd/pages/forms/**`
- 상담 상세 모달을 위한 신규 feature/shared 파일
- 관련 `tests/unit/**`
