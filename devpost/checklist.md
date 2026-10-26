---
doc: checklist
status: approved
updated: 2026-10-27
approved: 2026-10-26
---

# SettleK — 제작 순서

Build mode: fast — 구현·검증을 이어서 진행하고 모든 기능이 연결된 최종본에서 직접 사용 의견을 받는다.

## Slices

- [x] **1. 기존 화면에서 상황을 입력하고 실제 맞춤 계획 받기**
  Becomes usable: 기존 디자인의 홈·입력·질문·계획에서 가상 사례를 입력하고 실제 AI와 공식 자료에 연결된 목록을 받는다.
  Why now: 개인화가 작동하는지 먼저 확인해야 이후의 서류·기록·일정이 올바른 결과를 이어받는다.
  PRD ref: `prd.md > The Core Journey`, `상황 이해와 추가 확인`, `개인화된 전체 준비 목록`
  Spec ref: `spec.md > Navigation and Screens`, `Situation and Questions`, `AI Analysis and Grounded Plans`, `Look and Feel`
  Build: 새 실행 환경, 기본 화면·언어, 검토한 출처와 조건별 규칙, 실제 Nebius 연결, 누락·충돌 질문, 계획과 생성 상태를 구현한다.
  Verify (mechanical): 두 가상 사례의 실제 응답·목록 차이, 반복 질문 방지, 요청 한도·키 비노출 확인; 브라우저에서 홈→입력→질문→계획 완료.
  Learner check: 새 앱이 기존과 같은 느낌인지 보고 가상 사례의 조건을 바꿨을 때 목록이 달라지는지 확인한다.
  Commit: `Build SettleK situation flow and grounded AI plans`

- [x] **2. 서류 준비와 기록을 계정에 저장해 이어가기**
  Becomes usable: 전체 서류의 방법·출처를 확인하고 여러 항목을 준비하며 보유·재사용·완료 기록을 저장하고 불러온다.
  Why now: 검증한 계획에 준비 상태를 연결해 반복 입력을 줄이는 핵심 경험을 완성한다.
  PRD ref: `prd.md > 공식 출처와 준비 방법`, `보유 기록과 준비 상태`, `계정 저장과 백업`, `공식 자료 찾기와 상황 대조`
  Spec ref: `spec.md > Document Preparation`, `Personal Records and Account Storage`, `Source Library`, `Data Model`
  Build: 서류·기록·자료 화면, 준비 방법·요청문, 변경 시 재사용 재확인, 기기 저장, 계정 저장·불러오기, 백업·삭제·접근 분리를 구현한다.
  Verify (mechanical): 두 항목 동시 준비·완료 되돌리기, 조건 변경 재확인, 새로고침 복원, 별도 세션 불러오기, 타인 접근 차단, 백업과 민감 원문 제외 확인.
  Learner check: 서류 두 개의 상태를 바꾸고 다시 열어 남아 있는지, 준비 방법과 공식 자료를 찾기 쉬운지 확인한다.
  Commit: `Add document preparation and private saved records`

- [x] **3. 일정·설치·전체 화면을 완성하고 기존 앱과 비교하기**
  Becomes usable: 아홉 화면에서 일정·캘린더와 휴대폰 설치·두 언어까지 사용할 수 있다.
  Why now: 핵심 준비와 저장을 검증한 뒤 일상에서 다시 들어오는 흐름을 연결하고 전체 경험을 비교한다.
  PRD ref: `prd.md > 일정과 캘린더`, `앱 설치와 두 언어`, `완료 확인 기준`
  Spec ref: `spec.md > Reminders and Calendar`, `Install and Language`, `검증 방법`
  Build: 일정 등록·수정·완료·내보내기, 설치 설정, 두 언어·휴대폰 화면, 별도 비공개 배포, README·라이선스·실제 검증 기록을 완성한다.
  Verify (mechanical): 캘린더 날짜·제목·형식, 설치 설정, 두 언어와 휴대폰 브라우저, 기능 비교표 전체, 배포 결과와 해당 환경의 실제 검증 범위 확인.
  Learner check: 기존 앱과 비교하며 처음 입력부터 저장·재방문까지 사용하고 다른 점이나 불편을 알려준다.
  Commit: `Complete reminders install and SettleK parity checks`

## Hands-on Checkpoints

- Early checkpoint: 첫 작동 화면을 제시했고, 전체 기능 완성 후 한 번에 검토하는 방식으로 변경했다. 직접 사용 완료로 기록하지 않는다.
- [x] Final kick-the-tires exploration and feedback completed — 제작자가 실제 배포 앱을 사용하고 아홉 화면·기록·일정의 흐름을 녹화했다. 질문 표시와 버튼 안내에 관한 피드백을 반영했다.

## Final Review

- [x] Final app review complete — 구직 중 → 채용 제안의 변경 예시를 승인하고 직접 녹화했다. 공개 저장소·영상 URL·최종 제출 확인은 별도 제출 체크리스트에 남긴다.

## Code Tour and App Map

- [x] Learning activity complete — 실제 사용과 안내를 통해 상황 입력 → AI 사실 추출 → 필요한 질문 → 준비 목록의 흐름을 확인했다. 메모를 분석하는 AI 요청과 선택 답변만 갱신하는 동작의 차이를 설명했다. 코드 편집 실습으로 기록하지 않는다.
- [x] Optional edit and transfer reflection addressed — 별도 편집 과제를 추가하지 않고 사용 피드백·촬영을 통한 확인 후 제출 준비로 이동했다.
- [x] `devpost/app-map.html` generated from finished code, checked, and shown

세 제작 단계의 구현·비공개 배포·제작자 사용 검토를 완료했다. 학습 확인은 실제 사용 안내와 앱 지도에 근거한 정리이며, 별도 코드 편집 실습이나 외부 사용자 시험으로 기록하지 않는다.

## Revisions

- 중간 직접 사용 확인을 최종 검토로 합쳤다. 모든 기능을 연결한 완성본에서 수정 의견을 받는다.

## Completion evidence

- 82 자동 검사·타입 검사·배포용 빌드 통과. 서류 준비·계정 저장과 복원·일정 등록/완료/되돌리기/캘린더 내보내기를 로컬 브라우저에서 확인했다.
- 비공개 배포 성공. 배포 환경의 AI 설정·DB 연결·인증 없는 기록 접근 차단을 확인했다. 소유 계정의 Chrome에서 실제 AI·충돌 확인·서류 준비·계정 저장/불러오기·백업·일정 내보내기까지 확인했다.
- devpost/app-map.html은 실제 구현을 바탕으로 작성하고 경로·오프라인 구성을 검사한 뒤 제작자에게 제시했다.
- 제작자의 녹화에는 실제 AI 응답, 서류 2개 추가·1개 제외, 기존 임대차계약서 준비 상태 유지, 일정의 캘린더 가져오기, 계정 저장 v4 성공이 포함된다. 상세 환경별 결과는 `docs/verification.md`를 기준으로 한다.

- Situation-change revision: added/removed/recheck/carried-forward comparison and five status-specific official-check cards verified mechanically and in the creator's recorded flow. Actual external-user testing remains unperformed; a protocol is ready.
