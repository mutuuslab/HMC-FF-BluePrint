# 7장. 개발 방법론 전환

> **제3편. 운영 모델** | 대상 독자: C-Level, CTO, 개발조직장, PMO

---

## 7.1 자동차 전통 개발 방법론 (V-Model / Waterfall)

**현재 HMC의 양산 개발 기저에 깔려 있는 방법론.** ASPICE·ISO 26262가 전제하는 순차적 검증 구조.

### V-Model 개발 사이클

| 단계 | 활동 | 산출물 | 소요 | 관여 조직 |
|---|---|---|---|---|
| 요구사항 정의 | 시스템/SW 요구분석, ASIL 할당 | SRS, SSS, Safety Plan | 3~6개월 | 시스템팀, 기능안전팀 |
| 아키텍처 설계 | HW/SW 분할, AUTOSAR 구성 | SAD, ICD, arxml | 2~4개월 | 아키텍처팀 |
| 상세 설계/구현 | 코딩, 캘리브레이션, NVM 세팅 | 소스코드, Cal Data | 3~6개월 | SW 개발팀, 협력사 |
| 단위 검증 | 모듈 테스트, 정적분석, MISRA | Unit Test Report | 1~2개월 | 개발팀, QA |
| 통합 테스트 | SIL/MIL, 다중 ECU 통합 | Integration Report | 2~3개월 | 통합검증팀 |
| 시스템 검증 | HIL, 실차 테스트, 환경 시험 | Validation Report | 3~6개월 | 검증팀 |
| 양산 릴리스 | SOP, 형식승인 | PPAP, RXSWIN | SOP 기점 | 품질, 규제, 생산 |

**전체 사이클: 18~36개월** (차종 프로그램 단위)

### 구조적 특성

- **순방향 1회, 역방향 1회** — 각 단계가 이전 완료를 전제
- **변경 비용 기하급수 증가** — 후반 발견 시 전체 재수행
- **릴리스 = SOP** — SOP 이후 변경은 ECN → 리콜/캠페인
- **피드백 루프 부재** — 고객 데이터 반영까지 2~4년 (다음 차종)
- **조직이 V에 맞춰 고정** — "벽 너머로 던지기" 패턴

### V-Model이 여전히 유효한 영역

- ASIL C/D Safety-critical (AEB, LKA, EPS)
- 형식승인 대상 (RXSWIN, R79/R13/R157)
- HW-SW 결합도 높은 ECU 펌웨어
- 협력사 납품 SW (계약 기반)

---

## 7.2 Agile & Test-driven (현재 HMC 전환 중)

V-Model 한계를 극복하기 위해 도입 중이나, **출시(Launch)는 여전히 Big-bang**.

### 사이클 구조

```
Marketing·Design·Engineering 합동 계획 (1회)
    ↓
  [ Build → Test ] × N회 반복 (스프린트 2~4주)
    ↓
  Launch (전체 완성 후 1회)
    ↓
  Feedback (출시 후 수집)
```

### V-Model 대비 개선점

| 관점 | V-Model | Agile |
|---|---|---|
| 개발 주기 | 18~36개월 | 2~4주 스프린트 |
| 테스트 시점 | 구현 완료 후 | 매 스프린트 자동화 |
| CI/CD | 수동 빌드 | Jenkins/GitLab 자동 |

### 여전히 남아 있는 한계

- Launch는 맨 끝에 1회 (All-or-nothing)
- 내부 테스트 ≠ 프로덕션 (실제 시장 피드백 없음)
- 부분 롤백 불가
- 비엔지니어링 부서 참여 구조적 불가

---

## 7.3 Feature Flag-driven Development (Target)

### 사이클 구조

```
[ Marketing·Design·Engineering 수렴 → Plan
    ↓
  Build (코드 + Feature Flag wrapping)
    ↓
  Test (SIL/HIL + 프로덕션 카나리)
    ↓
  Launch (소규모 세그먼트)  ← 매 반복마다
    ↓
  Feedback (실제 시장 데이터) ← 매 반복마다
    ↓
  다시 수렴 → 다음 Plan ]
  × 반복
```

핵심 전환: **"모든 신규 기능을 FF로 감싸는 것"이 팀의 기본 관행(Lean release cadence)으로 제도화.**

---

## 7.4 3단계 비교 총괄표

