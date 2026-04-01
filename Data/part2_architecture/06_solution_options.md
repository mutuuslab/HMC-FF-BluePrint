# 6장. 솔루션 옵션 및 권고안

> **제2편. 아키텍처 블루프린트** | 대상 독자: C-Level, CTO, 의사결정자

---

## 6.1 3개 옵션 비교

| | Option A | Option B (**권고**) | Option C |
|---|---|---|---|
| **핵심** | 외부 플랫폼 주도 (Vendor-led managed) | Hybrid 자체 거버넌스 + self-hosted foundation | 전량 자체 구축 (Full in-house) |
| **강점** | 빠른 학습·PoC 속도, RBAC/UI 성숙 | 제어권+속도 균형, 단계적 확장, On-prem 대응 | 최대 커스터마이즈, 장기 통제권 |
| **약점** | Safety path·data residency 한계 | 전담 platform owner 필수 | 12개월 내 가치 증명 곤란 |
| **종합 점수** | 2.83 | **3.95** | 3.79 |
| **PoC 범위** | 비안전 digital/FoD 한정 | D1/D3/D5/D6 핵심 흐름 | Architecture spike only |

---

## 6.2 가중 평가 매트릭스

| Criterion | Weight | A Score | A Weighted | B Score | B Weighted | C Score | C Weighted |
|---|---|---|---|---|---|---|---|
| Safety / control-path fitness | 0.18 | 2 | 0.36 | 4 | 0.72 | 5 | 0.90 |
| HMC control ownership | 0.15 | 2 | 0.30 | 5 | 0.75 | 5 | 0.75 |
| Vehicle runtime suitability | 0.14 | 2 | 0.28 | 4 | 0.56 | 5 | 0.70 |
| Time-to-value | 0.10 | 5 | 0.50 | 4 | 0.40 | 1 | 0.10 |
| Integration complexity | 0.10 | 3 | 0.30 | 3 | 0.30 | 2 | 0.20 |
| Data residency / security | 0.08 | 2 | 0.16 | 4 | 0.32 | 5 | 0.40 |
| Scalability / multi-brand | 0.07 | 3 | 0.21 | 4 | 0.28 | 5 | 0.35 |
| Governance / audit readiness | 0.08 | 4 | 0.32 | 4 | 0.32 | 3 | 0.24 |
| TCO balance | 0.05 | 4 | 0.20 | 3 | 0.15 | 1 | 0.05 |
| Organizational readiness | 0.05 | 4 | 0.20 | 3 | 0.15 | 2 | 0.10 |
| **Total** | **1.00** | | **2.83** | | **3.95** | | **3.79** |

---

## 6.3 Buy vs Build 원칙

| 영역 | 전략 | 근거 |
|---|---|---|
| Control-plane UX / RBAC / Audit | **Buy** (self-hosted foundation) | 성숙한 상용/OSS 제품 활용, 재구축 비용 불필요 |
| Vehicle runtime evaluator | **Build** (자체 구축) | 차량 Safety 요구, 오프라인/임베디드 특화 |
| Safety gate / kill-switch | **Build** | ASIL C/D 이중채널, Latch-at-Init 고유 요구 |
| Entitlement bridge | **Build/Adapter** | FoD 상업 모델이 HMC 고유 |
| HMC workflow (승인/감사) | **Build/Adapter** | 기존 CAB/ALM 프로세스 통합 필요 |

---

## 6.4 No-go 조건

| Option | No-go 조건 |
|---|---|
| A | Safety-critical 제어를 벤더 기본모델에 과도 의존 시 / Data residency 미충족 시 |
| B | 전담 platform owner와 governance lead가 없을 때 / Integration discipline 부족 시 |
| C | 12~18개월 내 가치 검증 필요할 때 / Control-plane UX 재구축 비용 과대 |

---

## 6.5 권고안 Headline

> **"어떤 주요 OEM도 상용 FF 플랫폼을 차량 내 기능 관리에 사용하지 않는다. 전부 자체 구축이다. 그러나 FF의 성패는 tool 기능보다 ownership, metadata discipline, rollout rule, cleanup automation에 달려 있다. 현실적 기본안은 Hybrid ownership + bounded pilot이다."**

Option B를 기본 타깃으로 확정:
- **Buy:** control-plane UX/RBAC/audit (성숙한 상용/OSS 활용)
- **Build:** vehicle runtime/safety gate/entitlement bridge (자동차 고유 요구)
- Option A는 단기 학습용, Option C는 장기 진화 옵션으로 유지

