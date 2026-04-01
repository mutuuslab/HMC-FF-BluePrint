const DVF_E2E=['Flag Mgmt','ALM Sync','CP Config','Uptane Sign','Distribution','Vehicle Rx','Local Eval','ECU Dist','Telemetry','Quality'];

const DVF=[
{n:'Plan',t:'Feature 기획',sub:'Identity',ph:'Phase 1',phCls:'ph1',e2e:[1,2],
 tools:['Jira','Confluence','Codebeamer'],
 dataIn:['Customer Requirement','Product Backlog'],
 dataOut:['Feature ID','Flag Spec YAML','ASIL 분류','Bill of Features'],
 planes:[{c:'dvf-pl-c',n:'Control Plane',d:'Feature Catalog 등록, binding_time(selected/deselected/deferred) 결정'},{c:'dvf-pl-g',n:'Governance Plane',d:'ASIL 분류 → 4-Tier 규제 등급, Owner·TTL·Cleanup plan 지정'}],
 flow:'상품기획 → Feature기획 → Feature-Function-사양 맵핑 → Feature Model 3-State 분류(Selected/Deselected/Deferred) → Deferred 항목이 FF 대상 확정',
 sp:['Feature brief 작성 + KPI 정의','ASIL/Criticality 분류 (QM/A/B/C/D, Tier T0~T4)','Feature Interaction Matrix 갱신 (7% direct, 33% code interaction, 22% 성장률)','3-State 결정: Selected(컴파일 고정) / Deselected(제외) / Deferred(FF 대상)','Bill of Features 등록 + Feature Catalog 입력','Safety Case 작성 (ASIL C/D: FMEA/FTA + 독립 검증)'],
 actors:[{n:'Product Owner',p:true},{n:'Development Lead',p:false},{n:'Safety Engineer',p:true},{n:'Safety Board (C/D)',p:false},{n:'Independent Assessor (C/D)',p:false}],
 gates:['Flag Spec 메타데이터(키, 변형, 기본값, owner, TTL) 완전성','ASIL 분류 완료 + 해당 승인 레벨 sign-off','Feature Interaction Matrix 충돌 없음 (ASIL D 간섭 시 No-Go)','Safety Case(C/D) 또는 Impact Summary(A/B) 승인'],
 asil:{qm:{t:'< 2시간',a:'PO 승인',n:'자동 메타데이터 검증'},ab:{t:'1~3일',a:'Safety Engineer',n:'Safety Impact Summary 포함'},cd:{t:'1~2주',a:'Board + Assessor',n:'Full Safety Case + FMEA/FTA + Board 심의'}}
},
{n:'Code',t:'설계 & 구현',sub:'Binding',ph:'Phase 2',phCls:'ph2',e2e:[2,3],
 tools:['Bitbucket','EA','PREEvision','MATLAB'],
 dataIn:['Flag Spec YAML','SDK 통합 가이드'],
 dataOut:['Toggle Point 코드','Latch-at-Init 구현','Fail-safe 4단계','Dual-channel (ASIL C-D)'],
 planes:[{c:'dvf-pl-v',n:'Vehicle Plane',d:'FF SDK 통합, Toggle Point 배치(Eval+Apply 분리), NVRAM 캐시 설계'},{c:'dvf-pl-c',n:'Control Plane',d:'Policy ID + Targeting rule + Eval context schema 부여'}],
 flow:'Flag별 코드 분리 + 빌드/차량 조건별 활성화. 허용: Latch-at-Init(초기화 1회). 금지: 동일 루프 다중 평가, 중첩 2+단계',
 sp:['Toggle Point 배치 (Eval Point + Apply Point 분리)','OpenFeature SDK 통합 (Provider 등록, Hook 설정)','Latch-at-Init 패턴 적용 (부팅 시 1회 고정, 런타임 변경 불가)','NVRAM 캐시 설계 (Fail-safe L2/L3 저장소)','Dual-channel 구현 (ASIL C/D: Ch.A + Ch.B + Voter/Comparator)','Watchdog 모니터링 코드 + 타임아웃 safe default'],
 actors:[{n:'SDK Development Team',p:true},{n:'Safety Specialist',p:false}],
 gates:['SDK 통합 테스트 통과','Fail-safe L3 NVRAM 검증 완료','Latch-at-Init 패턴 준수 확인 (정적 분석)'],
 asil:{qm:{t:'표준',a:'자동 검증',n:'단일 채널, cache/NVRAM fallback'},ab:{t:'+1~2일',a:'Safety 리뷰',n:'Plausibility check (>20% 변경 시 경고)'},cd:{t:'+3~5일',a:'FFI 증명',n:'Dual-channel + FFI + Watchdog + 독립 리뷰'}}
},
{n:'Build',t:'빌드 & CI',sub:'Packaging',ph:'Phase 3',phCls:'ph3',e2e:[3,4],
 tools:['Bamboo','SonarQube','PolySpace','ld-find-code-refs'],
 dataIn:['Toggle Point 코드','Flag Spec YAML'],
 dataOut:['COTA 패키지','SOTA 패키지','Campaign Manifest','플래그 참조 유효성 보고서'],
 planes:[{c:'dvf-pl-q',n:'Quality Plane',d:'CI 규칙 7개 (MISRA-C, Race Condition, 커버리지 100%, WCET, CPU avg<70%/max<90%, 결함주입, 영향성 분석)'},{c:'dvf-pl-g',n:'Governance Plane',d:'ASPICE 4.0 매핑, ES95411 검증 게이트'}],
 flow:'6-Stage 파이프라인: Commit → Static → Unit → Integration → Package → Sign. Feature Model 제약 기반 Pairwise/3-way 매트릭스 축소로 조합 폭발 대응',
 sp:['Commit hook + FF lint (FF_DEAD_REF time bomb, FF_BOTH_PATHS 검증)','Static analysis (MISRA-C, Race Condition, PolySpace)','Unit test (ON/OFF 양쪽 100% 커버리지, Pairwise 매트릭스)','Integration test (Cross-flag 상호작용, Feature Interaction CI)','COTA/SOTA 패키지 분리 + 델타 압축 (최대 95% 축소)','Uptane 이중 서명 (Image Repo + Director Repo, ECDSA-P256)','Feature Interaction CI 분석 (22% 성장률 모니터링, Knight Capital 사례 참조)'],
 actors:[{n:'CI/CD Engineer',p:true},{n:'QA',p:false},{n:'Governance Lead',p:false}],
 gates:['CI 규칙 7개 전부 Pass','ASIL 게이트 통과 (FF_SAFETY_REVIEW blocker)','ON/OFF 커버리지 100%','COTA 패키지 크기 < 500KB'],
 asil:{qm:{t:'자동',a:'자동 파이프라인',n:'표준 CI 규칙'},ab:{t:'+ASIL 게이트',a:'Safety 게이트 추가',n:'FF_SAFETY_REVIEW blocker 삽입'},cd:{t:'+MC/DC',a:'Board 서명',n:'MC/DC + 결함주입 + Safety Board 서명 필수'}}
},
{n:'Test',t:'검증 & V&V',sub:'Gate',ph:'Phase 3-4',phCls:'ph3',e2e:[3],
 tools:['MATLAB/Simulink','vECU L1-3','HKSAT','디지털트윈'],
 dataIn:['COTA/SOTA 패키지','vECU 바이너리'],
 dataOut:['SIL/HIL 검증 결과','Shadow Flag 결과','ES95411 검증결과서','Scenario Scorecard'],
 planes:[{c:'dvf-pl-q',n:'Quality Plane',d:'ON/OFF 양쪽 커버리지 100%, Shadow Mode 병행+비교, ML 이상탐지(2σ)'},{c:'dvf-pl-v',n:'Vehicle Plane',d:'vECU L3 NVRAM 폴백 검증 (Fail-safe Level 3 필수)'}],
 flow:'4단계 통합 테스트: L1 컴포넌트(단일 FF) → L2 ECU(Cross-supplier) → L3 시스템(E2E) → L4 차량(실차). Shadow Flag: 신규 로직 병행 실행 + 출력 비교 → 전환 판단',
 sp:['MIL (MATLAB/Simulink — FF 알고리즘 로직, 상태 전이)','SIL (vECU — FF SDK 통합, 평가 로직, API 호환)','HIL (실 ECU + 시뮬레이터 — HW-SW 통합, 타이밍, 인터럽트)','디지털 트윈 (CARLA/Autoware/SUMO — E2E 시나리오: AEB 카나리, FoD 활성, 킬스위치, 오프라인)','Shadow Flag 검증 (신규 로직 병행 실행 + 기존 대비 비교 데이터 수집)','ES95411 협력사 SW 검증 (SDK conformance + IF-01~08 인터페이스)'],
 actors:[{n:'QA',p:true},{n:'Safety Engineer',p:true},{n:'Supplier QA',p:false}],
 gates:['ON/OFF 양쪽 경로 모두 Pass','NVRAM fallback (Fail-safe L3) 검증 통과','Shadow Flag 비교 허용 범위 이내','ES95411 검증서 발급'],
 asil:{qm:{t:'SIL만',a:'QA 승인',n:'vECU 가상 검증'},ab:{t:'SIL + HIL',a:'Safety Engineer',n:'실 ECU 검증 추가'},cd:{t:'SIL+HIL+DT+실차',a:'Board + 독립검증',n:'디지털트윈 + 실차 + 독립 검증 필수'}}
},
{n:'Deploy',t:'OTA 배포',sub:'Delivery',ph:'Phase 3',phCls:'ph3',e2e:[4,5,6],
 tools:['Bamboo','OTA Campaign Engine','Uptane','MQTT'],
 dataIn:['서명된 COTA/SOTA 패키지','Campaign Manifest'],
 dataOut:['Ring 1 카나리 (내부 50-100대)','VIN 타겟팅 규칙','RXSWIN 체크 결과','Kill-switch 배선'],
 planes:[{c:'dvf-pl-c',n:'Control Plane',d:'타겟팅 규칙(VIN/모델/지역/HW/SW) 배포, Ring 1→2→3→4 확장 정책'},{c:'dvf-pl-v',n:'Vehicle Plane',d:'COTA Uptane 이중서명 수신, 로컬 캐시 업데이트'}],
 flow:'Deploy ≠ Release. Package ≠ Activation. 8-Stage OTA의 Stage 1-4: 배포 승인 → FF 구성 → 타겟팅 → 카나리. COTA(구성변경)와 SOTA(바이너리)는 별도 채널',
 sp:['배포 승인 (ASIL 3-트랙: QM 3명 / ASIL A-B 4명 / ASIL C-D 6+명)','FF 플랫폼 구성 (fallback safe default, schema 검증)','타겟팅 규칙 적용 (Consistent Hashing SHA256 균등 분포 검증)','Ring 할당 설계 (Canary 0.1% → Ring1 1% → Ring2 5% → Ring3 25% → Ring4 50% → GA 100%)','MQTT/CDN 이중경로 배포 (Push <30s + Pull fallback 30s~5min)','TCU Uptane 이중서명 검증 (Image Repo + Director Repo)','HPVC 로컬 캐시 갱신 + NVRAM 저장 + Activation conditions 체크'],
 actors:[{n:'Release Manager',p:true},{n:'OTA Operations',p:true},{n:'Safety Engineer',p:false}],
 gates:['Uptane 이중 서명 유효','배포 확인 ≥ 95% (대상 fleet 30초 이내)','Activation conditions 충족 (주차/배터리≥40%/동의/시간)','MQTT Broker 온라인 + CDN health check 통과'],
 asil:{qm:{t:'자동 배포',a:'자동',n:'MQTT QoS 1 + CDN fallback'},ab:{t:'+Safety 게이트',a:'Safety Engineer',n:'강화 확인 로그 + Regional Edge 이중화'},cd:{t:'Board per Ring',a:'Safety Board',n:'이중채널 병렬 배포 + Board 승인 per Ring. Safety flag TTL=Never expire'}}
},
{n:'Release',t:'릴리스 판정',sub:'Decision',ph:'Phase 4',phCls:'ph4',e2e:[9,10],
 tools:['FF Admin Console','Guardrail Monitor','텔레메트리 대시보드'],
 dataIn:['Ring 1 카나리 결과','가드레일 KPI','ML 이상탐지 결과'],
 dataOut:['Decision Record','Ring 확장 판정 (Go/No-Go)','차량 Release Dossier','RXSWIN Record'],
 planes:[{c:'dvf-pl-q',n:'Quality Plane',d:'자동 롤백 트리거 5개: 오류율 2σ, Safety DTC, 크래시율, 텔레메트리 <90%, NLP 불만'},{c:'dvf-pl-g',n:'Governance Plane',d:'ASIL 3-트랙 분기: QM→FLC, ASIL A-B→SFRB, ASIL C-D→Safety Board+VFGB'}],
 flow:'Stage 5-6: 통계적 유의성 검정 + No-go boundary 판정 → Ring 확장(2→3→4). 비엔지니어링 팀(마케팅/고객지원)이 Release 토글을 직접 제어 가능 (Deploy 권한과 분리)',
 sp:['코호트별 실시간 모니터링 (Canary / Ring 1~4 / GA)','ML anomaly detection (Gaussian 2σ + Isolation Forest + NLP 클러스터링)','Go/No-Go 판정 (Safety Engineer 리뷰: Go/No-Go/Wait)','Ring 확장 실행 (0.1% → 1% → 5% → 25% → 50% → 100%)','GA 선언 + SUMS/RXSWIN 최종화','FoD 과금 연결 + Connect App 노출','Release flag 90일 sunset 스케줄 등록 (Day60 알림→Day85 정리→Day90 제거)'],
 actors:[{n:'Safety Engineer',p:true},{n:'Release Manager',p:true},{n:'Safety Board (C/D)',p:false},{n:'Platform Analytics',p:false}],
 gates:['텔레메트리 커버리지 ≥ 95% (배포 코호트)','미검토 High-severity alert 없음','Safety Engineer sign-off: "안전 회귀 미감지"','KPI 충족: 오류율 ≤ baseline+1σ, Safety DTC ≤ baseline+0σ','ASIL C/D: Safety Board 승인 (Ring별 5회 게이트)'],
 asil:{qm:{t:'24~48시간/Ring',a:'자동 진행',n:'자동 모니터링 + 자동 Ring 확장, >2σ 자동 롤백'},ab:{t:'48~72시간/Ring',a:'Safety Eng 리뷰',n:'Ring별 수동 Go/No-Go, >2σ 수동 확인'},cd:{t:'1~2주 Canary + Board×5',a:'Safety Board ①~⑤',n:'총 6~12주. Canary→Ring1(72h+②)→Ring2(48h+③)→Ring3(48h+④)→Ring4(24h+⑤)→GA'}}
},
{n:'Operate',t:'운영 & FoD',sub:'Runtime',ph:'Phase 4-5',phCls:'ph4',e2e:[7],
 tools:['CIF System','FoD 결제 시스템','Kill-switch MQTT'],
 dataIn:['Entitlement Profile','구독 정보','FoD 결제 이벤트'],
 dataOut:['FoD 활성화 상태','Kill-switch 실행 로그','인시던트 RCA 보고서'],
 planes:[{c:'dvf-pl-v',n:'Vehicle Plane',d:'effective_decision = variant && auth && safe_mode && flag_rule. 3-Level Kill-switch: L1 COTA <5min / L2 UCM 20-30min / L3 딜러'},{c:'dvf-pl-c',n:'Control Plane',d:'Permission 플래그 + Entitlement 동기화, FoD 결제-권한-활성화 일치성'}],
 flow:'SafeMode 합성 규칙 적용. Kill-switch 에스컬레이션: Level 1(COTA 플래그 비활성화) → Level 2(UCM SW 롤백) → Level 3(딜러 리플래시). 인시던트 → 5-Why RCA → 플래그 처분',
 sp:['FoD 구독 확인 + 결제 처리','Permission flag 동기화 (Entitlement Bridge via gRPC)','SafeMode 합성 규칙 적용 (4조건 AND 연산)','Kill-switch L1 실행 (COTA flag 비활성화, MQTT push <5min)','Kill-switch L2 에스컬레이션 (UCM SW 롤백, 20-30min)','Kill-switch L3 딜러 리플래시 (서비스 불레틴 발행, 시간~일)','5-Why RCA → 플래그 처분 (Rework/Permanent Disable/Code Removal)'],
 actors:[{n:'OTA Operations',p:true},{n:'Safety Engineer',p:true},{n:'Safety Board (L2+)',p:false}],
 gates:['FoD 결제-권한-활성화 일치성 확인','Kill-switch 응답 시간 < 5min (L1)','인시던트 RCA 24시간 내 완료'],
 asil:{qm:{t:'L1만',a:'자동',n:'COTA flag 비활성화'},ab:{t:'L1 + L2',a:'Safety Engineer',n:'UCM 롤백 가능'},cd:{t:'L1+L2+L3 + Board',a:'Safety Board',n:'딜러 리플래시 + Safety Board 승인'}}
},
{n:'Monitor',t:'피드백 & 정리',sub:'Closure',ph:'Phase 5',phCls:'ph5',e2e:[9,10],
 tools:['텔레메트리 플랫폼','A/B 분석 엔진','Flag Hygiene 대시보드'],
 dataIn:['Exposure Event','텔레메트리 로그','고객 피드백'],
 dataOut:['KPI 대시보드 (DORA 5 + 자동차 12)','A/B 실험 결과','Stale/Dead 플래그 목록','Cleanup 스프린트 리포트'],
 planes:[{c:'dvf-pl-q',n:'Quality Plane',d:'DORA 5 Metrics + 자동차 특화 KPI 12개 = 총 17개 지표 모니터링, Flag Debt 추적'},{c:'dvf-pl-g',n:'Governance Plane',d:'Flag Hygiene: Piranha AST 자동 정리, Time Bomb CI, 분기 Cleanup 스프린트'}],
 flow:'Feedback Loop → Feature Catalog 업데이트 → 다음 Sprint의 Phase 1(Identity)로 순환. Flag TTL 만료 → 자동 알림 → 코드 정리 또는 영구 플래그 전환. 월간 Cleanup 스프린트 참여 의무',
 sp:['DORA 5 메트릭 수집 (배포빈도, 리드타임, 변경실패율, 복구시간, 신뢰성)','자동차 특화 KPI 12개 산출 (FTTI, MTTR, 롤백시간, dead flag ratio 등)','A/B 실험 결과 분석 + 코호트 상관 분석','Flag hygiene 점검 (owner 없는 flag, TTL 초과, 미사용 flag)','Dead flag 탐지 (Piranha AST 자동 코드 정리)','Time Bomb CI 실행 (만료 flag → 빌드 실패 강제)','분기 Cleanup sprint 실행 (전원 참여 의무)','Feature Catalog 피드백 루프 → 다음 Sprint Phase 1(Identity) 순환'],
 actors:[{n:'Platform Analytics',p:true},{n:'Feature Owner',p:false},{n:'QA',p:false}],
 gates:['Dead flag ratio < 5%','Cleanup sprint 완료','KPI 목표 달성','Release flag 90일 내 정리 or 영구 전환'],
 asil:{qm:{t:'공통',a:'자동',n:'전 등급 공통 모니터링'},ab:{t:'공통',a:'자동',n:'Safety DTC 추가 모니터링'},cd:{t:'공통',a:'자동',n:'Safety DTC + Board 리포트'}}
}
];

