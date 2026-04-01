# 18장. KPI 및 경영효과

> **제5편. 중장기 전략** | 대상 독자: C-Level, CFO, PMO, Value 관리

---

## 18.1 핵심 KPI (Top 8 — 경영층 보고용)

| KPI | 공식 | Owner | Target | 주기 |
|---|---|---|---|---|
| Approval lead time | Median(승인완료 - 요청제출) | Governance Lead | <24h (Standard) / <0.5h (Emergency) | Weekly |
| Dead flag ratio | Dead flags / total flags | Platform Gov | <5% | Monthly |
| P95 evaluation latency | P95(eval_end - eval_start) | Vehicle Lead | SLO by path | Daily |
| Rollout success rate | Successful / total rollouts | Quality Lead | >95% | Per release |
| COTA rollback time | abort_executed - breach_detected | Quality Lead | <5분 | Per incident |
| Kill-switch response | safe_state - kill_request | Safety Lead | <3분 | Per incident |
| Audit retrieval time | pack_ready - request_ts | Compliance | <1 business day | Per request |
| Release lead time reduction | (baseline - current) / baseline | PMO | Pilot 후 정량화 | Quarterly |

---

## 18.2 프로세스 KPI 요약

| 프로세스 | KPI | 목표 |
|---|---|---|
| 카나리→GA 리드타임 | QM | 2~3주 |
| | ASIL A-B | 4~6주 |
| | ASIL C-D | 8~16주 |
| 텔레메트리 커버리지 | 연결 차량 | >95% |
| Flag Hygiene Score | 분기 | >85% |
| 팀당 활성 플래그 | 상한 | <50개 |
| 릴리스 플래그 수명 | GA 후 | 90일 |

---

## 18.3 Executive Value Case (6개 경영효과 레버)

| Value Lever | Business Question | 측정 논리 | 비고 |
|---|---|---|---|
| **VAL-01** Release lead time 단축 | 기능 출시 속도 개선 | (baseline - current) / baseline | Pilot 전 baseline 필수 |
| **VAL-02** Incident cost avoidance | 점진배포로 장애 비용 회피 | prevented blast radius × cost | proxy 기반 시작 |
| **VAL-03** Audit retrieval 자동화 | 감사 증적 시간 단축 | baseline - current retrieval | 고객 설득력 높음 |
| **VAL-04** FoD revenue leakage 방지 | 결제-활성화 불일치 차단 | prevented failed activations | Pilot 후 taxonomy |
| **VAL-05** Recall risk reduction | 위험 기능 조기 차단 | prevented unsafe exposure count | proxy index |
| **VAL-06** Onboarding productivity | 온보딩 시간 단축 | baseline - current onboarding | Self-service 후 |

> **Client delivery rule:**
> - No fabricated numbers — value logic만 먼저 제시
> - Proxy first — Recall, incident cost는 초기 proxy로 설명
> - KPI to value bridge — 모든 KPI는 business decision과 연결

---

## 18.4 외부 증거: Flagsmith Enterprise 설문 (2024.11)

> FF 도입의 정량적 효과에 대해 "우리만의 추정"이 아닌 **외부 실증 데이터**로 보강.

### 리스크 감소

**84%의 엔터프라이즈 고객**이 "릴리스가 덜 위험해졌다"고 응답.

| 리스크 감소 방법 (1순위) | 비율 |
|---|---|
| 기능을 안전하게 롤아웃 | 35% |
| 문제 발생 시 코드 롤백 | 27.5% |
| 다운타임 최소화 | 17.5% |
| 이슈 해결 속도 향상 | 7.5% |
| 앱 신뢰성 개선 | 7.5% |

### 개발 속도

**50%의 고객**이 FF 도입 전 월간 릴리스 → 도입 후 **일간/주간 릴리스**로 전환.

| 릴리스 지연 감소 방법 (1순위) | 비율 |
|---|---|
| 내부 릴리스 프로세스 개선 | 45.5% |
| 크로스팀 협업 용이 | 45.5% |

### 혁신/실험

| 기능 혁신 기여 (1순위) | 비율 |
|---|---|
| 실험 문화 촉진 | **57.14%** |
| 최종 사용자 만족도 향상 | 21.43% |
| 경쟁사 앞서기 | 14.29% |

### 개발팀 체감 영향

| 항목 | 비율 |
|---|---|
| 개발자가 기능 출시에 더 자신감 | 25% |
| 무언가 깨질 걱정 감소 | 25% |
| 팀 간 협업 개선 (개발↔제품/마케팅) | 18.75% |
| 팀 사기·개발자 경험 향상 | 15.63% |
| 창의성·실험 의지 증가 | 9.37% |

> **HMC 적용 시사점:** 자동차 산업은 "데이터 민감 산업"(금융·의료·정부) 이상의 안전 규제를 받으므로, 위 수치가 그대로 적용되지는 않으나, **리스크 감소·릴리스 속도·실험 문화**의 방향성은 동일하게 기대.

---

## 18.5 외부 증거: eBay의 FF 대규모 도입 사례

| 지표 | Before | After |
|---|---|---|
| 플래그 평가 엔진 호출 | — | **일 수십억 회** |
| 플래그 뒤 실험 | 소수 | **연간 2,500+건** |
| 변경 전파 시간 | 15분 | **1분** |
| 평가 지연 | 25ms | **<5ms** |
| 대상 개발자 | 일부 | **수천 명** |
| 사용 API | 25+ 레거시 | **OpenFeature 단일 API** |

### eBay Velocity Program 핵심 교훈 (HMC 적용)

| eBay 접근 | HMC 적용 |
|---|---|
| **CTO+CPO 스폰서십** | 사업부장/CTO 스폰서 확보 필수 |
| **300팀 크로스 조직** | FF 도입 Working Group 구성 |
| **3라운드 파일럿 (3분기)** | Wave 1→1.5→2 (17장) |
| **10% Velocity 예산 확보** | FF 전환에 전담 예산 배정 |
| **Self-serve 마이그레이션 대시보드** | 팀별 전환 진척 가시화 |
| **내부 마케팅 (뉴스레터+에스컬레이션)** | FF Ops Enabler의 내부 교육 캠페인 |
| **OpenFeature facade로 미래 대비** | OpenFeature 표준 채택 (5장) |

> **"Feature flag는 기술 혁신이라기보다 사회적 혁신이다. 진짜 마법은 FF가 조직 규모로 도입될 때 — SW가 만들어지는 방식 자체를 바꿀 때 나타난다."** — Flagsmith eBook
