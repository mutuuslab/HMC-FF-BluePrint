# 3장. 현황 진단 (AS-IS Baseline)

> **제1편. 경영 요약** | 대상 독자: C-Level, 아키텍처팀, 기획

---

## 3.1 현행 체계 21항목 기준선

7축(D1~D7) 기준으로 HMC의 조직·프로세스·도구·E2E 흐름을 구조화.

| 벤치마킹 축 | 세부 영역 | 현황 요약 | 현 수준 추정 |
|---|---|---|---|
| D1 FF 아키텍처 | Runtime SDK/Evaluator, Offline Registry, Zonal/Central Split | CCS 관리테이블 기반 On/Off, Trim 단위 제어 불가, 런타임 FF/SDK 미도입 | L2 |
| D2 배포전략/롤아웃 | Progressive Delivery, Guardrail, Rollout Simulator | 전체 배포(All-or-nothing), 가드레일 미지원 | L1~L2 |
| D3 거버넌스/권한 | RBAC, 4-Eyes, Audit Trail | R&R gray zone, 승인 체계 불명확, Audit trail 미구축 | L1~L2 |
| D4 생애주기 | Feature Catalog, Dead Flag, Cleanup | Feature 명칭 부서별 상이, Owner/expiry 미정의 | L1 |
| D5 안전/컴플라이언스 | Kill-switch, FTTI/MTTR, Safe-state | 안전 변경 절차 수동, Kill-switch SLO 미정의 | L1~L2 |
| D6 수익화/UX | FoD, Entitlement, Permission Flag | 서버 필터/관리테이블 중심, Entitlement 객체 모델 부재 | L1 |
| D7 운영모델/조직 | Platform Team, Enablement, KPI | 현업이 FF를 추가업무로 인식, KPI 분산 | L1~L2 |

---

## 3.2 Current System Landscape (10개 Layer)

| # | Layer / System | 현황 | 핵심 Gap | 연결 D# |
|---|---|---|---|---|
| 1 | Demand / portfolio intake | Feature 명명 규칙 불일치, canonical Feature ID 약함 | Feature ID 부재 | D4,D7 |
| 2 | Requirements / ALM | ALM 중심 존재하나 Flag 객체와 미연결 | Flag-요구 trace 단절 | D4 |
| 3 | Approval / governance | CAB/조직별 승인 있으나 FF-specific 규칙 미정의 | 승인 리드타임 불명확 | D3,D5 |
| 4 | Control / config management | CCS 관리테이블/서버 필터 중심 | 세그먼트·permission flag 약함 | D1,D6 |
| 5 | Commerce / entitlement | 결제-권한-기능활성화 단일 object model 부재 | sync failure 가능 | D6 |
| 6 | OTA campaign | 패키지/캠페인 있으나 feature-level cohort/guardrail 약함 | All-or-nothing 경향 | D2,D5 |
| 7 | Vehicle runtime | 런타임 evaluator/local registry 표준 구조 미약 | offline fallback 불명확 | D1,D5 |
| 8 | Observability / telemetry | Incident 모니터링 있으나 feature exposure 결합 약함 | guardrail data 부족 | D2,D7 |
| 9 | Audit / evidence store | 규제 증적 보관되나 자동 조립 약함 | evidence retrieval 수작업 | D3,D5 |
| 10 | Identity / access | 일반 IAM 존재하나 feature-level RBAC 미정의 | 권한경계 불명확 | D3 |

---

## 3.3 기존 Domain 아키텍처의 FF 제약

| 구분 | 제약 | FF 적용 방식 |
|---|---|---|
| Mobilgene Classic (ASIL-D ECU) | 런타임 동적 토글 불가 | Post-build Selectable NVM 캘리브레이션 매핑 |
| Mobilgene Adaptive (HPC) | ara::com 네이티브 통합 가능 | FF SDK 직접 탑재, 전체 평가 로직 실행 |
| ccOS Head Unit | 소프트웨어 플랫폼 유연 | FF SDK 네이티브, A/B 실험 최적 |
| CGW 기반 라우팅 | 도메인 간 CAN 버스 분리 | 각 도메인에 개별 플래그 값 분배 필요 |

---

## 3.4 Pain Point → D1~D7 역매핑

| Pain ID | AS-IS Pain Point | D# | 핵심 비교 질문 |
|---|---|---|---|
| PP-01 | CCS Trim 단위 제어 불가 | D1 | 선도사의 다차원 타겟팅 아키텍처는? |
| PP-02 | FoD 관리테이블 부재 | D6 | Entitlement·결제·기능 활성화 연결 체계는? |
| PP-03 | R&R gray zone | D3 | 승인/감사/만료 통제 방식은? |
| PP-04 | Feature 용어 불일치 | D4 | Feature Catalog 운영 방식은? |
| PP-05 | 현업 FF 추가업무 저항 | D7 | Platform Team Enablement 모델은? |
| PP-06 | OTA 릴리스 리드타임 | D2 | Progressive delivery 가드레일은? |
| PP-07 | 안전 규제 대응 | D5 | Safety-critical FF FTTI/MTTR은? |

---

## 3.5 현황 Headline

> **"현재 HMC는 시스템이 없는 것이 아니라, Feature 단위 digital thread와 control ownership이 끊겨 있다."**
> 
> - '새 플랫폼 필요'가 아니라 '현재 시스템 간 객체/권한/증적 연결이 약하다'는 메시지
> - 기존 OTA를 부정하지 않고 '확장해야 할 control model'을 제시해야 고객 저항이 적음
