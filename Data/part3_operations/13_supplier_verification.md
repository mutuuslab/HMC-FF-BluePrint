# 13장. 협력사 관리, 통합 테스트, 가상 검증

> **제3편. 운영 모델** | 대상 독자: 구매/협력사관리, 품질, 검증팀, 플랫폼팀

---

## 13.1 협력사 FF 인터페이스 요건 체계

### 왜 협력사 관리가 필요한가

HMC 차량의 SW 중 상당 부분은 Tier-1/Tier-2 협력사가 개발·납품. FF 플랫폼이 OEM 내부에만 적용되고 협력사 SW에 미적용되면, **차량 전체의 일관된 Feature 제어가 불가능**. 특히:
- 협력사 ECU에 FF SDK가 없으면 해당 ECU의 기능은 플래그 제어 불가 (All-or-nothing 유지)
- 협력사별 다른 FF 구현 → 통합 시 호환성 문제
- Safety 플래그가 OEM↔협력사 경계에서 끊기면 ASIL 추적성 단절

### 공급사 협업 5대 원칙 (블랙박스 모델)

> **핵심 철학:** OEM이 요구하는 것은 공급사 내부 소스 공개가 아니라, **표준 제어 인터페이스와 관측성 계약**이다.

| # | 원칙 | 상세 |
|---|---|---|
| 1 | **SW 내부 구현은 블랙박스** | 공급사 소스코드 접근 불요, 내부 아키텍처 간섭 않음 |
| 2 | **표준 인터페이스 준수 의무** | Feature/Flag/Variant 식별자, 제어 API, 응답 코드, 버전 호환 정책 |
| 3 | **관측성 계약** | 텔레메트리 노출, 헬스체크, 로그 포맷, 메트릭 스키마를 계약으로 정의 |
| 4 | **보안 협력 의무** | 코드 스캔, 취약점 공지, Incident 협력, TARA 참여를 SoW에 포함 |
| 5 | **승인 없는 Production 활성화 금지** | 공급사가 자체적으로 FF를 On 할 수 없음 — OEM 승인 워크플로우 필수 |

### 협력사 등급별 요건

| 등급 | 대상 | FF 요건 | SDK 요구 | 거버넌스 |
|---|---|---|---|---|
| **Tier A** (핵심) | ADAS, 파워트레인, 제동 Tier-1 | **OpenFeature Provider 필수 구현** + Safety FF 인터페이스 | OEM 지정 FF SDK 탑재 | Safety Board 공동 심의 |
| **Tier B** (주요) | Body, Chassis, 커넥티드 Tier-1 | **OpenFeature Provider 권장** + QM FF 인터페이스 | OEM SDK 또는 호환 SDK | FF 운영 가이드 준수 |
| **Tier C** (일반) | 인포테인먼트 앱, UI 공급사 | **FF API 인터페이스만** (SDK 내장 불필요) | REST/gRPC API 호출 | 기본 명명/메타데이터 규칙 |

### 협력사 계약 반영 사항 (SoW/기술 요건서)

| 요건 항목 | 내용 | 근거 |
|---|---|---|
| **FF SDK 탑재 의무** | OEM 지정 OpenFeature Provider를 ECU SW에 통합 | 일관된 평가 로직 |
| **양쪽 경로 구현** | 모든 FF toggle point에 ON/OFF 양쪽 경로 + 단위 테스트 | CI 규칙 FF_BOTH_PATHS |
| **Flag Spec 제출** | 협력사 자체 플래그 사용 시 OEM 카탈로그에 등록 + ASIL 태그 | 거버넌스 일관성 |
| **ASIL 분류 준수** | Safety 기능 플래그는 OEM ASIL 분류 따름 | ISO 26262 |
| **Fail-safe 기본값** | 오프라인/연결 실패 시 safe default 정의 필수 | 4단계 Fail-safe 위계 |
| **테스트 증적 제출** | FF 매트릭스 테스트 결과, ON/OFF 양쪽 커버리지 보고서 | ASPICE SWE.4~6 |
| **킬스위치 응답** | OEM Kill 명령 수신 시 지정 시간 내 safe state 전환 | 12장 3-Level 롤백 |
| **감사 추적** | 모든 플래그 상태 변경 로깅 + OEM 감사 시스템 연동 | R155/R156 SUMS |
| **OpenFeature Context 전달** | VIN, HW revision, ECU version, region 등 평가 컨텍스트 표준 준수 | 타겟팅 일관성 |

### 협력사 온보딩 프로세스

```
① 기술 요건서 전달 (SoW + FF Interface Spec)
② 협력사 기술 평가 (SDK 역량, 테스트 역량, 보안 역량)
③ FF SDK 통합 PoC (OEM 테스트 환경에서 검증)
④ 통합 테스트 Pass (13.2절 상세)
⑤ 프로덕션 승인 (SIL/HIL/디지털 트윈 검증 Pass)
⑥ 지속 모니터링 (텔레메트리 + Flag Hygiene 포함)
```

---

## 13.2 협력사 FF 기반 SW 개발 요건

> 협력사가 FF 기반으로 SW를 개발할 때 준수해야 하는 **구현 수준의 요건**. 이 요건은 SoW/기술 요건서에 포함되어 계약 시점에 합의되어야 한다.

### 13.2.1 FF SDK 통합 요건

| 요건 ID | 요건 | 상세 | Tier A | Tier B | Tier C |
|---|---|---|---|---|---|
| DEV-01 | **OpenFeature SDK 탑재** | OEM 지정 OpenFeature Provider를 ECU SW에 통합. SDK 버전은 OEM이 지정한 최소 버전 이상 | 필수 | 필수 | 해당없음 (API만) |
| DEV-02 | **SDK 초기화 시점** | ECU 부팅 시퀀스에서 **OS 초기화 직후, 애플리케이션 시작 전**에 FF SDK 초기화 완료 | 필수 | 필수 | — |
| DEV-03 | **초기화 시간 제약** | FF SDK 초기화 + 플래그값 로드 **≤3초** (Cold start 기준) | 필수 | 필수 | — |
| DEV-04 | **SDK 언어 지원** | C/C++ (AUTOSAR Classic/Adaptive), Rust (가능 시), Java/Python (Cloud-side) | C/C++ 필수 | C/C++ 필수 | 언어 무관 |
| DEV-05 | **SDK 리소스 예산** | ROM ≤200KB, RAM ≤50KB, CPU 오버헤드 ≤1% (ES95411 자원사용량 기준 내) | 필수 | 권장 | — |

### 13.2.2 Toggle Point 구현 요건

