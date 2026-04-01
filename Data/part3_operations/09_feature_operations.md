# 9장. 피처 관리 운영 체계

> **제3편. 운영 모델** | 대상 독자: 개발조직장, 플랫폼팀, QA, PMO

---

## 9.1 Feature Flag 기본 원리

### Feature Flag란?

Feature Flag는 코드 안의 **제어점(control point)**으로, 특정 기능이나 동작의 활성/비활성을 결정한다. 재배포 없이 기능의 노출 여부를 런타임에 변경할 수 있는 개발 방법론이다.

- **Boolean 플래그**: 단순 On/Off 스위치
- **Multivariate 플래그**: 여러 옵션/변형(variant) 중 선택 — A/B/C 테스트, 지역별 구성 등에 활용

### FF가 가능하게 하는 4가지

| 능력 | 설명 |
|---|---|
| **Deploy와 Release 분리** | 기능을 FF 뒤에 숨긴 채 프로덕션에 배포, 준비되면 사용자에게 활성화 |
| **단계적 롤아웃** | 소규모 사용자부터 점진 활성화 → 리스크 감소 + 실환경 테스트 |
| **A/B 테스트/실험** | 여러 변형을 동시 테스트하고 영향 측정 |
| **원격 구성** | 재배포 없이 실시간으로 앱 동작/구성 변경 |

### FF 사용의 핵심 이점

- **안전한 릴리스** — 노출 범위를 제어해 신규 기능 배포 리스크 감소
- **빠른 반복** — 배포 사이클을 기다리지 않고 즉시 테스트·개선
- **타겟 롤아웃** — 특정 사용자/그룹/환경에만 활성화
- **즉각적 롤백** — 버그 발견 시 즉시 Off → 재배포 불필요
- **실험 문화** — 데이터 기반 제품 의사결정

### FF 워크플로우 6단계 (범용)

```
① 새 기능 개발 시작 (예: sharing_button)
② FF 플랫폼에서 플래그 생성 — Dev: enabled, Prod: disabled
③ 코드에서 조건문으로 플래그 값 체크 — enabled일 때만 기능 노출
④ FF가 Off이므로 미완성 코드도 안전하게 프로덕션 배포 가능
⑤ 준비 완료 → 팀원·베타 테스터에게 먼저 활성화
⑥ 정상 확인 → 전체 프로덕션 활성화 → 롤아웃 완료
```

### HMC 자동차 FF 워크플로우 (6단계 + 자동차 특화)

| 범용 단계 | HMC 적용 | 자동차 특화 사항 |
|---|---|---|
| ① 기능 개발 시작 | Flag Spec 작성 + ALM(Codebeamer) 등록 | ASIL 분류 분기 (QM/A-B/C-D) |
| ② 플래그 생성 (Dev:On, Prod:Off) | FF 플랫폼에서 생성 + ASIL 태그 | ASIL C-D는 Safety Board 사전 승인 |
| ③ 조건문으로 코드 래핑 | OpenFeature SDK로 toggle point 구현 | ON/OFF **양쪽 경로 모두** 코딩 + Safety path 검증 |
| ④ 프로덕션 배포 (기능 숨김) | **COTA 패키지(KB)**로 차량에 전달 | 4단계 Fail-safe 위계 적용 (캐시→NVRAM→하드코딩) |
| ⑤ 팀·베타 활성화 | **내부 플릿 50~100대 카나리** | VIN 타겟팅, 텔레메트리 모니터링, Safety DTC 감시 |
| ⑥ 전체 활성화 | **Ring 1→2→3→4→GA** 단계적 확산 | 매 Ring에 헬스체크, ASIL C-D는 매 단계 Board 승인 |

### SDLC 내 FF의 더 넓은 역할

FF는 단순 기능 토글을 넘어 **소프트웨어 현대화의 핵심 도구**:
- **모놀리스→마이크로서비스 전환** — 신규 서비스를 FF 뒤에 배치, 점진적 트래픽 이전
- **레거시→신규 시스템 마이그레이션** — 사용자/컴포넌트를 FF로 순차 마이그레이션
- **두 앱 통합(합병)** — FF로 기능 단위 점진 통합
- **데이터 민감 산업** (금융, 의료, 보험, **자동차**) — 현대화 리스크가 높고 리스크 수용도가 낮은 산업에서 특히 유용

---

## 9.2 배포 전략 8종과 자동차 FF 매핑

