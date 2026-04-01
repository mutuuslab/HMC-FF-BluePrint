# 5장. 4-Plane 프레임워크 상세 설계

> **제2편. 아키텍처 블루프린트** | 대상 독자: CTO, 아키텍처팀, 플랫폼팀

---

## 5.1 Control Plane — "시스템의 두뇌"

> 경영층 핵심: **"무엇을 켜고 끌지 결정하는 시스템"**

### Core Services

| 서비스 | 핵심 기능 |
|---|---|
| Flag Management Service | CRUD, 버전관리, 전제조건 그래프, 프로젝트 스코핑 |
| Targeting Rule Engine | Clause 기반 규칙, Top-down First-match, 일관 해싱(SHA1) |
| Environment Manager | Dev/Staging/Production, 환경별 구성, Promotion 워크플로우 |
| SDK Config Streamer | SSE 푸시, 폴링 폴백, 델타 압축, Edge 동기화 |
| Campaign Engine | VIN 타겟팅, Ring Rollout, 코호트 관리 |

### Governance Services

| 서비스 | 핵심 기능 |
|---|---|
| Approval Workflow Engine | ASIL 계층 승인, 자동 리뷰어 배정, 변경 사유 필수 |
| Audit Trail Service | 불변 이벤트 로그, Who/What/When/Why, Before/After Diff |
| ASIL Classification Svc | 플래그 ASIL 태깅, 안전 영향 분석, ALM 동기화 |
| RXSWIN Manager | 형식승인 추적, R79/R13/R157 매핑 |

### Analytics

| 서비스 | 핵심 기능 |
|---|---|
| Telemetry Ingestion | Kafka Consumer, 메달리온 파이프라인 |
| Experiment Engine | A/B 코호트, 통계 유의성, Holdout |
| Anomaly Detector | ML 탐지, 2σ 임계, 자동 롤백 트리거 |
| Flag Health Dashboard | 활성 플래그, Stale 탐지, Hygiene Score |

### 데이터 계층

| 데이터스토어 | 용도 | 기술 |
|---|---|---|
| PostgreSQL | 플래그 정의, 규칙, 프로젝트 | RDBMS |
| Redis Cluster | 캐시, 세션, Rate Limiting | In-memory |
| Kafka Cluster | 이벤트 스트림, 텔레메트리 | Message Broker |
| ClickHouse/BigQuery | 분석 OLAP, 실험 데이터 | Analytics |
| S3/Object Storage | COTA/SOTA 패키지, 감사 아카이브 | Object |
| Elasticsearch | 감사 로그 검색 | Full-text Search |
| Vault (HSM) | Uptane 서명 키, API 토큰 | Secret Management |

### Edge 배포 토폴로지

```
Cloud (Master) → Regional Edge (Korea/NA/EU/CN) → Vehicle Edge Proxy (HPVC)
                  │                                      │
                  └── Daisy-chain Topology ──────────────┘
                  │
                  └── Offline Bootstrap: JSON Snapshot from NVRAM
```

---

## 5.2 Vehicle Plane — "플래그와 금속이 만나는 곳"

> 경영층 핵심: **"네트워크 없이도 안전하게 작동하는 차량측 엔진"**

### HPVC 내부 구조

- **Type-1 Hypervisor** (QNX/INTEGRITY) 위에 두 파티션 분리:
  - **Safety Partition (ASIL-D):** Safety FF Evaluator — 이중채널 Ch.A+Ch.B, Voter/Comparator, Watchdog
  - **QM Partition:** QM FF Evaluator — OpenFeature Provider, In-memory, μs 지연

### 4단계 Fail-safe 위계

| Level | 조건 | 동작 | ASIL 요건 |
|---|---|---|---|
| L1 | Flag 서비스 응답 | 현재값 사용 | 전체 |
| L2 | 서비스 타임아웃 | Staleness window 내 캐시값 | 전체 |
| L3 | 캐시 만료/손상 | NVRAM 영구 기본값 | ASIL A+ |
| L4 | NVRAM 실패 | **하드코딩 컴파일타임 기본값** | **ASIL C/D 필수** |

### Safety 실행 제약

- 결정론적 평가 + 실행시간 한정
- **Latch-at-Init:** 초기화 시 플래그 값 고정, 실행 중 변경 금지
- Watchdog 정지 시 하드코딩 safe default 적용
- **Freedom from Interference:** Safety ↔ QM 평가 경로 간 간섭 자유 (ISO 26262)

### Edge 평가 + 계층별 TTL 전략

차량의 FF SDK가 전체 규칙셋을 다운로드하여 **로컬에서 평가** → 네트워크 의존성 제거.

| 플래그 유형 | TTL (캐시 만료) | 만료 시 폴백 | 근거 |
|---|---|---|---|
| **Safety-critical (ASIL C/D)** | **만료 없음** (never expire) | UCM 파이프라인 통해서만 업데이트 | 안전 검증 없이 값 변경 불가 |
| **기능 플래그 (QM functional)** | 7~30일 | 공장 기본값 | 장기 오프라인 후 안전한 기본 동작 |
| **Comfort/UX** | 24~72시간 | 마지막 동기화값 유지 | 사용자 경험 연속성 |