| 요건 ID | 요건 | 상세 |
|---|---|---|
| DEV-10 | **양쪽 경로 필수 구현** | 모든 FF toggle point에 **ON 경로와 OFF 경로를 모두 구현**. OFF 경로가 빈 블록이면 안 됨 — 의미 있는 fallback 동작 필수 |
| DEV-11 | **2단계 이상 중첩 금지** | FF 조건문을 다른 FF 조건문 안에 중첩(nesting) 금지. 복잡도 폭발 + 조합 테스트 비용 방지 |
| DEV-12 | **Fail-safe 기본값 정의** | 모든 플래그에 **안전한 기본값(Safe Default)** 정의 필수. SDK 연결 실패, 캐시 없음 상태에서 이 값이 사용됨 |
| DEV-13 | **Latch-at-Init (Safety)** | ASIL C-D 플래그는 **ECU 초기화 시 플래그값 고정**, 실행 중 변경 금지. 다음 ignition cycle에서만 새 값 적용 |
| DEV-14 | **평가 결과 캐싱** | FF 평가 결과를 매 호출마다 재평가하지 않고 **캐시에서 반환**. 캐시 갱신 주기는 플래그 유형별 TTL에 따름 |
| DEV-15 | **Toggle Point 위치 제한** | ISR(인터럽트 서비스 루틴), 실시간 제약 경로, 부팅 시퀀스 내에 toggle point 배치 금지 |

**코드 패턴 예시 (C, AUTOSAR Adaptive):**

```c
/* DEV-10: ON/OFF 양쪽 경로 모두 구현 */
#include "openfeature.h"

void apply_dynamic_reroute(RouteContext* ctx) {
    EvaluationContext eval_ctx = {
        .targeting_key = vehicle_get_vin(),
        .attributes = {
            {"hw_version", hw_get_revision()},
            {"region", config_get_region()},
            {"trim", config_get_trim()},
            {"asil", "QM"}
        }
    };
    
    bool enabled = ff_evaluate_bool(
        "nav.routing.dynamic_reroute.kor.t1", 
        false,  /* DEV-12: Safe Default = OFF */
        &eval_ctx
    );
    
    if (enabled) {
        /* ON 경로: 동적 재경로 활성화 */
        route_engine_enable_dynamic_reroute(ctx);
        telemetry_log_exposure("nav.routing.dynamic_reroute", true);
    } else {
        /* OFF 경로: 기존 정적 경로 유지 (빈 블록 아님) */
        route_engine_use_static_route(ctx);
        telemetry_log_exposure("nav.routing.dynamic_reroute", false);
    }
}
```

### 13.2.3 평가 컨텍스트 (Evaluation Context) 전달 요건

| 요건 ID | 요건 | 상세 |
|---|---|---|
| DEV-20 | **필수 컨텍스트 필드** | 모든 FF 평가 호출에 아래 필드를 포함한 EvaluationContext 전달 |
| DEV-21 | **컨텍스트 갱신 주기** | VIN/HW revision은 부팅 시 1회, region/trim은 설정 변경 시, 차량 상태는 실시간 |
| DEV-22 | **컨텍스트 무결성** | 컨텍스트 필드가 null/비정상이면 FF 평가를 중단하고 Safe Default 반환 |

**필수 EvaluationContext 필드:**

| 필드 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `targeting_key` | string | **VIN** (차량 식별) | `"KMHXX12345678901"` |
| `hw_version` | string | ECU 하드웨어 리비전 | `"HW-3.2"` |
| `ecu_type` | string | ECU 유형 | `"ADAS-front"`, `"IVI"`, `"Body"` |
| `region` | string | 차량 등록 지역 | `"KR"`, `"EU"`, `"US"`, `"CN"` |
| `trim` | string | 차량 트림 | `"Premium"`, `"Exclusive"` |
| `model` | string | 차종 | `"IONIQ6"`, `"GV80"` |
| `sw_version` | string | 현재 SW 버전 | `"2.4.1"` |
| `safety_level` | string | 해당 기능의 ASIL 등급 | `"QM"`, `"ASIL-B"`, `"ASIL-D"` |
| `fleet_segment` | string | Fleet 세그먼트 | `"production"`, `"employee-test"`, `"canary"` |
| `vehicle_state` | string | 차량 상태 (주행/정차/충전) | `"driving"`, `"parked"`, `"charging"` |

### 13.2.4 오프라인 동작 및 Fail-safe 요건

| 요건 ID | 요건 | 상세 |
|---|---|---|
| DEV-30 | **로컬 평가 필수** | FF 평가는 반드시 **차량 내 로컬에서** 수행. 서버 호출 없이 캐시된 규칙셋으로 평가 |
| DEV-31 | **4단계 Fail-safe 위계** | 서버 연결 불가 시: ① 현재 캐시 → ② Last-known-good 스냅샷 → ③ NVRAM 저장값 → ④ 하드코딩 기본값 |
| DEV-32 | **TTL 준수** | Safety: 만료 없음 (UCM만 변경), 기능: 7~30일, UX: 24~72시간 |
| DEV-33 | **오프라인 기간 무제한** | 서버와 30일+ 미연결 상태에서도 ECU가 정상 동작해야 함 (Fail-safe 위계로 보장) |
| DEV-34 | **재연결 시 동기화** | 서버 연결 복구 시 최신 플래그 구성 자동 동기화. Safety 플래그는 Vehicle-wins 정책 (더 안전한 값 유지) |

### 13.2.5 킬스위치 응답 요건

| 요건 ID | 요건 | 상세 |
|---|---|---|
| DEV-40 | **Kill 명령 수신** | MQTT 토픽 `fleet/{vin}/flags/kill` 구독. QoS 1 (at-least-once) |
| DEV-41 | **응답 시간** | Kill 수신 → Safe Default 적용 **≤10초** (온라인 상태) |
| DEV-42 | **Safe State 전환** | Kill 시 해당 플래그의 Safe Default 즉시 적용. 기능 비활성이 Safe State |
| DEV-43 | **Kill 상태 지속** | Kill 상태는 서버에서 명시적으로 해제할 때까지 유지. ECU 재부팅 후에도 Kill 상태 유지 (NVRAM 저장) |
| DEV-44 | **Kill 후 텔레메트리** | Kill 적용 시각, 이전 상태, 현재 상태를 텔레메트리로 보고 |

### 13.2.6 텔레메트리 노출 요건

| 요건 ID | 요건 | 상세 |
|---|---|---|
| DEV-50 | **Exposure 로깅** | 모든 FF 평가 호출에 대해 **어떤 플래그가 어떤 값으로 평가되었는지** 기록 |
| DEV-51 | **로그 포맷** | OEM 지정 텔레메트리 스키마 준수 (flag_key, value, timestamp, vin, context 포함) |
| DEV-52 | **로컬 버퍼링** | 오프라인 시 텔레메트리를 로컬에 버퍼링, 연결 복구 시 일괄 전송 |
| DEV-53 | **샘플링 비율** | 전 평가 기록이 기본. 고빈도 플래그는 OEM과 협의하여 샘플링 비율 설정 가능 |
| DEV-54 | **메트릭 노출** | FF SDK 헬스 메트릭: 평가 성공/실패 수, 평균 지연, 캐시 히트율, 마지막 동기화 시각 |

### 13.2.7 버전 관리 및 호환성 요건

