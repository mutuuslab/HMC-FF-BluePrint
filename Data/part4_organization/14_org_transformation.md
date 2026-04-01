# 14장. 조직 변혁 전략

> **제4편. 조직 전환** | 대상 독자: C-Level, CHRO, 조직혁신, 사업부장

---

## 14.1 핵심 설계 원칙: Deploy 권한과 Release 권한의 분리

FF 도입이 조직에 가져오는 가장 극적인 변화:
- **기존:** 개발자가 배포하면 곧 출시
- **전환 후:** 배포(Deploy)는 플랫폼 팀, 출시(Release) 결정은 피처 스쿼드·마케팅·QA·고객지원까지 이양

이 분리가 **조직 재설계의 출발점**이자, FF-driven Development가 동작하기 위한 구조적 전제.

---

## 14.2 4계층 조직 전환 모델

### ① 플랫폼 계층 (공통 인프라)

| AS-IS (레거시 HW 중심) | → | TO-BE (SDV FF 기반) |
|---|---|---|
| HW 부품별 ECU 팀 | → | **SDV 플랫폼 팀** (SoC, OS, MW, CI/CD, OTA, FF엔진) |

| Deploy 권한 | Release 권한 |
|---|---|
| ✅ 코드 배포 — FF 엔진, SDK, Edge | ❌ Release 권한 없음 (인프라만 제공) |

> "도로를 깔되, 어떤 차가 달릴지는 결정하지 않는다."

### ② 피처 계층 (도메인 기능)

| AS-IS | → | TO-BE |
|---|---|---|
| 파워트레인/차체/IVI 부서 | → | **피처 스쿼드** (ADAS, HMI, 커넥티드 등 도메인) |

| Deploy 권한 | Release 권한 |
|---|---|
| ✅ 도메인 코드 배포, Toggle point 구현 | ✅ QM 범위 자율 Release — 플랫폼 API 위에서 독립 주기 |

### ③ 거버넌스 계층 (문지기)

| AS-IS | → | TO-BE | Deploy | Release | Gap |
|---|---|---|---|---|---|
| 프로젝트 매니저 | → | **TPM (기술 프로그램 매니저)** | ❌ | ✅ 안전 규정 × Agile 균형 | **미커버 — 신규 정의 필요** |
| — | → | **아키텍처 팀 (시스템 Gatekeeper)** | ❌ | 표준 준수 강제 (VSS, uProtocol, OpenFeature) | **부분** |

### ④ 비엔지니어링 계층 (Release 권한 이양) — 가장 큰 Gap

| AS-IS | → | TO-BE | Deploy | Release | Gap |
|---|---|---|---|---|---|
| 마케팅→개발 요청 | → | **마케팅/비즈니스** FF UI 직접 운영 | ❌ | ✅ A/B 직접 실행, 타겟 설정, 성과 분석 | **미커버** |
| QA→별도 환경 테스트 | → | **QA** 프로덕션 샌드박스 | ❌ | ✅ 테스터 VIN만 플래그 On | **미커버** |
| 고객지원→개발 에스컬레이션 | → | **고객지원** Entitlement 즉시 조정 | ❌ | ✅ 구독 변경→실시간 활성화 | **부분** |
| 개발자=배포+출시 겸임 | → | **SRE/개발자** 안정성 집중 | ✅ | Kill-switch, 만료 플래그 정리 | **커버** |

> **가장 큰 Gap:** 기존 문서는 엔지니어링 역할 전환만 다루고, 비엔지니어링 Release 권한 이양을 전혀 다루지 않음.

---

## 14.3 경쟁사 조직 변혁 규모

| OEM | 조직 변혁 | 시사점 |
|---|---|---|
| Tesla | 수직통합, SW 엔지니어가 HW까지 제어 | 극단적 통합 모델 |
| Mercedes | MBition 1,000+ SW + CSO 신설 | 자회사 + C-Level 신설 |
| BMW | 10,000+ SW, CodeCraft 200K빌드/일 | CI/CD 조직 규모 |
| NIO | SW-native 조직 | 처음부터 SW 중심 설계 |

**공통:** 조직 구조 개편이 기술 구축보다 **선행**.

---

## 14.4 기존 역할 전환 매핑

| 기존 역할 | 전환 후 역할 | 핵심 변화 |
|---|---|---|
| 시스템 엔지니어 | **SW 플랫폼 아키텍트** | 플래그 평가 인프라 + 멀티 ECU 조율 |
| 검증 엔지니어 | **지속적 검증 엔지니어** | 디지털 트윈 조합 테스트 + 프로덕션 지표 |
| 프로젝트 매니저 | **릴리스 트레인 엔지니어** | 프로그레시브 딜리버리 + 링 배포 관리 |
| 품질 매니저 | **피처 품질 오너** | 플래그 위생 + 기술부채 + 컴플라이언스 |

---

## 14.5 신규 필요 역할 (10종)

> **운영 모델의 본질:** "누가 플래그를 만들 수 있는가"가 아니라, **"누가 어떤 근거로 어떤 위험수준의 기능을 언제 어떤 차량에 노출할 수 있는가"**를 표준화하는 것.