### 전략 개요 매트릭스

| 전략 | 설명 | 리스크 | 다운타임 | 복잡도 | 최적 대상 |
|---|---|---|---|---|---|
| **Big Bang** | 전체 앱을 새 버전으로 한꺼번에 교체 | 높음 | 있음 | 낮음 | 소규모 앱, 비핵심 시스템, 예정된 유지보수 |
| **Canary** | 소수에게 먼저 배포 후 점진 확대 | 낮음 | 없음 | 중간 | 다양한 사용자 기반, 고가치 기능, 리스크 회피 조직 |
| **Blue-Green** | 두 동일 환경 병행, 트래픽 전환 | 중간 | 없음 | 중~높 | 무중단 필수 앱, 대규모 구성 변경 |
| **A/B Testing** | 복수 버전 배포 후 성과 메트릭 비교 | 낮음 | 없음 | 중~높 | UX 개선, 성능 최적화, 기능 평가 |
| **Progressive Delivery** | 점진 롤아웃 + 실시간 모니터링 종합 | 낮음 | 없음 | 높음 | 엔터프라이즈, 미션 크리티컬 시스템 |
| **Rolling** | 앱 인스턴스를 순차적으로 교체 | 중간 | 없음 | 중간 | 컨테이너 환경, Kubernetes |
| **Shadow** | 프로덕션 트래픽 복제본을 신버전에 보내되 결과는 사용자에게 미반환 | 낮음 | 없음 | 높음 | 결제, 인증, 미션 크리티컬 |
| **Recreate** | 구버전 완전 제거 후 신버전 배포 | 높음 | 있음 | 낮음 | 동시 다중 버전 불가 앱, DB 스키마 변경 |

### 전략별 상세와 FF의 역할

**① Big Bang** — 기존 HMC의 All-or-nothing OTA. 100% 사용자에게 동시 배포. CrowdStrike 사태(2024)처럼 결과가 치명적일 수 있음. FF를 추가하면 배포 후 점진 활성화 + kill-switch 안전망으로 리스크를 근본적으로 완화.

**② Canary** — 광산의 카나리아처럼 소수(1%)에게 먼저 배포, 이상 없으면 점진 확대. FF 없이도 네트워크 레벨 트래픽 분할로 가능하지만, 문제 발생 시 **새 파이프라인으로 롤백 대기** 필요. FF가 있으면 **플래그 Off만으로 즉시 롤백**, 개별 기능 단위 제어 가능.

**③ Blue-Green** — 두 동일 환경(Blue/Green)을 병행 운영, 신버전을 Green에 배포·검증 후 트래픽 전환. FF를 추가하면 전체 전환 대신 **사용자를 점진적으로 Green으로 이동**, 내부 사용자 사전 테스트 후 확대.

**④ A/B Testing** — 사용자를 무작위로 A(대조군)/B(변형)에 배정, 행동 측정으로 승리 변형 결정. FF 없이는 테스트별 커스텀 코드 작성 + 승리 변형 트래픽 리디렉션 수작업. FF가 있으면 **코드 터치 없이 세그먼트 타겟팅, 비율 조정, 분석 연동** 가능.

**⑤ Progressive Delivery** — Continuous Delivery에 점진 롤아웃 + 실시간 모니터링을 결합한 종합 전략. Canary + Blue-Green + A/B를 조합. 다수 팀·기능에 걸쳐 확장하면 FF 중앙화 플랫폼 없이는 혼돈. **HMC의 Target 전략 = 8-Stage 프로세스가 바로 이것.**

**⑥ Rolling** — Kubernetes 등 컨테이너 환경에서 인스턴스를 소규모 배치로 순차 교체. FF를 결합하면 인프라의 인스턴스 교체(배포)와 기능 활성화(릴리스)를 분리. 10% 인스턴스 업데이트 → 모니터링 → 30% → 100%.

**⑦ Shadow** — 프로덕션 트래픽(또는 복사본)을 신버전에 보내되 **결과를 사용자에게 반환하지 않음**. 성능·리소스·오류를 실제 트래픽으로 테스트. 결제 시스템 교체 시 신버전이 트랜잭션을 처리(실제 과금 미실행)하고 구버전과 결과 비교. FF로 **어떤 트래픽을 shadow할지 정밀 제어** + 점진적 shadow→production 전환.