| 요건 ID | 요건 | 상세 |
|---|---|---|
| DEV-60 | **SDK 버전 고정** | 프로젝트 기간 중 FF SDK 버전은 OEM이 지정. 자체 업그레이드 금지 |
| DEV-61 | **하위 호환성** | 신규 SDK 버전은 이전 플래그 구성 포맷과 하위 호환 필수 |
| DEV-62 | **Feature Model 준수** | 협력사 코드에서 사용하는 모든 플래그 키는 OEM Feature Catalog에 등록된 것만 허용. 미등록 플래그 사용 금지 |
| DEV-63 | **변경 통보** | FF 관련 코드 변경(toggle point 추가/삭제/수정) 시 OEM에 사전 통보 + 변경 영향성 분석 제출 (ES95411 §4.10) |

### 13.2.8 AUTOSAR 플랫폼 통합 요건

| 요건 ID | 대상 | 요건 | 상세 |
|---|---|---|---|
| DEV-70 | Classic | **NVM 캘리브레이션 매핑** | FF 캐시를 AUTOSAR NvM Block으로 매핑. 전원 차단 시 값 보존 |
| DEV-71 | Classic | **SOME/IP 전달** | Zone Controller → Classic ECU 간 플래그 전달은 SOME/IP 서비스 인터페이스 |
| DEV-72 | Adaptive | **ara::com 서비스** | FF Evaluator를 ara::com 서비스로 등록. 다른 Adaptive App에서 호출 가능 |
| DEV-73 | Adaptive | **ara::per 저장** | FF 캐시 + Last-known-good을 ara::per(Persistency)에 저장 |
| DEV-74 | 공통 | **Flashing Adapter** | Classic ECU의 경우 Flashing Adapter를 통한 FF 구성 업데이트 경로 구현 |
| DEV-75 | 공통 | **Diagnostic 연동** | UDS(Unified Diagnostic Services)로 현재 FF 상태 조회 가능 (DID 할당) |

### 13.2.9 개발 산출물 요구

| 산출물 | 내용 | 제출 시점 |
|---|---|---|
| **FF Integration Design** | SDK 초기화 시퀀스, toggle point 목록, 캐시 전략, Fail-safe 설계 | 설계 리뷰 시 |
| **FF Toggle Point Catalog** | 코드 내 전 toggle point의 위치(파일/라인), 플래그 키, ON/OFF 동작 설명 | 코드 리뷰 시 |
| **FF Test Plan** | ON/OFF 양쪽 테스트 케이스, 오프라인 시나리오, 킬스위치 시나리오 | 검증 계획 시 |
| **FF Resource Report** | CPU/RAM/ROM/Stack/WCET 측정 (ES95411 §13.7 참조) | 통합 검증 후 |
| **FF 호환성 매트릭스** | SDK 버전 × ECU HW × SW 버전 호환성 | 납품 시 |

### 13.2.10 협력사 API 설계 요건 — FF 제어 인터페이스

> **출처:** IF1 API 문서(APILevel-095) 구조 분석 기반. 협력사가 배포하는 서비스 API에 FF 제어점을 설계할 때 준수해야 하는 요건.

#### 3계층 구성 원칙: Variant Coding × Auth × SafeMode × Flag Rule

```
effective_decision = variant_coding && authentication && safe_mode && flag_rule
```

| 계층 | 역할 | 결정 시점 | 예시 |
|---|---|---|---|
| **Variant Coding** | "이 기능이 이 차종/시장/트림에 **존재할 수 있는가**" (can exist) | 빌드/공장 | AR 기능이 해당 HW에 탑재됨 |
| **Feature Flag** | "이 기능이 지금 **노출되어야 하는가**" (should be exposed now) | 런타임 | AR 기능을 한국 시장에 먼저 노출 |
| **Runtime Policy** | "이 기능이 현재 상태에서 **동작해도 되는가**" (may operate now) | 런타임 실시간 | SafeMode=OFF이고 인증 통과일 때만 |

> **핵심:** FF는 Variant Coding 위의 동적 활성화 계층이지, Variant Coding이나 SafeMode를 대체하거나 우회하는 것이 아님.

#### 도메인별 FF 후보 및 정책 (IF1 API 기반)

| 도메인 (API 네임스페이스) | FF 관련 서비스 | 후보 플래그 | 위험도 | 정책 |
|---|---|---|---|---|
| `communication.containerManager` | startContainer, getContainerInfo | container_launch_enable, headful_ui_exposure, asset_gate | 중 | **Pilot 적합** |
| `navigation.PackageUpdate` | requestInstallation, installationStatusChanged | livemap_rollout, navigation_beta_feature, regional_map_activation | 중 | **Pilot 적합** |
| `platform.remoteAppPairing` | pairingRequest, getAuthorizedRemoteApps | remote_app_beta_access, partner_app_enablement | 중 | **Pilot 적합** |
| `platform.variantCodingApplication` | getActiveComfortConfig, getARConfig | dynamic_overlay_over_variant, market_rollout_gate | 중 | **기준선 전제** |
| `platform.safeMode` | getSafeModeResult, setActiveRuleSet | ui_panel_exposure, feature_visibility_guard | 고 | **보호형만** |
| `vehicle.remoteUpdateIF2Cloud` | requestInstallation, requestVehicleSafeState | post_install_activation, cohort_release_gate, campaign_kill_switch | 고 | **보호형만** |
| `vehicle.authentication` | requestAuthLevel, getSensorState | profile_scoped_experience, privileged_action_gate | 고 | **보호형만** |
| `vehicle.vehicleFunctions` | charging, notifications, general functions | notification_enable, bounded_parameter_rollout, service_ui_exposure | 고 | **보호형만** |
| `vehicle.comfortFunctions` | windows, sunblinds, door, valet | comfort_feature_visibility, subscription_gate | 고 | **보호형만** |
| `vehicle.adas` | ADASPosition, C2X events | shadow_algorithm_eval, non-safety UI indication | **최고** | **직접 토글 금지** |
| `platform.diagGateway` | udsRequest, udsResponse | diagnostic_shadow_collection | 고 | **관측용만** |

#### 파일럿 우선순위 (IF1 기반)

| 순위 | 후보 | 근거 |
|---|---|---|
| 1 | Navigation 라이브 맵 / 맵 업데이트 노출 | 기능 폭 넓음, KPI 측정 용이, 온·오프라인 폴백 검증 |
| 2 | Remote app / Companion app / 브라우저 / 미디어 베타 | 파트너 롤아웃, 권한 기반 노출 |
| 3 | 컨테이너 앱 활성화 및 UI 노출 | SDK/정책엔진 검증, 로컬 롤백 |
| 4 | 프로필/시트 기반 개인화 플래그 | 세분화된 타겟팅 |
| 5 | 보호형 차량 알림 / 충전 프로그램 UX | 제한적 차량 기능 |

#### 절대 금지 (Strict No-Go)

| # | 금지 항목 |
|---|---|
| 1 | 제동/조향/안전 봉투 제어 로직을 런타임 FF로 직접 토글 |
| 2 | 인증(authentication) 또는 도난방지(anti-theft) 요구사항을 FF로 약화 |
| 3 | OTA 업데이트 안전 사전조건(fotaPreconditions)을 FF로 우회 |
| 4 | 형식승인(homologation) 제한사항을 FF로 우회 |
| 5 | 오프라인 시 결정론적 기본값 없이 FF 생성 |

#### 8대 핵심 인터페이스 계약 — 상세 요건 정의

