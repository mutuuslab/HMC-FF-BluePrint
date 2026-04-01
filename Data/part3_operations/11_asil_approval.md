# 11장. ASIL 등급별 승인 워크플로우

> **제3편. 운영 모델** | 대상 독자: Safety팀, 규제/컴플라이언스, Governance Board

---

## 11.1 3트랙 승인 프로세스

| Track | 대상 | 기간 | 승인자 수 | 자동화 수준 |
|---|---|---|---|---|
| **QM Track** | 인포테인먼트, 개인화, 비안전 | 1~2주 | 3명 | 카나리→GA 자동 진행 가능 |
| **ASIL A-B Track** | 일부 ADAS 보조, 기능안전 경미 | 3~4주 | 4명 | 안전엔지니어 Go/No-Go |
| **ASIL C-D Track** | AEB, EPS, 제동 | 6~12주 | 6명+ | Safety Board 심의 + 독립 평가 + RXSWIN + 매 단계 Board 승인 (5회+) |

---

## 11.2 ASIL C-D Safety Board 심의 프로세스

1. 개발팀 → Safety Engineer: Flag Spec + Safety Impact Analysis 제출
2. Safety Engineer → 독립 평가자: 독립 안전 평가 의뢰
3. 독립 평가자 → Safety Board: 형식 영향 분석 + 평가 보고서
4. Safety Engineer → Safety Board: Safety Case 초안 + 상호작용 매트릭스
5. **Safety Board 심의 (제1차):** 조합 상호작용 검토, FMEA/FTA 확인
6. 승인 시 → RXSWIN 해당 여부 확인 (R79/R13/R157)
7. RXSWIN 필요 시 → 형식승인 확장 평가 착수
8. **이후 카나리/각 롤아웃 단계마다 Board 승인 반복 (총 5회+)**

---

## 11.3 RACI 매트릭스

| 라이프사이클 단계 | QM | ASIL A-B | ASIL C-D |
|---|---|---|---|
| 플래그 생성 | 개발자(R), PO(A) | 개발자(R), 안전엔지니어(A) | 개발자(R), Safety Board(A) |
| 타겟팅 규칙 | PO(R/A) | PO(R), 안전엔지니어(A) | Safety Board(A), 독립평가자(C) |
| 스테이징 활성화 | QA(R/A) | QA(R), 안전엔지니어(A) | 안전엔지니어(R), Safety Board(A) |
| 프로덕션 카나리 | Eng Lead(R/A) | 안전엔지니어(R/A) | Safety Board(R/A) |
| 단계적 롤아웃 | PO(A), DevOps(R) | 안전엔지니어(A) | Safety Board(A), **매 단계 필수** |
| 킬스위치 트리거 | DevOps/SRE(R/A) | DevOps/SRE(R/A) | **모든 안전 이해관계자(R/A)** |
| 플래그 은퇴 | Release Mgr(R/A) | Release Mgr(R), 안전엔지니어(C) | Safety Board(A) |

---

## 11.4 거버넌스 보드 구조

### Vehicle Feature Governance Board — CSO 주재

| 구성원 | 역할 |
|---|---|
| Safety Engineering Lead | 안전 기능 전반 |
| Cybersecurity Lead | TARA, R155 CSMS |
| Regulatory/Compliance Lead | R156 SUMS, RXSWIN |
| **TPM Lead** | 안전 규정 × Agile 균형, 크로스팀 Release 조율 |
| Product Management Lead | 기능 우선순위, FoD 전략 |
| QA Lead | 테스트 커버리지, Flag Hygiene |
| OTA Operations Lead | 배포 파이프라인, 킬스위치 |
| **비엔지니어링 대표** | 마케팅/고객지원 Release 권한 운영 현황 |

### 산하 소위원회

| 위원회 | 목적 | 주기 |
|---|---|---|
| Safety Flag Review Board | ASIL 등급 플래그 검토, 독립 안전 평가자 포함 | 월간 |
| Feature Launch Committee | 프로그레시브 롤아웃 Go/No-Go | 주간 |
| **Release Enablement Committee** | 비엔지니어링 Release 권한 설계·교육·관리 | 격주 |
