---
doc: spec
status: approved
updated: 2026-10-26
approved: 2026-10-26
---

# SettleK — 구현 설계

## How This Works, In Plain Language

기존 개인용 SettleK의 디자인·아홉 화면·메뉴·동작을 새 코드로 만든다. 상황을 입력하면 AI가 설명을 정리하고 공식 자료에 연결된 준비 목록을 제공한다. 사용자가 서류 준비와 재사용을 확인하고 기록을 기기 또는 계정에 저장해 이어간다. 직접 확인한 일정은 캘린더로 내보낸다.

기존 앱은 그대로 보존한다. 새 앱은 별도 주소와 저장 공간을 사용한다. 기존 코드나 사용자 기록을 복사하지 않으며, 공식 자료는 현재 조건을 다시 확인한다.

## Where It Runs and How Someone Tries It

- 개발: 이 프로젝트의 `web/`에서 Node 24로 실행한다. 설치 후 `npm run dev -- --port 4189 --hostname 127.0.0.1`, 접속 주소는 `http://127.0.0.1:4189`다. 구현 후 실제 명령을 검증해 README에 적는다.
- 배포: 기존과 별도의 Sites 웹 앱으로 만들고 처음에는 소유자 비공개로 배포한다. 기존 사이트와 기록은 변경하지 않는다.
- 계정: 배포 환경의 ChatGPT 로그인을 이용한다. 로컬 개발용 로그인과 실제 계정 검증을 구분한다.
- AI: 기존과 같은 Nebius의 NVIDIA Nemotron을 사용한다. 새 앱의 실제 응답을 확인한 뒤 연결 성공으로 기록한다.
- 제출: 실행 소스·계획 문서를 포함한 공개 저장소와 짧은 데모 영상을 준비한다. 배포만으로 제출이 완료되지는 않는다.

## Stack

| 부분 | 구현 제안 | 목적 |
|---|---|---|
| 화면 | Sites의 Vinext/React 기본 프로젝트, TypeScript, 직접 작성한 CSS | 기존 디자인과 아홉 화면 구현 |
| 서버 | Cloudflare Workers | AI 키 보호와 사용자별 요청 처리 |
| 계정 저장 | Sites D1, Drizzle 스키마·마이그레이션 | 계정에 기록 저장·불러오기 |
| 기기 저장 | 버전이 있는 브라우저 저장 형식 | 로그인 전에도 이어 쓰기 |
| AI | Nebius의 NVIDIA Nemotron | 설명에서 사실·두 언어 요약 추출; 규칙이 할 일·이유·순서를 결정 |
| 일정 | 사용자 입력 날짜·iCalendar 파일 | 일반 캘린더에서 활용 |
| 설치 | 웹 앱 manifest·기기별 설치 안내 | 휴대폰 홈 화면에서 접근 |