협력사 API가 OEM FF 플랫폼과 연동하기 위해 구현해야 하는 **표준 인터페이스 8종**.

---

##### IF-01. Flag Manifest (Cloud → Vehicle)

**목적:** 플래그 키, 타입, 기본값, TTL, 타겟팅 규칙셋을 담은 서명된 구성 패키지를 차량에 전달.

| 항목 | 사양 |
|---|---|
| 프로토콜 | HTTPS (초기 풀) + SSE/MQTT (증분 업데이트) |
| 포맷 | JSON (QM) / CBOR (리소스 제약 ECU) |
| 서명 | Uptane Director 서명 (ECDSA-P256) |
| 최대 크기 | ≤500KB (COTA 한도) |
| 갱신 주기 | 폴링 30초~5분 / MQTT push 즉시 |
| 버전 관리 | Semantic Versioning (major.minor.patch) + monotonic sequence number |

**Manifest 스키마:**

```json
{
  "manifest_version": "2.1.0",
  "sequence": 14823,
  "timestamp": "2026-09-15T03:22:00Z",
  "expires": "2026-12-31T23:59:59Z",
  "target_scope": {
    "models": ["IONIQ6", "GV80"],
    "regions": ["KR", "EU"],
    "hw_versions": ["HW-3.2+"]
  },
  "flags": [
    {
      "key": "nav.routing.dynamic_reroute.kor.t1",
      "type": "boolean",
      "default_value": false,
      "safety_class": "QM",
      "criticality_tier": "T1",
      "ttl_days": 30,
      "owner": "nav-team@hmc.co.kr",
      "rules": [
        {
          "condition": {"region": "KR", "fleet_segment": "canary"},
          "value": true,
          "rollout_percentage": 10
        }
      ],
      "rollback_policy": "immediate-to-default",
      "expires": "2026-12-15T00:00:00Z"
    }
  ],
  "integrity": {
    "hash": "sha256:a1b2c3d4...",
    "signature": "ecdsa-p256:...",
    "signing_role": "targets"
  }
}
```

**요건:**

| 요건 ID | 요건 | 검증 방법 |
|---|---|---|
| IF01-01 | 서명 검증 실패 시 manifest 전체 거부 + 이전 유효 manifest 유지 | 위조 manifest 주입 테스트 |
| IF01-02 | sequence가 현재보다 작으면 리플레이 공격으로 간주, 거부 | 이전 sequence 재전송 테스트 |
| IF01-03 | expires 초과 시 해당 manifest 무효화, 캐시된 값으로 폴백 | TTL 만료 시나리오 |
| IF01-04 | 파싱 오류 시 전체 manifest 거부 (부분 적용 금지) | 손상 JSON 입력 |
| IF01-05 | 네트워크 실패 시 마지막 유효 manifest 유지, 재시도 (exponential backoff) | 서버 차단 시나리오 |

---

##### IF-02. Context Schema (Vehicle → FF SDK)

**목적:** FF 평가 시 SDK에 전달하는 차량/사용자/환경 컨텍스트.

**필수 필드:**

| 필드 | 타입 | 소스 | 갱신 주기 | 예시 |
|---|---|---|---|---|
| `targeting_key` | string | VIN | 고정 | `"KMHXX12345678901"` |
| `hw_version` | string | ECU 하드웨어 | 고정 | `"HW-3.2"` |
| `ecu_type` | string | ECU 설정 | 고정 | `"IVI"`, `"ADAS-front"` |
| `region` | string | 차량 등록 | 설정 변경 시 | `"KR"`, `"EU"`, `"US"` |
| `model` | string | 차종 | 고정 | `"IONIQ6"` |
| `trim` | string | 트림 | 고정 | `"Exclusive"` |
| `sw_version` | string | SW 빌드 | 업데이트 시 | `"2.4.1-20260915"` |
| `safety_level` | string | Flag Spec | 플래그별 | `"QM"`, `"ASIL-B"` |
| `fleet_segment` | string | 서버 배정 | 서버 동기화 시 | `"production"`, `"canary"` |
| `vehicle_state` | enum | CAN/센서 | 실시간 | `"parked"`, `"driving"`, `"charging"` |

**확장 필드 (선택):**

| 필드 | 타입 | 용도 | 예시 |
|---|---|---|---|
| `seat_position` | string | 시트별 개인화 | `"driver"`, `"passenger"` |
| `profile_id` | string | 사용자 프로필 | `"profile-001"` |
| `auth_level` | int | 인증 수준 | `0`(미인증)~`3`(생체) |
| `subscription_tier` | string | 구독 등급 | `"basic"`, `"premium"` |
| `safe_mode_active` | boolean | SafeMode 상태 | `true`/`false` |
| `variant_coding` | map | Variant Coding 기준선 | `{"ar_capable": true, "comfort_pkg": "premium"}` |
| `battery_soc` | int | 배터리 잔량 | `72` (%) |
| `connectivity` | enum | 연결 상태 | `"online"`, `"offline"`, `"degraded"` |

**요건:**

| 요건 ID | 요건 |
|---|---|
| IF02-01 | 필수 필드 10개 중 하나라도 null이면 FF 평가 중단 → Safe Default 반환 |
| IF02-02 | `vehicle_state`가 `"driving"`일 때 Safety 관련 플래그만 Latch-at-Init 적용 |
| IF02-03 | `safe_mode_active=true`이면 해당 도메인의 모든 UX 플래그 강제 OFF |
| IF02-04 | `variant_coding` 필드가 `false`인 기능의 플래그는 평가하지 않음 (can_exist 실패) |
| IF02-05 | Context 변경 시 변경된 필드만 갱신 (전체 재구성 금지 — 성능) |

---

##### IF-03. Decision Log (SDK → Telemetry)

**목적:** 매 FF 평가의 입력·결정·시간을 기록하여 감사 추적 + 분석 제공.

**로그 스키마:**

```json
{
  "log_id": "uuid-v4",
  "timestamp": "2026-09-15T03:22:01.234Z",
  "flag_key": "nav.routing.dynamic_reroute.kor.t1",
  "evaluation_result": true,
  "default_used": false,
  "fallback_level": "cache",
  "context_snapshot": {
    "targeting_key": "KMHXX12345678901",
    "region": "KR",
    "fleet_segment": "canary",
    "vehicle_state": "parked"
  },
  "rule_matched": "rule-001",
  "evaluation_duration_us": 42,
  "sdk_version": "1.3.2",
  "manifest_sequence": 14823
}
```

| 요건 ID | 요건 |
|---|---|
| IF03-01 | 모든 FF 평가 호출에 대해 Decision Log 생성 (샘플링 비율은 OEM과 협의) |
| IF03-02 | 오프라인 시 로컬 버퍼에 저장 (최대 10,000건 또는 5MB), FIFO 순환 |
| IF03-03 | 연결 복구 시 버퍼된 로그 일괄 전송 (batch upload) |
| IF03-04 | `context_snapshot`은 필수 필드 10개 중 플래그 평가에 사용된 필드만 포함 (최소화) |
| IF03-05 | `evaluation_duration_us` 기록 필수 — 성능 모니터링 근거 |
| IF03-06 | 로그 보관 기간: 차량측 7일, 서버측 **10년** (R155/R156 감사 요건) |

