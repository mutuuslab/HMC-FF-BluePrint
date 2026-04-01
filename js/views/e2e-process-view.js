const EDF_STEPS=[
{id:1,title:'Flag Management',short:'Flag Mgmt',loc:'Cloud',
 planes:['control','governance'],
 tools:['FF Admin Console','PostgreSQL','Vault HSM'],
 dataIn:['Customer Requirement','Product Backlog','Feature Brief'],
 dataOut:['Flag Spec YAML','Feature ID','ASIL Classification','Bill of Features'],
 protocol:'REST API',timing:'On-demand',
 desc:'Flag Spec(키, 변형, 기본값, ASIL) 생성 및 Feature Catalog 등록. binding_time(Selected/Deselected/Deferred) 결정.',
 pd:{control:'Feature Catalog 등록, binding_time(selected/deselected/deferred) 결정',governance:'ASIL 분류 → 4-Tier 규제 등급 배정, Owner·TTL·Cleanup plan 지정'},
 exc:[],
 subProcess:[
   '<b>Flag Spec 생성</b> — ALM(Codebeamer)에 키, 변형, 기본값, owner, TTL, KPI 등록',
   '<b>ASIL/Criticality 분류</b> — Safety Engineer가 ASIL QM/A/B/C/D 및 Criticality Tier(T0~T4) 판정',
   '<b>Feature Interaction Matrix 갱신</b> — 기존 ASIL D 플래그와 충돌 여부 분석 (7% direct, 33% code interaction)',
   '<b>3-State 결정</b> — Selected(컴파일 고정) / Deselected(제외) / Deferred(FF 대상) 분류',
   '<b>Architecture 매핑</b> — Toggle Point 배치 설계, API contract 정의, Dual-channel 필요 여부 결정',
   '<b>Safety Case 작성</b> — ASIL C/D: FMEA/FTA 분석 + Safety Case 문서화',
   '<b>Control Plane 서비스 등록</b> — Flag Management Service에 메타데이터 입력 완료'
 ],
 actors:[
   {name:'Product Owner',primary:true,role:'Feature 요건 정의, KPI 설정, 비즈니스 기준 승인'},
   {name:'Development Lead',primary:false,role:'Flag Spec 작성, API contract 설계'},
   {name:'Safety Engineer',primary:true,role:'ASIL 분류, FMEA/FTA 검토 (ASIL A+)'},
   {name:'Safety Board',primary:false,role:'ASIL C/D 공식 승인 (Board 심의)'},
   {name:'Independent Assessor',primary:false,role:'ASIL C/D 독립 검증'}
 ],
 gates:[
   'Flag Spec 메타데이터(키, 변형, 기본값, owner, TTL) 완전성 검증 통과',
   'ASIL 분류 완료 및 해당 승인 레벨 sign-off',
   'Feature Interaction Matrix 충돌 없음 확인 (ASIL D 간섭 시 No-Go)',
   'Safety Case(ASIL C/D) 또는 Impact Summary(ASIL A/B) 승인'
 ],
 decisions:[
   {q:'ASIL 등급은?',go:'QM → PO 승인만으로 진행',nogo:'ASIL C/D → Safety Board + Independent Assessor 필수'},
   {q:'기존 Safety 플래그와 충돌?',go:'충돌 없음 → 진행',nogo:'충돌 감지 → FFI 분석 완료까지 대기'},
   {q:'R156/R155 규제 해당?',go:'비해당 → 표준 경로',nogo:'해당 → Enhanced Gate + RXSWIN 경로 활성화'}
 ],
 asil:{
   qm:{time:'< 2시간',approver:'PO 승인',note:'자동 메타데이터 검증'},
   ab:{time:'1~3일',approver:'Safety Engineer sign-off',note:'Safety Impact Summary 포함'},
   cd:{time:'1~2주',approver:'Safety Board + Independent Assessor',note:'Full Safety Case + FMEA/FTA + Board 심의'}
 }
},
{id:2,title:'ALM/PLM Sync',short:'ALM Sync',loc:'Cloud',
 planes:['control','governance'],
 tools:['Codebeamer','Jira','Confluence'],
 dataIn:['Flag Spec YAML','SYS/SW Requirements'],
 dataOut:['Traceability Record','Test Matrix','ASPICE Mapping'],
 protocol:'REST (양방향)',timing:'On change',
 desc:'요구사항 ↔ Flag Spec 양방향 추적성 확보. ASPICE SYS.2~SWE.6 프로세스 매핑.',
 pd:{control:'Policy ID + Targeting rule schema 부여',governance:'ASPICE 4.0 양방향 추적성 매핑, RXSWIN 사전 점검'},
 exc:[7],
 subProcess:[
   '<b>양방향 동기화</b> — Flag Spec ↔ ALM(Codebeamer) 자동 동기화, Feature ID 관통 식별자 확보',
   '<b>ASPICE 추적성 확립</b> — SYS.2(시스템 요구) → SWE.1(SW 요구) → SWE.2(아키텍처) → SWE.3(상세설계) → SWE.4(단위검증)',
   '<b>R156/R155 분류 등록</b> — PLM에 규제 관련성 기록, RXSWIN 해당 여부 판정',
   '<b>협력사 인터페이스 통보</b> — Tier-1 컴포넌트 관련 시 Supplier Quality Lead에 IF Spec 전달',
   '<b>Change Request 발행</b> — CR 로그 생성, 감사 추적 시작',
   '<b>배포 대상 매트릭스 문서화</b> — 대상 ECU, HW 리비전, SW 버전 범위 확정'
 ],
 actors:[
   {name:'ASPICE Process Owner',primary:true,role:'추적성 검증, 프로세스 준수 확인'},
   {name:'Architecture Team',primary:true,role:'컴포넌트 의존성 매핑'},
   {name:'ALM Administrator',primary:false,role:'동기화 설정 및 메타데이터 관리'},
   {name:'Supplier Quality Lead',primary:false,role:'협력사 인터페이스 검증 (해당 시)'}
 ],
 gates:[
   'ASPICE 추적성 링크 100% 확립 (Req → Spec → Code 빈 참조 없음)',
   'R156/R155 분류 완료 및 PLM 기록 완료',
   'Configuration Catalog 누락 참조 0건',
   'CR 발행 및 추적 시작'
 ],
 decisions:[
   {q:'Cross-team Feature인가?',go:'단일팀 → 기본 추적성',nogo:'Cross-team → 확장 범위 추적성 + 추가 리뷰'},
   {q:'R156 RXSWIN 해당?',go:'비해당 → 표준 경로',nogo:'해당 → 필수 RXSWIN 업데이트 경로'},
   {q:'협력사 연동 필요?',go:'불필요 → 즉시 진행',nogo:'필요 → 협력사 검증 일정 추가 (1~3일)'}
 ],
 asil:{
   qm:{time:'< 1일',approver:'자동 동기화 + 검증',note:'기본 ALM 참조'},
   ab:{time:'1~2일',approver:'ASPICE Process Owner',note:'Full ASPICE 추적성 필수'},
   cd:{time:'2~5일',approver:'독립 감사 + FFI 검증',note:'FFI 증빙 + 이중 채널 아키텍처 증명'}
 }
},
{id:3,title:'Control Plane Config',short:'CP Config',loc:'Cloud',
 planes:['control','governance'],
 tools:['FF Admin Console','Redis','Vault HSM'],
 dataIn:['Flag Spec YAML','Approval Record'],
 dataOut:['Targeting Rules','Approval Workflow','Signing Keys'],
 protocol:'REST + Vault',timing:'On-deploy',
 desc:'타겟팅 규칙(VIN/모델/지역/HW/SW), 승인 워크플로우, 서명 키 설정. ASIL 3-트랙 분기 승인.',
 pd:{control:'타겟팅 규칙 생성, 환경별(Dev/Staging/Prod) 구성',governance:'ASIL 3-트랙 승인: QM(3명) / ASIL A-B(4명) / ASIL C-D(6+명)'},
 exc:[7],
 subProcess:[
   '<b>Flag 생성</b> — Flag Management Service에 CRUD, Fallback safe default 설정',
   '<b>타겟팅 규칙 정의</b> — VIN, 모델, 지역, HW 리비전, SW 버전, FoD 연동 조건 설정',
   '<b>Consistent Hashing 검증</b> — SHA256(featureKey + VIN) mod 100 균등 분포 확인 (1000 VIN 샘플)',
   '<b>Ring 할당 설계</b> — Canary 0.1% → Ring1 1% → Ring2 5% → Ring3 25% → Ring4 50% → GA 100%',
   '<b>승인 워크플로우 활성화</b> — ASIL 등급별 게이트 삽입 (QM: 3명, ASIL A-B: 4명, ASIL C-D: 6+명)',
   '<b>Kill-switch 인프라 설정</b> — MQTT topic 배선, TTL 설정, Retained Message 구성',
   '<b>환경별 구성 분리</b> — Dev / Staging / Production 별도 타겟팅 프로파일'
 ],
 actors:[
   {name:'Platform Team',primary:true,role:'타겟팅 규칙 엔진 설정, Consistent Hashing 검증'},
   {name:'Release Manager',primary:true,role:'Ring 할당 계획, 배포 스케줄'},
   {name:'Safety Engineer',primary:false,role:'Fallback safety default 검증 (ASIL C/D)'},
   {name:'Safety Board',primary:false,role:'ASIL C/D 타겟팅 로직 공식 승인'},
   {name:'OTA Operations Lead',primary:false,role:'Kill-switch 인프라 준비 확인'}
 ],
 gates:[
   '타겟팅 규칙 검증 통과 (VIN 분포 균등, 규칙 중첩 없음)',
   'Fallback safe default 값 설정 완료 (NVRAM persistence > 90일)',
   'Uptane 매니페스트 서명 유효',
   'MQTT Broker 온라인 + CDN health check 통과',
   '승인 워크플로우 전 단계 sign-off 완료'
 ],
 decisions:[
   {q:'FoD 연동 있는가?',go:'없음 → 표준 타겟팅',nogo:'있음 → FoD 과금 시스템 연동 확인'},
   {q:'지역별 차별화 필요?',go:'단일 → 글로벌 규칙',nogo:'다지역 → Region gate 추가 + 규제 컴플라이언스'},
   {q:'Consistent Hashing 분포 정상?',go:'균등 (±1.5%) → 진행',nogo:'편향 → 해시 알고리즘 조정 후 재검증'}
 ],
 asil:{
   qm:{time:'< 4시간',approver:'PO + 자동 검증',note:'자동 타겟팅 검증, 즉시 진행'},
   ab:{time:'1~2일',approver:'Safety Engineer sign-off',note:'Fallback default 검증 포함'},
   cd:{time:'3~7일',approver:'Safety Board + 독립 검증',note:'오프라인 시나리오 증명 + Board 승인 per Ring'}
 }
},
{id:4,title:'Uptane Signing',short:'Uptane Sign',loc:'Cloud',
 planes:['control','governance'],
 tools:['Uptane Director','Image Repo','HSM'],
 dataIn:['Flag Manifest (unsigned)','Signing Keys'],
 dataOut:['Signed COTA Package','Director Metadata','Image Metadata'],
 protocol:'Uptane (ECDSA-P256)',timing:'Per-package',
 desc:'Uptane 이중 서명: Image Repository + Director Repository. COTA 매니페스트에 activation conditions 포함.',
 pd:{control:'Image Repo(전체 타겟) + Director Repo(VIN별 타겟) 이중 서명',governance:'서명 키 교체 정책, 만료 관리'},
 exc:[],
 subProcess:[
   '<b>COTA 패키지 조립</b> — FF 구성 JSON + 메타데이터 + 매니페스트 통합',
   '<b>HSM 키 조회</b> — Vault/HSM에서 서명 키 retrieve (ECDSA-P256)',
   '<b>이중 서명 생성</b> — Image Repo(무결성 SHA256) + Director Repo(타겟팅 VIN 배정)',
   '<b>만료 타임스탬프 삽입</b> — QM: 90일, ASIL C/D: 30~60일 (Safety flag 단축 TTL)',
   '<b>패키지 버전 관리</b> — Semantic Versioning(major.minor.patch)',
   '<b>서명 검증 테스트</b> — Mock vehicle acceptance test 실행',
   '<b>CDN + MQTT 게시</b> — 서명된 패키지를 CDN 배포 + MQTT Retained Message 설정'
 ],
 actors:[
   {name:'Release Manager',primary:true,role:'패키지 조립 + 버전 관리'},
   {name:'OTA Operations',primary:true,role:'서명 실행 + CDN 게시'},
   {name:'Cybersecurity Lead',primary:false,role:'키 교체 관리, HSM 준수 확인'},
   {name:'Platform Team',primary:false,role:'Delta 압축 알고리즘 검증'}
 ],
 gates:[
   'COTA 패키지 크기 < 500KB (안전 임계치)',
   'Image Repo + Director Repo 서명 모두 유효',
   '만료 타임스탬프 > 현재시각 + TTL',
   'CDN 가용성 > 99% (대상 리전)',
   '서명 검증 테스트 통과 (mock vehicle acceptance)'
 ],
 decisions:[
   {q:'Delta 압축 적용 가능?',go:'구성 변경만 → 불필요 (원본 < 500KB)',nogo:'SDK 포함 → Delta 압축 적용 (최대 95% 축소)'},
   {q:'만료 정책?',go:'QM → 90일 표준 TTL',nogo:'ASIL C/D → 30~60일 단축 TTL (Safety flag 주기적 갱신)'},
   {q:'다중 리전 배포?',go:'단일 → 통합 매니페스트',nogo:'다중 → 리전별 별도 Director Metadata'}
 ],
 asil:{
   qm:{time:'< 30분',approver:'자동 서명 + 검증',note:'표준 이중 서명, 90일 TTL'},
   ab:{time:'< 1시간',approver:'Safety Engineer 확인',note:'서명 검증 로그 포함'},
   cd:{time:'1~2시간',approver:'감사 검증 + Board sign-off',note:'단축 TTL(30~60일) + 시퀀스 넘버링 + 재전송 공격 방어'}
 }
},
{id:5,title:'Distribution',short:'Distribution',loc:'Cloud → Edge',
 planes:['control','vehicle'],
 tools:['CDN','MQTT Broker','Regional Edge'],
 dataIn:['Signed COTA Package','Targeting Rules'],
 dataOut:['Flag Manifest (distributed)','MQTT Kill-switch Channel'],
 protocol:'SSE + MQTT',timing:'<30s push',
 desc:'Regional Edge(Korea/NA/EU/CN)로 배포. Push(SSE/MQTT) + Pull(CDN) 이중 경로. MQTT kill-switch 채널 배선.',
 pd:{control:'Regional Edge 캐시 업데이트, SSE push 트리거',vehicle:'MQTT QoS 1 구독, fleet/{vin}/flags/kill 채널'},
 exc:[],
 subProcess:[
   '<b>MQTT Push 개시</b> — QoS 1(at-least-once), topic: fleet/{vin}/flags/config',
   '<b>CDN Regional Push</b> — Korea/NA/EU/CN Edge 노드로 패키지 배포',
   '<b>Daisy-chain 활성화</b> — Master Cloud → Regional Edge → Vehicle Edge Proxy(HPVC)',
   '<b>Delta 해제</b> — 압축된 경우 Edge에서 delta decompression',
   '<b>Fallback Polling 설정</b> — Push 실패 시 30초~5분 간격 polling 자동 전환',
   '<b>오프라인 Bootstrap</b> — NVRAM JSON Snapshot 생성 (다음 부팅 시 적용)',
   '<b>배포 확인 로그</b> — 수신 차량/미수신 차량 리스트 기록'
 ],
 actors:[
   {name:'OTA Operations Lead',primary:true,role:'MQTT/CDN 오케스트레이션, 배포 모니터링'},
   {name:'Platform Team (CDN)',primary:true,role:'Regional Edge 노드 모니터링'},
   {name:'SRE',primary:false,role:'Push 배포 Health 모니터링'},
   {name:'Safety Engineer',primary:false,role:'오프라인 fallback snapshot 검증'}
 ],
 gates:[
   'MQTT 배포 확인 ≥ 95% (대상 fleet 30초 이내)',
   'CDN 가용성 ≥ 99.9%',
   '차량 수신 텔레메트리 > 90% (1시간 이내)',
   '오프라인 fallback snapshot CRC 검증 통과'
 ],
 decisions:[
   {q:'온라인 fleet 비율?',go:'> 90% → Push 우선 전략',nogo:'< 90% → CDN Pull 병행 강화'},
   {q:'Push 실패 감지?',go:'성공 → 표준 진행',nogo:'실패 → Exponential backoff polling 모드 전환'},
   {q:'리전 용량 충분?',go:'충분 → 병렬 배포',nogo:'> 1M 동시 접속 → 순차 배포 + backoff'}
 ],
 asil:{
   qm:{time:'30초 ~ 5분',approver:'자동 배포',note:'MQTT QoS 1 + CDN fallback'},
   ab:{time:'30초 ~ 3분',approver:'강화 확인 로그',note:'Regional Edge 이중화 필수'},
   cd:{time:'< 30초 (온라인)',approver:'이중 채널 병렬 배포',note:'Push+Pull 병행 5분 + 오프라인은 다음 접속 시. Safety flag TTL=Never expire'}
 }
},
{id:6,title:'Vehicle Receive',short:'Vehicle Rx',loc:'Vehicle',
 planes:['vehicle','governance'],
 tools:['TCU','HPVC','UCM'],
 dataIn:['Signed COTA Package','Director Metadata'],
 dataOut:['Validated Config','NVRAM Cache Update','Vehicle Version Manifest'],
 protocol:'HTTPS + Uptane',timing:'Per-COTA',
 desc:'TCU가 Uptane 검증 후 HPVC로 전달. Safety Path(UCM) vs QM Path(Streaming) 이중 경로. NVRAM 캐시 갱신.',
 pd:{vehicle:'TCU Uptane 검증 → HPVC 다운로드 → Safety/QM 경로 분기',governance:'SUMS 준수 확인, activation conditions 체크(주차/배터리/동의/시간)'},
 exc:[1,4],
 subProcess:[
   '<b>COTA 패키지 수신</b> — TCU가 MQTT/CDN으로부터 패키지 다운로드',
   '<b>Uptane 이중 서명 검증</b> — Image Repo(무결성) + Director Repo(타겟팅) 서명 확인',
   '<b>만료 타임스탬프 검증</b> — 차량 시각 ≤ 만료시각 확인',
   '<b>ECU 호환성 점검</b> — min_firmware 충족 여부, SDK 의존성 확인',
   '<b>Activation Conditions 평가</b> — vehicle_state(주차), battery_soc(≥40%), user_consent, time_window(02:00~05:00)',
   '<b>CRC + 무결성 해시 검증</b> — 패키지 손상 여부 확인',
   '<b>NVRAM/Cache 저장</b> — Fail-safe L2 계층에 validated config 저장',
   '<b>수신 텔레메트리 보고</b> — "Config received, validated, stored" 상태 전송'
 ],
 actors:[
   {name:'HPVC Firmware Team',primary:true,role:'Uptane 검증 로직 구현'},
   {name:'Safety Engineer',primary:false,role:'Activation conditions 안전성 평가'},
   {name:'Vehicle Telemetry System',primary:false,role:'검증 결과 보고'}
 ],
 gates:[
   'Image + Director 서명 모두 유효 (차량 내 공개키 기준)',
   '만료 타임스탬프 미경과',
   'ECU 펌웨어 ≥ min_firmware, SDK 의존성 충족',
   'Activation conditions 전체 충족 (OR 해당 배포에 bypass 승인)',
   'CRC 해시 일치',
   'NVRAM/Cache 저장 공간 확보'
 ],
 decisions:[
   {q:'서명 검증 실패?',go:'성공 → 적용 진행',nogo:'실패 → Critical Error. 적용 거부, last-known-good 유지'},
   {q:'Activation 조건 미충족?',go:'충족 → 즉시 적용',nogo:'미충족(주행 중 등) → 다음 조건 충족 시 재시도'},
   {q:'Safety Path vs QM Path?',go:'QM flag → Streaming(QM Path, 빠름)',nogo:'ASIL flag → UCM Pipeline(Safety Path, 느리지만 안전)'}
 ],
 asil:{
   qm:{time:'< 1초',approver:'자동 검증',note:'표준 Uptane 검증, 조건 충족 시 즉시 적용'},
   ab:{time:'< 2초',approver:'강화 검증',note:'Plausibility check (이전 대비 >20% 변경 시 경고)'},
   cd:{time:'< 5초',approver:'이중 채널 검증',note:'Dual-channel(Ch.A+Ch.B 독립 검증) + Watchdog(5초 초과 시 safe default) + Latch-at-Init'}
 }
},
{id:7,title:'Local Evaluation',short:'Local Eval',loc:'Vehicle',
 planes:['vehicle','quality'],
 tools:['FF SDK (OpenFeature)','Evaluation Engine','ara::per'],
 dataIn:['Validated Config','Context Schema (VIN, model, HW, region)'],
 dataOut:['Flag Value (bool/multivariate)','Decision Log','Exposure Event'],
 protocol:'In-process SDK',timing:'Per-call <100ms',
 desc:'SDK가 로컬에서 컨텍스트 기반 평가. effective_decision = variant && auth && safe_mode && flag_rule. Latch-at-Init 패턴.',
 pd:{vehicle:'OpenFeature SDK 평가, 4-level Fail-safe(서비스→캐시→NVRAM→하드코딩)',quality:'Decision Log 기록, Exposure Event 생성'},
 exc:[2,5,8],
 subProcess:[
   '<b>SDK 초기화</b> — OpenFeature Provider 선택 (OEM backend vs fallback)',
   '<b>평가 컨텍스트 구성</b> — VIN, HW version, ECU type, region, ASIL level, fleet segment',
   '<b>타겟팅 규칙 로드</b> — 로컬 캐시에서 전체 규칙셋 로드',
   '<b>Consistent Hashing 평가</b> — SHA256(VIN + featureKey) → bucket 배정 → 롤아웃 % 결정',
   '<b>Rule Engine 실행</b> — Top-down First-match 전략: 규칙 매칭 → 변형 선택 → 기본값 fallback',
   '<b>TTL/Staleness 체크</b> — Safety ASIL C/D: Never expire | QM: 7~30일 | Comfort: 24~72시간',
   '<b>Fail-safe 4-Tier 결정</b> — L1 서비스 응답 → L2 캐시(staleness 내) → L3 NVRAM → L4 하드코딩',
   '<b>OpenFeature Hook 실행</b> — Before(안전 제약), After(텔레메트리), Error(fallback 로깅)',
   '<b>Decision Log + Exposure Event 생성</b> — flag key, variant, timestamp, context 기록'
 ],
 actors:[
   {name:'SDK Development Team',primary:true,role:'Provider 구현, Hook 로직'},
   {name:'Safety Engineer',primary:true,role:'Fail-safe L3/L4 기본값 선정 (ASIL C/D)'},
   {name:'Platform Team',primary:false,role:'TTL 정책 정의, 규칙 엔진 유지보수'}
 ],
 gates:[
   '평가 컨텍스트 완전성 (VIN, HW, region 확보)',
   '타겟팅 규칙 CRC 일치 (변조 없음)',
   'Consistent Hashing 결정적 동작 확인 (동일 VIN = 동일 결과)',
   'Fail-safe 계층 최소 1개 이상 가용',
   'Decision Log 버퍼 잔여 용량 확인 (최소 1000건)'
 ],
 decisions:[
   {q:'타겟팅 규칙 매칭?',go:'매칭 → 규칙에 따라 적용',nogo:'미매칭 → Default allocation 적용'},
   {q:'Flag staleness?',go:'TTL 이내 → 현재 캐시 사용',nogo:'TTL 초과 → NVRAM default 또는 safe default'},
   {q:'Hook 실행 오류?',go:'정상 → 진행',nogo:'Critical → 에러 로깅, fail-safe 적용 후 계속'}
 ],
 asil:{
   qm:{time:'< 100μs',approver:'자동 평가',note:'단일 채널, cache/NVRAM fallback'},
   ab:{time:'< 500μs',approver:'강화 로깅',note:'Plausibility check (이전 대비 >20% 변경 시 경고)'},
   cd:{time:'< 5ms',approver:'이중 채널 + Voter',note:'Dual-channel 독립 평가 + Watchdog(<100ms) + Latch-at-Init(부팅 시 1회 고정)'}
 }
},
{id:8,title:'ECU Distribution',short:'ECU Dist',loc:'Vehicle → ECU',
 planes:['vehicle'],
 tools:['SOME/IP','ara::com','D-PDU API (Classic)'],
 dataIn:['Flag Value','ECU Context'],
 dataOut:['ECU-applied Flag State','Cross-ECU Sync Result'],
 protocol:'SOME/IP, ara::per',timing:'<100ms',
 desc:'HPVC → Zone Controller → ECU로 플래그 값 전파. Classic AUTOSAR는 Flashing Adapter(ara::com→D-PDU API) 브릿지.',
 pd:{vehicle:'SOME/IP로 Adaptive ECU 전달, D-PDU로 Classic ECU 브릿지, Cross-ECU 일관성 보장'},
 exc:[6],
 subProcess:[
   '<b>전파 경로 선택</b> — Safety Path(UCM SoftwareCluster) vs QM Path(ara::per Streaming)',
   '<b>메시지 패키징</b> — Flag key + 선택된 variant + timestamp + TTL (+ Safety 서명)',
   '<b>네트워크 전송</b> — Ethernet/SOME/IP(게이트웨이) / CAN·CAN-FD(브레이크·조향·ADAS) / FlexRay(결정적 전달)',
   '<b>Classic AUTOSAR 브릿지</b> — Flashing Adapter: ara::com → D-PDU API (ISO 22900-2)',
   '<b>ECU 수신 검증</b> — 서명 확인(Safety), 값 범위 점검(plausibility), TTL 내 수신 확인',
   '<b>ECU 메모리 저장</b> — RAM(세션 중), NVRAM(영구 저장), Flash(ASIL D 불변 기본값)',
   '<b>ECU 피드백</b> — HPVC에 "Flag received, applied, current state: X" 보고'
 ],
 actors:[
   {name:'Vehicle Architecture Team',primary:true,role:'이중 경로 프로토콜 설계'},
   {name:'ECU Firmware Teams',primary:true,role:'수신측 구현 (Infotainment, ADAS, Powertrain, BMS)'},
   {name:'OTA Operations',primary:false,role:'메시지 라우팅 + 전송 모니터링'},
   {name:'Safety Engineer',primary:false,role:'Safety Path(UCM) 감독 (ASIL C/D)'}
 ],
 gates:[
   'HPVC → ECU 네트워크 reachability 확인',
   'ECU 펌웨어 버전이 flag 메시지 포맷과 호환',
   '이전 flag 값 정상 저장 확인 (메모리 corruption 없음)',
   '전송 버퍼 혼잡 없음 (queue latency < 1초)'
 ],
 decisions:[
   {q:'QM or Safety Path?',go:'QM → ara::per Streaming (빠름, 서명 없음)',nogo:'ASIL C/D → UCM SoftwareCluster 필수 (서명 + ACK 필수)'},
   {q:'다중 ECU 대상?',go:'단일 → 직접 전달',nogo:'다중 → 적절한 경로별 라우팅'},
   {q:'ECU 펌웨어 미호환?',go:'호환 → 전달',nogo:'미호환 → Skip + 비호환 로그 기록'}
 ],
 asil:{
   qm:{time:'< 100ms',approver:'자동 전달',note:'QM Path(Streaming), 단일 전송, 서명 없음'},
   ab:{time:'< 100ms',approver:'선택적 서명',note:'QM Path 우선, Safety Path 가용'},
   cd:{time:'2~5분 (UCM)',approver:'서명 + 명시적 ACK',note:'Safety Path 필수, 이중 메시지(primary+backup 네트워크), ECU ACK 필수 (TTL 내)'}
 }
},
{id:9,title:'Telemetry Return',short:'Telemetry',loc:'Vehicle → Cloud',
 planes:['vehicle','quality'],
 tools:['Kafka','MQTT','OTel'],
 dataIn:['Decision Log','Exposure Event','DTC/Error Data'],
 dataOut:['Telemetry Stream','Vehicle Health Metrics','A/B Attribution'],
 protocol:'Kafka, MQTT',timing:'Batch + Real-time',
 desc:'Decision Log + Exposure Event + 차량 상태를 Cloud로 전송. Kafka 메달리온 아키텍처(Bronze→Silver→Gold). 오프라인 시 로컬 버퍼링.',
 pd:{vehicle:'로컬 버퍼링 후 재전송 (오프라인 대응)',quality:'Kafka 메달리온 아키텍처, ML 이상탐지 입력 데이터'},
 exc:[3],
 subProcess:[
   '<b>텔레메트리 버퍼 수집</b> — Flag 평가 이벤트 + ECU 결과 + DTC + 크래시 + 성능 메트릭 + 사용자 상호작용',
   '<b>로컬 집계 + 압축</b> — 1000건 또는 5분 윈도우 배치, LZ4/Zstd 압축 (~500KB → ~50KB)',
   '<b>네트워크 전송</b> — MQTT(pub/sub QoS 1) topic: fleet/{vin}/telemetry/flags + /dtc',
   '<b>Cloud 수집 (Kafka)</b> — 스키마 검증 → 중복 제거 → 태깅(fleet segment, region, HW)',
   '<b>시계열 DB 저장</b> — ClickHouse/BigQuery(분석) + Redis(라이브 대시보드, 최근 1시간)',
   '<b>메타데이터 보강</b> — VIN→모델/HW, flag key→owner/ASIL, variant→기대 동작 조인',
   '<b>배포 확인 ACK</b> — Cloud → Vehicle ACK 전송',
   '<b>실패 시 재전송</b> — Exponential backoff: 1s→2s→4s→8s (max 60s), 로컬 버퍼 영구 저장(reboot 생존)'
 ],
 actors:[
   {name:'Vehicle Telemetry System',primary:true,role:'로컬 버퍼 + 압축 + 전송'},
   {name:'OTA Operations',primary:false,role:'MQTT Broker + Kafka Consumer 상태 모니터링'},
   {name:'Platform Analytics Team',primary:true,role:'스키마 검증 + 메달리온 파이프라인'},
   {name:'Data Engineering',primary:false,role:'ClickHouse/BigQuery ETL'},
   {name:'Safety Team',primary:false,role:'DTC 우선순위 + 이상 알림'}
 ],
 gates:[
   '텔레메트리 버퍼 ≥ 1 배치 완성 또는 5분 경과',
   'Kafka Consumer lag < 5분 (실시간 처리)',
   '스키마 검증 통과 (malformed 메시지 없음)',
   '중복 제거 확인 (최근 24시간 내 중복 없음)',
   '텔레메트리 커버리지 > 95% (24시간 내 최소 1건/차량)'
 ],
 decisions:[
   {q:'차량 온라인?',go:'온라인 → 즉시 전송',nogo:'오프라인 → 로컬 큐잉 + 재접속 시 재전송'},
   {q:'Safety DTC 존재?',go:'없음 → 표준 배치',nogo:'있음 → 우선 큐 (비안전 텔레메트리보다 먼저 전송)'},
   {q:'Kafka lag > 5분?',go:'정상 → 계속',nogo:'> 30분 → SRE 에스컬레이션'}
 ],
 asil:{
   qm:{time:'5~30분 (배치)',approver:'표준 배치 텔레메트리',note:'5분 윈도우, 선택적 암호화'},
   ab:{time:'1~5분 (우선)',approver:'Safety DTC 우선 큐',note:'서명된 타임스탬프'},
   cd:{time:'< 5초 (Safety DTC)',approver:'실시간 별도 채널',note:'TLS + 메시지 서명 + 배포 확인 필수 + NVRAM 버퍼(reboot 생존) + 완전성 검증(>90%)'}
 }
},
{id:10,title:'Quality Analysis',short:'Quality',loc:'Cloud',
 planes:['quality','control'],
 tools:['Guardrail Monitor','A/B Engine','ClickHouse','ML Pipeline'],
 dataIn:['Telemetry Stream','KPI Targets/SLO'],
 dataOut:['Guardrail Alert','Rollback Trigger','A/B Result','KPI Dashboard'],
 protocol:'Webhook / Event',timing:'Continuous',
 desc:'ML 이상탐지(2σ), 가드레일 모니터링, A/B 실험 분석. 위반 시 자동 롤백 트리거. DORA 5 + 자동차 특화 KPI 12개.',
 pd:{quality:'Progressive Delivery Controller, Guardrail Monitor, Exposure Telemetry 분석',control:'가드레일 위반 → 자동 롤백 트리거 (Webhook)'},
 exc:[3],
 subProcess:[
   '<b>실시간 모니터링</b> — 코호트별(Canary/Ring1~4/GA) 텔레메트리 스트림 수집 + 베이스라인 대비 비교',
   '<b>이상 탐지 실행</b> — Gaussian 2σ + Isolation Forest(다변량) + NLP 클러스터링(고객 불만)',
   '<b>자동 롤백 트리거 판정</b> — 오류율 2σ↑ / Safety DTC↑ / 크래시율↑ / 텔레메트리 <90% / NLP 불만 클러스터',
   '<b>Go/No-Go 판정</b> — Safety Engineer 리뷰 → Go(다음 Ring) / No-Go(롤백) / Wait(관찰 연장)',
   '<b>롤백 실행 (해당 시)</b> — L1 COTA Kill(<5분) → L2 UCM SW(20~30분) → L3 딜러 리플래시(시간~일)',
   '<b>Post-Incident RCA</b> — 5-Why 근본원인 분석(24시간 내) → Rework/Permanent Disable/Code Removal',
   '<b>Ring 확장 판정</b> — 이상 없음 + Safety sign-off + KPI 충족 → 다음 Ring 진행',
   '<b>GA 선언</b> — SUMS/RXSWIN 최종화 + FoD 과금 연결 + Connect App 노출',
   '<b>장기 모니터링</b> — Kill-switch 대기 유지 + 90일 Release flag 일몰 (Day60 알림→Day85 정리→Day90 제거)'
 ],
 actors:[
   {name:'SRE / OTA Operations',primary:true,role:'실시간 모니터링 대시보드 + 알림'},
   {name:'Safety Engineer',primary:true,role:'이상 리뷰 + Go/No-Go 판정 (ASIL C/D)'},
   {name:'Safety Board',primary:false,role:'ASIL C/D: Ring별 진행 승인 (Board ①~⑤)'},
   {name:'Platform Analytics',primary:false,role:'이상 탐지 모델 학습 + KPI 리포팅'},
   {name:'Release Manager',primary:false,role:'RCA + 플래그 처분 결정'},
   {name:'Feature Owner',primary:false,role:'장기 KPI 리포팅 + 90일 일몰 관리'}
 ],
 gates:[
   '텔레메트리 커버리지 ≥ 95% (배포 코호트)',
   '미검토 High-severity alert 없음',
   'Safety Engineer sign-off: "안전 회귀 미감지"',
   'KPI 목표 충족: 오류율 ≤ baseline+1σ, Safety DTC ≤ baseline+0σ',
   'ASIL C/D: Safety Board 승인 (Ring별 5회 게이트)'
 ],
 decisions:[
   {q:'다음 Ring 진행?',go:'이상 없음 + Safety sign-off + KPI 충족 + 최소 관찰기간 경과 → 진행',nogo:'이상 존재 + 원인 불명 → 조사 중 대기',wait:'관찰 연장 (+24~48시간)'},
   {q:'긴급 Kill 필요?',go:'불필요 → 표준 진행',nogo:'Safety DTC↑ 또는 크래시율>2σ 지속 → 즉시 Kill'},
   {q:'GA 후 플래그 처분?',go:'성공 → 90일 내 Release flag 제거 + 코드 정리',nogo:'실패 → Permanent Disable 또는 Code Removal'}
 ],
 asil:{
   qm:{time:'24~48시간/Ring',approver:'자동 진행',note:'자동 모니터링, 자동 Ring 확장, >2σ 자동 롤백'},
   ab:{time:'48~72시간/Ring',approver:'Safety Engineer 리뷰',note:'Ring별 수동 Go/No-Go, >2σ 수동 확인'},
   cd:{time:'1~2주 Canary + Ring별 Board',approver:'Safety Board ①~⑤',note:'Canary 1~2주 → Ring1(72h+Board②) → Ring2(48h+③) → Ring3(48h+④) → Ring4(24h+⑤) → GA. <b>총 6~12주</b>'}
 }
}
];

