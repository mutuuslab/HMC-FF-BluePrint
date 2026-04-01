# 8장. CI/CD Toolchain 및 FF 파이프라인 통합

> **제3편. 운영 모델** | 대상 독자: CTO, 플랫폼팀, DevOps, CI/CD 운영

---

## 8.1 현행 Toolchain과 FF 통합 목표

### 현재 HMC CI/CD 환경 (추정)

| 도구 | 역할 | FF 통합 Gap |
|---|---|---|
| Jenkins / GitLab CI | 빌드·테스트 자동화 | FF 생성/변경 Step 미존재 |
| Jira / ALM(Codebeamer) | 요구사항·이슈 추적 | Flag Spec ↔ 요구사항 양방향 링크 미구축 |
| Git (Gitflow) | 소스 코드 관리 | Trunk-Based + FF 전환 필요 |
| SIL/HIL/MIL | 시뮬레이션 검증 | FF 조합 매트릭스 테스트 미지원 |
| Artifactory / Nexus | 바이너리 저장소 | COTA/SOTA 패키지 분리 미적용 |
| SonarQube | 정적 분석 | FF 관련 코드 품질 규칙 미정의 |

### Target: FF-aware CI/CD Pipeline

```
코드 커밋 (Trunk)
  ↓
[Stage 0] Feature Model 검증 ★신규
  ├── Feature Model 제약조건 검증 (requires/excludes/XOR 위반 탐지)
  ├── 3-State 분류 확인: Selected(확정) / Deselected(제외) / Deferred(유보=FF)
  ├── Deselected 기능 코드 참조 탐지 → 빌드 실패 (Dead code 제거 강제)
  ├── Feature Interaction 탐지: Safety FF 간 미정의 상호작용 경고
  └── Feature Model ↔ Codebeamer 동기화 확인
  ↓
[Stage 1] 정적분석 + FF 린트
  ├── SonarQube: 코드 품질
  ├── FF Lint: 양쪽 경로(ON/OFF) 존재 확인
  ├── ASIL Gate: Safety 플래그 변경 시 자동 블록
  └── Dead Flag 탐지: 만료 플래그 참조 → 빌드 실패 (Time Bomb)
  ↓
[Stage 2] 단위 테스트 + FF 매트릭스
  ├── ON/OFF 양쪽 단위 테스트
  ├── 조합 테스트: 쌍대(Pairwise) 커버리지
  └── Safety 경로: MC/DC 커버리지 (ASIL C/D)
  ↓
[Stage 3] 통합 빌드
  ├── COTA 패키지 (구성, 1KB~500KB) → FF 구성 + 캘리브레이션
  ├── SOTA 패키지 (코드, 50MB~2GB) → FF SDK 포함 SW 번들
  ├── FOTA 패키지 (펌웨어, 500MB~5GB+) → Safety ECU 전체 이미지
  └── ★Deselected 기능 바이너리 제외 검증 (Feature Model 기반)
  ↓
[Stage 4] SIL/HIL 자동 검증
  ├── 가상 ECU에서 FF 조합 테스트
  ├── 디지털 트윈 시나리오
  └── Safety 시뮬레이션 (이중채널, Fail-safe 검증)
  ↓
[Stage 5] 패키지 서명 + 스테이징
  ├── Uptane 이중서명 (Image Repo + Director Repo)
  ├── Staging 환경 배포 + 24h Soak 테스트
  └── 승인 Gate (ASIL별 차등)
  ↓
[Stage 6] 프로덕션 배포 (10장 8-Stage 프로세스로 연결)
```

### Stage 0 상세: Feature Model → Feature Toggle 연속체 (Partial Resolution)

**학술 근거:** Jézéquel, Kienzle, Acher (SPLC 2022) "From Feature Models to Feature Toggles in Practice"

핵심 아이디어: Feature Model(SPL 설계시점 가변성)과 Feature Toggle(런타임 가변성)을 통합. Feature Model을 **부분 해결(Partial Resolution)**하여 설계시점에 확정할 것/제거할 것/런타임에 이연할 것을 분리.

**3-State Feature 분류:**