### 전략적 기회: 업계 최초 FF 거버넌스 표준

어떤 인증기관(TÜV SÜD, UL Solutions, SGS)도 FF 특화 거버넌스 프레임워크를 발표하지 않음. R155/R156/ISO 26262/ASPICE/한국 140항목을 교차하는 **업계 최초 FF 거버넌스 프레임워크**를 TÜV SÜD와 공동 개발·검증하면 HMG가 **글로벌 참조 아키텍처**로 자리매김하는 전략적 기회.

---

## 6.6 개발 기능 상세 Action Item 도출

Option B(Hybrid) 권고안을 실현하기 위해 필요한 **개발 모듈별 구체적 Action Item**.

### 4-Plane별 개발 모듈 맵

| Plane | 모듈 | Buy/Build | Action Item | 산출물 |
|---|---|---|---|---|
| **Control** | FF Admin UI | Buy | 오픈소스/상용 셀프호스트 평가 → PoC | Admin UI PoC 보고서 |
| | Targeting Rule Engine | Buy+Adapt | HMC 타겟팅 차원(VIN, HW rev, region) 맞춤 설정 | 타겟팅 규칙 사양서 |
| | RBAC/Audit | Buy | 4-Eyes 원칙, ASIL별 승인 워크플로우 구성 | RBAC 정책 문서 |
| | SDK Config Streamer | Buy+Adapt | SSE 푸시 + 폴링 폴백 + Edge 동기화 | Streamer 설정 사양서 |
| | Campaign Engine | Build | VIN 타겟팅, Ring 롤아웃, 코호트 관리 | Campaign Engine 설계서 |
| **Vehicle** | HPVC FF Evaluator (QM) | Build | OpenFeature Provider 구현, 인메모리 평가, μs 지연 | Evaluator SDK v1 |
| | HPVC FF Evaluator (Safety) | Build | 이중채널 Ch.A+Ch.B, Voter/Comparator, Watchdog, Latch-at-Init | Safety Evaluator 설계서 + FMEA |
| | NVRAM Persistent Cache | Build | 4단계 Fail-safe 위계, TTL 전략, Last-known-good 스냅샷 | 캐시 설계서 |
| | Edge Proxy | Buy+Adapt | 경량 캐싱, 오프라인 모드, 데이지체이닝 | Edge Proxy 배포 사양서 |
| | ECU Bridge (Classic AUTOSAR) | Build | NVM 캘리브레이션 매핑, SOME/IP 전달 | Bridge 인터페이스 사양서 |
| **Governance** | Feature Catalog | Build | Feature ID·owner·expiry·ASIL 태그·trace link | Catalog 데이터 모델 |
| | Approval Workflow Engine | Build | ASIL 3트랙 승인, 자동 리뷰어 배정, 변경 사유 필수 | 워크플로우 설계서 |
| | Audit Trail Service | Buy+Adapt | 불변 이벤트 로그, Before/After Diff, SUMS 연동 | Audit Trail 사양서 |
| | RXSWIN Manager | Build | 형식승인 추적, R79/R13/R157 매핑, 자동 트리거 | RXSWIN 매핑 로직서 |
| | Lifecycle Manager + Cleanup | Build | Stale 탐지, Time Bomb CI, Piranha 스타일 자동 정리 | Lifecycle 정책서 |
| **Quality** | Progressive Delivery Controller | Build | 카나리→Ring→GA 자동 진행, 헬스체크 통합 | Rollout Controller 설계서 |
| | Guardrail Monitor | Build | ML 이상탐지, 2σ 임계, 자동 롤백 트리거 | 가드레일 규칙서 |
| | Telemetry Pipeline | Build+Adapt | Kafka 메달리온, 노출 기록, 어트리뷰션 | 텔레메트리 파이프라인 설계서 |
| | A/B Experiment Engine | Build | VIN 해싱 코호트, 통계 유의성, BMW Design 적용 | 실험 엔진 설계서 |
| | Flag Health Dashboard | Build | 활성 플래그, Stale, Hygiene Score, DORA 지표 | Dashboard 사양서 |
| **Cross-cutting** | Codebeamer ALM 연동 | Build | Req ↔ Flag Spec 양방향 링크, ASPICE 추적성 | ALM 연동 사양서 |
| | CI/CD FF Pipeline | Build | FF Lint, ASIL Gate, 매트릭스 테스트, 패키징 분리 | CI/CD 파이프라인 설계서 |
| | MQTT Kill Switch | Build | Hybrid Push-Pull, Retained Message, TTL | Kill Switch 설계서 |
| | Uptane COTA 패키지 | Build+Adapt | 이중 서명, Director Repo 연동, 매니페스트 | COTA 패키지 사양서 |
| | Entitlement Bridge | Build | 결제→권한→FF 활성화 E2E, FoD 과금 연동 | Entitlement 인터페이스 사양서 |
| | 협력사 FF Interface Spec | Build | Tier A/B/C 요건, SDK 호환성 테스트, SoW 반영 | FF Interface Spec v1 |