const EDF_EXC=[
{id:1,title:'Offline Fallback',steps:[6],sev:'medium',
 desc:'Server 미도달 시 4-level 결정적 폴백: L1 서비스 캐시 → L2 NVRAM permanent default → L3 하드코딩 컴파일 기본값',
 timing:'Immediate (local)',resolution:'Deterministic 4-level fallback. Safety flag TTL=Never expire, QM 7~30일, Comfort 24~72시간.',
 planes:['vehicle'],detail:'재접속 시: 대부분 Server-wins, Safety flag(오프라인 중 보수적 값) → Vehicle-wins'},
{id:2,title:'Kill-Switch Trigger',steps:[7],sev:'critical',
 desc:'Safety Board 결정 또는 자동 트리거 → MQTT push로 전 fleet safe state 전환',
 timing:'<30s (MQTT QoS 1)',resolution:'3-Level: L1 COTA <5min / L2 UCM SW 20-30min / L3 Dealer reflash',
 planes:['control','vehicle','governance'],detail:'Topic: fleet/{vin}/flags/kill, Retained Message로 오프라인 차량도 재접속 시 수신'},
{id:3,title:'Canary Health Check Fail',steps:[9,10],sev:'high',
 desc:'카나리/Ring 단계에서 이상 감지 → 자동 롤백',
 timing:'Auto <5min',resolution:'이전 config 복원. 5-Why RCA → 플래그 처분(수정/비활성화/코드 제거)',
 planes:['quality','control'],detail:'자동 트리거 5개: 오류율 2σ, Safety DTC, 크래시/재시작, 텔레메트리 <90%, NLP 불만 클러스터'},
{id:4,title:'SOTA Update In-Flight',steps:[6],sev:'medium',
 desc:'SOTA 업데이트 진행 중 FF 상태 변경 시도 → 변경 보류',
 timing:'업데이트 완료까지 대기',resolution:'SOTA 완료 후 FF 변경 자동 적용. 업데이트 완료까지 기존 상태 안정 유지.',
 planes:['vehicle'],detail:'FOTA/SOTA는 500MB~5GB+ (30분~2시간+), 이 기간 동안 FF 변경은 큐에 보류'},
{id:5,title:'Safety FFI Violation',steps:[7,8],sev:'critical',
 desc:'QM 평가가 ASIL C/D Safety 플래그에 간섭 감지 → Safety flag만 롤백',
 timing:'Immediate',resolution:'Freedom from Interference 원칙. Dual-channel voter가 safe default 선택.',
 planes:['vehicle','governance'],detail:'ASIL C/D: 이중 채널(Ch.A ≠ Ch.B → Voter select safe default), Watchdog 모니터링'},
{id:6,title:'Cross-ECU Conflict',steps:[8],sev:'high',
 desc:'ECU-A(ON) ≠ ECU-B(OFF) 상태 불일치 감지',
 timing:'Retry 즉시',resolution:'재동기화 시도 → 실패 시 vehicle-wins(보수적 값). 전 ECU 일관 상태 보장.',
 planes:['vehicle'],detail:'ECU 간 FF 상태 전파 지연, 통신 지연, 우선순위 충돌 케이스. IT-FF-005 테스트로 사전 검증'},
{id:7,title:'RXSWIN Miss',steps:[2,3],sev:'high',
 desc:'ASIL C/D 플래그 변경 시 RXSWIN 업데이트 누락 → Governance 거부',
 timing:'승인 단계에서 차단',resolution:'RXSWIN 체크 통과 후 재시도. R156 SUMS 프로세스 준수.',
 planes:['governance','control'],detail:'R156: RXSWIN 해당 변경은 반드시 형식승인 기관 통보. 누락 시 배포 파이프라인 차단'},
{id:8,title:'FoD Entitlement Revoke',steps:[7],sev:'medium',
 desc:'구독 종료/취소 → Permission flag OFF → 기능 즉시 비활성화',
 timing:'Real-time (gRPC)',resolution:'FoD 결제-권한-활성화 일치성 보장. Entitlement Bridge 동기화.',
 planes:['control','vehicle'],detail:'effective_decision에서 auth 조건 false → 기능 비활성. Connect App에서 구독 상태 반영'}
];

