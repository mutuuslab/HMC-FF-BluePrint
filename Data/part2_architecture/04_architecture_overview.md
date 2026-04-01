# 4장. Target 아키텍처 개요

> **제2편. 아키텍처 블루프린트** | 대상 독자: CTO, 아키텍처팀, 플랫폼팀

---

## 4.1 설계 원칙

**"클라우드가 제어하고 차량이 평가한다 (Cloud-controlled, Local-evaluated)"**

- 플래그 평가는 네트워크 호출이 아닌 **차량 인메모리에서 마이크로초 지연**으로 수행
- 오프라인 우선 — **4단계 Fail-safe** (현재값→캐시→NVRAM→하드코딩 기본값)
- 비례적 거버넌스 — QM 인포테인먼트와 ASIL-D 제동에 동일 프로세스를 적용하지 않음
- Deploy ≠ Release — 코드 배포와 기능 출시를 구조적으로 분리

---

## 4.2 HAE FF 상세 컨셉 — V-Model 중심의 "Bill of Features"

> **출처:** 현대오토에버 Feature Flag 상세 컨셉 (공식 문서)

### 핵심 비전

FF System은 SDV 개발체계의 **"데이터 기반 동적제어 Backbone"**이자 **"기능 관리 파이프라인"**.

**Full Lifecycle Pipeline:**
```
상품기획 → Feature기획 → Function연계 → SYS/SW사양 → 아키텍처설계 → 개발 → 검증 → 빌드/배포 → 운영
```

### V-Model + FF System 통합 구조

V-Model의 **정중앙에 FF System("Bill of Features")**이 위치하고, 좌측(개발)→우측(검증/운영)의 모든 단계가 4-Plane과 연동:

```
    좌측 (개발)                    FF System                    우측 (검증/운영)
                                "Bill of Features"
┌──────────────┐         ┌─────────────────────┐         ┌──────────────┐
│Feature 관리   │ ←────→ │   Control Plane      │ ←────→ │ 운영 (CIF)    │
│Confluence,Jira│         │                     │         │ 고객 피드백    │
├──────────────┤         │   Quality Plane      │         ├──────────────┤
│요구사양       │ ←────→ │                     │ ←────→ │ 빌드/배포     │
│Codebeamer    │         │   Vehicle Plane      │         │ Bamboo, OTA  │
├──────────────┤         │                     │         ├──────────────┤
│아키텍처 설계  │ ←────→ │   Governance Plane   │ ←────→ │ SW 통합검증   │
│EA,PREEvision │         │                     │         │ SIL/HIL      │
├──────────────┤         │   FEEDBACK LOOP      │         ├──────────────┤
│SW 단위구현    │ ←────→ │      ↻              │ ←────→ │ SW 단위검증   │
│Bitbucket     │         └─────────────────────┘         │ PolySpace    │
└──────────────┘                                         └──────────────┘
```

### Toolchain 연동 맵 (HAE 기준)

| V-Model 단계 | 도구 | FF 연동 포인트 |
|---|---|---|
| **Feature 관리** | Confluence, Jira | Feature 기획, 고객 요구사항 → Feature 맵핑 |
| **요구사양** | **Codebeamer** | 고객요구사항→Feature 맵핑, **Feature-Function-사양 맵핑**, ASIL 태그 |
| **아키텍처 설계** | Enterprise Architect, PREEvision, MATLAB | MBD 기반 설계, **Fail-safe/ASIL 등급 연계**, HW/SW Sub-sys 설계 |
| **SW 단위구현** | Bitbucket | **Flag별 코드 분리**, 빌드 및 **차량 조건별 활성화** |
| **SW 단위검증** | PolySpace, SonarQube | MISRA, 정적분석, FF ON/OFF 양쪽 커버리지 |
| **SW 통합검증** | MATLAB/Simulink | SIL/HIL, **Canary Release**, **Shadow Flag 검증** |
| **빌드/배포** | Bamboo | OTA 연동, **Telemetry 분석**, Rollback 프로세스 |
| **운영** | CIF System | **고객 피드백 반영**, User Acceptance Test |

### 핵심 연동 원칙

1. **Feature-Function-사양 맵핑**: Codebeamer에서 고객 요구→Feature→Function→SYS/SW 사양을 양방향 추적 → ASPICE 추적성 확보
2. **Flag별 코드 분리**: Bitbucket에서 각 플래그의 ON/OFF 코드가 분리되어 관리 → Trunk-Based + FF 전제
3. **Shadow Flag 검증**: SIL/HIL 단계에서 실제 차량 동작 없이 플래그 평가 결과를 검증하는 Shadow 모드 → 안전성 확보
4. **FEEDBACK LOOP**: 운영 단계의 텔레메트리·고객 피드백이 Feature 기획 단계로 환류 → "기능 관리 파이프라인"의 순환 구조
5. **Bill of Features**: FF System이 차량의 BOM(Bill of Materials)에 대응하는 **BoF(Bill of Features)** 역할 — 어떤 차량에 어떤 기능이 활성화되어 있는지의 단일 진실 원천