**⑧ Recreate** — 구버전 완전 제거 후 신버전 배포. 동시 다중 버전 불가능한 경우(DB 스키마 변경 등) 사용. 롤백이 매우 어려움. FF를 추가하면 **모든 신규 기능을 disabled 상태로 배포** → 기본 시스템 정상 확인 후 점진 활성화.

### HMC 영역별 Target 배포 전략 조합

| 영역 | 1차 전략 | 보조 전략 | FF 역할 |
|---|---|---|---|
| QM 인포테인먼트 | **Progressive Delivery** | A/B Testing | 전체 8-Stage |
| QM Comfort / FoD | **Canary → Progressive** | A/B Testing | 코호트 + 실험 |
| ASIL A-B | **Canary** | Rolling | 카나리 + 안전엔지니어 Gate |
| ASIL C-D | **Canary** (매우 보수적) | — | 매 단계 Safety Board 승인 |
| 클라우드 서비스 | **Blue-Green + Rolling** | Progressive | 환경 전환 + 인스턴스 순차 |
| Safety-critical 신규 도입 | **Shadow → Canary** | — | Shadow 테스트 후 점진 전환 |
| 레거시 ECU 전환 | **Recreate** (정비소) | — | 리플래시 후 FF로 점진 활성화 |

### 배포 전략 선택 기준

| 기준 | 권장 전략 |
|---|---|
| **리스크 허용도 낮음** | Canary 또는 Progressive Delivery |
| **빠른 롤백 필요** | Blue-Green (환경 전환) + FF (기능 단위) |
| **모놀리식 아키텍처** | Blue-Green (깔끔한 전환) |
| **마이크로서비스** | Rolling 또는 Progressive Delivery |
| **특정 세그먼트 먼저 테스트** | Progressive Delivery + FF 세그먼트 타겟팅 |
| **데이터 기반 의사결정** | A/B Testing + FF 분석 연동 |

> **핵심 메시지:** HMC는 단일 배포 전략이 아니라 **영역별로 최적 전략을 조합**하며, FF가 모든 전략에서 "배포와 릴리스를 분리"하는 공통 제어 레이어로 작동. 궁극적으로 FF는 배포 전략 자체보다 더 큰 가치를 제공: **실험 문화 구축, 피드백 루프 가속, 소프트웨어 현대화 리스크 감소**.

---

## 9.3 플래그 유형 분류 체계 (6종 운영 + 4-Tier 규제)

### 운영 분류 (6종)

| 플래그 유형 | 수명 | 동적성 | ASIL | 예시 | 승인 수준 |
|---|---|---|---|---|---|
| **릴리스 플래그** | 일~주 (임시) | 정적 | QM | 미완성 기능 숨김 | PO + Eng Lead |
| **실험 플래그** | 주~월 | 높음 | QM | UX A/B 테스트 | PO + Exp Lead |
| **운영 플래그** | 영구 | 높음 | QM~B | 킬스위치, 서킷브레이커 | DevOps/SRE |
| **권한 플래그** | 장기 | 요청별 | QM | FoD 구독 게이팅 | PO + Billing |
| **안전 핵심 플래그** | 영구 | 제한적 | B~D | ADAS 기능 게이트 | Safety Board |
| **구성 플래그** | 장기 | 준정적 | QM~B | 지역 캘리브레이션 | Eng Lead |

### 규제 분류 (4-Tier)

| Tier | 설명 | R156 영향 | ISO 26262 | 예시 |
|---|---|---|---|---|
| **Tier 1** | Safety-critical | RXSWIN 업데이트 + 전체 SUMS | ASIL C/D, FFI 필수 | AEB 활성화/비활성화 |
| **Tier 2** | Type-approval relevant | RXSWIN 업데이트 | ASIL A/B | 배기 파라미터 |
| **Tier 3** | Non-regulated functional | SUMS 추적만 | QM | Comfort 기능 |
| **Tier 4** | UX/cosmetic | 최소 추적 | QM | 테마, 선호 설정 |

> **운영 6종 × 규제 4-Tier 매트릭스**로 모든 플래그를 분류. 분류 결과에 따라 승인 워크플로우, 테스트 범위, 감사 수준이 자동 결정됨.

### Criticality Tier T0~T4 (운영 위험도 기반)

규제 4-Tier와 별도로, **운영 관점에서의 위험도 등급**:

| Tier | 범위 | 승인 요구 | 초기 12개월 |
|---|---|---|---|
| **T0** | UI, 가시성, 정보성 기능 | Domain Owner + QA | ✅ 운영 |
| **T1** | 비안전이지만 고객 영향 큼 | Domain + QA + Platform delegate | ✅ 운영 |
| **T2** | 규제/상용/과금/개인정보 영향 | + Legal/Privacy/Security | ✅ 제한적 운영 |
| **T3** | 차량 동작에 간접 영향, 안전 여파 가능 | + Safety Review Board + Launch Committee | ⚠️ 파일럿만 |
| **T4** | Safety-critical 또는 homologation 핵심 | **별도 Safety 프로세스 (일반 FF와 분리)** | ❌ 미적용 |

> **권고:** 초기 12개월은 **T0~T2 중심으로 운영**하고, T3 이상은 제한적 파일럿만 허용. T4는 FF 제어 대신 별도 안전 승인 프로세스로 관리.

### 플래그 명명 규칙

**기본 형식:** `{type}_{team}_{feature}_{detail}`

**도메인 확장 형식:** `<domain>.<feature>.<purpose>.<scope>.<tier>`

| 예시 | 설명 |
|---|---|
| `nav.routing.dynamic_reroute.kor.t1` | 내비 동적 재경로, 한국, T1 |
| `nav.map.ar_video.capability_gate.t1` | 내비 AR 비디오, 역량 게이팅, T1 |
| `nav.search.poi_ranking.experiment.t0` | 내비 POI 랭킹, 실험, T0 |
| `adas.aeb.sensitivity_v2.canary.t3` | ADAS AEB, 카나리, T3 |
| `fod.rearsteering.10deg.permission.t2` | FoD 후륜조향, 과금, T2 |

| 접두어 | 유형 | 수명 | 정리 우선순위 |
|---|---|---|---|
| `release_` | 릴리스 | 일~주 | **높음** |
| `experiment_` | 실험 | 일~주 | **높음** |
| `ops_` | 운영 | 주~영구 | 낮음 |
| `permission_` | 권한 | 장기 | 낮음 |
| `safety_` | 안전 | 영구 관리 | **최우선** |
| `config_` | 구성 | 장기 | 낮음 |

**필수 메타데이터:** owner, team, 만료일, 이슈 티켓(Jira/Codebeamer), ASIL 분류, Tier 분류, 대상 서비스.

> QM과 ASIL-D에 같은 프로세스를 적용하면 비안전 기능은 출시 불가능하거나 안전 기능 거버넌스가 부족해짐. **비례적 프로세스 엄격성**이 핵심 원칙.

---

## 9.4 피처 라이프사이클 (11단계)

```
Proposed → Approved → Implemented → Verified → Shadow → Canary → Ramp-up → GA → Locked → Deprecated → Retired
                                                                                    ↑ Rollback ← (Shadow/Canary/Ramp-up/GA)
```

### 단계별 활동 및 필수 산출물

| # | 단계 | 핵심 활동 | 필수 산출물 |
|---|---|---|---|
| ① | **Proposed** | Flag Spec 작성, ALM 등록, ASIL/Criticality 분류, 3-State 결정(Selected/Deselected/Deferred), Feature Interaction 매트릭스 갱신 | Feature Brief, Owner, KPI, Criticality Tier |
| ② | **Approved** | Architecture 매핑, API 계약 정의, 테스트 전략 수립, 공급사 인터페이스 확인 | Architecture mapping, API contract, Test strategy |
| ③ | **Implemented** | OpenFeature SDK 통합, ON/OFF 양쪽 경로 코딩, Safety 특화(ASIL C/D: 이중채널, Watchdog, Latch-at-Init) | 코드/설정/SDK 등록 |
| ④ | **Verified** | 정적분석, ASIL Gate, 매트릭스 테스트, SIL/HIL/vECU 검증, COTA/SOTA 패키징 | SIL/HIL/vECU 결과, 보안 체크 |
| ⑤ | **Shadow** | 실차에서 플래그 평가하되 **고객에게 노출하지 않음**, 텔레메트리 수집, 성능 영향 측정 | 실차 telemetry, customer impact 없음 확인 |
| ⑥ | **Canary** | 소규모 fleet(50~100대)에 실제 노출, 가드레일 모니터링, 롤백 조건 사전 정의 | 대상군, 비율, rollback 조건 |
| ⑦ | **Ramp-up** | Ring 1→2→3 단계 확장, 이슈 모니터링, 확장 계획 | 확장 계획, 이슈 모니터링 로그 |
| ⑧ | **General Availability** | 전 fleet 노출, SUMS 업데이트, FoD 과금 연동, Connect App 노출 | SUMS 문서, FoD 연동 확인 |
| ⑨ | **Locked** | 안정화 후 변경 동결 — 값 변경 불가, 설정만 읽기 모드 | Lock 기록 |
| ⑩ | **Deprecated** | 은퇴 예고, 영향 분석, 제거 일정 설정, 대체 기능 안내 | 제거 일정, 영향분석 |
| ⑪ | **Retired** | 코드 제거, 문서 폐쇄, Audit 완료, 기술부채 정리 | 코드 제거 확인, Audit 완료 |