---

##### IF-04. Exposure Event (SDK → Analytics)

**목적:** 사용자에게 기능이 **실제로 노출된 시점**을 기록. Decision Log와 구분 — Decision은 "평가했다", Exposure는 "사용자가 봤다".

```json
{
  "event_id": "uuid-v4",
  "timestamp": "2026-09-15T03:22:05.000Z",
  "flag_key": "nav.routing.dynamic_reroute.kor.t1",
  "variant": true,
  "exposure_type": "user_visible",
  "screen": "route_options",
  "session_id": "sess-abc-123",
  "vin": "KMHXX12345678901"
}
```

| 요건 ID | 요건 |
|---|---|
| IF04-01 | UI 렌더링 시점에 Exposure Event 발생 (FF 평가 시점이 아님) |
| IF04-02 | 동일 세션 내 중복 노출은 1건으로 deduplicate |
| IF04-03 | A/B 실험 시 `experiment_id`, `cohort_id` 추가 필드 포함 |
| IF04-04 | 오프라인 시 로컬 버퍼링 후 일괄 전송 (Decision Log와 동일 정책) |

---

##### IF-05. Rollback Event (Cloud → Vehicle)

**목적:** 킬스위치 또는 버전 롤백 명령을 차량에 즉시 전달.

| 항목 | 사양 |
|---|---|
| 채널 | **MQTT** `fleet/{vin}/flags/rollback` (QoS 1) + **Retained Message** |
| 폴백 | CDN/API 폴링 (30초~5분 주기) — MQTT 실패 시 안전망 |
| 포맷 | JSON |

```json
{
  "command": "kill",
  "flag_key": "nav.routing.dynamic_reroute.kor.t1",
  "target_value": false,
  "reason": "canary_anomaly_detected",
  "issued_by": "guardrail-auto@ff-platform",
  "issued_at": "2026-09-15T03:25:00Z",
  "ttl_seconds": 0,
  "persist": true
}
```

| 요건 ID | 요건 |
|---|---|
| IF05-01 | Kill 수신 → Safe Default 적용 **≤10초** (온라인 상태) |
| IF05-02 | `persist=true`이면 NVRAM에 저장 — ECU 재부팅 후에도 Kill 상태 유지 |
| IF05-03 | Kill 해제는 서버에서 `command: "resume"` 명시적 전송 시에만 |
| IF05-04 | Kill 적용 시 Decision Log에 `"rollback_applied": true` 기록 |
| IF05-05 | 오프라인 차량은 다음 연결 시 Retained Message로 즉시 수신 |
| IF05-06 | `command: "rollback_manifest"`이면 지정 sequence의 이전 manifest로 전체 복원 |

---

##### IF-06. Approval Record (Governance → Audit)

**목적:** 플래그 생성/변경/활성화/비활성화/삭제의 모든 변경에 대한 불변 감사 기록.

```json
{
  "record_id": "uuid-v4",
  "action": "activate",
  "flag_key": "nav.routing.dynamic_reroute.kor.t1",
  "requested_by": "kim.nav@hmc.co.kr",
  "approved_by": ["lee.lead@hmc.co.kr", "park.qa@hmc.co.kr"],
  "approval_track": "T1",
  "timestamp": "2026-09-14T10:00:00Z",
  "change_detail": {
    "before": {"rollout_percentage": 0},
    "after": {"rollout_percentage": 10},
    "reason": "Navigation 카나리 1차 진입",
    "ticket": "JIRA-NAV-4521"
  },
  "target_scope": {
    "models": ["IONIQ6"],
    "regions": ["KR"],
    "fleet_segment": "canary"
  },
  "evidence_links": [
    "codebeamer://req/NAV-REQ-001",
    "sil_result://TR-2026-0915-001"
  ]
}
```

| 요건 ID | 요건 |
|---|---|
| IF06-01 | 모든 action(create/update/activate/deactivate/kill/retire)에 Approval Record 생성 |
| IF06-02 | `approved_by`는 Criticality Tier별 최소 인원 준수 (T0: 1명, T1: 2명, T2: 3명+, T3: Safety Board) |
| IF06-03 | `before/after` diff 필수 — 무엇이 바뀌었는지 명확히 |
| IF06-04 | `reason` + `ticket` 빈 값 금지 (변경 사유 필수) |
| IF06-05 | 불변 저장 (append-only) — 수정/삭제 불가 |
| IF06-06 | 보관 기간: **10년** (R155/R156 SUMS 감사 요건) |

---

##### IF-07. OTA Activation Contract (OTA → FF)

**목적:** OTA 패키지 설치 완료와 기능 활성화를 **분리**. "설치 ≠ 노출"의 핵심 인터페이스.

**시퀀스:**

```
[OTA Agent]                   [FF SDK]                    [FF Server]
     |                            |                            |
     |-- install_complete ------->|                            |
     |   (package_id, version)    |                            |
     |                            |-- check_activation ------->|
     |                            |   (package_id, vin,        |
     |                            |    context)                |
     |                            |<-- activation_decision ----|
     |                            |   (approved/deferred/      |
     |                            |    denied)                 |
     |                            |                            |
     |<-- activation_status ------|                            |
     |   (feature_x: active,     |                            |
     |    feature_y: deferred)    |                            |
```

| 요건 ID | 요건 |
|---|---|
| IF07-01 | OTA 패키지 설치 성공 후에도 FF 활성화는 **별도 승인 게이트** 필요 |
| IF07-02 | activation_decision이 `"deferred"`이면 기능은 설치되었으나 노출하지 않음 (코드 존재, 플래그 OFF) |
| IF07-03 | activation_decision이 `"denied"`이면 해당 기능 코드는 실행하지 않음 (Feature Model Deselected와 동일) |
| IF07-04 | 서버 연결 불가 시 → activation_decision = `"deferred"` (안전측 — 설치만 완료, 노출 보류) |
| IF07-05 | Canary/Ring 정책에 따라 차량별로 다른 activation_decision 가능 (동일 패키지, 다른 활성화) |
| IF07-06 | fotaPreconditions (차량 안전 상태, 배터리, 주차 상태)는 OTA Agent가 검증 — FF가 우회 불가 |

---

##### IF-08. Supplier Flag Interface (OEM ↔ Supplier)

**목적:** 협력사 서비스가 OEM FF SDK를 호출하는 표준 API. OpenFeature Provider 인터페이스 기반.

**API 명세:**

```c
/* 초기화 */
ff_status_t ff_init(
    const char* provider_name,     /* "hmc-vehicle-provider" */
    const ff_config_t* config      /* 캐시 경로, TTL, 로깅 설정 */
);

/* Boolean 플래그 평가 */
bool ff_evaluate_bool(
    const char* flag_key,          /* "nav.routing.dynamic_reroute.kor.t1" */
    bool default_value,            /* Safe Default */
    const ff_context_t* context    /* IF-02 Context Schema */
);

/* Multivariate 플래그 평가 */
const char* ff_evaluate_string(
    const char* flag_key,
    const char* default_value,
    const ff_context_t* context
);

int ff_evaluate_int(
    const char* flag_key,
    int default_value,
    const ff_context_t* context
);

/* 킬스위치 콜백 등록 */
ff_status_t ff_register_kill_callback(
    const char* flag_key,
    void (*callback)(const char* flag_key, bool killed)
);

/* SDK 상태 조회 */
ff_health_t ff_get_health(void);
/* 반환: last_sync_time, cache_hit_rate, evaluation_count, error_count */

/* 종료 */
ff_status_t ff_shutdown(void);
```

