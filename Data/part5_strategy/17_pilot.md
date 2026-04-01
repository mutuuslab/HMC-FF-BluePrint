# 17장. Pilot 우선순위

> **제5편. 중장기 전략** | 대상 독자: PMO, 사업부장, Pilot 스폰서

---

## 17.1 Pilot 후보 7건 가중 평가

**평가 기준 (가중치):**
- Business value: 0.25
- Measurability: 0.15
- Safety / risk manageability: 0.20
- Integration feasibility: 0.15
- 재사용성: 0.15
- Sponsor readiness: 0.10

| Pilot | 점수 | Wave | 첫 번째 증명할 KPI |
|---|---|---|---|
| **Feature Catalog + cleanup automation** | **4.65** | **Wave 1** | Trace coverage / dead flag ratio |
| **Personalization flag + profile gating** | **4.15** | **Wave 1** | Activation success / latency |
| Regional compliance gating | 3.70 | Wave 1.5 | Audit retrieval time |
| Supplier SDK conformance gate | 3.65 | Wave 1.5 | SDK conformance pass rate |
| FoD entitlement-to-activation | 3.80 | Wave 2 | Entitlement sync / activation success |
| OTA staged rollout with guardrail | 3.65 | Wave 2 | Rollout success / abort response |
| Kill-switch operational flag class | 3.55 | Wave 2 | FTTI / safe-state success |

---

## 17.2 Wave 해석

| Wave | 의미 | 착수 시기 |
|---|---|---|
| **Wave 1** | 조직 저항 낮고 측정 쉬워 즉시 착수 | 2026 Q3 |
| **Wave 1.5** | 의미는 크지만 추가 정렬 필요 | 2026 Q4 ~ 2027 Q1 |
| **Wave 2** | 효익 크지만 integration/safety burden | 2027 H1~ |

---

## 17.3 Pilot 측정 체계

| Pilot KPI | Day-0 baseline action | Day-90 success signal | Decision meaning |
|---|---|---|---|
| Approval lead time | 현재 CAB cycle 측정 | 주 1회 median 산출 | 지연 구간 파악 |
| Dead flag ratio | catalog/owner/expiry 시범 계산 | pilot 영역 month-end 산출 | lifecycle discipline 효과 |
| Policy propagation latency | runtime/edge PoC 배포→적용 시간 | P95 threshold 정의 | vehicle suitability |
| Entitlement sync success | FoD flow subset 성공/실패 taxonomy | activation E2E 추적 | D6 value proof |
| Audit retrieval time | 증적 패키지 조립시간 pilot 기록 | 1 request당 elapsed time | compliance automation 효과 |