| 상태 | 설계시점 결정 | 바이너리 포함 | 런타임 제어 | 자동차 예시 |
|---|---|---|---|---|
| **Selected** ✅ | 확정 포함 | **항상 포함** (FF 오버헤드 없음) | 항상 활성 | ABS, ESC, 기본 계기판, 필수 안전 기능 |
| **Deselected** ❌ | 확정 제거 | **완전 제거** (dead code 없음) | 존재하지 않음 | 해당 차종 미탑재 HW 기능, 수출 금지 암호화 |
| **Deferred** 🔵 | 런타임 이연 | **포함 + FF 래핑** | FF 프레임워크 On/Off | FoD 기능, A/B 실험, 카나리 신기능, 지역 규제 |

**Pipeline에서의 동작 흐름:**

```
Feature Model (전체 가변성 정의 — Codebeamer 연동)
    ↓ Partial Resolution (차종/시장/HW 리비전별)
    ├── Selected → 코드에 직접 컴파일 (런타임 FF 평가 불필요 → 성능 최적)
    ├── Deselected → 코드에서 제거 (바이너리 축소 + 공격표면↓)
    └── Deferred → FF toggle point로 래핑
         ├── QM Deferred → OpenFeature SDK + COTA 스트리밍
         └── Safety Deferred → UCM 파이프라인 + Safety FF Evaluator
```

**이것이 해결하는 문제 5가지:**

| # | 문제 | 해결 방법 | 근거 |
|---|---|---|---|
| 1 | **보안 (R155)** | Deselected 코드가 바이너리에 없어 공격 표면 물리적 축소 | "미사용 코드 = 보안 리스크" (SPLC 2022) |
| 2 | **사고 방지** | Deselected 기능은 코드 자체가 없으므로 실수로 활성화 불가 | Knight Capital: 오래된 FF 재활용으로 파산 |
| 3 | **바이너리 최적화** | Deselected 제거 → SOTA 패키지↓ → OTA 시간·비용↓ | 차종별 맞춤 빌드 |
| 4 | **Feature 상호작용** | Feature Model에서 상호작용을 설계시점에 명시적 추론 | FF 7%가 상호작용, 33%가 코드와 교차, 시간↑ (22%) |
| 5 | **성능** | Selected는 FF 평가 오버헤드 없음 (직접 컴파일) | Safety-critical 경로에서 μs 절약 |

**HMC 차종/시장별 적용 예시:**

| 빌드 대상 | Selected (항상) | Deselected (제거) | Deferred (FF) |
|---|---|---|---|
| 한국 내수 아이오닉 | ABS, ESC, 기본 ADAS, 한국 규제 | EU 전용, 수출 금지 암호화 | FoD, 카나리 ADAS v2, A/B |
| EU 수출 EV | + EU 규제 기능 | 한국 전용 | FoD, 실험 |
| 중국 수출 | + 중국 규제 | EU+한국 전용 | 지역화 기능 |

> **경영층 핵심:** Feature Model은 "이 차종에 무엇이 있고 없는가"를 정의하는 **단일 진실 원천(Single Source of Truth)**. CI/CD Pipeline의 첫 번째 입력이 되어, 빌드마다 해당 차종/시장에 맞는 최적 바이너리를 자동 생성.

### Feature 상호작용 CI 분석

논문에 따르면 Feature Toggle 상호작용은 시간이 갈수록 증가:

| 연구 결과 (SPLC 2022, VaMoS 2022) | 수치 | HMC 시사점 |
|---|---|---|
| FF 간 직접 상호작용 비율 | **7%** | Safety FF 간 교차 → 전수 테스트 대상 |
| FF와 다른 코드 표현식 상호작용 | **33%** | FF 변경 시 영향 범위 분석 필수 |
| 상호작용 증가율 (시간 경과) | **평균 22%** | Cleanup 없으면 상호작용 폭발 → 정리 스프린트 근거 |

CI 파이프라인의 Stage 0에서 **Feature Interaction 매트릭스를 자동 생성**하고, 신규 상호작용이 감지되면:
- QM×QM: Warning (리뷰 권고)
- QM×Safety: Error (안전엔지니어 리뷰 필수)
- Safety×Safety: Blocker (Safety Board 승인 필수)

---

## 8.2 FF-specific CI 규칙

### 정적분석 확장