### 3-Tier 폴백 + 재연결 정책

| 폴백 순서 | 데이터 원천 | 설명 |
|---|---|---|
| 1차 | **현재 캐시** | 가장 최근 동기화된 플래그 값 |
| 2차 | **Last-known-good 스냅샷** | 검증된 동작 구성 (별도 저장) |
| 3차 | **공장 기본값** | 펌웨어에 컴파일된 보장 안전 구성 |

**재연결 시 정책:**
- 대부분 플래그: **Server-wins** (서버 값으로 덮어씀)
- Safety 플래그 (오프라인 중 보수적 값으로 설정된 경우): **Vehicle-wins** (차량이 더 안전한 값을 유지)

---

## 5.3 Governance Plane — "아키텍처로서의 컴플라이언스"

> 경영층 핵심: **"누가 승인했는지, 왜 바꿨는지, 감사에 즉시 답할 수 있는 체계"**

### R156: FF 상태 변경 = 소프트웨어 업데이트

R156 §2.4는 "소프트웨어 업데이트"를 **"구성 매개변수 변경을 포함하여 소프트웨어를 새 버전으로 업그레이드하는 데 사용되는 패키지"**로 정의. 이 정의가 핵심: **FF 상태 변경이 구성 매개변수를 변경하면, 바이너리 코드 변경이 없어도 R156상 소프트웨어 업데이트로 분류**되어 전체 SUMS 프로세스가 트리거됨.

- **RXSWIN 업데이트 필요:** FF 변경이 UN 규정 관련 동작을 변경할 때 (R79 조향, R13 제동, R157 ALKS)
- **RXSWIN 불필요:** 비안전·비형식승인 FF 변경 (인포테인먼트, UI) — 그러나 SUMS 내 추적 필수
- **R156 §7.2.2 OTA 요구:** 업데이트 실패 시 기능 복원(롤백 필수), 충분한 전력에서만 실행, 업데이트 중·후 안전 보장, 사용자 사전 고지
- 01 시리즈 개정안 (WP.29/2025/147): 모든 규제 시스템에 RXSWIN 의무화 — 2028년 9월경 시행 예상

> **"Silent" COTA 플래그 푸시라도 형식승인 관련 동작을 변경하면 고지·안전 요구사항 준수 필수.**

### R155: FF 플랫폼의 사이버보안 위협 모델 (TARA)

R155는 **"차량 상태를 원격으로 변경하거나 조회할 수 있는 모든 것"**에 CSMS를 요구. FF 플랫폼은 네트워크 채널을 통해 차량 동작을 원격 변경하므로 **명백히 CSMS 범위 내**.

TARA에서 명시적으로 모델링해야 할 **5대 FF 위협:**

| 위협 | 설명 | 대응 |
|---|---|---|
| **비인가 플래그 조작** | 공격자가 FF 콘솔에 접근하여 안전 플래그 변경 | RBAC + MFA + 4-Eyes |
| **플래그 인젝션 공격** | 위조된 플래그 구성을 차량에 주입 | Uptane 이중 서명 + TLS |
| **리플레이 공격** | 이전 플래그 구성을 재전송하여 롤백 유도 | 타임스탬프 + 시퀀스 번호 |
| **내부자 위협** | 권한 있는 콘솔 접근으로 악의적 변경 | 감사 로그 + 이상 탐지 + 승인 워크플로우 |
| **서비스 거부** | 정당한 플래그 업데이트가 차량에 도달하지 못하게 차단 | 로컬 캐시 + Fail-safe 기본값 |

R155 §7.2.2.2(g): 예상치 못한 플래그 상태 변경 이상 탐지, 플래그 구성 저장소 무결성 모니터링, 모든 플래그 상태 전환 로깅 의무.
R155는 **2024년 7월부터 모든 신차에 의무**, CSMS 인증서 유효기간 3년.

### 한국 규제: R155 + 140항목 세부 체크리스트

한국은 2024년 2월 자동차관리법 하위에 사이버보안 프레임워크를 수립.

| 시행 시기 | 대상 |
|---|---|
| **2025년 8월 14일** | 신규 차종 |
| **2027년 8월 14일** | 모든 차량 |

- R155 + ISO/SAE 21434 + 한국 고유 추가 → **약 140개 세부 요구사항**
- R155보다 **더 세분화** — 각 세부항목별 구체적 증빙 요구 (R155의 일반적 리스크 기반 접근과 차이)
- R155 인증 보유 기업도 한국 규제 추가 준비 필요
- FF 플랫폼은 **140항목 체크리스트 증빙 생성 기능을 day one부터 내장**해야 함
- EU vs 한국 별도 컴플라이언스 문서 산출 필요

> **전략적 기회:** 어떤 인증기관(TÜV SÜD, UL Solutions, SGS)도 FF 특화 거버넌스 프레임워크를 발표하지 않음. TÜV SÜD와 협력하여 R155/R156/ISO 26262/ASPICE/한국 140항목을 교차하는 **업계 최초 FF 거버넌스 프레임워크**를 개발·검증하면 HMG가 글로벌 참조 아키텍처로 자리매김.

