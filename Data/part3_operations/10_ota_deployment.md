# 10장. OTA Feature 배포 프로세스 (8-Stage)

> **제3편. 운영 모델** | 대상 독자: 플랫폼팀, DevOps, OTA 운영, Safety

---

## 10.1 3계층 OTA 아키텍처

FF의 자연적 거처(natural home)는 **COTA 계층**이다.

| 계층 | 대상 | 일반 크기 | 소요 시간 | 리스크 | FF 관련성 |
|---|---|---|---|---|---|
| **COTA** | Feature flag, 캘리브레이션, 정책 | 1KB ~ 500KB | 초~분 | **낮음** (코드 변경 없음) | **FF의 직접 전달 경로** |
| **SOTA** | 인포테인먼트 앱, 내비, IVI OS | 50MB ~ 2GB | 10~60분 | 중간 | FF SDK 포함 SW 업데이트 |
| **FOTA** | ECU 펌웨어, 파워트레인, ADAS, BMS | 500MB ~ 5+GB | 30분 ~ 2시간+ | **높음** (ECU brick 가능) | Safety FF의 UCM 경로 |

> COTA는 최저 리스크·최고 속도 OTA 유형이며, **progressive rollout의 이상적 메커니즘**. 델타 업데이트 기법으로 SOTA 패키지 크기를 최대 95% 축소 가능.

### AUTOSAR UCM 이중경로 플래그 전달

| 경로 | 대상 | 전달 방식 | 속도 | 안전 수준 |
|---|---|---|---|---|
| **Safety Path** (UCM) | ASIL 등급 플래그 | 표준 UCM 파이프라인 — SoftwareCluster 패키지(구성 매니페스트만) | 분~시간 | SUMS 전체 준수 |
| **QM Path** (Streaming) | QM 등급 플래그 | UCM 바이패스 — FF Service가 스트리밍으로 직접 수신, ara::per 저장 | **초~분** | 경량 |

> 이중경로 설계가 **안전 엄격성과 운영 속도의 균형**을 실현. Classic AUTOSAR ECU는 Flashing Adapter(ara::com→D-PDU API, ISO 22900-2)로 브릿지.

---

## 10.2 8-Stage 전체 흐름

| Stage | 활동 | 핵심 Gate | QM 리드타임 | ASIL C-D 리드타임 |
|---|---|---|---|---|
| **1. 배포 승인** | ASIL 분기별 승인자 확보 | 코드 리뷰 + 사이버보안 + ASIL Gate | 1~2일 | 1~3주 |
| **2. FF 플랫폼 구성** | 플래그 키/변형/기본값, 스키마 검증 | Fallback 안전 기본값 설정 | 수시간 | 수시간 |
| **3. 타겟팅 규칙** | VIN/모델/지역/HW/SW, FoD 연동 | RXSWIN 해당 시 규제 병행 | 수시간 | 수일 |
| **4. 카나리 배포** | COTA Uptane 이중서명, 내부 50~100대 | TCU→HPVC→UCM→SDK→ZC→ECU | 1~2주 | 2~4주 |
| **5. 텔레메트리 분석** | ML 이상탐지, 통계 유의성 | Go/No-Go 판정 | 자동 | Safety Board |
| **6. 단계적 롤아웃** | 0.1%→1%→5%→25%→50%→100% | 매 단계 헬스체크 | 자동 진행 | 매 단계 Board 승인 |
| **7. GA** | SUMS/RXSWIN 최종화, FoD 과금, Connect App | 최종 선언 | 1일 | 수일 |
| **8. 지속 모니터링** | 킬스위치 상시 대비, 릴리스 플래그 90일 은퇴 | 장기 추세 | 지속 | 지속 |

---

## 10.3 Stage 1 — 배포 승인 상세

| 승인자 | QM | ASIL A-B | ASIL C-D |
|---|---|---|---|
| 코드 리뷰어 | ✅ | ✅ | ✅ |
| 사이버보안 리뷰어 | ✅ | ✅ | ✅ |
| 제품 책임자 (PO) | ✅ | ✅ | ✅ |
| 안전 엔지니어 | - | ✅ | ✅ |
| Safety Board | - | - | ✅ |
| 독립 안전 평가자 | - | - | ✅ |
| **합계** | **3명** | **4명** | **6명+** |