---

## 4.3 4-Tier 계층 구조

| Tier | 구성 | 핵심 역할 | 기술 스택 |
|---|---|---|---|
| **Cloud** | FF 관리 서버 | 플래그 CRUD, 타겟팅 규칙, 승인 워크플로우, 감사 로깅 | PostgreSQL, Redis, Kafka, SSE |
| **Edge** | 경량 캐싱 프록시 | 리전별 캐시, 오프라인 모드, 데이지체이닝 | Unleash Edge(Rust, ~11MiB) 또는 Relay Proxy(Go) |
| **Vehicle** | HPVC(42dot SDV OS) + FF SDK | 로컬 평가, NVRAM 영구 캐시, Safety/QM 파티션 분리 | C/C++, Rust, OpenFeature Provider |
| **ECU** | Legacy MCU | 사전 평가된 파라미터 수신 (복잡한 평가 미실행) | SOME/IP, CAN/CAN-FD/LIN |

**경영층 핵심:** 새 HW 불필요. 기존 HPVC/ccOS/Zone Controller 위에 **SW 레이어로 구현**.

---

## 4.4 기존 Domain vs SDV/Zonal 아키텍처 비교

| 관점 | 기존 Domain | SDV/Zonal |
|---|---|---|
| FF 평가 위치 | 각 도메인 HPC 개별 SDK | **HPVC 단일 평가 엔진** |
| 통신 백본 | CAN/CAN-FD (도메인별) | **Automotive Ethernet + DDS/SOME/IP** |
| 전파 지연 | 도메인별 상이 | **<100ms 통합 목표** |
| Legacy ECU 통합 | CGW → 도메인 CAN | **Zone Controller → CAN/LIN 브릿지** |
| Safety 분리 | 물리적 ECU 분리 | **Hypervisor 파티션 (SW 분리)** |
| 확장성 | 도메인 추가 시 CGW 변경 | **Zone 추가로 유연 확장** |

양 아키텍처 병행 기간(2027~2029)의 운영 방안 필요.

---

## 4.5 전체 연동 시스템 인터페이스 맵

**9개 시스템 범주:**

| # | 시스템 | 인터페이스 패턴 | 방향 |
|---|---|---|---|
| ① | ALM/PLM (Codebeamer) | 양방향 추적성 — Req ↔ Flag Spec | 양방향 |
| ② | CI/CD (Jenkins, GitLab CI) | 정적분석 → ASIL 게이트 → 매트릭스 테스트 → 패키징 | 단방향 |
| ③ | OTA (UCM, Uptane) | COTA(구성, KB) + SOTA(코드, MB) 분리 전달 | Cloud→Vehicle |
| ④ | 차량 ECU/SOC | Mobilgene Classic(NVM), Adaptive(SDK), ccOS(SDK) | Cloud→Vehicle |
| ⑤ | 텔레메트리 | Kafka 스트리밍, 메달리온 아키텍처, ML 이상탐지 | Vehicle→Cloud |
| ⑥ | A/B 실험 | VIN 일관 해싱 코호트, 노출 기록, 어트리뷰션 | 양방향 |
| ⑦ | Safety/Compliance | ASIL 게이트, SUMS, RXSWIN | 양방향 |
| ⑧ | VCDM | VIN별 플래그 상태 + 옵션코드/부품번호 통합 | 양방향 |
| ⑨ | 고객 대면 | Connect App(FoD), 딜러 진단(수동 활성화) | 양방향 |

---

## 4.6 데이터 교환 패턴 요약

| 데이터 흐름 | 방향 | 형식 | 빈도 | 프로토콜 |
|---|---|---|---|---|
| 플래그 정의 (키, 변형, 규칙) | Cloud→Edge→Vehicle | JSON/Binary | 변경 시 (SSE) | SSE + TLS 1.3 |
| 평가 컨텍스트 (VIN, 모델, 지역) | SDK→Evaluation Engine | 구조화 객체 | 호출당 | In-process |
| 텔레메트리 이벤트 | Vehicle→Cloud | Event Stream | 배치+실시간 | Kafka |
| 안전 제약 (ASIL, Fail-safe) | ALM→FF Platform | API Sync | 생성/수정 시 | REST API |
| FoD 과금 | FF Platform↔Billing | Subscription | 실시간 | gRPC |