| 관점 | V-Model (전통) | Agile (현재) | FF-driven (Target) |
|---|---|---|---|
| 개발 사이클 | 18~36개월 | 2~4주 스프린트 | 2~4주 (동일) |
| 계획 주체 | 시스템팀 단독 | 3팀 1회 합동 | **매 반복마다** 3팀 수렴 |
| Build 방식 | 순차 | 스프린트 반복 | 스프린트 + **FF wrapping** |
| Test 환경 | SIL/HIL/실차 | SIL/HIL + 자동화 | SIL/HIL + **프로덕션 카나리** |
| Launch 시점 | SOP 1회 | 개발 완료 후 1회 | **매 반복마다** 소규모 |
| Launch 대상 | 전체 양산 | 전체 fleet | **0.1%→1%→100%** 점진 |
| Feedback 원천 | 다음 차종 (2~4년) | 출시 후 CS/VOC | **실시간 텔레메트리+A/B** |
| 실패 대응 | ECN→리콜 | OTA 재배포 (수시간) | **플래그 Off (<5분)** |
| 부분 롤백 | 불가 | 불가 | **코호트 단위 가능** |
| 비엔지니어링 참여 | 불가 | 제한적 | **매 사이클 직접 참여** |
| Safety 대응 | V-Model 고유 강점 | V-Model 병행 | **ASIL 3트랙 승인 내장** |
| 기능 완성도 | 100% 필수 | 100% 필수 | **80%도 FF 뒤 출시 가능** |
| 학습 속도 | 수년 | 수개월 | **수주** |

---

## 7.5 브랜칭 전략 전환: Gitflow → Trunk-Based + Feature Flag

FF-driven 개발이 동작하려면 **브랜칭 전략도 함께 바뀌어야** 한다.

### 비교: Gitflow vs Trunk-Based Development

| 관점 | Gitflow (현재 일부 팀) | Trunk-Based + FF (Target) |
|---|---|---|
| 브랜치 수명 | 수주~수개월 (feature/release/hotfix) | **수시간~1~2일** (short-lived만) |
| 주요 브랜치 | main, develop, feature, release, hotfix | **main/trunk 단일** |
| Merge 빈도 | 기능 완성 시 1회 | **하루 수 차례** |
| Conflict 리스크 | 높음 — 코드 분기가 쌓임 | **낮음** — 작고 빈번한 merge |
| CI/CD 적합성 | 적응 필요 (stabilization phase 발생) | **네이티브 지원** |
| 릴리스 방식 | 예정된 버전 릴리스 | **연속 배포 (continuous delivery)** |
| 미완성 기능 처리 | feature 브랜치에 격리 | **FF 뒤에 숨겨서 trunk에 merge** |
| 코드 리뷰 크기 | 대형 PR (수백~수천 줄) | **소형 PR (50~200줄)** — 70~90% 결함 발견율 |
| DORA 성과 | 하위 | **엘리트** (일 수회 배포) |

> Google은 25,000+ 개발자가 단일 monorepo trunk에서 작업하며 3,500만 커밋을 넘겼다.

### Trunk-Based의 핵심 이점

- **빠른 피드백 루프** — 수주가 아니라 수시간 내 문제 발견, 컨텍스트가 신선할 때 수정
- **Merge conflict 최소화** — 짧은 브랜치가 trunk에 가깝게 유지되어 코드 분기 최소
- **협업 향상** — 모두가 같은 trunk에서 작업하므로 다른 팀이 무엇을 빌드하는지 가시성 확보
- **단순한 브랜치 관리** — 다중 장기 브랜치 추적 불필요, 개발자가 코드에 집중
- **작은 코드 리뷰** — 50~200줄 PR로 리뷰 품질 향상 (SmartBear 연구: 200~400줄, 60~90분 리뷰 시 70~90% 결함 발견)
- **CI/CD 네이티브 정렬** — DORA 연구에서 엘리트 팀은 일 수회 배포, Trunk-Based가 이를 자연스럽게 지원

### Trunk-Based의 전제조건

- **개발 규율 필수** — 작고 테스트 가능한 독립적 변경, push 전 로컬 빌드 실행
- **강력한 자동화 테스트** — trunk에 즉시 도달하므로 자동 테스트가 1차 안전망
- **Feature Flag 인프라** — 미완성 기능이 프로덕션에 존재하므로 FF 없이는 사용자 노출 리스크
- **대규모 팀의 조율 투자** — Google 규모에서는 tooling과 프로세스 투자 필수