**에러 코드:**

| 코드 | 의미 | SDK 동작 |
|---|---|---|
| `FF_OK` | 정상 | 평가 결과 반환 |
| `FF_ERR_NOT_INITIALIZED` | SDK 미초기화 | Safe Default 반환 + 에러 로그 |
| `FF_ERR_FLAG_NOT_FOUND` | 플래그 키 미등록 | Safe Default 반환 + Unknown Flag 경고 |
| `FF_ERR_CONTEXT_INVALID` | 필수 컨텍스트 누락 | Safe Default 반환 + 에러 로그 |
| `FF_ERR_MANIFEST_EXPIRED` | Manifest TTL 초과 | 캐시 폴백 → NVRAM → 하드코딩 |
| `FF_ERR_KILLED` | 해당 플래그 Kill 상태 | Safe Default 반환 (기능 비활성) |
| `FF_ERR_SAFE_MODE` | SafeMode 활성 중 | 해당 도메인 모든 UX 플래그 OFF |

**요건:**

| 요건 ID | 요건 |
|---|---|
| IF08-01 | `ff_init()`은 ECU 부팅 시퀀스에서 OS 초기화 직후 1회 호출, **≤3초** 완료 |
| IF08-02 | `ff_evaluate_*()` 호출은 **≤1ms** (QM), **≤100μs** (Safety, 캐시 히트 시) |
| IF08-03 | 모든 evaluate 함수는 **절대 블로킹하지 않음** — 네트워크 I/O 없이 인메모리 평가만 |
| IF08-04 | 미등록 플래그 키 호출 시 `FF_ERR_FLAG_NOT_FOUND` 반환 + 서버에 Unknown Flag 보고 |
| IF08-05 | Kill 콜백은 MQTT 수신 시 SDK가 자동 호출 — 협력사 코드가 폴링하지 않음 |
| IF08-06 | `ff_get_health()` 데이터는 UDS DID로도 조회 가능 (진단 연동) |
| IF08-07 | Thread-safe — 멀티태스크 환경에서 동시 호출 안전 |
| IF08-08 | SDK는 OEM이 제공 (협력사 자체 구현 금지) — 협력사는 **호출만** |

---

#### 인터페이스 간 데이터 흐름 종합

```
[Cloud]
  │ IF-01: Flag Manifest (서명된 구성)
  │ IF-05: Rollback Event (Kill/Resume)
  │ IF-06: Approval Record (감사 기록)
  ▼
[Vehicle FF SDK]
  │ IF-02: Context Schema (차량 상태 입력)
  │ IF-08: Supplier Flag Interface (evaluate 호출)
  │
  ├──→ IF-03: Decision Log (매 평가 기록 → 텔레메트리)
  ├──→ IF-04: Exposure Event (사용자 노출 시점 → 분석)
  │
  │ IF-07: OTA Activation Contract
  ▼        (설치 완료 → 활성화 별도 승인)
[Supplier ECU/App]
  └── ff_evaluate_bool("flag_key", default, &context)
```

#### 버전 관리 및 호환성 정책

| 요건 ID | 요건 |
|---|---|
| IF-V01 | 모든 인터페이스 스키마는 Semantic Versioning (major.minor.patch) |
| IF-V02 | minor 변경: 필드 추가만 허용 (하위 호환) — 기존 필드 삭제/변경 금지 |
| IF-V03 | major 변경: 최소 6개월 전 deprecation 공지 + 이전 버전 12개월 병행 지원 |
| IF-V04 | SDK 버전과 Manifest 버전 간 **호환성 매트릭스** OEM이 관리·배포 |
| IF-V05 | 협력사는 OEM 승인 없이 인터페이스 스키마 변경 불가 |

> **종합:** 이 8대 인터페이스를 구현하면 "기존 구조(Variant Coding + SafeMode + OTA 상태기계 + 인증 + 진단)를 하나의 운영 모델로 묶는 Control Plane / Vehicle SDK / Governance Plane"이 완성된다.

---

## 13.3 협력사 SW 통합 테스트

### 통합 테스트의 목적

협력사가 납품한 SW가 OEM FF 플랫폼과 **올바르게 연동되는지** 검증:
- FF SDK가 정상 초기화되고 평가 컨텍스트를 올바르게 전달하는가
- ON/OFF 양쪽 경로가 모두 올바르게 동작하는가
- 오프라인 상태에서 Fail-safe 기본값이 적용되는가
- 킬스위치 명령에 올바르게 응답하는가
- 다른 ECU/서비스의 FF와 상호작용 시 충돌이 없는가

### 통합 테스트 4단계

| 단계 | 환경 | 검증 내용 | Pass 기준 |
|---|---|---|---|
| **L1: SDK 인터페이스** | 단위 테스트 환경 | SDK 초기화, Provider 등록, Context 전달, 평가 응답 | 100% API 호환 |
| **L2: 기능 동작** | SIL (소프트웨어 시뮬레이션) | ON/OFF 양쪽 기능 동작, 상태 전이, 경계값 | ON/OFF 양쪽 Pass |
| **L3: 다중 ECU 통합** | HIL (하드웨어 연동) | ECU 간 FF 상태 전파, 통신 지연, 우선순위 충돌 | 전 ECU 일관된 상태 |
| **L4: E2E 시나리오** | 디지털 트윈 / 실차 | 실제 주행 시나리오에서 FF 전환, 킬스위치, 롤백 | 시나리오 100% Pass |

### FF 특화 통합 테스트 케이스

| 테스트 ID | 카테고리 | 시나리오 | 예상 결과 |
|---|---|---|---|
| IT-FF-001 | SDK 초기화 | 차량 시동 → FF SDK 부팅 → 서버 동기화 | 플래그값 로드 <3초 |
| IT-FF-002 | 오프라인 폴백 | 서버 연결 불가 상태에서 시동 | 캐시/NVRAM/기본값 위계 적용 |
| IT-FF-003 | 킬스위치 | 서버에서 Kill 명령 → 차량 수신 | 지정 시간 내 safe state |
| IT-FF-004 | 플래그 전파 | OEM 플래그 변경 → 협력사 ECU 반영 | <100ms 전파 지연 |
| IT-FF-005 | 교차 ECU | ECU-A(FF=ON) + ECU-B(FF=OFF) 동시 | 기능적 충돌 없음 |
| IT-FF-006 | Safety FFI | Safety FF 변경 → QM FF에 영향 없음 | Freedom from Interference |
| IT-FF-007 | 롤백 시나리오 | COTA 롤백 → 협력사 ECU 이전 상태 | 전 ECU 동기 롤백 |
| IT-FF-008 | FoD 연동 | Entitlement 변경 → Permission Flag → 기능 활성화 | E2E 과금-활성 일치 |
| IT-FF-009 | A/B 코호트 | VIN 기반 코호트 배정 → 협력사 기능 분기 | 코호트별 올바른 변형 |
| IT-FF-010 | 업데이트 중 | SOTA 업데이트 중 FF 상태 변경 시도 | 업데이트 완료까지 FF 변경 보류 |

