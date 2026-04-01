# 2장. 도입 당위성 — 왜 지금 Feature Flag인가

> **제1편. 경영 요약** | 대상 독자: C-Level, 전략기획, 사업부장

---

## 2.1 SDV 전략과의 정합성

### HMG "Unlock the Software Age" 전략

- **투자 규모:** SDV 개발에 **18조 원 (약 $12.5B)** 투자 계획 — 글로벌 SW 센터 신설
- **OTA 전 차종 적용:** 2023년 신차부터 OTA 탑재, **2025년까지 전 차종 OTA 완료** (ICE 포함)
- **CCS 등록 목표:** 2025년까지 **2,000만 대** Connected Car Services 등록
- **FoD 서비스:** 2023년부터 Feature-on-Demand 서비스 도입 계획 발표
- **신규 EV 플랫폼:** eM(승용 전용) + eS(PBV 스케이트보드) — L3+ 자율주행 + OTA 기본 탑재

### 시장 컨텍스트 — SDV는 이미 수조 달러 산업

| 시장 | 2024~25 | 2030(F) | CAGR | 출처 (최신) |
|---|---|---|---|---|
| **글로벌 SDV** | $213.5B (2024) | **$1.24T** | 34.0% | MarketsandMarkets 2025.02 |
| SDV (별도 추정) | $475.4B (2025) | **$1.6T** | 27.3% | BCC Research 2025.06 |
| **자동차 OTA** | $5.2B (2025) | **$11.4B** | 17.0% | Future Market Insights |
| OTA (별도 추정) | $3.9B (2023) | **$13.9B** | 20.1% | P&S Intelligence |
| **FF 관리 플랫폼** | $1.52B (2025) | **$2.65B** (2032) | 8.25% | 360iResearch 2025 |
| **FoD (기능 온디맨드)** | $0.35B (2023) | 수십억$ | 46.6% | Frost & Sullivan 2024 |
| 인포테인먼트 디지털 애프터세일즈 | ~$9B (2023) | **~$14B** | ~10% | Oliver Wyman 2025 |
| **구독 기반 차량 기능 플랫폼** | $1.82B (2025) | **$12.55B** (2035) | 21.3% | Fact.MR 2025 |

> FF 관리 플랫폼 자체는 $15억 규모이나, 이것이 **제어하는 SDV 시장은 $1.2조, FoD 연 46% 성장**. FF는 지렛대다.

### 리콜과 OTA — FF 플랫폼의 비용 회피 근거

| 지표 | 수치 | 출처 |
|---|---|---|
| 2024년 미국 리콜 차량 수 | **2,770만 대** | NHTSA 2024 연간 보고서 |
| OTA로 해결 가능 리콜 비율 | **33%** (2023년 21%에서 ↑12%p) | BizzyCar / NHTSA |
| Tesla 2024 리콜 | **510만 대** — 전부 OTA로 해결 | NHTSA |
| 리콜 완료율 (물리 서비스) | 75~87% (미완료 차량 수백만 대) | NHTSA / Recall Masters |
| 커넥티드카 신차 비율 | 선진국 시장 **70%+** | SNS Insider |
| EV 소프트웨어 의존도 | **90%** | SNS Insider |
| LaunchDarkly 밸류에이션 | **$3B**, 누적 $330M 투자 | Tracxn 2025 |

> **핵심 논거:** 2024년 리콜 2,770만 대 중 33%가 OTA로 해결. FF 플랫폼이 있으면 리콜 대신 **COTA 플래그 비활성으로 수 분 내 대응** — 딜러 방문 불필요, 완료율 사실상 100%.

### 패러다임 전환의 본질

- **정적 빌드타임 Configuration → 동적 런타임 Feature Management**
- 이 전환 없이는 OTA·FoD·프로그레시브 딜리버리가 구조적으로 작동하지 않음
- Feature Flag는 "기능 제어 플랫폼"이자 "배포와 출시를 분리하는 운영 체계"
- **업계 도입률:** 기업의 61%가 FF/A/B 테스트 솔루션 도입 → 릴리스 60% 가속, 프로덕션 장애 40% 감소

---

## 2.2 경쟁 환경

### 핵심 발견: 어떤 OEM도 상용 FF 플랫폼을 사용하지 않는다

29개사 조사 결과, **어떤 주요 OEM도 LaunchDarkly, Unleash, OpenFeature 등 상용 FF 플랫폼을 차량 내 기능 관리에 사용하지 않는다.** 전부 자체 구축(custom-built progressive delivery). 이유 5가지:
- ISO 26262 결정론적 동작 요구 — 표준 FF SDK와 비호환
- 간헐적 차량 연결성 — 오프라인 평가 필수
- 고유 타겟팅 차원 (VIN, HW 리비전, ECU 버전, 규제 지역)
- 차량 대면 공격 표면의 보안 우려
- Feature-on-Demand 과금 시스템과의 긴밀 통합