---

## 10.4 Stage 5 — 자동 롤백 트리거

| 트리거 | 임계값 | 탐지 방법 | 응답 시간 |
|---|---|---|---|
| 오류율 급증 | 기준선 대비 2σ | ML 이상탐지 | 자동 <5분 |
| Safety DTC 증가 | 유의미 증가 | DTC 비율 모니터링 | 자동 <5분 |
| 크래시/재시작율 | 기준선 대비 이상 | 크래시 리포트 | 자동 <5분 |
| 텔레메트리 중단 | 수신율 <90% | 수신 모니터링 | 알림→수동 |
| 고객 불만 급증 | NLP 클러스터 | 지원채널 NLP | 알림→수동 |
| Safety Engineer 수동 | 언제든 | 수동 트리거 | 즉시 |

---

## 10.5 Stage 6 — 단계적 롤아웃

| Tier | 비율 | 대상 | 헬스체크 | ASIL C-D 승인 |
|---|---|---|---|---|
| Canary | 0.1% | 내부 플릿 | 1~2주 | Board ① |
| Ring 1 | 1% | 얼리 어답터 | 72시간 | Board ② |
| Ring 2 | 5% | 지역 선도 | 48시간 | Board ③ |
| Ring 3 | 25% | 지역 확대 | 48시간 | Board ④ |
| Ring 4 | 50% | 전체 HW 세대 | 24시간 | Board ⑤ |
| GA | 100% | 전체 플릿 | 지속 | 최종 선언 |

---

## 10.6 구현 원칙: FF Operations-as-Pipeline-Steps

8-Stage의 각 단계는 **수동 콘솔 클릭이 아니라 CI/CD 파이프라인의 공식 Step으로 코드화**.

### FF 파이프라인 6대 Step 유형

| Step 유형 | 8-Stage 매핑 | 용도 |
|---|---|---|
| **Flag Create** | Stage 2 | 신규 플래그 생성 + 전 환경 기본 롤아웃 플랜 |
| **Flag Update** | Stage 2~7 | 메타데이터 변경 (상태, Owner, 태그) |
| **Set Individual Targets** | Stage 4 | 특정 VIN/테스터를 ON 대상으로 지정 (리스트 교체) |
| **Add/Remove Targets** | Stage 6 | 기존 리스트에 VIN/세그먼트 점진 추가·제거 |
| **Set Default Allocations** | Stage 6 | 매칭 안 되는 트래픽의 On/Off 비율 (50/50, 100/0 등) |
| **Kill Flag** | Stage 8 / 긴급 | 즉시 비활성화 — 기본값(Off) 서빙 |

### 파이프라인 내 Approval Gate 삽입

| 구간 | QM | ASIL A-B | ASIL C-D |
|---|---|---|---|
| Create → 카나리 | 자동 | Approval: 안전엔지니어 | Approval: Safety Board |
| 카나리 → Ring 1 | 자동 (헬스체크 Pass) | Approval: Go/No-Go | Approval: Board ① |
| Ring N → Ring N+1 | 자동 | 자동 | Approval: Board ②③④⑤ |
| Kill Flag | 자동/수동 모두 | 자동/수동 모두 | **자동 허용** (사후 보고) |

### 이 원칙이 해결하는 3가지

1. **감사 추적 자동화** — 파이프라인 실행 이력 = 감사 로그. ISO 26262·ASPICE 충족.
2. **반복 가능한 배포** — 동일 YAML을 Dev→Staging→Prod 순차 적용. 환경별 수동 오류 차단.
3. **실패 시 자동 대응** — 텔레메트리 이상 → Kill Flag Step 자동 실행.

---

## 10.7 MQTT 킬스위치 아키텍처

### 하이브리드 Push-Pull 모델

