# 16장. 3-Horizon 실행 로드맵

> **제5편. 중장기 전략** | 대상 독자: C-Level, PMO, 전략기획

---

## 16.1 Quick Wins (2026년 내) — 4개 과제

| 과제 | 핵심 활동 | 4-Plane | KPI/성공기준 | Gate (Entry → Exit) |
|---|---|---|---|---|
| RACI/승인 워크플로우 | 책임 경계 + 승인 프로세스 문서화 | Governance | 승인 리드타임 측정 시작 | 현재 승인 경로 식별 → swimlane 승인 |
| Feature 용어 표준화 | Feature-Flag 매핑 + 카탈로그 초안 | Governance | 용어 불일치 0건 | naming 이슈 목록화 → ID·owner·expiry 합의 |
| 가드레일 지표 정의 | Error budget/SLO/자동 중단 기준 | Quality | 지표 문서화 | rollout KPI 확보 → metric·threshold 문서화 |
| FTTI/MTTR 목표 | Kill-switch SLO + 폴백 시나리오 | Vehicle | 목표치 합의 | feature class 정의 → FTTI/MTTR rule 승인 |

---

## 16.2 Mid-term (2027~2028) — 5개 과제

| 과제 | 핵심 활동 | KPI | Gate |
|---|---|---|---|
| Control Plane PoC | 정책 엔진 + Admin + RBAC | 배포 성공률 >95% | ownership/hosting 선택 → PoC scope 승인 |
| Vehicle SDK + Edge PoC | Runtime Evaluator + 캐시 + 오프라인 | P95 지연 <50ms | target node 선택 → evaluator/cache demo |
| CI/CD + FF 연동 | 카나리/링 배포 + 자동 가드레일 | DORA 측정 시작 | current-state mapped → gate+rollback demo |
| 플랫폼팀 조직 설계 | Enablement + Self-service | 온보딩 리드타임 측정 | scope 정의 → charter+catalog 승인 |
| Safety Rule Engine | Safety Gatekeeper + 4-Eyes | Safety 위반 0건 | feature class fixed → rule engine PoC |

---

## 16.3 Long-term (2029~) — 4개 과제

| 과제 | 핵심 활동 | KPI |
|---|---|---|
| 전사 롤아웃 | Pilot → 차종 확대 → 전사 | Feature 제어 커버리지 |
| FoD/Entitlement 연동 | Permission Flag + 결제 + 감사 | FoD 활성화 성공률 |
| 자동 Clean-up + KPI | 만료 정책 강제, Piranha 등 자동화 | Dead-flag <5% |
| Progressive Feedback Loop | Rollout Simulator + 자동 중단 + SLO | MTTR < 목표치 |

---

## 16.4 마일스톤 타임라인

```
2026 Q2  ─── Quick Wins 착수 (RACI, 용어, 가드레일, FTTI)
2026 Q3  ─── Pilot Wave 1 시작 (Catalog, Personalization)
2026 Q4  ─── Quick Wins 완료, Pilot Day-90 측정
─────────────────────────────────────────
2027 H1  ─── Control Plane PoC, 플랫폼팀 발족
2027 H2  ─── Vehicle SDK PoC, Safety Rule Engine
2028 H1  ─── CI/CD+FF 연동, 비엔지니어링 Self-service
2028 H2  ─── Mid 완료 판정, 전사 확대 Gate
─────────────────────────────────────────
2029 H1  ─── 전사 롤아웃 시작, FoD 연동
2029 H2  ─── 자동 Cleanup, Progressive Loop
2030     ─── L4 Optimized 목표 달성
```