### Feature Flag가 Trunk-Based를 가능하게 만드는 방법

FF는 trunk-based development의 핵심 리스크(미완성 기능 노출)를 제거하는 핵심 기술:

1. **Deploy와 Release 분리** — 코드 배포는 저위험 작업(코드를 제자리에 옮기기), 고위험 Release 결정은 별도로 진행
2. **프로덕션 환경 테스트** — 개발팀만 FF On → 내부 테스터 → 일부 사용자 % → 전체. 각 단계가 다음 확장의 신뢰를 높임
3. **즉시 롤백** — 문제 발생 시 FF Off로 즉시 제거, 전체 배포 롤백 불필요. 폭발 반경(blast radius)이 전체 사용자 → FF 활성 세그먼트 → 0으로 축소

### Trunk-Based + FF가 SDV에 적합한 이유

1. **Deploy ≠ Release 구조적 실현** — 코드는 trunk에 merge 즉시 배포되지만, FF가 Off이므로 사용자에게 노출되지 않음
2. **미완성 기능의 안전한 프로덕션 존재** — 장기 feature 브랜치 없이도 작업중 코드가 trunk에 공존
3. **merge conflict 최소화** — 자동차 SW의 수백 개 ECU/서비스 간 통합 복잡도를 줄임
4. **ASPICE 추적성 유지** — Flag Spec이 ALM과 양방향 연결되므로 trunk 단일 브랜치에서도 추적 가능

### Gitflow가 여전히 유효한 영역

- 협력사 납품 SW (계약 기반 버전 릴리스, 고객이 자체 일정으로 업그레이드)
- ASIL C-D ECU 펌웨어 (형식승인 연동, 광범위한 QA/승인 프로세스)
- 다중 버전 동시 유지보수 (구형 차종 v2.3 지원 + 신형 v3.0 개발)
- 규제 산업의 엄격한 컴플라이언스 (릴리스 브랜치가 자연스러운 승인 게이트 제공)

### HMC 전환 경로

| Phase | 브랜칭 전략 |
|---|---|
| Quick (2026) | Pilot 팀: Trunk-Based + FF 시작 (QM 영역) |
| Mid (2027~28) | 피처 스쿼드 전체: Trunk-Based 전환, Gitflow는 협력사/ASIL C-D만 유지 |
| Long (2029~) | 전사 표준: Trunk-Based + FF, Gitflow는 예외 경로로만 |

---

## 7.6 Persistent Undo Button — 제도화된 안전망

- 부정적 영향 → 즉시 롤백 (COTA <5분)
- 긍정적 반응 → 점진 확산 (0.1%→100%)
- 이것이 8-Stage 배포 프로세스의 설계 근거

---

## 7.7 V-Model과의 공존 — 이중 트랙 거버넌스

| 영역 | 적용 방법론 | 이유 |
|---|---|---|
| QM 인포테인먼트 | **FF-driven** 단독 | Safety 제약 없음 |
| QM Comfort / FoD | **FF-driven** + 경량 V | Commerce 검증 필요 |
| ASIL A-B | **Agile + FF** + V-Model 병행 | 안전 검증 + 반복 가능 |
| ASIL C-D | **V-Model 주도** + FF 보조 | 형식승인 필수 |
| HW-SW ECU 펌웨어 | **V-Model** 단독 | HW 의존 |
| 협력사 납품 SW | **V-Model** + FF 인터페이스 | Tier-1 표준 유지 |

> **경영층 핵심:** "FF-driven은 V-Model을 없애는 것이 아니라, V-Model이 과도한 영역에서 속도를 되찾는 것."

---

## 7.8 HMC 적용 시 단계적 전환

| Phase | 대상 | 방법론 | V-Model 관계 |
|---|---|---|---|
| Quick (2026) | Pilot 2~3팀 | QM에 FF wrapping 시작 | 기존 유지, FF를 추가 레이어 |
| Mid (2027~28) | 전체 피처 스쿼드 | QM 전체 + ASIL A-B 일부 | V-Model은 ASIL B+ 병행 |
| Long (2029~) | 전사 | ASIL C-D 포함 | 초기 설계/검증은 V, 양산 후 FF-driven |