### 협력사 테스트 증적 요구

| 증적 | 내용 | 형식 | 제출 시점 |
|---|---|---|---|
| **FF 매트릭스 테스트 결과** | 플래그 ON/OFF 전 조합 테스트 | 테스트 리포트 (Codebeamer) | SOP 전 |
| **SDK 호환성 보고서** | OpenFeature Provider 인터페이스 적합성 | 적합성 매트릭스 | 통합 테스트 전 |
| **Fail-safe 검증 보고서** | 4단계 폴백 각 레벨 검증 | 시험 성적서 | L3 테스트 후 |
| **킬스위치 응답 측정** | Kill 명령 → safe state 전환 시간 | 타임스탬프 로그 | L4 테스트 후 |
| **ASPICE 추적성 매핑** | Req ↔ Flag Spec ↔ Test Case ↔ Result | Codebeamer Export | SOP 전 |

---

## 13.4 가상 검증 (Virtual Verification & Validation)

### 왜 가상 검증이 필수인가

FF 조합 폭발 문제: 50개 플래그 × 100개 HW 변형 × 10개 지역 = **물리적 테스트로 전수 검증 불가능**. 가상 검증이 유일한 해법.

### V&V 계층 구조

| 계층 | 도구/환경 | FF 검증 내용 | 커버리지 | 비용 |
|---|---|---|---|---|
| **MIL** (Model-in-the-Loop) | MATLAB/Simulink | FF 알고리즘 로직, 상태 전이 | 알고리즘 | 낮음 |
| **SIL** (Software-in-the-Loop) | 가상 ECU (vECU) | FF SDK 통합, 평가 로직, API 호환 | SW 기능 | 낮음 |
| **HIL** (Hardware-in-the-Loop) | 실 ECU + 시뮬레이터 | FF+실 HW 동작, 타이밍, 인터럽트 | HW-SW 통합 | 중간 |
| **디지털 트윈** | CARLA/Autoware/SUMO | FF+실 주행 시나리오, 환경 변수 | E2E 시나리오 | 중간 |
| **실차** | 시험장/공도 | 최종 확인 (가상 검증 보완) | 실환경 | 높음 |

### SIL — FF 조합 테스트의 핵심 계층

SIL 환경에서 가상 ECU(vECU)에 FF SDK를 탑재하고 **대규모 조합 테스트를 자동 실행**:

```
┌────────────────────────────────────────────────┐
│            SIL 테스트 오케스트레이터              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ vECU-1   │  │ vECU-2   │  │ vECU-N   │     │
│  │ (ADAS)   │  │ (Body)   │  │ (IVI)    │     │
│  │ FF SDK   │  │ FF SDK   │  │ FF SDK   │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│       ↕              ↕              ↕           │
│  ┌────────────────────────────────────────┐    │
│  │     FF Platform (테스트 환경)           │    │
│  │  플래그 매트릭스 자동 토글              │    │
│  └────────────────────────────────────────┘    │
│       ↕                                         │
│  ┌────────────────────────────────────────┐    │
│  │     Vehicle Bus Simulator               │    │
│  │  CAN/CAN-FD/Ethernet/SOME-IP 시뮬      │    │
│  └────────────────────────────────────────┘    │
└────────────────────────────────────────────────┘
```

**자동 실행 흐름:**
1. Pairwise 테스트 생성기 → 조합 매트릭스 산출
2. 각 조합에 대해 vECU 클러스터 구동
3. FF Platform API로 플래그 상태 설정
4. 시나리오 주입 (주행, 환경, 사용자 입력)
5. 결과 수집 + Pass/Fail 자동 판정
6. ASPICE 추적성 리포트 자동 생성

### HIL — 실 ECU FF 검증

| 검증 항목 | 방법 | Pass 기준 |
|---|---|---|
| FF 평가 지연 | 플래그 변경 → ECU 동작 변경 시간 측정 | <100ms (QM), <50ms (Safety) |
| 킬스위치 응답 | Kill 명령 → safe state 전환 | <5분 (COTA), <30분 (UCM) |
| Fail-safe 계위 | 서버 차단 → 캐시 → NVRAM → 하드코딩 순차 확인 | 각 레벨 정상 전환 |
| 이중채널 (Safety) | Ch.A ≠ Ch.B → Voter가 safe default 선택 | 불일치 시 safe state |
| 부팅 시 동기화 | 시동 ON → FF 초기값 로드 시간 | <3초 |
| OTA 중 동작 | SOTA 업데이트 중 FF 상태 유지/보류 | 업데이트 완료까지 안정 |

### 디지털 트윈 — E2E 시나리오 검증

**Target 환경:** CARLA + Autoware + FF Platform

| 시나리오 | FF 조합 | 검증 포인트 |
|---|---|---|
| AEB 카나리 롤아웃 | AEB_v2=ON (1% 차량), AEB_v1=ON (99%) | 1% 차량만 v2 동작, 나머지 v1 유지 |
| FoD 구독 활성화 | permission_fod_rearseat=ON | 결제 → 활성화 → 기능 사용 E2E |
| 킬스위치 시나리오 | safety_adas_lka=KILL | 전 fleet LKA 비활성 → safe state |
| 지역 규제 차단 | config_region_kr=ON, config_region_eu=OFF | 한국 차량만 기능 활성, EU는 비활성 |
| 오프라인 장기 | 서버 연결 7일 중단 | TTL 만료 후 factory default 적용 |
| 다중 FF 동시 변경 | 5개 플래그 동시 전환 | 상호작용 없음, 각각 독립 적용 |

---

## 13.5 협력사 관리 로드맵

| Phase | 협력사 요건 | 통합 테스트 | 가상 검증 |
|---|---|---|---|
| **Quick (2026)** | FF Interface Spec v1 배포, Tier A 1~2개사 PoC | L1~L2 SDK 호환성 | SIL 기본 환경 구축 |
| **Mid (2027~28)** | 신규 SoW에 FF SDK 탑재 의무화, Tier A-B 전체 | L1~L4 전체 | SIL+HIL 자동화, 디지털 트윈 PoC |
| **Long (2029~)** | 전 Tier FF 인터페이스 표준화, OpenFeature 생태계 | CI/CD 통합 자동 실행 | 디지털 트윈 상시 운영 |

---

## 13.6 ASPICE 추적성 확장 (협력사 포함)