let dvfCur=0,dvfDtab='overview';

function dvfInit(){
  const e=document.getElementById('dvfE2e');
  e.innerHTML=DVF_E2E.map((s,i)=>`<div class="dvf-e2e-s" id="dvfE${i+1}">${i+1}. ${s}</div>`).join('');
  const c=document.getElementById('dvfStgs');
  DVF.forEach((s,i)=>{
    const el=document.createElement('div');
    el.className='dvf-stg'+(i===0?' on':'');el.id='dvfS'+i;
    el.innerHTML=`<div class="dvf-stg-n">${s.n}</div><div class="dvf-stg-t">${s.t}</div><div class="dvf-stg-k">${s.sub}</div><div class="dvf-stg-ph ${s.phCls}">${s.ph}</div>${i<DVF.length-1?'<span class="dvf-arr">\u2192</span>':''}`;
    el.onclick=()=>dvfSelect(i);c.appendChild(el);
  });
  dvfSelect(0);
}

function dvfSelect(i){
  dvfCur=i;dvfDtab='overview';
  document.querySelectorAll('.dvf-stg').forEach((s,j)=>s.classList.toggle('on',j===i));
  document.querySelectorAll('.dvf-e2e-s').forEach(e=>e.classList.remove('on'));
  DVF[i].e2e.forEach(n=>{const el=document.getElementById('dvfE'+n);if(el)el.classList.add('on');});
  dvfShow(i);
}