---

## 6.7 개발 우선순위 식별 및 Scoping

### 우선순위 평가 매트릭스

| 평가 기준 | 가중치 | 설명 |
|---|---|---|
| 비즈니스 가치 (Value) | 0.25 | 경영효과 직접 연결도 |
| 기술 의존성 (Dependency) | 0.20 | 다른 모듈의 전제조건 여부 |
| 리스크 감소 (Risk) | 0.20 | 안전/규제/운영 리스크 해소 기여도 |
| 구현 복잡도 (Complexity) | 0.15 | 기술 난이도, 소요 인력/기간 |
| 측정 가능성 (Measurability) | 0.10 | Pilot에서 효과 측정 가능 여부 |
| 조직 준비도 (Readiness) | 0.10 | 현 조직이 바로 착수 가능한 수준 |

### 모듈별 우선순위 (Scoping)

| 우선순위 | 모듈 | Horizon | 근거 |
|---|---|---|---|
| **P1 — Must Have** | Feature Catalog + Lifecycle Manager | Quick | 모든 모듈의 기반, 용어/메타데이터 통일 |
| **P1** | RBAC/Audit + Approval Workflow | Quick | 거버넌스 체계 없이 다른 모듈 운영 불가 |
| **P1** | Codebeamer ALM 연동 | Quick | ASPICE 추적성 확보의 전제 |
| **P1** | HPVC FF Evaluator (QM) | Quick→Mid | 차량측 평가 엔진 — 전체 FF 가치의 핵심 |
| **P2 — Should Have** | FF Admin UI (셀프호스트) | Mid | Control Plane 운영의 진입점 |
| **P2** | CI/CD FF Pipeline | Mid | 개발 프로세스 통합 |
| **P2** | Edge Proxy + NVRAM Cache | Mid | 오프라인 운영 + Fail-safe |
| **P2** | Progressive Delivery Controller | Mid | 8-Stage 프로세스 실현 |
| **P2** | Telemetry Pipeline | Mid | 가드레일/실험의 전제 |
| **P2** | 협력사 FF Interface Spec | Mid | Tier A 협력사 온보딩 시작 |
| **P3 — Nice to Have** | HPVC FF Evaluator (Safety) | Long | ASIL C-D 확장 시 |
| **P3** | A/B Experiment Engine | Long | 실험 문화 성숙 후 |
| **P3** | Entitlement Bridge | Long | FoD 상용화 시 |
| **P3** | RXSWIN Manager | Long | 형식승인 자동화 시 |
| **P3** | Flag Health Dashboard | Long | 전사 확산 후 모니터링 |

### Scoping 경계

| In Scope (본 프로젝트) | Out of Scope (후속) |
|---|---|
| Control Plane 셀프호스트 PoC | 멀티 브랜드(Genesis, Kia) 확장 |
| QM 차량 Evaluator SDK v1 | ASIL C-D Safety Evaluator 양산 |
| 카나리 50~100대 Pilot | 전 fleet 롤아웃 (30M+ 차량) |
| Codebeamer 양방향 링크 PoC | 전체 ALM 마이그레이션 |
| 협력사 Tier A 1~2개사 PoC | 전 협력사 FF 표준화 |
| COTA 패키지 기본 구조 | FOTA 레벨 Safety 패키지 양산 |
| 한국 시장 규제 대응 | 글로벌 전 시장 형식승인 |

---

## 6.8 핵심 개발 요구사항 정의

### 기능 요구사항 (Functional Requirements)