| 규칙 | 설명 | 심각도 |
|---|---|---|
| **FF_BOTH_PATHS** | 모든 FF toggle point에 ON/OFF 양쪽 경로 존재 필수 | Error |
| **FF_NO_NESTED** | FF 조건문 2단계 이상 중첩 금지 (복잡도 폭발 방지) | Warning |
| **FF_EXPIRY_SET** | 임시 플래그(release/experiment)에 만료일 필수 | Error |
| **FF_DEAD_REF** | 만료된 플래그 코드 참조 → **빌드 실패** (Time Bomb) | Error |
| **FF_SAFETY_REVIEW** | safety_ 접두어 플래그 변경 시 Safety Engineer 리뷰 필수 | Blocker |
| **FF_NAMING** | `{type}_{team}_{feature}_{detail}` 명명규칙 위반 | Warning |
| **FF_SDK_VERSION** | OpenFeature SDK 최소 버전 준수 | Error |

### ASIL Gate 자동화

| ASIL | CI Gate | 추가 검증 |
|---|---|---|
| QM | 정적분석 + 단위테스트 Pass | 없음 |
| ASIL A-B | + 안전엔지니어 코드리뷰 Approved | + 통합테스트 커버리지 >80% |
| ASIL C-D | + Safety Board Approval Step | + MC/DC 100% + FMEA 확인 + 이중채널 검증 |

---

## 8.3 FF 매트릭스 테스트 전략

### 조합 폭발 문제

N개 boolean 플래그 → 2^N 조합. 50개 플래그 = ~10^15 조합 → 전수 테스트 불가능.

### 해결: 쌍대(Pairwise) 테스트 + 리스크 기반 선별

| 전략 | 적용 범위 | 커버리지 | 비고 |
|---|---|---|---|
| **전수 테스트** | 동시 활성 Safety 플래그 (5개 이하) | 100% | ASIL C/D 필수 |
| **쌍대(Pairwise)** | QM + ASIL A-B 플래그 조합 | ~70~90% 결함 발견 | ACTS, Hexawise 도구 |
| **3-way Covering** | Safety×QM 교차 조합 | >95% | 핵심 교차 시나리오 |
| **리스크 기반 선별** | 나머지 | 핵심 시나리오 집중 | 상호작용 매트릭스 기반 |

### 상호작용 매트릭스

| | Flag A (AEB) | Flag B (LKA) | Flag C (FoD) | Flag D (UI Theme) |
|---|---|---|---|---|
| Flag A (AEB) | — | **ASIL-D 교차** | — | — |
| Flag B (LKA) | **ASIL-D 교차** | — | — | — |
| Flag C (FoD) | — | — | — | QM 교차 |
| Flag D (UI Theme) | — | — | QM 교차 | — |

> Safety 플래그 간 교차(A×B)는 반드시 전수 테스트. Safety×QM 교차는 3-way. QM×QM은 쌍대로 충분.

---

## 8.4 COTA/SOTA/FOTA 패키징 분리

### 패키지 유형별 CI 파이프라인

| 패키지 | 내용 | 빌드 주기 | 서명 | 배포 경로 |
|---|---|---|---|---|
| **COTA** | FF 구성 JSON + 캘리브레이션 | FF 변경 시 즉시 | Uptane Director 서명 | SSE/MQTT → Edge → Vehicle |
| **SOTA** | FF SDK + IVI 앱 + 서비스 | 스프린트 주기 | Uptane Image 서명 | CDN → OTA Agent → UCM |
| **FOTA** | ECU 전체 펌웨어 (Safety 포함) | 릴리스 주기 | Uptane + HSM 이중서명 | UCM → Flashing Adapter → ECU |

### 델타 빌드 최적화

- COTA: 이전 구성 대비 **diff만 전송** (1~10KB)
- SOTA: bsdiff/vcdiff 바이너리 델타 → **최대 95% 크기 축소**
- FOTA: A/B 파티션 기반 → 델타 적용 후 파티션 스왑

---