### 컴플라이언스 기준 매핑 (기존 + 보강)

| 규격 | 조항 | FF 플랫폼 준수 요건 |
|---|---|---|
| **R156** | §2.4, §7.2.2 | FF 상태변경 = SW업데이트, RXSWIN 해당 시 업데이트, 롤백 필수, 사용자 고지 |
| **R155** | §7.2.2.2(g) | CSMS 범위, TARA 5대 위협 모델, 이상탐지, 무결성, 전환 로깅 |
| ISO 26262 Part 8 | §7.5.1 | 고유 식별 + 재현 가능성 → 플래그 버전 관리 + 감사 추적 |
| ISO 26262 Part 8 | §11 | 도구 적격성 → FF 플랫폼 TQL 결정 + 고장모드 분석 |
| ISO 26262 | §7.4.11 | **FFI(Freedom from Interference)** — ASIL D 평가 로직은 하위 ASIL과 격리 |
| ASPICE SUP.8 | 형상관리 | 형식 변경 통제 + 상태 보고 + 형상 감사 |
| ASPICE SUP.10 | 변경요청관리 | Flag Spec 변경 시 CR 발행 + 영향분석 |
| UNECE R79/R13/R157 | 조향/제동/ALKS | 해당 플래그 → RXSWIN 업데이트 |
| **한국 자동차관리법** | **140항목** | **R155 + ISO 21434 + 한국 고유, 세부항목별 증빙, 2025.8/2027.8 시행** |

### OpenFeature: 벤더 중립 추상화 레이어

OpenFeature (CNCF Incubating, 2023.11~)는 자동차 FF 플랫폼의 표준화 핵심.

- **Provider 인터페이스:** OEM이 자체 백엔드를 쓰면서 Tier-1은 다른 백엔드 가능 — 동일 API
- **Hooks 메커니즘:** Before→After→Error→Finally 4단계 × Global/Client/Invocation/Provider 4레벨 — 안전 제약 검증, 감사 로깅, 텔레메트리를 비즈니스 로직 수정 없이 삽입
- **Multi-Provider:** 마이그레이션/OEM-공급사 혼용 환경에서 FirstMatch 전략으로 복수 백엔드 결합
- **SDK:** Java, Go, .NET, JavaScript, Python, **C++, Rust** (차량 임베디드 핵심)

자동차 전용 평가 컨텍스트:

```json
{
  "targetingKey": "VIN-KMHXX12345",
  "hardwareVersion": "HW-3.2",
  "ecuType": "ADAS-front",
  "region": "KR",
  "safetyLevel": "ASIL-B",
  "fleetSegment": "employee-test"
}
```

### 핵심 컴포넌트 (기존 + 보강)

- Feature Catalog + Metadata Store (Feature ID·owner·expiry·trace link)
- Approval Workflow Engine (3트랙 ASIL 승인)
- Audit Trail (불변 로그)
- Lifecycle Manager + Cleanup Queue
- **R156/R155/한국 140항목 증빙 생성 엔진**
- **OpenFeature Provider + Hooks (안전 검증·감사·텔레메트리)**

---

## 5.4 Quality Plane — "중요한 것을 측정"

> 경영층 핵심: **"문제 발생 시 5분 안에 전 차량 원복 가능"**

### KPI 프레임워크

| 카테고리 | 지표 | 목표 | 주기 |
|---|---|---|---|
| 플래그 건강 | 활성 플래그 수 | 팀당 <50개 | 주간 |
| | Stale 플래그 수 | 0개 | 주간 |
| | Flag Hygiene Score | >85% | 분기 |
| 배포 효율 | 카나리→GA 리드타임 | QM: 2주 / ASIL C-D: 12주 | 릴리스별 |
| | COTA 롤백 시간 | <5분 | 이벤트별 |
| 모니터링 | 텔레메트리 커버리지 | >95% 차량 | 일간 |
| | 킬스위치 응답시간 | <3분 | 이벤트별 |
| 실험 | A/B 실험 완료율 | >80% | 분기 |

### 핵심 컴포넌트

- Progressive Delivery Controller (카나리→Ring→GA)
- Guardrail Monitor (ML 이상탐지, 자동 롤백)
- Exposure Telemetry (Kafka 메달리온)
- 3-Level Rollback (COTA/UCM/딜러)

---

## 5.5 Plane 간 통합 포인트

| 연결 | 데이터 흐름 | 프로토콜 | 장애 시 폴백 |
|---|---|---|---|
| Control → Vehicle | 정책/타겟팅 규칙 배포 | HTTPS + gRPC/SOME/IP | 로컬 캐시 유지 |
| Vehicle → Quality | 평가 결과/텔레메트리 | MQTT / OTel | 로컬 버퍼링 후 재전송 |
| Quality → Control | 가드레일 위반 시 롤백 트리거 | Webhook / Event | 수동 대시보드 |
| Governance → Control | Catalog/승인 상태 동기화 | REST API | 수동 승인 |
| Governance → Quality | KPI 목표/SLO 전달 | Config-as-Code | 기본값 적용 |