> **Rollback:** Shadow/Canary/Ramp-up/GA 어디에서든 Verified 단계로 되돌릴 수 있음. 롤백 후 재검증 필수.

### ⑦ 은퇴 (Retirement)
- Stale 탐지: 평가 없음 N일, 만료일 초과, Code Reference 0건
- Time Bomb: CI 테스트 실패 트리거
- 월간 Capture the Flag 정리 스프린트
- **팀당 활성 플래그 상한: 50개**

---

## 9.4.1 FF 안티패턴 — 반드시 피해야 할 것

| 안티패턴 | 문제 | 올바른 접근 |
|---|---|---|
| **FF로 비즈니스 로직 대체** | FF가 코드의 분기 규칙을 해석하면 실수가 쉬워짐. FF 소프트웨어는 IDE가 아님 | FF는 기능 노출 제어에만 사용. 접근 제어·데이터 분리는 비즈니스 로직으로 구현 |
| **플래그 2단계 이상 중첩** | Flag A가 ON일 때만 Flag B가 평가되는 구조 → 조합 폭발, 디버깅 불가 | **1단계까지만 중첩**. 부모 플래그 아래 자식 플래그는 허용하되 그 이상은 금지 |
| **사후 적용 (Afterthought)** | 기능 개발 완료 후 FF를 덧씌우면 ON/OFF 양쪽 경로가 불완전 | **설계 단계부터 FF 계획**. "이 기능을 FF 뒤에 어떻게 넣을까"를 먼저 결정 |
| **만능 플래그 (God Flag)** | 하나의 플래그가 여러 기능을 동시 제어 | **1 플래그 = 1 기능** 원칙. 범위를 최소화 |
| **정리 안 함** | 출시 완료된 릴리스 플래그를 코드에 방치 → 기술부채 | 90일 은퇴 규칙 + Time Bomb CI + 월간 Cleanup Sprint |
| **권한 없는 전원 접근** | 누구나 프로덕션 플래그를 토글 가능 | RBAC + 4-Eyes + ASIL별 승인 워크플로우 |

> **자동차 특화 안티패턴:** Safety 플래그를 QM 플래그와 동일한 프로세스로 관리하는 것. 비례적 프로세스 엄격성(Proportionate Governance) 원칙 위반.

---

## 9.5 거버넌스 프레임워크

### 플래그 위생(Flag Hygiene) 강제 사항

- 임시 플래그 생성 시 **필수 폐기 날짜**
- 인벤토리 상한: 팀당 50개 (초과 시 기존 제거 필요)
- **Flag Hygiene Score** 분기 목표: >85%
- 릴리스 플래그 최대 수명: GA 후 **90일**

### 업계 벤치마크 (Compendium 조사 결과)

| 지표 | Healthy | Warning | Critical |
|---|---|---|---|
| Stale flag 비율 | **<15%** | 15~30% | >30% |
| 생성 대비 제거 비율 | **>0.8** | 0.5~0.8 | <0.5 |
| 활성 플래그 수 (200+ 엔지니어 조직) | **<800** | 800~2,000 | **>2,000** |

> 대부분의 팀이 생성한 플래그의 절반도 정리하지 않는다. 이것이 기술부채의 주요 원인.

### Time Bomb CI 테스트 — 자동 강제 정리

> **경각심 사례 — Knight Capital Group 파산 (2012):** 오래된 Feature Flag를 잘못 재사용하여 시스템이 의도치 않은 동작을 수행 → 45분 만에 **$440M 손실**, 회사 파산. FF 라이프사이클 관리 실패의 극단적 결과. (Mahdavi-Hezaveh et al., ESE 2021; Jézéquel et al., SPLC 2022 인용)