## 8.5 Toolchain 통합 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Workflow                         │
│  IDE → Git (Trunk) → PR (Short-lived branch, <2일)          │
└────────────┬────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────┐
│                    CI Pipeline (Jenkins/GitLab CI)            │
│  ┌──────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │Lint  │→ │Unit Test │→ │Integ Test│→ │Package + Sign  │  │
│  │+FF   │  │+FF Matrix│  │+SIL/HIL  │  │COTA/SOTA/FOTA  │  │
│  └──────┘  └──────────┘  └──────────┘  └────────────────┘  │
│       ↕           ↕            ↕              ↕              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  FF Platform API (플래그 생성/변경/타겟팅/킬)        │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────┬────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────┐
│              Artifact Repository (Artifactory)                │
│  COTA Registry │ SOTA Registry │ FOTA Registry               │
└────────────┬────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────┐
│          ALM / Traceability (Codebeamer)                        │
│  Req ↔ Flag Spec ↔ Test Case ↔ Test Result ↔ Audit Trail   │
└─────────────────────────────────────────────────────────────┘
```

---

## 8.6 환경별 FF 구성 관리

| 환경 | FF 기본 상태 | 용도 | 승인 |
|---|---|---|---|
| **Dev** | 개발자 재량 On/Off | 로컬 개발·디버깅 | 불필요 |
| **CI/Test** | 매트릭스 자동 토글 | 자동 테스트 | 불필요 |
| **Staging** | Prod 미러 + 선별 On | 통합 검증 + 24h Soak | Tech Lead |
| **Production** | 기본 Off, 승인 후 On | 실제 차량 배포 | ASIL별 차등 (11장) |

> Unleash 패턴: **단일 플래그 엔티티 + 환경별 구성 분리** → 환경 간 구성 드리프트 제거.

---

## 8.7 도구 선정 기준 및 후보

| 기준 | 필수 | 권장 |
|---|---|---|
| Jenkins/GitLab CI 연동 | ✅ | — |
| FF Platform API 호출 Step | ✅ | — |
| Uptane 서명 통합 | ✅ | — |
| ASIL Gate (수동 승인 Step) | ✅ | — |
| Pairwise 테스트 생성 | — | ✅ |
| 디지털 트윈 연동 | — | ✅ |
| Codebeamer ALM 양방향 | ✅ | — |

### BMW CodeCraft 벤치마크

| 지표 | BMW | HMC Target (Mid) |
|---|---|---|
| 일일 빌드 수 | **200,000+** | 10,000+ (피처 스쿼드 기준) |
| 개발자 수 | 10,000+ | 500+ (FF 관련) |
| 코드 라인 | 500M+ | 점진 확대 |
| vCPU | 75,000 | 수요 기반 스케일 |
| CI 도구 | Zuul + Artifactory | Jenkins/GitLab CI + Artifactory |

---

## 8.8 Feature Model → Feature Toggle 파이프라인

> **학술 근거:** Jézéquel, Kienzle, Acher, "From Feature Models to Feature Toggles in Practice," SPLC 2022 (ACM)

### 설계시점 ↔ 런타임 가변성의 연속체 (Continuum)

전통적 SPL(Software Product Line)의 Feature Model과 FF(Feature Toggle)는 **같은 가변성(variability)의 두 가지 해결 시점**:

| 시점 | 메커니즘 | 자동차 적용 | 바이너리 영향 |
|---|---|---|---|
| **설계시점 (Design-time)** | Feature Model로 Selected/Deselected 확정 | 차종/트림별 기능 구성 (CCS 관리테이블의 진화) | Deselected는 바이너리에서 **완전 제거** |
| **런타임 (Runtime)** | Feature Toggle로 Deferred 기능 On/Off | OTA FoD, A/B, 점진 롤아웃, 킬스위치 | Deferred는 바이너리에 **포함되나 비활성** |

### 3-State Feature Resolution

모든 기능을 Feature Model에서 3가지 상태로 분류:

| 상태 | 의미 | 컴파일러/생성기 동작 | HMC 예시 |
|---|---|---|---|
| **Selected** (확정/녹색) | 항상 포함 — 비활성화 불가 | 코드 항상 포함, FF 불필요 | AEB 기본 기능, ESC, 에어백 |
| **Deselected** (제외/회색) | 절대 불포함 — 바이너리에서 제거 | 코드 완전 제거, Dead code 없음 | 수출 규제 암호화, 해당 지역 불법 기능 |
| **Deferred** (유보/파란색) | 포함되나 FF로 런타임 제어 | 코드 포함 + FF 프레임워크 연동 | FoD 후륜조향, A/B 실험, 카나리 |

> **핵심:** HMC의 CCS 관리테이블은 사실상 **암묵적 Feature Model**. 이를 명시적 Feature Model로 형식화하면 Selected/Deselected/Deferred를 체계적으로 관리 가능.

### Feature Interaction 탐지의 필요성

논문의 실증 연구 결과:
- FF의 **7%가 다른 FF와 직접 상호작용**
- FF의 **33%가 다른 코드 표현식과 상호작용**
- 상호작용은 시간이 지날수록 **평균 22% 증가**

자동차 Safety 맥락에서 이 상호작용이 관리되지 않으면:
- AEB(FF=ON) + LKA(FF=OFF) 조합에서 예상치 못한 동작
- 두 Safety FF가 동시 활성화될 때 리소스 경합
- FoD FF가 Safety FF의 전제조건을 무효화

**Feature Model의 제약조건 유형:**

| 제약조건 | 의미 | 자동차 예시 |
|---|---|---|
| **Requires** | A 활성화 시 B도 필수 | LKA → ESC (LKA는 ESC 없이 동작 불가) |
| **Excludes** | A와 B 동시 활성화 금지 | Manual_Steering ⊕ Auto_Steering |
| **XOR** | 그룹 내 정확히 하나만 선택 | EPS_Mode: Comfort XOR Sport XOR Eco |
| **OR** | 그룹 내 하나 이상 선택 | Auth_Method: Password OR Fingerprint OR Biometric |
| **Mandatory** | 부모 선택 시 자동 포함 | Vehicle → AEB (전 차종 필수) |

### Dead Code 제거와 R155 보안

논문의 보안 관점: **"사용하지 않는 코드가 실행 파일에 포함되면 공격 표면(attack surface)이 확대된다."**

- **Deselected 기능을 바이너리에서 완전 제거** → R155 공격 표면 축소
- 예: 특정 지역에서 불필요한 암호화 모듈을 제거하여 TARA 위협 모델 범위 축소
- **Knight Capital Group 파산 사례:** 오래된 FF를 잘못 재사용 → 시스템 오작동 → **$440M 손실, 파산**
- 교훈: FF 라이프사이클 관리(9장)와 Time Bomb CI(8.2)의 중요성을 극단적으로 보여주는 사례

### CI/CD Pipeline에서 Feature Model 검증 (Stage 0 상세)

**Stage 0가 검증하는 5가지:**

| 검증 항목 | 방법 | 실패 시 |
|---|---|---|
| **제약조건 위반** | Feature Model SAT Solver로 requires/excludes/XOR 검증 | **빌드 실패** — 위반 조합 명시 |
| **Deselected 코드 참조** | 코드베이스 스캔 — Deselected 기능 참조 탐지 | **빌드 실패** — Dead code 제거 강제 |
| **Feature Interaction** | 상호작용 매트릭스 대비 미정의 조합 탐지 | **경고** (Safety FF 간이면 **빌드 실패**) |
| **3-State 일관성** | Feature Model의 Selected/Deselected/Deferred와 코드 내 FF 사용이 일치하는지 | **빌드 실패** — Selected인데 FF guard 있으면 불필요 |
| **Codebeamer 동기화** | Feature Model ↔ ALM 요구사항 양방향 링크 확인 | **경고** — 추적성 단절 리포트 |

### HMC 적용 방안

| Phase | Feature Model 적용 |
|---|---|
| **Quick (2026)** | CCS 관리테이블을 Feature Model 형식으로 변환 (Pilot 범위), Stage 0 기본 검증 도입 |
| **Mid (2027~28)** | 전 차종 Feature Model 형식화, SAT Solver 기반 제약조건 자동 검증, Feature Interaction 매트릭스 |
| **Long (2029~)** | Feature Model 기반 자동 코드 생성/제거, Deselected 바이너리 제거 자동화, 규제 지역별 자동 파생 |

### SPL과 FF의 관계 정리

```
Software Product Line (SPL)          Feature Flag (FF)
  설계시점 가변성 관리              →    런타임 가변성 관리
  Feature Model로 모델링            →    FF Platform으로 운영
  Selected/Deselected 확정          →    Deferred를 On/Off
  제약조건 (requires/excludes)      →    Feature Interaction 탐지
  Product Derivation (코드 생성)    →    Progressive Delivery (점진 배포)
  
  ←————————— Continuum (연속체) ——————————→
  
  HMC의 CCS 관리테이블              →    HMC의 FF Platform
  (현재: 암묵적, 정적)              →    (Target: 명시적, 동적)
```

> **경영층 핵심:** Feature Model은 "어떤 차에 어떤 기능이 있는가"의 **단일 진실 원천(Single Source of Truth)**. FF는 그 중 "런타임에 켜고 끌 수 있는 기능"의 운영 도구. 둘이 연결되지 않으면 "어떤 차에 어떤 기능이 어떤 상태인가"를 아무도 모르게 됨.