| ASPICE 프로세스 | OEM 산출물 | 협력사 산출물 | 추적 |
|---|---|---|---|
| ACQ.4 공급자 모니터링 | FF Interface Spec | SDK 호환성 보고서 | Spec → 보고서 |
| SWE.4 단위 검증 | OEM FF 단위 테스트 | **협력사 FF 단위 테스트** | Flag Spec → Test |
| SWE.5 통합 테스트 | OEM-협력사 통합 테스트 | 협력사 내부 통합 테스트 | Test → Result |
| SWE.6 적격성 테스트 | SIL/HIL/디지털 트윈 | 협력사 HIL 증적 | Result → Qualification |
| SUP.8 형상관리 | OEM Flag Catalog | **협력사 Flag Spec 등록** | Catalog → ECU |

---

## 13.7 ES95411 소프트웨어 평가 사양 — FF SDK 적합성 요건

> **ES95411-00 (REV9)** — HMC 소프트웨어 평가 사양서 (203쪽). 협력사 제어기 SW의 정적/단위/통합 검증 기준. V-Model 기반, ISO 26262 준수. FF SDK 및 FF toggle point 코드도 이 사양의 적용 대상.

### ES95411이 FF에 영향을 미치는 핵심 영역

| ES95411 영역 | FF 적용 영향 | 조치 |
|---|---|---|
| **MISRA-C:2012 코딩룰** | FF SDK C/C++ 코드 전체 + toggle point 코드가 MISRA 준수 대상 | ASIL A~C: 98 규칙, ASIL D: 104 규칙 준수 |
| **ASIL별 커버리지 기준** | FF ON/OFF 양쪽 경로 모두 커버리지 대상 | QM: 문장 커버리지, ASIL A~B: 문장+결정 100%, ASIL C~D: **MC/DC** |
| **결함주입검증** | FF Evaluator의 fault tolerance 검증 필수 | 이중채널 불일치, 캐시 손상, NVRAM 실패 시나리오 |
| **자원사용량 기준** | FF 평가 로직의 CPU/RAM 오버헤드 제한 | CPU 평균 ≤70%, 최대 ≤90% + WCET Slack Time |
| **Error Protection 15항목** | FF Evaluator가 탑재되는 ECU에 전부 적용 | 아래 상세 |
| **소프트웨어 변경 영향성 분석** | FF 상태 변경이 SW 변경으로 간주 → 영향 분석 필수 | R156 SUMS와 연결 |
| **오픈소스 사용여부** | OpenFeature SDK 등 OSS 사용 시 검증 대상 | 라이선스 + 취약점 스캔 |

### ASIL별 FF SDK 검증 수준

| 검증 단계 | QM | ASIL A-B | ASIL C-D |
|---|---|---|---|
| **정적검증** | MISRA 기본 + 복잡도 | + ASIL 코딩룰(98) + 태스크 타이밍 | + 코딩룰(104) + WCET + Race Condition |
| **단위검증** | 문장 커버리지 | + 결정 커버리지 100% | + **MC/DC 100%** + 결함주입 |
| **통합검증** | 함수/호출 커버리지 | + 인터페이스 검증 | + 자원사용량 + **결함주입** |
| **FF 특화** | ON/OFF 양쪽 Pass | + 조합 테스트(쌍대) | + **전수 조합** + 이중채널 |

> **핵심:** FF toggle point가 추가하는 `if (Feature.isEnabled(...))` 분기문은 **커버리지 측정 대상**. ASIL C-D에서는 MC/DC가 요구되므로, FF ON/OFF 양쪽의 모든 조건 조합을 테스트해야 함.

### Error Protection 15항목 — FF Evaluator 적용

ES95411 §6.7에서 요구하는 시스템 Error Protection 기능:

| 카테고리 | 항목 | FF Evaluator 적용 |
|---|---|---|
| **메모리 (7항)** | RAM Test | FF 캐시 메모리 무결성 주기 검사 |
| | ROM Test | FF SDK 코드 영역 무결성 |
| | Register Test | FF 평가 결과 레지스터 검증 |
| | EEPROM Test | NVRAM 저장 플래그값 무결성 |
| | **Memory Protection** | **Safety FF Evaluator ↔ QM FF Evaluator 메모리 파티셔닝** (ISO 26262 FFI) |
| | Exchange of Information | FF 평가 결과 전달 시 데이터 무결성 (CRC) |
| | **Stack Overflow** | **FF 평가 로직의 스택 사용량 모니터링** |
| **타이밍 (4항)** | Clock Error | FF 평가 타이머 정확도 |
| | **Watchdog** | **FF Evaluator Watchdog — 응답 없으면 Safe Default 적용** |
| | **Alive Supervision** | **FF SDK 주기적 heartbeat — 미응답 시 Fail-safe** |
| | **Deadline Monitoring** | **FF 평가 WCET 초과 시 Task Overrun 감지 → Safe Default** |
| **기타 (4항)** | **Control Flow Monitoring** | **FF 평가 로직 실행 순서 검증 (Latch-at-Init 포함)** |
| | Instruction Exception | FF 코드 비정상 명령 예외 처리 |
| | A/D Error | 센서 입력 기반 FF 평가 시 A/D 변환 오류 감지 |
| | OS Error | FF SDK가 사용하는 OS 서비스 오류 처리 |

> **Memory Protection + Watchdog + Alive Supervision + Deadline Monitoring + Control Flow Monitoring** — 이 5가지가 FF Evaluator 설계에 가장 직접적인 영향. 5장(Vehicle Plane)의 Safety 실행 제약 및 4단계 Fail-safe 위계와 직접 연결됨.

### 자원사용량 기준 — FF 오버헤드 예산

| 항목 | ES95411 기준 | FF Evaluator 영향 |
|---|---|---|
| **CPU Load** | 평균 ≤70%, 최대 ≤90% | FF 평가는 전체 CPU 예산의 **1% 미만** 사용 목표 |
| **WCET** | 태스크별 WCET + Slack Time | FF 평가 WCET를 별도 측정·보고 |
| **RAM** | 할당량 내 사용 | FF 캐시 + 규칙셋 저장 RAM 예산 사전 정의 |
| **ROM** | 코드 크기 제한 | FF SDK 바이너리 크기 ≤ 지정 한도 |
| **Stack** | 스택 사용량 모니터링 | FF 평가 함수의 최대 스택 깊이 측정 |

### 협력사 FF SDK 납품 시 ES95411 추가 증적

| 증적 | 내용 | 기존 ES95411 매핑 |
|---|---|---|
| **FF MISRA 리포트** | FF SDK + toggle point 코드의 MISRA-C:2012 위반 0건 | §4 정적검증 |
| **FF 커버리지 리포트** | ON/OFF 양쪽 경로 커버리지 (QM: 문장, ASIL C-D: MC/DC) | §5 단위검증 |
| **FF 결함주입 리포트** | Evaluator fault tolerance 검증 결과 | §5.2.5, §6.3.5 |
| **FF 자원사용량 리포트** | CPU/RAM/ROM/Stack/WCET 측정값 | §6 통합검증 §6.6 |
| **FF Error Protection 리포트** | 15항목 중 FF 관련 항목 Pass 확인 | §6.7 |
| **FF 변경 영향성 분석** | FF 상태 변경이 다른 SW 모듈에 미치는 영향 | §4.10 (Rev8+) |
| **FF 오픈소스 리포트** | OpenFeature SDK 등 OSS 라이선스 + 취약점 | §4 (Rev8+) |