| 역할 | 계층 | 핵심 책임 | 예상 인원 | 상태 |
|---|---|---|---|---|
| **Platform Owner** | 플랫폼 | Control Plane 전략/예산/표준, 플랫폼 KPI 총괄 | 1~2명 | **신규** |
| FF 플랫폼 엔지니어 | 플랫폼 | 평가 엔진, SDK, Edge, 텔레메트리 | 8~12명 | 기존 |
| Release Engineer (OTA Ops Lead) | 플랫폼 | OTA, 배포 창구, 카나리 정책, 롤백 오퍼레이션 | 3~5명 | 기존 |
| Domain Feature Owner | 피처 | 도메인별 Feature 정의, 라이프사이클, KPI, 롤아웃 책임 | 3~5명 | 기존 |
| **Variant Manager** | 피처 | **차종/지역/트림/법규 변형 정책 소유, 규칙 관리** | **2~3명** | **신규** |
| **Supplier Interface Manager** | 거버넌스 | **공급사 API 계약, 버전 호환성, 온보딩 추적** | **2~3명** | **신규** |
| Safety Flag Reviewer | 거버넌스 | ASIL 분류, 안전 영향 분석, T3/T4 정책 | 2~3명 | 기존 |
| **Cybersecurity Lead** | 거버넌스 | **위협 모델링, 승인 체계, 취약점 대응, 비밀관리** | **1~2명** | **신규** |
| Experimentation Lead | 비엔지니어링 | A/B, 코호트, 통계, SRE/Observability | 2~3명 | 기존 |
| FF Ops Enabler / PMO | 비엔지니어링 | 마케팅/QA/고객지원 교육, 로드맵, 의사결정 기록 | 2~4명 | 신규 |

> **총 ~25~45명.** 초기 12개월은 핵심 6역할(Platform Owner, FF 엔지니어, Release Engineer, Domain Feature Owner, Safety Reviewer, PMO)부터 구성하고, 2년차에 Variant Manager, Supplier Interface Manager, Cybersecurity Lead를 추가.

---

## 14.6 거버넌스 5개 위원회

| 위원회 | 의장 | 역할 | 케이던스 |
|---|---|---|---|
| **Vehicle Feature Governance Board (VFGB)** | 플랫폼 총괄/CSO급 | 표준 정책 승인, 중요 예외 승인, 기술부채 해소 우선순위, KPI 리뷰 | **월간** |
| **Architecture Council** | CTO/아키텍트 리드 | SDK/API 표준 심의, Variant 모델 리뷰, CI/CD·OTA 연계, 공급사 인터페이스 리뷰 | **격주** |
| **Safety & Compliance Review Board (SCRB)** | Safety Lead | T2~T4 플래그 검토, 규제/보안/안전 승인, Fail-safe 리뷰 | **T3~T4: 건별, T2: 주간 배치** |
| **Feature Launch Committee (FLC)** | Domain Owner | Shadow/Canary/Ramp-up Go/No-Go, 롤아웃 임계 승인, 롤백 리뷰 | **출시 건별** |
| **Change Control Board (CCB)** | PMO | 범위 변경 통제, 긴급 예외 승인, Baseline freeze | **필요시** |

### 회의체 Cadence 총괄

| 주기 | 회의 내용 |
|---|---|
| **주간** | 도메인별 롤아웃 리뷰, Stale flag 리뷰 |
| **격주** | Architecture/SDK/API 리뷰 (Architecture Council) |
| **월간** | VFGB 정례 — KPI, 리스크, 정책 변경 |
| **분기** | 플랫폼 로드맵 재정의, 기술부채/자동화 우선순위 |

---

## 14.7 교차 기능 협업 구조

| 팀 | 소유 범위 | Deploy | Release |
|---|---|---|---|
| OEM 플랫폼팀 (HAE/42dot) | 차량 플래그 인프라 | ✅ | ❌ (인프라만) |
| OEM 피처 스쿼드 | 도메인 기능 | ✅ (Toggle) | ✅ (QM 자율 / ASIL Board) |
| Tier-1 공급사 | 서브시스템 플래그 | ✅ (OEM 승인) | ❌ (OEM만 Release) |
| 클라우드 플랫폼팀 (HAE) | FF 서버, 텔레메트리, A/B | ✅ | ❌ |
| **마케팅/비즈니스** | A/B 실험, 타겟팅 | ❌ | ✅ (QM 실험) |
| **QA** | 프로덕션 테스트 | ❌ | ✅ (테스터 VIN) |
| **고객지원** | Entitlement 조정 | ❌ | ✅ (Commerce) |

---

## 14.8 역량 확보 로드맵

| Phase | 인력 확보 | 조직 구축 |
|---|---|---|
| Quick (2026) | 내부 전환 교육 30~40명, Safety Reviewer 2명 | Governance Board 발족, TPM 2명, 비엔지니어링 Release 범위 1차 설계 |
| Mid (2027~28) | FF 플랫폼 엔지니어 8~12명 채용, Exp Lead 배치 | 비엔지니어링 Self-service 오픈, FF Ops Enabler 배치 |
| Long (2029~) | Feature E2E 책임 모델 정착 | 전사 Enablement 포털, 고객지원 Entitlement 실시간 운영 |