const EDF_DO={
c2v:[
 {name:'Flag Manifest',steps:[1,3,4,5],desc:'Uptane 이중 서명된 플래그 구성 — key, type, default, ASIL, TTL, dependencies'},
 {name:'Targeting Rules',steps:[3,5],desc:'VIN 패턴, 모델코드, HW 리비전, 지역, 코호트 할당(%, SHA256 해싱)'},
 {name:'Rollback Event',steps:[3,5],desc:'Kill 명령(즉시 기본값) 또는 Resume(이전 상태 복원)'},
 {name:'Approval Record',steps:[1,3],desc:'승인자, 시점, 사유, 서명 — 감사 추적용'},
 {name:'COTA Package',steps:[4,5,6],desc:'Activation conditions(vehicle_state, battery_soc, user_consent, time_window) 포함'}
],
v2c:[
 {name:'Decision Log',steps:[7,9],desc:'타임스탬프, flag key, 평가 컨텍스트, 결과(ON/OFF/timeout), 레이턴시'},
 {name:'Exposure Event',steps:[7,9],desc:'VIN, flag key, 노출된 variant, 타임스탬프 — 분석/과금용'},
 {name:'Telemetry Events',steps:[9,10],desc:'오류율, DTC 수, 크래시 리포트, 배터리 상태, 위치, 네트워크 상태'},
 {name:'Vehicle Version Manifest',steps:[6,9],desc:'현재 활성 플래그 목록 + 각 값, ECU 펌웨어 버전, 마지막 동기화 시간'}
],
bi:[
 {name:'Feature Brief',steps:[1,2],desc:'Spec ID, owner, KPI, criticality tier, ASIL 분류'},
 {name:'Test Matrix',steps:[2,10],desc:'플래그 조합(pairwise), SIL/HIL/vECU 결과'},
 {name:'Context Schema',steps:[3,7],desc:'VIN, model, HW version, ECU type, region, safety level, fleet segment'},
 {name:'Audit Compliance Record',steps:[2,10],desc:'ASPICE 추적성(Req→Spec→Code→Test), R156/R155/ISO 26262 증적'}
]
};