> **시사점:** HMC도 상용 FF를 그대로 쓸 수 없다. Option B(Hybrid)에서 control-plane UX/RBAC/audit는 buy하되, vehicle runtime/safety gate/entitlement bridge는 반드시 build.

### OEM별 Progressive Delivery 현황

| OEM | 아키텍처 | Progressive Delivery 방식 | Fleet 규모 | 핵심 지표 |
|---|---|---|---|---|
| **Tesla** | 중앙집중 HW3/HW4 | Employee→1%→5%→Fleet, Shadow Mode | ~600만 대 | 5~10일 사이클, 400K 클립/초 처리 |
| **Mercedes** | MB.OS 4도메인(chip-to-cloud) | 도메인 기반 OTA 캠페인 | ~200만 대 연결 | €489/년 후륜조향 FoD |
| **BMW** | 4 Superbrain + Zonal | 지역/모델 기반 | 1,000만+ OTA 가능 | 200K 빌드/일, 10K 개발자, 5억 줄 코드 |
| **NIO** | SkyOS 1+4+N | Pilot 1,800대 → 배치 롤아웃 | ~50만+ | FOTA/SOTA 분리, 4단계 테스트 |
| **XPENG** | Tianji XOS / SEPA 2.0 | 지리적 스테이징 (고속도로→도시→전국) | ~30만+ | **2일 1반복, 70일/35 iteration** |
| **VW→Rivian JV** | RV Tech Zonal | Wave 기반 (~5일) | 30M 목표 | $5.8B JV, 1,500+ 직원 |
| **Ford** | SYNC 4 / Power-Up | 모델/트림 단계별 + Blue Zones | 2028년 3,300만 | BlueCruise $2,495 또는 $49.99/월 |
| **BYD** | Xuanji 璇玑 | HW 티어 게이팅 (100/300/600) | ~400만+ | 7,200만 km/일 학습 데이터 |

### 주요 OEM 상세

**Tesla Shadow Mode** — 업계 가장 정교한 implicit FF. 새 신경망이 모든 Tesla에서 조용히 실행, 카메라 데이터를 처리하고 주행 판단을 내리되 차량을 제어하지 않음. 판단 불일치 시 트리거 분류기가 이벤트 플래그+데이터 업로드. FSD v14(2025.10)는 HW3 지원 중단, HW4/AI4만 서비스 — HW 게이팅 롤아웃의 전형.

**Mercedes FoD** — EQS 후륜조향: 모든 차량에 10도 하드웨어 탑재, 기본 4.5도만 활성화, €489/년에 전체 해제. 하드웨어는 존재하되 소프트웨어로 게이팅하는 **교과서적 FF 패턴**.

**BMW 히팅시트 구독 철회** — 소비자 백래시로 HW 기능 구독 철회, SW-only 구독(ADAS, 디지털 서비스)으로 전환. **FoD 전략의 핵심 교훈: HW 기능 구독은 소비자 저항 높음.**

**XPENG** — 업계 최빠른 OTA: 2일 1반복, 2주 1경험 업그레이드. XNGP는 고속도로→선별도시→전국(2,595+ 도시) 지리적 스테이징 — 기능 수준 progressive delivery.

**공통점:** 경쟁사는 모두 **조직 구조 개편에 대규모 투자를 기술 구축보다 선행**하고, **자체 progressive delivery 시스템을 구축**함.

---

## 2.3 현재 제약과 리스크

| 제약 | 상세 | 리스크 |
|---|---|---|
| CCS 관리테이블 한계 | Trim 단위 제어 불가, 서버 필터링 방식 | 다차원 타겟팅 불가능 |
| FoD 운영 | Entitlement 객체 모델 부재, 결제-권한-활성화 분리 | 수익 누수, sync failure |
| R&R gray zone | 승인 지연, 긴급 차단 책임 불명확 | 사고 대응 지연 |
| Feature 용어 불일치 | 부서/시스템 간 동일 기능 다르게 지칭 | 추적성 단절 |
| All-or-nothing 배포 | 단계적 롤아웃/가드레일 미지원 | 전 fleet 영향, 롤백 비용 과대 |
| 규제 대응 | R155/R156 강화 + 감사 증적 수작업 | 감사 실패 리스크 |

---

## 2.4 기대효과 요약

| Value Lever | Business Question |
|---|---|
| Release lead time 단축 | 기능 출시까지 얼마나 빨라지나 |
| Incident cost avoidance | 점진배포로 장애 확산 비용 회피 |
| Audit retrieval 자동화 | 감사 증적 취합 시간 단축 |
| FoD revenue leakage 방지 | 결제-활성화 불일치 누수 차단 |
| Recall risk reduction | 위험 기능 조기 차단 |
| Onboarding productivity | 신규 팀 온보딩 시간 단축 |

> **Client delivery rule:** 정량값은 임의로 만들지 않는다. Value logic·formula·required data만 먼저 제시하고, Pilot 후 actual value case로 고도화.