**원리:** 만료된 FF가 코드에 남아 있으면 CI 빌드가 자동 실패하도록 강제.

**구현 패턴:**
1. FF 관리 API에서 만료된 플래그 목록 조회
2. CI 파이프라인(Jenkins/GitLab CI)에서 코드베이스 스캔 — 만료 플래그 참조 탐지
3. 참조 발견 시 **빌드 실패** (테스트가 아닌 빌드 자체를 막음)

**업계 사례:**
- **The Guardian:** "실험에 만료일을 부여하고, 만료된 실험이 있으면 빌드 시스템이 해당 팀의 작업을 처리하지 않음"
- **Optimizely:** 월간 "Feature Flag Removal Day" — 4~6시간 집중 정리 스프린트. 종료 기준: 30일 이상 100% 롤아웃 + 주요 버그 없음
- **Uber Piranha:** 오픈소스 자동 리팩토링 도구 — 모바일 앱에서 ~2,000개 stale 플래그를 최소한의 수작업으로 자동 탐지·삭제

### LaunchDarkly 7단계 라이프사이클 (참조 모델)

```
New → Active → Launched → Inactive → Ready for Code Removal → Ready to Archive → Archived
```

- `ld-find-code-refs` CLI: 리포지토리 스캔으로 플래그 키를 파일·라인 번호에 매핑
- 모든 참조가 제거되면 "extinction event" 발생 → 자동 아카이브 후보

### Unleash의 거버넌스 기능 (참조 모델)

- 단일 플래그 엔티티가 전 환경에 존재, 환경별 구성만 분리 → **구성 드리프트 제거**
- 자동 Stale 마킹 (예상 수명 초과 시)
- **Technical Debt Dashboard** — 프로젝트 수준 건강도 등급
- **Unknown Flag 탐지** — SDK가 평가하려는데 플랫폼에 없는 플래그 감지 (오타, stale 참조)
- 변경 요청(Change Request) 내장: 4-Eyes 원칙, 승인자 ID + 타임스탬프

### HMC 적용 방안

| 도구/패턴 | 적용 시기 | 효과 |
|---|---|---|
| Flag 명명 규칙 + 필수 메타데이터 | Quick (2026) | 기본 거버넌스 확립 |
| Time Bomb CI (만료 플래그 빌드 실패) | Quick (2026) | 기술부채 축적 방지 |
| 월간 Cleanup Sprint | Quick (2026) | Stale <15% 유지 |
| 자동 Stale 탐지 + Dashboard | Mid (2027~28) | 프로젝트별 건강도 가시화 |
| Piranha 스타일 자동 리팩토링 | Long (2029~) | 코드 수준 자동 정리 |

### 플래그 명명 규칙

**패턴: `{type}_{team}_{feature}_{detail}`**

| type 접두사 | 수명 | 정리 우선순위 | 예시 |
|---|---|---|---|
| `release_` | 일~주 | **높음** | `release_hmi_newdashboard_v3` |
| `experiment_` | 일~주 | **높음** | `experiment_ux_onboarding_flow_b` |
| `ops_` | 주~영구 | 낮음 | `ops_sre_circuit_breaker_payment` |
| `permission_` | 장기 | 낮음 | `permission_fod_rearsteering_10deg` |
| `safety_` | 신중 관리 | **치명적** | `safety_adas_aeb_sensitivity_v2` |

### 필수 메타데이터 (플래그당)

| 필드 | 필수 | 설명 |
|---|---|---|
| Owner | ✅ | 개인 또는 팀 |
| Team | ✅ | 소속 스쿼드 |
| Expiration date | ✅ (임시) | 만료일 — 없으면 CI 경고 |
| Issue ticket | ✅ | Jira/ALM(Codebeamer) 링크 |
| **ASIL 분류** | ✅ | QM / A / B / C / D |
| Flag type | ✅ | release / experiment / ops / permission / safety |
| Target services | ✅ | 영향받는 ECU/서비스 목록 |

---

## 9.6 4-Tier 플래그 분류 체계 (규제 기반)

R156/R155/ISO 26262 규제 분석에서 도출된 분류:

| Tier | 설명 | R156 영향 | ISO 26262 | 예시 | 승인 수준 |
|---|---|---|---|---|---|
| **Tier 1** | Safety-critical | RXSWIN 업데이트 + SUMS 전체 | **ASIL C/D** — FFI 필수, MC/DC, 이중채널 | AEB 활성화/비활성화 | Safety Board + 독립 평가 |
| **Tier 2** | 형식승인 관련 | RXSWIN 업데이트 | **ASIL A/B** | 배기가스 파라미터 | 안전엔지니어 |
| **Tier 3** | 비규제 기능 | SUMS 추적만 | **QM** | 컴포트, FoD | PO + Eng Lead |
| **Tier 4** | UX/화장적 | 최소 추적 | **QM** | 테마, 선호 설정 | 자동 승인 가능 |

### ISO 26262 FFI(Freedom from Interference) 상세

Tier 1 플래그의 ASIL D 평가 로직은 하위 ASIL 처리와 **격리 필수** (§7.4.11):

| 격리 수단 | 설명 |
|---|---|
| **메모리 파티셔닝** | Safety FF Evaluator와 QM FF Evaluator의 메모리 영역 분리 |
| **시간 격리** | ASIL D 평가 실행시간 한정 (Watchdog), QM이 Safety 시간 잠식 불가 |
| **전용 실행경로** | Safety 플래그는 이중채널(Ch.A+Ch.B) + Voter/Comparator |
| **고장 허용** | QM 평가 결함 → Safety 플래그 상태 손상 불가 |
| **검증** | CRC + 이중 저장 + 타당성 검사(plausibility check) |

> **ISO 26262 Gap:** OTA 배포 후 런타임 구성 변경을 명시적으로 다루지 않음 — 표준이 개발 단계용으로 설계됨. 이 gap이 **TÜV SÜD 파트너십 기회**의 근거.

---

## 9.7 자동차 A/B 테스트 특화 기법

### 소규모 표본 문제

자동차 A/B 테스트는 웹/모바일(수백만 사용자)과 달리 **소규모 표본**으로 유의성을 확보해야 함.

| 기법 | 출처 | 설명 | HMC 적용 |
|---|---|---|---|
| **BMW Design** (Balance Match Weighted) | 의료연구→자동차 최초 적용 | **28대에서도** 균형 매칭으로 통계적 유의성 확보 | Pilot Wave 1 카나리 |
| **BOAT Framework** (Bayesian Observational Testing) | 학술 연구 | 무작위 실험 불가 시나리오에서 관찰 데이터 기반 인과 추론 | Safety 기능(무작위 불가) |

### 교란변수 (Confounding Variables)

| 교란변수 | 예시 | 통제 방법 |
|---|---|---|
| 날씨/온도 | 동일 기능이 영하·영상에서 다르게 작동 | 지역·계절 층화 |
| 도로 유형/노면 | 고속도로 vs 비포장 | 주행 패턴 클러스터링 |
| 운전자 행동 | 공격적/보수적 운전 | 운전 스타일 분류 |
| 시간대/계절 | 주간/야간, 겨울/여름 | 시간 층화 |
| 고도/습도 | 산간/해안 | 지리적 층화 |
| 차량 마모 | 신차 vs 5만km | 주행거리 층화 |

### 코호트 필수 층화 차원

VIN 코호트 배정 시 **최소 5개 차원으로 층화**:
- 차량 모델 + 트림
- HW 리비전 (HW3 vs HW4 등)
- 지리적 지역 + 기후대
- 운전 패턴 클러스터
- 차량 마모/주행거리

---

## 9.8 ASPICE 양방향 추적성

| ASPICE 프로세스 | FF 산출물 | 추적 방향 |
|---|---|---|
| SYS.2 시스템 요구분석 | Flag Specification (ASIL 분류) | Req → Flag Spec |
| SWE.1 SW 요구분석 | SDK 통합 요구사항 | Flag Spec → SW Req |
| SWE.2 SW 아키텍처 | FF Evaluation Engine 아키텍처 | SW Req → Architecture |
| SWE.3 상세설계/구현 | Toggle Point 구현 | Architecture → Code |
| SWE.4 단위 검증 | ON/OFF 양쪽 단위 테스트 | Code → Unit Test |
| SWE.5 통합 테스트 | 플래그 매트릭스 통합 테스트 | Unit → Integration |
| SWE.6 적격성 테스트 | SIL/HIL/디지털트윈 결과 | Integration → Qualification |
| SUP.8 형상관리 | 감사 추적, 버전 관리 | 전 구간 |
| SUP.10 변경요청관리 | Flag Spec 변경 시 CR 발행 | 전 구간 |