const EDF_FLOW_DATA=[
 null,['Flag Spec','Feature ID'],['Traceability','Policy ID'],['Targeting Rules','Approval'],
 ['Signed COTA','Director Meta'],['Flag Manifest','MQTT Ch.'],['Validated Config','NVRAM'],
 ['Flag Value','Context'],['Decision Log','Exposure Evt'],['Telemetry','Health Metrics']
];

let edfCur=0,edfExcMode=false,edfDtab='overview';

function edfBuildTrack(){
  const t=document.getElementById('edfTrack');let h='';
  for(let i=0;i<5;i++){const s=EDF_STEPS[i];const has=s.exc.length>0;const pills=EDF_FLOW_DATA[i+1]||[];
    h+=`<div class="edf-node" style="grid-row:1;grid-column:${i+1}"><div class="edf-node-card${i===0?' on':''}${has?' has-exc':''}" onclick="edfSelect(${i})" id="edfN${i}"><div class="edf-exc-dot"></div><div class="edf-num" style="background:${plBg(s.planes[0])};color:${plFg(s.planes[0])}">${s.id}</div><div class="edf-node-title">${s.short}</div><div class="edf-node-loc">${s.loc}</div><div class="edf-planes-dots">${s.planes.map(p=>`<div class="edf-pd edf-pd-${p[0]}"></div>`).join('')}</div><div class="edf-proto">${s.protocol}</div></div><div class="edf-data-pills">${pills.map(d=>`<div class="edf-dpill">${d}</div>`).join('')}</div>${i<4?'<span class="edf-arrow edf-arrow-r">\u2192</span>':''}</div>`;}
  h+=`<div class="edf-conn edf-conn-right" style="grid-row:2;grid-column:5"></div>`;
  h+=`<div class="edf-conn edf-conn-left" style="grid-row:2;grid-column:1"><span class="edf-conn-label">Feedback Loop</span></div>`;
  for(let c=2;c<=4;c++) h+=`<div style="grid-row:2;grid-column:${c}"></div>`;
  for(let i=5;i<10;i++){const s=EDF_STEPS[i];const has=s.exc.length>0;const col=10-i;const pills=EDF_FLOW_DATA[i+1]||[];
    h+=`<div class="edf-node" style="grid-row:3;grid-column:${col}"><div class="edf-node-card${has?' has-exc':''}" onclick="edfSelect(${i})" id="edfN${i}"><div class="edf-exc-dot"></div><div class="edf-num" style="background:${plBg(s.planes[0])};color:${plFg(s.planes[0])}">${s.id}</div><div class="edf-node-title">${s.short}</div><div class="edf-node-loc">${s.loc}</div><div class="edf-planes-dots">${s.planes.map(p=>`<div class="edf-pd edf-pd-${p[0]}"></div>`).join('')}</div><div class="edf-proto">${s.protocol}</div></div><div class="edf-data-pills">${pills.map(d=>`<div class="edf-dpill">${d}</div>`).join('')}</div>${col>1?'<span class="edf-arrow edf-arrow-l">\u2190</span>':''}</div>`;}
  t.innerHTML=h;
}