| ID | 카테고리 | 요구사항 | 우선순위 | 근거 |
|---|---|---|---|---|
| FR-01 | 플래그 관리 | Boolean/Multivariate 플래그 CRUD + 버전 관리 | P1 | 기본 기능 |
| FR-02 | 플래그 관리 | 환경별(Dev/Staging/Prod) 독립 구성, 단일 엔티티 | P1 | 구성 드리프트 방지 |
| FR-03 | 타겟팅 | VIN, 모델, HW revision, 지역, ASIL, fleet 세그먼트 기반 타겟팅 | P1 | 자동차 특화 |
| FR-04 | 타겟팅 | SHA256 Consistent Hashing 기반 % 롤아웃 (단조 확장 보장) | P1 | 카나리/Ring |
| FR-05 | 평가 | 차량 내 로컬 평가 (네트워크 의존성 제거), μs 지연 | P1 | 오프라인 필수 |
| FR-06 | 평가 | 4단계 Fail-safe 폴백 (현재값→캐시→NVRAM→하드코딩) | P1 | Safety |
| FR-07 | 승인 | ASIL 3트랙 승인 워크플로우 (QM/A-B/C-D 차등) | P1 | 거버넌스 |
| FR-08 | 승인 | 4-Eyes 원칙 + 변경 사유 필수 + 승인자 ID·타임스탬프 | P1 | 감사 |
| FR-09 | 감사 | 불변 Audit Trail — Who/What/When/Why/Before/After Diff | P1 | R155/R156 |
| FR-10 | 감사 | SUMS 연동 + RXSWIN 해당 여부 자동 판별 | P2 | R156 |
| FR-11 | 배포 | COTA 패키지 생성 + Uptane 이중서명 | P1 | OTA |
| FR-12 | 배포 | 8-Stage Progressive Delivery (카나리→Ring→GA) | P1 | 핵심 운영 |
| FR-13 | 킬스위치 | MQTT Push + CDN Pull 하이브리드 킬스위치 (<5분 전 fleet) | P1 | 안전 |
| FR-14 | 라이프사이클 | 플래그 만료일 관리 + Stale 자동 탐지 + 알림 | P1 | 기술부채 방지 |
| FR-15 | 텔레메트리 | 플래그 노출(exposure) 기록 + 가드레일 메트릭 수집 | P2 | 품질 |
| FR-16 | 실험 | VIN 코호트 A/B 테스트 + 통계 유의성 판정 | P3 | 실험 문화 |
| FR-17 | FoD | Entitlement 상태→Permission Flag 자동 동기화 | P3 | 수익화 |
| FR-18 | 카탈로그 | Feature Catalog — Feature ID·owner·expiry·ASIL·trace link | P1 | 거버넌스 기반 |
| FR-19 | ALM | Codebeamer 양방향 추적성 (Req ↔ Flag Spec ↔ Test) | P1 | ASPICE |
| FR-20 | 협력사 | OpenFeature Provider 인터페이스 + 협력사 SDK 호환성 테스트 | P2 | 생태계 |

### 비기능 요구사항 (Non-Functional Requirements)

| ID | 카테고리 | 요구사항 | 목표값 | 근거 |
|---|---|---|---|---|
| NFR-01 | 성능 | 차량 내 플래그 평가 지연 | <1ms (QM), <10ms (Safety) | 실시간 |
| NFR-02 | 성능 | COTA 킬스위치 전 fleet 전파 | <5분 | SLO |
| NFR-03 | 성능 | MQTT 킬스위치 온라인 fleet | <30초 | SLO |
| NFR-04 | 가용성 | Control Plane 업타임 | 99.9% | SLA |
| NFR-05 | 가용성 | 차량측 오프라인 동작 | 무기한 (Fail-safe 위계) | Safety |
| NFR-06 | 확장성 | 동시 차량 연결 수 | 100만+ (Mid), 1,000만+ (Long) | Fleet 규모 |
| NFR-07 | 확장성 | 활성 플래그 수 | 10,000+ (플랫폼 전체) | 성장 |
| NFR-08 | 보안 | 플래그 전송 암호화 | TLS 1.3 + Uptane 이중서명 | R155 |
| NFR-09 | 보안 | 콘솔 접근 인증 | MFA + RBAC + 4-Eyes | R155 |
| NFR-10 | 추적성 | 감사 로그 보관 | 10년 (규제 요구) | SUMS |
| NFR-11 | 호환성 | OpenFeature SDK 지원 언어 | C/C++, Rust, Java, Python | 차량+클라우드 |
| NFR-12 | 호환성 | AUTOSAR Adaptive/Classic 지원 | ara::com + Flashing Adapter | ECU 통합 |
| NFR-13 | 규제 | 한국 사이버보안 140항목 증적 생성 | 자동 | 2025.8 시행 |
| NFR-14 | 규제 | R156 SUMS 문서화 자동 생성 | 반자동 | EU 규제 |
| NFR-15 | 운영 | 플래그 Stale 비율 | <15% | 업계 벤치마크 |