---

## 14.9 변화 관리 (Change Management)

### 엔지니어링 저항 대응
- Deploy/Release 분리로 "배포했는데 왜 안 켜지냐" 질문 발생
- Release 판단이 PM/마케팅/Safety Board로 이동한다는 것을 명확히 커뮤니케이션

### 비엔지니어링 저항 대응
- "기술 도구를 직접 다루는" 경험 부재
- Self-service 포털 UX + 교육 프로그램이 채택 핵심
- FF Ops Enabler가 전환 전담

### 조직 KPI 연결
- DORA 지표 + Feature-level KPI를 팀 성과평가에 반영
- "출시 횟수"가 아니라 **"학습 속도"** (Feedback→Plan 전환 시간)로 재정의

### 단계적 확산
- Pilot팀 2~3개 → 성공사례 내재화 → 전사 확대

---

## 14.10 FF 도입은 기술 혁신이 아니라 사회적 혁신이다

> **"Feature flag는 기술적 혁신이라기보다 사회적 혁신이다. 코드에 if문 몇 개를 추가하는 것으로는 아무것도 바뀌지 않는다. 진짜 마법은 FF가 조직 규모로 도입되어 SW가 만들어지는 방식 자체를 바꿀 때 나타난다."** — Pete Hodgson (OpenFeature Governance Board)

기술은 절반. **누가·어떻게 사용하는지, 어떻게 채택을 이끄는지**가 나머지 절반.

### 대규모 조직 FF 도입 6단계 (Flagsmith Enterprise Playbook)

| 단계 | 활동 | HMC 적용 |
|---|---|---|
| **① 경영진 스폰서 확보** | 임원 스폰서십이 있는 전환이 성공률 높음 | 사업부장/CTO 명시적 스폰서 |
| **② 챔피언/워킹그룹 지정** | 구현 소유, 내부 온보딩 주도, FF 플랫폼 벤더와 직접 협업 | **FF Ops Enabler + TPM** (14.5절) |
| **③ Pilot 프로그램 결정** | Pilot 필요성·범위·대상팀 결정 | Wave 1: Feature Catalog + Personalization (17장) |
| **④ 단계적 롤아웃 계획** | 전사 확산 로드맵 수립 | 16장 3-Horizon 로드맵 |
| **⑤ 현재 릴리스 전략 매핑** | People(누가 deploy vs release) + Process(bottleneck은 어디) 현황 파악 | 3장 AS-IS Baseline |
| **⑥ 기존 FF 솔루션 식별** | 이미 존재하는 config 관리/토글이 FF로 "위장"되어 있을 수 있음 | CCS 관리테이블, 서버 필터 → FF 전환 대상 |

### 현재 릴리스 전략 매핑 — 질문 체크리스트

**People:**
- 어떤 팀이 릴리스에 관여하는가?
- 제품/엔지니어링 팀은 현재 어떻게 협업하는가?
- **누가 Deploy 권한을 가지고, 누가 Release 권한을 가지는가?**
- 엔지니어링/제품 외에 릴리스에 관여하는 사람은 누구인가?

**Process:**
- 엔지니어들은 현재 어떻게 브랜치를 관리하는가?
- 새 기능이 아이디어 → 반복 → 배포 → 출시로 가는 경로는?
- 이 프로세스에서 가치를 더하는 부분은 어디인가?
- **병목은 어디인가? 특정 단계에 승인이 필요한가?**

> 이 매핑이 3장(AS-IS)의 Pain Point → D1~D7 역매핑과 직접 연결됨.

### eBay 사례에서 배우는 채택 성공 공식

| eBay Velocity Program | HMC 적용 포인트 |
|---|---|
| CTO+CPO 공동 스폰서 | 사업부장 + CTO 공동 추진 |
| 300팀 크로스 조직 프로그램 | FF Working Group + 거버넌스 보드 (11장) |
| 21팀 3라운드 파일럿 (3분기) | Wave 1/1.5/2 (17장) |
| Milestone 1: 가능하게 → 2: 유용하게 → 3: 확장 가능하게 | Quick→Mid→Long (16장) |
| 전 팀에 Velocity 예산 10% 배정 | FF 전환 전담 예산·시간 공식 확보 |
| Self-serve 마이그레이션 대시보드 | Flag Health Dashboard (6장 모듈) |
| 내부 마케팅 (뉴스레터 + 에스컬레이션) | FF Ops Enabler의 교육·전파 캠페인 |

### Komerční Banka (체코 대형 은행) 사례

금융 규제 산업에서의 FF 도입 효과:
- **Before:** 연간 3회 릴리스 → 모든 기능이 수개월 대기
- **After:** 비프로덕션 환경 일간 배포 + 프로덕션 피처 단위 출시
- **핵심:** 자체 호스팅(self-hosted) FF 플랫폼으로 데이터 주권·비즈니스 연속성·재해복구 확보

> **HMC 유사성:** 자동차 산업도 "데이터 민감 + 규제 중심" — 금융 산업의 FF 전환 경험이 직접 참고 가능.