function plBg(p){return{control:'#E6F1FB',vehicle:'#E1F5EE',governance:'#EEEDFE',quality:'#FAEEDA'}[p]||'#f5f6fa'}
function plFg(p){return{control:'#0C447C',vehicle:'#085041',governance:'#3C3489',quality:'#633806'}[p]||'#555'}
function plName(p){return{control:'Control Plane',vehicle:'Vehicle Plane',governance:'Governance Plane',quality:'Quality Plane'}[p]||p}
function plCls(p){return{control:'edf-pl-c',vehicle:'edf-pl-v',governance:'edf-pl-g',quality:'edf-pl-q'}[p]||''}

function edfSelect(i){
  document.querySelectorAll('.edf-node-card').forEach(n=>n.classList.remove('on'));
  document.getElementById('edfN'+i).classList.add('on');
  edfCur=i;edfDtab='overview';edfShowDetail(i);
}

function edfSwitchTab(tab){edfDtab=tab;edfShowDetail(edfCur);}

function edfShowDetail(i){
  const s=EDF_STEPS[i];const d=document.getElementById('edfDetail');
  // Tabs
  const tabs=['overview','process','gate'];
  const tabLabels={overview:'Overview',process:'Sub-Process & Actors',gate:'Gate & ASIL'};
  let tabHtml='<div class="edf-dtabs">'+tabs.map(t=>`<div class="edf-dtab${edfDtab===t?' on':''}" onclick="edfSwitchTab('${t}')">${tabLabels[t]}</div>`).join('')+'</div>';

  // Header
  let head=`<div class="edf-d-head"><div class="edf-d-num" style="background:${plBg(s.planes[0])};color:${plFg(s.planes[0])}">Step ${s.id}</div><div class="edf-d-title">${s.title}</div><div class="edf-d-loc">${s.loc}</div></div><div class="edf-d-desc">${s.desc}</div>`;

  // Overview panel
  let plHtml='';for(const p of s.planes){if(s.pd[p]) plHtml+=`<div class="edf-d-plane ${plCls(p)}"><b>${plName(p)}</b>${s.pd[p]}</div>`;}
  let overviewHtml=`<div class="edf-dpnl${edfDtab==='overview'?' on':''}"><div class="edf-d-grid"><div class="edf-d-box"><div class="edf-d-box-h">도구 & 시스템</div><div>${s.tools.map(t=>`<span class="edf-d-tool">${t}</span>`).join(' ')}</div></div><div class="edf-d-box"><div class="edf-d-box-h">데이터 입력 / 출력</div><div style="margin-bottom:4px">${s.dataIn.map(t=>`<span class="edf-d-data">\u2192 ${t}</span>`).join(' ')}</div><div>${s.dataOut.map(t=>`<span class="edf-d-data out">${t} \u2192</span>`).join(' ')}</div></div><div class="edf-d-box"><div class="edf-d-box-h">4-Plane 관여</div>${plHtml}</div><div class="edf-d-box"><div class="edf-d-box-h">프로토콜 & 타이밍</div><div class="edf-d-proto-row"><div><b>Protocol</b><br><span>${s.protocol}</span></div><div><b>Timing</b><br><span>${s.timing}</span></div></div></div></div></div>`;

  // Process panel
  let spHtml='<div class="edf-sp">'+s.subProcess.map(sp=>`<div class="edf-sp-item"><div class="edf-sp-num"></div><div class="edf-sp-text">${sp}</div></div>`).join('')+'</div>';
  let actorsHtml='<div style="margin-top:8px"><div class="edf-d-box-h">담당 역할 (R&R)</div><div class="edf-actors">'+s.actors.map(a=>`<div class="edf-actor${a.primary?' primary':''}"><span class="edf-actor-icon">${a.primary?'\u25C6':'\u25CB'}</span>${a.name}</div>`).join('')+'</div>';
  actorsHtml+='<table class="edf-asil-tbl" style="margin-top:4px"><tr><th>역할</th><th>책임</th><th>구분</th></tr>'+s.actors.map(a=>`<tr><td style="font-weight:500">${a.name}</td><td>${a.role}</td><td>${a.primary?'<b style="color:#0C447C">Primary</b>':'Support'}</td></tr>`).join('')+'</table></div>';
  let processHtml=`<div class="edf-dpnl${edfDtab==='process'?' on':''}">${spHtml}${actorsHtml}</div>`;

  // Gate & ASIL panel
  let gateHtml='<div class="edf-gate"><div class="edf-gate-h"><span class="ico">\u2611</span> Gate 조건 (다음 Step 진행 조건)</div><ul class="edf-gate-list">'+s.gates.map(g=>`<li>${g}</li>`).join('')+'</ul></div>';
  let decHtml='<div class="edf-dec"><b>\u26A0 의사결정 포인트 (Go/No-Go)</b>'+s.decisions.map(dc=>{
    let r=`<div class="edf-dec-item"><b style="font-size:9px;display:inline">${dc.q}</b><br>`;
    r+=`<span class="edf-dec-go">\u2714 Go:</span> ${dc.go}<br>`;
    r+=`<span class="edf-dec-nogo">\u2718 No-Go:</span> ${dc.nogo}`;
    if(dc.wait) r+=`<br><span class="edf-dec-wait">\u23F3 Wait:</span> ${dc.wait}`;
    return r+'</div>';}).join('')+'</div>';
  let asilHtml=`<table class="edf-asil-tbl"><tr><th></th><th>QM</th><th>ASIL A-B</th><th>ASIL C-D</th></tr>
    <tr><td style="font-weight:600">소요 시간</td><td class="edf-asil-qm">${s.asil.qm.time}</td><td class="edf-asil-ab">${s.asil.ab.time}</td><td class="edf-asil-cd">${s.asil.cd.time}</td></tr>
    <tr><td style="font-weight:600">승인자</td><td>${s.asil.qm.approver}</td><td>${s.asil.ab.approver}</td><td>${s.asil.cd.approver}</td></tr>
    <tr><td style="font-weight:600">특이사항</td><td>${s.asil.qm.note}</td><td>${s.asil.ab.note}</td><td>${s.asil.cd.note}</td></tr></table>`;
  let gatePanel=`<div class="edf-dpnl${edfDtab==='gate'?' on':''}">${gateHtml}${decHtml}<div style="margin-top:6px"><div class="edf-d-box-h">ASIL 등급별 분기</div>${asilHtml}</div></div>`;

  // Exception
  let excHtml='';
  if(s.exc.length>0){for(const eid of s.exc){const e=EDF_EXC.find(x=>x.id===eid);if(!e) continue;
    excHtml+=`<div class="edf-exc-panel active"><div class="edf-exc-title"><span class="edf-sev edf-sev-${e.sev}">${e.sev}</span>Exception: ${e.title}</div><div class="edf-exc-grid"><div><b>트리거 조건</b>${e.desc}</div><div><b>응답 시간</b>${e.timing}</div><div><b>해결 경로</b>${e.resolution}</div><div><b>상세</b>${e.detail}</div></div></div>`;}}

  d.innerHTML=head+tabHtml+overviewHtml+processHtml+gatePanel+excHtml;
}

