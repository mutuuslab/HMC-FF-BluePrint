# 1장. Executive Summary

> **제1편. 경영 요약** | 대상 독자: C-Level, 사업부장, 의사결정자

---

## 1.1 한 장 권고안

### 왜 지금 해야 하는가 (3문장)

- 경쟁사(Tesla·Mercedes·BMW·NIO)는 이미 조직 개편 + FF 플랫폼 투자를 선행한 상태
- 현재 HMC의 CCS 관리테이블·All-or-nothing 배포·R&R gray zone으로는 OTA/FoD/프로그레시브 딜리버리가 구조적으로 작동하지 않음
- UNECE R155/R156 규제 강화와 FoD 확대가 동시에 진행되면 감사 대응·안전 통제·수익 누수 리스크가 가중됨

### 권고안

**Option B: Hybrid self-hosted + HMC-owned vehicle/runtime layer**
- 자체 거버넌스/제어권 확보 + self-hosted foundation 활용
- 가중 평가 점수: **3.95** (Option A: 2.83, Option C: 3.79)
- Buy vs Build 원칙: 공통 control-plane UX/RBAC/audit는 buy, vehicle runtime/safety gate/entitlement bridge는 build

### 3-Horizon 실행 요약

| Horizon | 기간 | 핵심 과제 |
|---|---|---|
| Quick | 2026년 내 | RACI/승인 워크플로우, Feature 용어 표준화, 가드레일 지표, FTTI/MTTR 목표 |
| Mid | 2027~2028 | Control Plane PoC, Vehicle SDK+Edge PoC, CI/CD+FF 연동, 플랫폼팀 설계, Safety Rule Engine |
| Long | 2029~ | 전사 롤아웃, FoD/Entitlement 연동, 자동 Clean-up, Progressive Feedback Loop |

---

## 1.2 핵심 KPI 카드 (Top 5)

| KPI | 목표 | 의미 |
|---|---|---|
| 승인 리드타임 | Standard <24h / Emergency <0.5h | 배포 병목 해소 |
| 롤백 응답시간 (COTA) | <5분 | 전 차량 원복 가능 |
| Dead flag 비율 | <5% | 기술부채 통제 |
| FoD 활성화 성공률 | High stable range | 수익 누수 방지 |
| 릴리스 리드타임 단축 | Pilot 후 정량화 | Speed-to-market |

---

## 1.3 소요 조직 / 투자 규모 개요

- 신규 역할 7종, 예상 인원 ~25~40명 (기존 전환 30~40명 + 신규 채용 18~35명)
- 첫 Pilot 2건: Feature Catalog + Cleanup (4.65점), Personalization Flag (4.15점)
- Pilot 목표 시점: 2026 H2

---

## 1.4 문서 읽는 순서 안내

| 목적 | 추천 경로 | 소요 시간 |
|---|---|---|
| 10분 임원 요약 | 1장 → 6장(옵션) → 14장(로드맵) → 16장(KPI) | ~10분 |
| 실무 설계 경로 | 3장 → 4장 → 5장 → 7장~11장 → 12장 → 14장 | ~2시간 |
| 조직 변혁 경로 | 2장 → 7장(방법론) → 12장(조직) → 14장 → 16장 | ~1시간 |
| 증빙/근거 경로 | 3장 → 부록 A~D → 16장 | ~1시간 |