function dvfTab(t){dvfDtab=t;dvfShow(dvfCur);}

function dvfShow(i){
  const s=DVF[i],d=document.getElementById('dvfDet');
  const tabs=['overview','process','gate'];
  const lbl={overview:'Overview',process:'Sub-Process & Actors',gate:'Gate & ASIL'};
  let th='<div class="dvf-dtabs">'+tabs.map(t=>`<div class="dvf-dtab${dvfDtab===t?' on':''}" onclick="dvfTab('${t}')">${lbl[t]}</div>`).join('')+'</div>';
  let hd=`<div class="dvf-d-head"><span class="dvf-stg-ph ${s.phCls}">${s.ph}</span><div class="dvf-d-title">${s.n} — ${s.t}</div></div><div class="dvf-d-desc">${s.flow}</div>`;
  // Overview
  let plH=s.planes.map(p=>`<div class="dvf-d-plane ${p.c}"><b>${p.n}</b>${p.d}</div>`).join('');
  let ovH=`<div class="dvf-dpnl${dvfDtab==='overview'?' on':''}"><div class="dvf-d-grid"><div class="dvf-d-box"><div class="dvf-d-box-h">도구 (Toolchain)</div>${s.tools.map(t=>`<span class="dvf-tool">${t}</span>`).join(' ')}</div><div class="dvf-d-box"><div class="dvf-d-box-h">데이터 입력 / 출력</div><div style="margin-bottom:4px">${s.dataIn.map(t=>`<span class="dvf-data">\u2192 ${t}</span>`).join(' ')}</div><div>${s.dataOut.map(t=>`<span class="dvf-data out">${t} \u2192</span>`).join(' ')}</div></div><div class="dvf-d-box"><div class="dvf-d-box-h">4-Plane 관여</div>${plH}</div><div class="dvf-d-box"><div class="dvf-d-box-h">E2E Step 매핑</div><div style="font-size:10px">${s.e2e.map(n=>`<b>Step ${n}</b> ${DVF_E2E[n-1]}`).join(' \u00B7 ')}</div></div></div></div>`;
  // Process
  let spH='<div class="dvf-sp">'+s.sp.map(x=>`<div class="dvf-sp-item"><div class="dvf-sp-num"></div><div style="flex:1">${x}</div></div>`).join('')+'</div>';
  let acH='<div style="margin-top:8px"><div class="dvf-d-box-h">담당 역할 (R&R)</div><div class="dvf-actors">'+s.actors.map(a=>`<div class="dvf-actor${a.p?' primary':''}">${a.p?'\u25C6':'\u25CB'} ${a.n}</div>`).join('')+'</div></div>';
  let prH=`<div class="dvf-dpnl${dvfDtab==='process'?' on':''}">${spH}${acH}</div>`;
  // Gate & ASIL
  let gtH=`<div class="dvf-gate"><div class="dvf-gate-h">\u2611 Gate 조건 (다음 Stage 진행 조건)</div><ul class="dvf-gate-list">${s.gates.map(g=>`<li>${g}</li>`).join('')}</ul></div>`;
  let asH=`<table class="dvf-asil"><tr><th></th><th>QM</th><th>ASIL A-B</th><th>ASIL C-D</th></tr><tr><td style="font-weight:600">소요시간</td><td>${s.asil.qm.t}</td><td>${s.asil.ab.t}</td><td style="color:#a94442;font-weight:500">${s.asil.cd.t}</td></tr><tr><td style="font-weight:600">승인자</td><td>${s.asil.qm.a}</td><td>${s.asil.ab.a}</td><td>${s.asil.cd.a}</td></tr><tr><td style="font-weight:600">특이사항</td><td>${s.asil.qm.n}</td><td>${s.asil.ab.n}</td><td>${s.asil.cd.n}</td></tr></table>`;
  let gaH=`<div class="dvf-dpnl${dvfDtab==='gate'?' on':''}">${gtH}<div style="margin-top:6px"><div class="dvf-d-box-h">ASIL 등급별 분기</div>${asH}</div></div>`;
  d.innerHTML=hd+th+ovH+prH+gaH;
}

dvfInit();