| 채널 | 역할 | 지연 | 비고 |
|---|---|---|---|
| **MQTT Push** | 킬스위치 트리거 → 차량 즉시 플래그 재fetch | **<30초** (온라인 fleet) | QoS 1 (at-least-once) |
| **CDN/API Pull** | 플래그 구성 풀 다운로드 | 30초~5분 폴링 | Push 실패 시 안전망 |
| **Retained Message** | 오프라인 차량이 연결 시 즉시 최신 상태 수신 | 다음 연결 시 | MQTT retained 기능 |

- 차량별 토픽: `fleet/{vin}/flags/kill`
- Safety 플래그에 **TTL(Time-to-Live)** 부여: TTL 내 백엔드 미연결 시 안전 기본값(기능 비활성)으로 자동 폴백
- 다음 부팅 시 구성 동기화 강제 (ignition cycle 마다)
- MQTT 브로커: HiveMQ, EMQX, AWS IoT Core — 수백만 동시 차량 연결 지원

---

## 10.8 Consistent Hashing — VIN 기반 결정론적 타겟팅

### 핵심 알고리즘

```
bucket = SHA256(featureKey + ":" + vehicleVIN) mod 100
→ bucket 0~99 매핑
→ rollout 10% = bucket 0~9에 해당하는 VIN만 활성화
```

### 4가지 보장

| 속성 | 설명 | 자동차 의미 |
|---|---|---|
| **결정론적** | 동일 VIN + 동일 featureKey = 항상 같은 결과 | 차량 재시작해도 동일 플래그 값 |
| **균일 분포** | VIN이 버킷에 고르게 분산 | 카나리 1% = 실제 fleet의 1% |
| **기능 독립** | 다른 featureKey는 다른 분포 생성 | 기능 A가 On인 차량 ≠ 기능 B가 On인 차량 |
| **단조 확장** | 10%→20% 확장 시 기존 차량 유지 + 신규만 추가 | 카나리 차량이 갑자기 Off 되지 않음 |

> Unleash의 교훈: MurmurHash 분포 버그로 10% 롤아웃에서 10~30% 편차 발생 (10억 샘플 기준). 할당 vs 변형 버킷에 서로 다른 시드 사용으로 해결 — **카나리 단계에서 정밀 제어가 필수**인 자동차에 핵심 교훈.

---

## 10.9 Uptane 준수 COTA 패키지 매니페스트

### Uptane 이중 저장소 아키텍처

| 저장소 | 역할 | FF 적용 |
|---|---|---|
| **Image Repository** | 서명된 메타데이터 보관 | 플래그 구성 패키지의 무결성 보증 |
| **Director Repository** | 차량별 타겟팅 | 카나리/단계적 롤아웃 로직 구현 |

### COTA 패키지 구조

```yaml
package:
  id: "cota-ff-2026-q3-014"
  version: "1.4.2"
  expiration: "2026-12-31T23:59:59Z"

ecu_targets:
  - ecu_type: "HPVC"
    min_firmware: "2.1.0"
    dependencies: ["sdk-ff-1.3+"]

flags:
  - key: "safety_adas_aeb_sensitivity_v2"
    type: "multivariate"
    default: "conservative"
    safety_class: "ASIL-D"
    rollback_policy: "immediate-to-default"
  - key: "release_hmi_newdashboard_v3"
    type: "boolean"
    default: false
    safety_class: "QM"
    rollback_policy: "standard"

activation_conditions:
  vehicle_state: "parked"           # 주행 중 변경 금지
  min_battery_soc: 40               # 배터리 40% 이상
  user_consent: true                # 사용자 동의
  time_window: "02:00-05:00 KST"   # 비활성 시간대

integrity:
  hash: "sha256:a1b2c3d4..."
  signature: "ecdsa-p256:..."
  signing_role: "targets"
```

### Vehicle Version Manifest — Fleet 가시성

Director Repository로 보고되는 차량측 매니페스트:
- 현재 활성 플래그 목록 + 각 값
- ECU별 펌웨어 버전
- 마지막 동기화 시각
- 오프라인 폴백 상태 여부

> **이 매니페스트가 "fleet 전체에서 어떤 차량이 어떤 기능을 사용 중인가"에 대한 실시간 가시성을 제공.**