공식 문서: [Vinext](https://github.com/cloudflare/vinext), [React](https://react.dev/learn), [Workers](https://developers.cloudflare.com/workers/), [Drizzle와 D1](https://orm.drizzle.team/docs/get-started/d1-new), [브라우저 저장](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), [웹 앱 manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest), [iCalendar](https://www.rfc-editor.org/rfc/rfc5545).

## Look and Feel

Implements `prd.md > Screens and Layout`, `Look and Feel`.

기존 앱의 회백색 배경 `#f7f8f4`, 짙은 글자 `#14211b`, 초록색 버튼 `#173f36`, 연두색 강조 `#bdf56a`, 옅은 파랑 `#dbe8ff`를 재현한다. SettleK 로고, 큰 홈 제목, 오른쪽 여정 카드, 둥근 흰색 카드와 여백을 기준으로 비교한다. 휴대폰에서는 세로 배치와 하단 메뉴를 제공한다. 개인용 화면에 HR 메뉴를 넣지 않는다.

## Components

### Navigation and Screens

Implements `prd.md > Screens and Layout`, `앱 설치와 두 언어`.

`/`, `/planner`, `/questions`, `/plan`, `/documents`, `/records`, `/sources`, `/reminders`, `/install`을 각각 제공한다. 직접 접속·새로고침·뒤로 가기에 대응하고 화면 간 입력과 언어 설정을 유지한다. 예시 버튼은 가상 사례임을 표시하며 누른 것만으로 유료 AI를 호출하지 않는다.

### Situation and Questions

Implements `prd.md > 상황 입력과 수정`, `상황 이해와 추가 확인`.

현재 상태·체류자격·만료일·목표·지역·생활 변화·선택 답변·보유 기록을 정규화한다. 학생으로 대상을 고정하지 않는다. 모르는 값은 별도로 유지하고, 이미 아는 정보는 다시 묻지 않는다. 메모에서 파악한 사실과 선택 답변이 충돌하면 해당 값만 확인한다. 메모의 외부 전송에는 별도 동의를 받는다.

### AI Analysis and Grounded Plans

Implements `prd.md > 상황 이해와 추가 확인`, `개인화된 전체 준비 목록`.

서버가 AI에서 제한된 형식의 사실·두 언어 요약을 받아 검증하고, 공식 자료에 연결된 준비 규칙과 결합한다. AI는 주거·취업·학업·사회통합의 허용된 값과 메모 근거만 추출한다. 할 일·서류·이유·순서는 앱의 규칙이 결정한다. AI가 임의 URL·법정 기한·필수 서류를 확정하지 않게 한다. 실제 성공·명시적인 예시 모드·연결 불가를 구분한다. 실패 시 기존 입력과 이전 결과를 유지하며 새 성공처럼 표시하지 않는다.

### Document Preparation

Implements `prd.md > 개인화된 전체 준비 목록`, `공식 출처와 준비 방법`, `보유 기록과 준비 상태`.

관련 서류를 중복 제거한 전체 목록과 미완료 필터로 제공한다. 각 카드의 이유에서 관련 준비 목적을 확인한다. 항목마다 이유·받는 곳·준비 단계·공식 링크·요청문을 연결한다. 준비 전·준비 중·준비 완료, 보유, 이번 신청의 재사용 확인을 구분한다. 조건 변경 시 필요한 항목만 재확인한다. 인쇄와 상태 저장·불러오기를 제공한다.

### Personal Records and Account Storage

Implements `prd.md > 계정 저장과 백업`, `보유 기록과 준비 상태`.

기기 상태는 즉시 저장하고 계정 저장은 사용자가 선택할 때 수행한다. 서버가 제공한 사용자 ID로 읽기·쓰기를 제한하며 클라이언트의 사용자 ID를 신뢰하지 않는다. 저장 버전으로 충돌을 감지한다. 메모·AI 응답 원문·키는 계정 저장에서 제외한다. 백업·기기 삭제·계정 삭제를 구분하고, 불러오기나 삭제가 바꾸는 범위를 먼저 표시한다.

### Source Library

Implements `prd.md > 공식 자료 찾기와 상황 대조`, `공식 출처와 준비 방법`.

기관·제목·URL·확인 시점·적용 조건·관련 항목을 관리한다. 검색과 상황 대조는 검토한 공식 자료를 대상으로 한다. 실시간 전체 웹 검색으로 표시하지 않는다. 모호하거나 오래된 자료는 확정 요건으로 사용하지 않는다.

### Reminders and Calendar

Implements `prd.md > 일정과 캘린더`.

사용자가 확인한 날짜·종류·관련 할 일·미리 표시할 기간·출처 링크를 저장한다. 등록·수정·완료·되돌리기를 제공한다. 제목을 안전하게 이스케이프한 iCalendar 파일로 내보낸다. 자체 푸시·문자·이메일은 제공하지 않으며, 캘린더 알림은 사용자 캘린더 설정에 따른다.

### Install and Language

Implements `prd.md > 앱 설치와 두 언어`.

이름·아이콘·시작 경로를 manifest에 선언한다. 설치 이벤트를 제공하는 브라우저에서 설치 버튼을 활성화하고 iPhone에는 홈 화면 추가 방법을 안내한다. 한국어·영어 메뉴·질문·결과·저장·오류 문구를 제공한다. 네트워크 없이 AI·계정 저장이 된다고 표시하지 않는다.

## Data Model

| 자료 | 핵심 내용 | 보관 범위 |
|---|---|---|
| Profile / Answers | 체류·목표·생활 변화·확인값·출처 | 브라우저, 명시적으로 저장한 계정 |
| Note | 선택 설명 | 메모리 또는 허용한 기기 저장; 계정 제외 |
| Plan | 항목·이유·출처·다음 행동·생성 상태 | 브라우저; 계정에는 제한된 재구성 상태 |
| Preparation | 진행도·보유·재사용 확인·신청 상황 | 브라우저, 계정 |
| Reminder | 제목·날짜·유형·관련 항목·완료 | 브라우저, 계정 |
| Source | 공식 자료·적용 조건·확인 시점 | 공개 자료 파일 |
| Generation / Usage | 제공자·모델·요청 ID·토큰·호출 예약 | 응답 메타데이터·검증 파일; D1에는 공용 요청 예산만 저장 |

## File Structure

```text
build ai 대회/
├── devpost/
│   ├── learner-profile.md       # 공개 제외
│   ├── scope.md / prd.md / spec.md
│   ├── parity.md                # 기능별 구현·검증 비교
│   └── checklist.md             # 단계 진행과 직접 사용 확인
├── web/                         # 별도 Sites 앱
│   ├── app/
│   │   ├── page.tsx             # 홈
│   │   ├── [screen]/page.tsx    # 여덟 작업 화면
│   │   ├── components/          # 메뉴·폼·카드·상태
│   │   ├── api/                 # AI·계정·상태
│   │   ├── state.tsx            # 기기 상태·저장·두 언어 설정
│   │   └── globals.css          # 기존 디자인 재현
│   ├── lib/
│   │   ├── planner.ts           # 질문·조건별 준비 목록
│   │   ├── preparation.ts       # 상태·재사용·변경
│   │   ├── ai.ts                # 서버 AI 호출
│   │   ├── calendar.ts          # 일정·내보내기
│   │   └── records.ts           # 계정 검증·저장·버전
│   ├── data/                    # 재검토한 출처·안내
│   ├── db/                      # D1 스키마·연결
│   ├── drizzle/                 # 순차 마이그레이션
│   ├── public/                  # 아이콘·manifest
│   ├── tests/                   # 주요 동작 검증
│   ├── scripts/                 # 실행·실제 연결 확인
│   ├── .openai/hosting.json      # 새 앱 식별자
│   ├── .dev.vars.example        # 값 없는 서버 설정 예시
│   └── package.json
├── docs/verification.md          # 실제 수행한 검증만 기록
├── README.md / LICENSE
└── .gitignore
```

공개 제출 저장소에 계획 문서와 실행 소스를 함께 포함한다. Sites 배포용 소스에도 공개 가능한 계획 문서를 넣되 개인 시작 기록은 제외한다. 기존 앱의 구현·Git 기록·사용자 데이터는 가져오지 않는다.

## External Services and Dependencies

### Nebius Token Factory

- 서버 요청: `POST https://api.tokenfactory.nebius.com/v1/chat/completions`.
- 서버 전용 `NEBIUS_API_KEY`, 모델 `nvidia/nemotron-3-super-120b-a12b`.
- 상황·선택 답변을 보내며 메모 원문은 별도 동의가 있을 때만 포함한다. 보유 서류 목록을 별도로 보내지 않는다.
- JSON 구조·허용 사실·출처 연결을 검증하고 모델·요청 ID·사용량을 실제 연결 근거로 기록한다.
- 시간·본문 크기·동시 요청 제한, 유료 자동 재시도 없음. 화면 열기·언어 변경·완료·저장은 AI를 호출하지 않는다.
- 데이터베이스별 전체 실제 요청 상한 20회를 적용한다. D1에서 원자적으로 예약해 여러 요청과 재시작으로 우회되지 않게 한다. 임의 증액·충전은 하지 않는다. 요청 수 제한은 계정 전체의 달러 지출 상한을 보장하지 않는다.

[요청·인증](https://docs.tokenfactory.nebius.com/api-reference/introduction), [JSON 응답](https://docs.tokenfactory.nebius.com/ai-models-inference/json), [호출 제한](https://docs.tokenfactory.nebius.com/ai-models-inference/rate-limits). 실제 호출 전에 현재 모델 가용성과 계정 설정을 확인한다.

### Identity and API

- `GET /api/status`: 설정·요청 한도. 키 원문 제외.
- `POST /api/analyze`: 상황·동의를 검증한 실제 분석.
- `GET/PUT/DELETE /api/records`: 로그인한 본인의 기록만 처리. 변경은 동일 출처를 검증.
- 공식 자료 검색·대조는 `data/catalog.ts`를 브라우저에서 필터링한다. 별도 `/api/sources` API는 없다.
- 계정·AI 응답은 공개 캐시하지 않고 요청 원문을 운영 로그에 출력하지 않는다.

## 입력 보존과 다시 시도

AI나 저장 연결이 중단돼도 입력과 마지막 계획을 유지한다. 이전 결과를 새 성공으로 표시하지 않는다. 중복 요청을 차단하고 사용자가 다시 시도하게 한다. 저장 실패를 저장 완료라고 표시하지 않는다.

## What Was Simplified and Why

기존 개인용 기능을 축소하지 않는다. 기존과 같은 한계는 유지한다: 서류 원본 자동 판독·기관 신청 대행·전 비자 자격 판정·실시간 전체 웹 검색·자체 푸시 알림은 포함하지 않는다. 계정 저장은 명시적인 저장·불러오기이며 실시간 공동 편집은 아니다.

## 검증 방법

1. 기존 아홉 화면과 디자인·메뉴·직접 접속·뒤로 가기 비교.
2. 근로자·구직자 등 다른 가상 사례의 실제 AI 응답과 상황별 목록 차이 확인.
3. 전체 서류·준비 방법·요청문·보유·재사용·완료 되돌리기 확인.
4. 재접속, 계정 저장·불러오기, 다른 사용자 접근 차단, 백업·삭제 확인.
5. 일정 등록·수정·완료와 캘린더 날짜·제목 확인.
6. 한국어·영어·휴대폰 화면·설치 설정 확인.
7. 공개 소스와 로그의 키·개인 원문 제외 확인.
8. 직접 사용한 의견을 반영한 뒤 완성된 흐름을 촬영.

## Decisions and Open Issues

- 제품 기준: 한국 거주 외국인 전체를 위한 기존 개인용 SettleK와 같은 기능·디자인·흐름.
- 구현 제안: 별도 Sites 앱, D1 계정 저장, 기존과 같은 Nebius/Nemotron, 새 코드.
- 실제 AI 응답과 소유자 비공개 배포를 확인했다. 환경별 계정 저장 등 상세 검증 범위는 `docs/verification.md`를 기준으로 한다.
- 언어 문구는 화면·규칙·자료 파일에 한국어/영어 쌍으로 둔다. 다른 언어 입력·번역은 현재 포함하지 않는다.
- 기능별 공식 자료를 다시 확인한다. 불명확한 조건을 확정 요건으로 만들지 않는다.
- 같은 기능을 새로 구현한다는 것은 기존 코드나 기록을 복사하거나 과거 작업일을 바꾸는 것이 아니다.


## 최종 보완 — 2026-10-26

사용자 요청에 따라 직전 완성한 계획과 변경 후 서류를 추가·제외·재확인·유지로 비교한다. 비교용 프로필은 메모를 제외해 이 기기에만 보관하고 계정 불러오기·새 예시에서 초기화한다. E-7-1·E-7-4·D-10-1·F-2·F-6 공식 확인 안내를 추가하며 F-2/F-6에 일반 E 계열 고용주 서류를 일괄 적용하지 않는다. 확인한 출처는 15개이며 자료별 범위·확인일을 표시한다. 실제 외국인 사용 확인은 참여자가 없어 미실시이며 기술 검증과 구분한다.
