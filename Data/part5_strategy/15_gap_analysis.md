# 15장. GAP 분석 및 도입 준비도

> **제5편. 중장기 전략** | 대상 독자: C-Level, CTO, PMO

---

## 15.1 D1~D7 GAP 요약

| D# | 비교 관점 | AS-IS | To-Be | 핵심 격차 | 우선순위 |
|---|---|---|---|---|---|
| D1 | FF 아키텍처 | CCS 관리테이블, Trim 불가 | Policy object + evaluation layer 분리 | 관리테이블→정책 객체 | High |
| D2 | 배포전략 | All-or-nothing | Deploy≠Release + progressive + guardrail | 배포/출시 분리 + stop rule | High |
| D3 | 거버넌스 | R&R 불명확, Audit 부재 | Metadata discipline + approval/audit | metadata + 승인/감사 | High |
| D4 | 생애주기 | 용어 불일치, owner/expiry 없음 | Feature Catalog + cleanup automation | 용어/수명/정리기준 | High |
| D5 | 안전/컴플라이언스 | 수동 절차, kill-switch SLO 없음 | Kill-switch + fallback + review | 운영 제어 + bounded path | High |
| D6 | 수익화/UX | 서버 필터, entitlement 부재 | Permission flag + entitlement audit | object model 설계 | Medium |
| D7 | 운영모델/조직 | 추가업무 인식, KPI 분산 | Platform + enablement + DORA KPI | operating model 부재 | Medium |

---

## 15.2 역량 성숙도 현황

| D# | L1 Ad-hoc | L2 Defined | L3 Managed | L4 Optimized | HMC 현 수준 | 2028 목표 |
|---|---|---|---|---|---|---|
| D1 | 하드코딩 | **관리테이블** | Runtime FF+SDK | 다차원+Edge | **L2** | L3 |
| D2 | All-or-nothing | 그룹배포 | 카나리+가드레일 | 자동 Progressive | **L1~L2** | L3 |
| D3 | 비공식 | 문서화 | RBAC+Audit | 자동정책 | **L1~L2** | L3 |
| D4 | 무관리 | 수동정리 | 만료정책+알림 | 자동Cleanup+KPI | **L1** | L3 |
| D5 | 없음 | 수동게이트 | Safety Rule+킬스위치 | 자동FTTI/MTTR | **L1~L2** | L3 |
| D6 | 수동 | 관리테이블 | Permission Flag | 개인화+A/B | **L1** | L2~L3 |
| D7 | 사일로 | 프로젝트협업 | 플랫폼+Enablement | Feature E2E | **L1~L2** | L3 |

---

## 15.3 GAP → 4-Plane 매핑

| Plane | 해결 GAP | 핵심 컴포넌트 |
|---|---|---|
| Control | D1(아키텍처), D3(거버넌스), D6(수익화) | Flag Admin, Policy Engine, RBAC, Entitlement |
| Vehicle | D1(런타임), D5(안전) | Evaluator/SDK, Safety Gatekeeper, Local Registry |
| Governance | D3(거버넌스), D4(생애주기), D7(운영모델) | Feature Catalog, Lifecycle Manager, Approval |
| Quality | D2(배포), D5(안전), D7(KPI) | Progressive Delivery, Rollout Simulator, Telemetry |

---

## 15.4 릴리스 전략 성숙도 모델 (Release Strategy Evolution)

FF 도입은 한 번에 완성되는 것이 아니라 **투자(시간·자원) 대비 가치가 점진적으로 상승**하는 성숙도 곡선을 따름.

### 성숙도 단계 (Value↑ × Investment→)

| 단계 | 성숙 수준 | 핵심 능력 | HMC 현 위치 | Target |
|---|---|---|---|---|
| **1. Feature Rollback** | 입문 | 문제 시 기능 단위 롤백 (Kill Switch) | — | Quick |
| **2. New Feature Gating** | 입문 | 신규 기능을 FF 뒤에 숨겨 배포 | ← **여기** | Quick |
| **3. Feature Testing** | 기초 | FF로 내부/베타 그룹 테스트 | | Quick |
| **4. Server-side Testing** | 기초 | 백엔드 로직(알고리즘, API)에 FF 적용 | | Mid |
| **5. Canary Releases** | 중급 | 소규모 % 사용자에게 단계적 노출 | | Mid |
| **6. Trunk-based Development** | 중급 | FF 기반 Trunk-Based 전환, 장기 브랜치 제거 | | Mid |
| **7. Automated CI/CD** | 고급 | FF를 CI/CD 파이프라인 Step으로 코드화 | | Mid |
| **8. Continuous Delivery** | 고급 | 언제든 배포 가능 상태 유지, Release는 비즈니스 결정 | | Long |
| **9. Governance** | 엘리트 | RBAC, Audit, 4-Eyes, Cleanup 자동화, DORA 엘리트 | | Long |

### HMC 전환 경로와 매핑

| Phase | 목표 성숙도 | 핵심 달성 항목 |
|---|---|---|
| **Quick (2026)** | 1~3단계 | Kill Switch 도입, Feature Catalog, Pilot 팀 FF wrapping |
| **Mid (2027~28)** | 4~7단계 | Vehicle SDK, Canary/Ring 배포, Trunk-Based 전환, CI/CD FF Pipeline |
| **Long (2029~)** | 8~9단계 | Continuous Delivery 체제, 전사 Governance, DORA 엘리트 |

> **핵심 메시지:** HMC는 현재 2단계(Feature Gating — CCS 관리테이블로 제한적 구현) 수준. 3년 내 8~9단계까지 도달하는 것이 목표이며, 각 단계는 이전 단계의 성공 위에 쌓인다.
