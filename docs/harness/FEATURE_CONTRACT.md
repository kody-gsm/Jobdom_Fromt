# Feature Contract

이 문서는 FSD migration/rebuild 중 반드시 유지해야 하는 사용자 기능 기준선이다. 실제 feature 작업 전 관련 코드와 API 명세를 확인해 세부 contract를 확장한다.

## Auth

- 로그인 성공/실패 흐름을 유지한다.
- 회원가입과 이메일 인증 흐름을 유지한다.
- 비밀번호 재설정 흐름을 유지한다.
- 로그인 유지, 세션 저장, reissue 동작을 유지한다.
- 사용자 role에 따른 접근/이동 규칙을 유지한다.

## Consultation

- 진로 상담과 일반 상담 신청을 유지한다.
- 선생님/날짜/교시 선택 규칙을 유지한다.
- 진로 상담 중복 신청 제한을 유지한다.
- 취소 시 입력을 버리고 홈으로 이동하는 동작을 유지한다.
- 기존 API payload 의미를 유지한다.

## Recruit / Forms

- 취업 공고 조회 흐름을 유지한다.
- 공고와 지원 폼 연결 규칙을 유지한다.
- 동적 폼 조회/응답/검증 흐름을 유지한다.

## Profile / Navigation

- 사용자 정보와 로그아웃 흐름을 유지한다.
- 기존 핵심 route 의미와 권한 경계를 유지한다.

## Teacher

Teacher는 기능 contract뿐 아니라 기존 UI 의미와 interaction도 보존한다. FSD migration 전 현재 동작을 characterization/regression으로 고정하고, migration 후 동일 contract를 다시 통과시킨다.

허용되는 변화는 구조 이동, 파일 분리, import/public API 정리 중심이다. Teacher redesign과 business rewrite는 별도 사용자 승인 없이는 수행하지 않는다.