function edfMode(m){
  const root=document.getElementById('edfRoot');const tabs=document.querySelectorAll('.edf-tab');
  if(m==='exc'){root.classList.add('exc-mode');tabs[0].classList.remove('on');tabs[0].classList.remove('on-exc');tabs[1].classList.add('on-exc');tabs[1].classList.add('on');edfExcMode=true;}
  else{root.classList.remove('exc-mode');tabs[1].classList.remove('on');tabs[1].classList.remove('on-exc');tabs[0].classList.add('on');edfExcMode=false;}
  edfShowDetail(edfCur);
}

function edfToggleDO(){
  const tog=document.getElementById('edfDoToggle'),body=document.getElementById('edfDoBody');
  tog.classList.toggle('open');body.classList.toggle('open');
  if(body.classList.contains('open')&&!body.dataset.built){edfBuildDO();body.dataset.built='1';}
}
function edfBuildDO(){
  const body=document.getElementById('edfDoBody');
  function col(title,items){let h=`<div class="edf-do-col"><h4>${title}</h4>`;for(const it of items){h+=`<div class="edf-do-item" onclick="edfHighlight([${it.steps.join(',')}])"><span>${it.name}</span>Step ${it.steps.join(', ')} &middot; <em>${it.desc}</em></div>`;}return h+'</div>';}
  body.innerHTML=`<div class="edf-do-grid">${col('Cloud \u2192 Vehicle (5)',EDF_DO.c2v)}${col('Vehicle \u2192 Cloud (4)',EDF_DO.v2c)}${col('\uC591\uBC29\uD5A5 (4)',EDF_DO.bi)}</div>`;
}
function edfHighlight(steps){for(const si of steps){const el=document.getElementById('edfN'+(si-1));if(el){el.classList.remove('pulse');void el.offsetWidth;el.classList.add('pulse');setTimeout(()=>el.classList.remove('pulse'),1400);}}}

edfBuildTrack();edfShowDetail(0);