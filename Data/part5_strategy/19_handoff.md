# 19장. 선행 의사결정 및 인수인계

> **제5편. 중장기 전략** | 대상 독자: C-Level, PMO, 각 Lead

---

## 19.1 후속 단계 착수 전 결정해야 할 11개 항목

| # | 결정 항목 | 핵심 질문 | Owner | 시급성 | First Workshop |
|---|---|---|---|---|---|
| 1 | Hybrid Option B 확정 | 공식 타깃 아키텍처로 고정할지 | Solution Lead | 상 | Architecture decision |
| 2 | Pilot shortlist 확정 | Wave 1 pilot 2~3개 확정 | PMO | 상 | Pilot scoping |
| 3 | HMC system landscape 승인 | 단일 current-state map 승인 | Baseline Lead | 상 | Current-state walkthrough |
| 4 | Feature taxonomy 채택 | Canonical object model 결정 | Governance Lead | 상 | Terminology workshop |
| 5 | 승인 워크플로우 분리 | FF-specific approval path | Governance Lead | 상 | Governance design |
| 6 | Entitlement/FoD object model | Entitlement 중심 FoD 설계 | Commerce Lead | 중 | FoD architecture |
| 7 | Runtime evaluator PoC 범위 | 어느 layer(HPC/ZCU/ECU)에서 | Vehicle Lead | 상 | Runtime PoC |
| 8 | Safety control path 분리 | Safety FF를 일반 FF와 분리할지 | Safety Lead | 상 | Safety requirements |
| 9 | KPI baseline 측정 시작 | Pilot 전 어떤 KPI를 먼저 | PMO + Value | 상 | KPI baseline |
| 10 | Source/evidence register | Client deck 직접 인용 범위 | PMO | 중 | Evidence review |
| 11 | Kickoff deck skeleton | 보고용 deck 이어쓰기 | Storyline Lead | 중 | Kickoff storyline |

---

## 19.2 5대 핵심 아키텍처 결정 (Cross-reference)

Research Compendium에서 도출된 5대 결정. 각각이 마스터 플랜의 어디에 상세 설계되어 있는지 연결.

| # | 결정 | 상세 위치 | 상태 |
|---|---|---|---|
| 1 | **OpenFeature를 표준 추상화 레이어로 채택** — 벤더 lock-in 방지 + OEM/Tier-1 상호운용 | 5장 §5.3 | 권고 확정 |
| 2 | **이중경로 플래그 전달** — Safety(UCM 파이프라인) + QM(경량 스트리밍) | 9장 §9.1 | 설계 완료 |
| 3 | **4-Tier 규제 분류 엔진** — R156/R155/ISO 26262 영향별 자동 태깅 + 승인 라우팅 | 8장 §8.6 | 설계 완료 |
| 4 | **Ring 기반 Progressive Delivery** — Consistent Hashing(VIN) + MQTT Kill Switch(<30초) + ML Anomaly Detection + Auto Circuit-breaker | 9장 §9.4~9.8 | 설계 완료 |
| 5 | **거버넌스 Twin** — VFGB + SFRB, Time-bomb CI, 분기 Cleanup Sprint, Flag 인벤토리 상한, DORA 지표 | 8장 §8.5 + 10장 | 설계 완료 |

> **전략적 기회:** 어떤 인증기관도 FF 특화 거버넌스 프레임워크를 발표하지 않음. TÜV SÜD 또는 UL Solutions와 공동 개발 시 **HMG가 업계 최초 참조 아키텍처**로 자리매김. 한국 2025.8 시행 일정이 urgency를 부여.

---

## 19.3 Open Issues / 리스크 레지스터

| Issue | 영향 | 대응 방안 | Owner |
|---|---|---|---|
| 일부 인터페이스 owner 미확정 | 시스템 연동 지연 | 착수 워크샵에서 확정 | Baseline Lead |
| 협력사 SDK 범위 미정 | Tier-1 온보딩 지연 | Pilot 범위에서 1~2 supplier 선정 | Platform Lead |
| HW/memory 제약 불명확 | Vehicle runtime PoC 범위 | Target node 사전 조사 | Vehicle Lead |
| 규제 일정 변동 (R156 등) | RXSWIN 타이밍 | Regulatory watch + buffer | Compliance Lead |
| 비엔지니어링 Release 권한 미설계 | 조직 변혁 최대 Gap | Release Enablement Committee 신설 | TPM + FF Ops Enabler |
| **한국 사이버보안 2025.8 시행** | **신규 차종 미준수 시 형식승인 불가** | **140항목 증빙 생성 기능 day one 내장** | **Compliance Lead** |
| **TÜV SÜD FF 거버넌스 표준 부재** | **글로벌 선점 기회** | **공동 개발 파트너십 제안** | **Governance Lead** |
| Onsite quote 공개범위 | PPT 제작 제약 | Evidence review 워크샵 | PMO |
