const SBP_E2E=['Flag Mgmt','ALM Sync','CP Config','Uptane Sign','Distribution','Vehicle Rx','Local Eval','ECU Dist','Telemetry','Quality'];

const SBP=[
{n:'Plan',k:'Feature 기획',ph:'Phase 1',phCls:'ph1',phSub:'Identity',e2e:[1,2],
 act:'Feature 기획 · Flag Spec 작성 · ASIL 분류',
 tools1:['Jira','Confluence'],tools2:['Codebeamer'],
 dataIn:['고객 요구','Product backlog'],dataOut:['Feature ID','Flag Spec YAML','ASIL 분류서'],
 planes:[{c:'pl-c',n:'Control',d:'Feature Catalog 등록, binding_time 결정'},{c:'pl-g',n:'Gov',d:'ASIL 분류·Owner·TTL 지정'}],
 desc:'상품기획→Feature기획→Feature-Function-사양 맵핑→3-State 분류(Selected/Deselected/Deferred)→Deferred=FF 대상 확정',
 sp:['Feature brief 작성 + KPI 정의','ASIL/Criticality 분류 (QM/A/B/C/D)','Feature Interaction Matrix 갱신 (7% direct, 33% code)','3-State 결정: Selected(컴파일 고정)/Deselected(제외)/Deferred(FF)','Bill of Features 등록','Safety Case 작성 (ASIL C/D: FMEA/FTA)'],
 actors:[{name:'Product Owner',p:true},{name:'Dev Lead',p:false},{name:'Safety Engineer',p:true},{name:'Safety Board (C/D)',p:false}],
 gates:['Flag Spec 메타데이터 완전성 검증','ASIL 분류 완료 + 해당 승인 레벨 sign-off','Feature Interaction Matrix 충돌 없음','Safety Case(C/D) 또는 Impact Summary(A/B) 승인'],
 asil:{qm:{t:'< 2시간',a:'PO 승인',n:'자동 메타데이터 검증'},ab:{t:'1~3일',a:'Safety Engineer',n:'Safety Impact Summary'},cd:{t:'1~2주',a:'Board + Assessor',n:'Full Safety Case + FMEA/FTA'}}
},
{n:'Code',k:'설계 & 구현',ph:'Phase 2',phCls:'ph2',phSub:'Binding',e2e:[2,3],
 act:'Toggle Point 구현 · SDK 통합 · Fail-safe 설계',
 tools1:['Bitbucket','EA'],tools2:['PREEvision','MATLAB'],
 dataIn:['Flag Spec','SDK guide'],dataOut:['Toggle Point 코드','Fail-safe 구현','Dual-channel'],
 planes:[{c:'pl-v',n:'Vehicle',d:'FF SDK 통합, Toggle Point 배치, NVRAM 설계'},{c:'pl-c',n:'Control',d:'Policy ID + Targeting rule schema 부여'}],
 desc:'Flag별 코드 분리. 허용 패턴: Latch-at-Init(초기화 1회 평가). 금지: 동일 루프 다중 평가, 중첩 2+단계',
 sp:['Toggle Point 배치 (Eval Point + Apply Point 분리)','OpenFeature SDK 통합','Latch-at-Init 패턴 적용 (부팅 시 1회 고정)','NVRAM 캐시 설계 (Fail-safe L2/L3)','Dual-channel 구현 (ASIL C/D: Ch.A + Ch.B + Voter)','Watchdog 모니터링 코드 추가'],
 actors:[{name:'SDK Dev Team',p:true},{name:'Safety Specialist',p:false}],
 gates:['SDK 통합 테스트 통과','Fail-safe L3 NVRAM 검증 완료','Latch-at-Init 패턴 준수 확인'],
 asil:{qm:{t:'표준',a:'자동 검증',n:'단일 채널'},ab:{t:'+1~2일',a:'Safety 리뷰',n:'Safety 리뷰 추가'},cd:{t:'+3~5일',a:'FFI 증명',n:'Dual-channel + FFI + Watchdog'}}
},
{n:'Build',k:'빌드 & CI',ph:'Phase 3',phCls:'ph3',phSub:'Packaging',e2e:[3,4],
 act:'CI 6-Stage · MISRA-C 검증 · COTA/SOTA 분리',
 tools1:['Bamboo','SonarQube'],tools2:['PolySpace','ld-refs'],
 dataIn:['코드+Flag Spec'],dataOut:['COTA pkg','SOTA pkg','Manifest'],
 planes:[{c:'pl-q',n:'Quality',d:'CI 규칙 7개 (MISRA-C, 커버리지 100%, WCET, CPU<70%/<90%)'},{c:'pl-g',n:'Gov',d:'ASPICE 4.0 매핑, ES95411 검증 게이트'}],
 desc:'6-Stage: Commit→Static→Unit→Integration→Package→Sign. Pairwise/3-way 매트릭스로 조합 폭발 대응',
 sp:['Commit hook + FF lint (dead ref 감지)','Static analysis (MISRA-C, Race Condition)','Unit test (ON/OFF 양쪽 100% 커버리지)','Integration test (Cross-flag 상호작용)','COTA/SOTA 패키지 분리 + 델타 압축','Uptane 이중 서명 (Image Repo + Director Repo)','Feature Interaction CI 분석 (22% 성장률 모니터링)'],
 actors:[{name:'CI/CD Engineer',p:true},{name:'QA',p:false},{name:'Governance Lead',p:false}],
 gates:['CI 규칙 7개 전부 Pass','ASIL 게이트 통과','ON/OFF 커버리지 100%','패키지 크기 < 500KB (COTA)'],
 asil:{qm:{t:'자동',a:'자동 파이프라인',n:'표준 CI'},ab:{t:'+게이트',a:'ASIL 게이트 추가',n:'Safety 게이트 삽입'},cd:{t:'+MC/DC',a:'Board 서명',n:'MC/DC + 결함주입 + Safety Board'}}
},
{n:'Test',k:'검증 & V&V',ph:'Phase 3-4',phCls:'ph3',phSub:'Verify',e2e:[3],
 act:'SIL/HIL 검증 · Shadow Flag · 커버리지 100%',
 tools1:['Simulink','vECU'],tools2:['HKSAT','디지털트윈'],
 dataIn:['COTA/SOTA pkg'],dataOut:['검증 결과서','Scorecard'],
 planes:[{c:'pl-q',n:'Quality',d:'ON/OFF 100%, Shadow Mode 병행+비교, ML 2σ'},{c:'pl-v',n:'Vehicle',d:'vECU L3 NVRAM 폴백 검증 (Fail-safe L3 필수)'}],
 desc:'4단계: L1 컴포넌트→L2 ECU(Cross-supplier)→L3 시스템(E2E)→L4 차량. Shadow Flag: 병행 실행→비교→전환 판단',
 sp:['MIL (MATLAB/Simulink 알고리즘 로직)','SIL (vECU FF SDK 통합, API 호환)','HIL (실 ECU + 시뮬레이터, 타이밍 검증)','디지털 트윈 (CARLA/Autoware/SUMO E2E 시나리오)','Shadow Flag 검증 (신규 로직 병행 실행 + 비교)','ES95411 협력사 SW 검증'],
 actors:[{name:'QA',p:true},{name:'Safety Engineer',p:true},{name:'Supplier QA',p:false}],
 gates:['ON/OFF 양쪽 Path 모두 Pass','NVRAM fallback (Fail-safe L3) 검증 통과','Shadow Flag 비교 허용 범위 이내'],
 asil:{qm:{t:'SIL만',a:'QA 승인',n:'vECU 가상 검증'},ab:{t:'SIL+HIL',a:'Safety Eng',n:'실 ECU 검증 추가'},cd:{t:'SIL+HIL+DT+실차',a:'Board',n:'디지털트윈+실차+독립검증'}}
},
{n:'Deploy',k:'OTA 배포',ph:'Phase 3',phCls:'ph3',phSub:'Delivery',e2e:[4,5,6],
 act:'OTA 캠페인 · Ring 1 카나리 · Uptane 서명',
 tools1:['OTA Engine','Uptane'],tools2:['MQTT','Campaign'],
 dataIn:['서명된 패키지'],dataOut:['Ring 1 결과','RXSWIN 체크'],
 planes:[{c:'pl-c',n:'Control',d:'타겟팅 규칙 배포, Ring 1→2→3→4 확장 정책'},{c:'pl-v',n:'Vehicle',d:'COTA Uptane 이중서명 수신, 로컬 캐시 갱신'}],
 desc:'Deploy≠Release. Package≠Activation. 8-Stage OTA의 1-4: 배포 승인→FF 구성→타겟팅→카나리',
 sp:['배포 승인 (ASIL 3-트랙: QM 3명/A-B 4명/C-D 6+명)','FF 플랫폼 구성 (fallback default, schema 검증)','타겟팅 규칙 적용 (VIN/모델/지역/HW/SW)','Consistent Hashing 검증 (SHA256, 균등분포)','MQTT/CDN 이중경로 배포 (<30s push)','TCU Uptane 이중서명 검증','HPVC 로컬 캐시 갱신 + NVRAM 저장'],
 actors:[{name:'Release Manager',p:true},{name:'OTA Operations',p:true},{name:'Safety Engineer',p:false}],
 gates:['Uptane 이중 서명 유효','배포 확인 ≥ 95% (대상 fleet)','Activation conditions 충족 (주차/배터리/동의/시간)'],
 asil:{qm:{t:'자동 배포',a:'자동',n:'MQTT QoS 1 + CDN'},ab:{t:'+Safety 게이트',a:'Safety Eng',n:'강화 확인 로그'},cd:{t:'Board per Ring',a:'Safety Board',n:'이중채널 + Board 승인 per Ring'}}
},
{n:'Release',k:'릴리스 판정',ph:'Phase 4',phCls:'ph4',phSub:'Decision',e2e:[9,10],
 act:'Go/No-Go 판정 · Ring 확장 · ASIL 3-트랙',
 tools1:['FF Console','Guardrail'],tools2:['ML 이상탐지'],
 dataIn:['카나리 결과','가드레일 KPI'],dataOut:['Decision rec','Release dossier'],
 planes:[{c:'pl-q',n:'Quality',d:'자동 롤백 트리거 5개 (오류 2σ, DTC, 크래시, 텔레메트리<90%, NLP)'},{c:'pl-g',n:'Gov',d:'3-트랙: QM→FLC, A-B→SFRB, C-D→Safety Board+VFGB'}],
 desc:'통계적 유의성 + No-go boundary → Ring 확장. 비엔지니어링 팀 Release 토글 직접 제어 (Deploy 분리)',
 sp:['코호트별 실시간 모니터링 (Canary/Ring1~4/GA)','ML anomaly detection (Gaussian 2σ, Isolation Forest, NLP)','Go/No-Go 판정 (Safety Engineer 리뷰)','Ring 확장 실행 (0.1%→1%→5%→25%→50%→100%)','GA 선언 + SUMS/RXSWIN 최종화','FoD 과금 연결 + Connect App 노출','Release flag 90일 sunset 스케줄 등록'],
 actors:[{name:'Safety Engineer',p:true},{name:'Release Manager',p:true},{name:'Safety Board (C/D)',p:false}],
 gates:['텔레메트리 커버리지 ≥ 95%','미검토 High-severity alert 없음','Safety Engineer sign-off','KPI 충족: 오류율 ≤baseline+1σ, Safety DTC ≤baseline+0σ'],
 asil:{qm:{t:'24~48h/Ring',a:'자동 진행',n:'자동 모니터링+자동 Ring 확장'},ab:{t:'48~72h/Ring',a:'Safety Eng 리뷰',n:'Ring별 수동 Go/No-Go'},cd:{t:'1~2w Canary + Board×5',a:'Safety Board ①~⑤',n:'총 6~12주. Ring별 Board 게이트'}}
},
{n:'Operate',k:'운영 & FoD',ph:'Phase 4-5',phCls:'ph4',phSub:'Runtime',e2e:[7],
 act:'FoD 활성화 · Kill-switch · SafeMode 합성',
 tools1:['CIF','MQTT'],tools2:['FoD 결제','Kill-sw'],
 dataIn:['Entitlement','구독 정보'],dataOut:['FoD 상태','Kill-sw 로그'],
 planes:[{c:'pl-v',n:'Vehicle',d:'effective_decision=variant&&auth&&safe_mode&&flag_rule. Kill-switch 3-Level'},{c:'pl-c',n:'Control',d:'Permission 플래그 + Entitlement 동기화, FoD 결제-권한-활성화 일치'}],
 desc:'SafeMode 합성 규칙. Kill-switch 에스컬레이션: L1(COTA <5min)→L2(UCM 20-30min)→L3(딜러). 인시던트→5-Why RCA→처분',
 sp:['FoD 구독 확인 + 결제 처리','Permission flag 동기화 (Entitlement Bridge)','SafeMode 합성 규칙 적용','Kill-switch L1 실행 (COTA flag 비활성화 <5min)','Kill-switch L2 에스컬레이션 (UCM SW 롤백 20-30min)','Kill-switch L3 딜러 리플래시 (시간~일)','5-Why RCA → 플래그 처분 (Rework/Disable/Remove)'],
 actors:[{name:'OTA Operations',p:true},{name:'Safety Engineer',p:true},{name:'Safety Board (L2+)',p:false}],
 gates:['FoD 결제-권한-활성화 일치성 확인','Kill-switch 응답 시간 < 5min (L1)','인시던트 RCA 24시간 내 완료'],
 asil:{qm:{t:'L1만',a:'자동',n:'COTA flag 비활성화'},ab:{t:'L1+L2',a:'Safety Eng',n:'UCM 롤백 가능'},cd:{t:'L1+L2+L3',a:'Board',n:'딜러 리플래시 + Safety Board'}}
},
{n:'Monitor',k:'피드백 & 정리',ph:'Phase 5',phCls:'ph5',phSub:'Closure',e2e:[9,10],
 act:'DORA 5 KPI · Flag Hygiene · Cleanup 스프린트',
 tools1:['Telemetry','A/B Engine'],tools2:['Piranha','DORA'],
 dataIn:['Exposure event','텔레메트리'],dataOut:['KPI 대시보드','Stale 플래그 목록'],
 planes:[{c:'pl-q',n:'Quality',d:'DORA 5 + 자동차 특화 KPI 12개 = 총 17지표. Flag Debt 추적'},{c:'pl-g',n:'Gov',d:'Flag Hygiene: Piranha AST 자동정리, Time Bomb CI, 분기 Cleanup'}],
 desc:'Feedback Loop→Feature Catalog→다음 Sprint Phase 1 순환. TTL 만료→알림→코드 정리 or 영구 전환. 월간 Cleanup 참여 의무',
 sp:['DORA 5 메트릭 수집 (배포빈도, 리드타임, 변경실패율, 복구시간, 신뢰성)','자동차 특화 KPI 12개 산출','A/B 실험 결과 분석 + 코호트 상관 분석','Flag hygiene 점검 (owner 없는 flag, TTL 초과)','Dead flag 탐지 (Piranha AST 자동 코드 정리)','Time Bomb CI 실행 (만료 flag 빌드 실패)','분기 Cleanup sprint 실행','Feature Catalog 피드백 루프 → 다음 Sprint'],
 actors:[{name:'Platform Analytics',p:true},{name:'Feature Owner',p:false},{name:'QA',p:false}],
 gates:['Dead flag ratio < 5%','Cleanup sprint 완료','KPI 목표 달성','Release flag 90일 내 정리 or 영구 전환'],
 asil:{qm:{t:'공통',a:'자동',n:'전 등급 공통 모니터링'},ab:{t:'공통',a:'자동',n:'Safety DTC 추가 모니터링'},cd:{t:'공통',a:'자동',n:'Safety DTC + Board 리포트'}}
}
];

let sbpCur=0,sbpDtab='overview';

function sbpInit(){
  // E2E bar
  const e2eEl=document.getElementById('sbpE2e');
  e2eEl.innerHTML=SBP_E2E.map((s,i)=>`<div class="sbp-e2e-step" id="sbpE${i+1}">${i+1}. ${s}</div>`).join('');
  // Grid
  buildGrid();
  // Note
  document.getElementById('sbpNote').innerHTML=`<b>범례:</b> <span class="sbp-ph ph1">Phase 1</span> Identity <span class="sbp-ph ph2">Phase 2</span> Binding <span class="sbp-ph ph3">Phase 3</span> Delivery <span class="sbp-ph ph4">Phase 4</span> Decision <span class="sbp-ph ph5">Phase 5</span> Closure | <span class="sbp-plane sbp-pl-c">Control</span> <span class="sbp-plane sbp-pl-v">Vehicle</span> <span class="sbp-plane sbp-pl-g">Governance</span> <span class="sbp-plane sbp-pl-q">Quality</span> | <span class="sbp-tool">도구</span> <span class="sbp-data">데이터</span>`;
}

function buildGrid(){
  const g=document.getElementById('sbpGrid');
  let h='';
  // Headers
  h+='<div class="sbp-hdr" style="text-align:left;padding-left:4px"></div>';
  SBP.forEach((s,i)=>{h+=`<div class="sbp-hdr${i===0?' on':''}" onclick="sbpSelect(${i})" id="sbpH${i}"><span style="font-weight:500;color:var(--color-text-primary);font-size:10px;display:block">${s.n}</span></div>`;});
  // Phase row
  h+='<div class="sbp-sect">DevOps stage & FF phase mapping</div>';
  h+='<div class="sbp-rl">Phase</div>';
  SBP.forEach((s,i)=>{h+=`<div class="sbp-cell${i===0?' hl':''}" data-col="${i}" onclick="sbpSelect(${i})"><span class="sbp-ph ${s.phCls}">${s.ph}</span><br>${s.phSub}</div>`;});
  // Activity
  h+='<div class="sbp-rl">Activity</div>';
  SBP.forEach((s,i)=>{h+=`<div class="sbp-cell${i===0?' hl':''}" data-col="${i}" onclick="sbpSelect(${i})">${s.act}</div>`;});
  // Tools
  h+='<div class="sbp-sect">Toolchain</div>';
  h+='<div class="sbp-rl">Primary</div>';
  SBP.forEach((s,i)=>{h+=`<div class="sbp-cell${i===0?' hl':''}" data-col="${i}" onclick="sbpSelect(${i})">${s.tools1.map(t=>`<span class="sbp-tool">${t}</span>`).join('')}</div>`;});
  h+='<div class="sbp-rl">Secondary</div>';
  SBP.forEach((s,i)=>{h+=`<div class="sbp-cell${i===0?' hl':''}" data-col="${i}" onclick="sbpSelect(${i})">${s.tools2.map(t=>`<span class="sbp-tool">${t}</span>`).join('')}</div>`;});
  // Data
  h+='<div class="sbp-sect">FF data objects (input → output)</div>';
  h+='<div class="sbp-rl">Input</div>';
  SBP.forEach((s,i)=>{h+=`<div class="sbp-cell${i===0?' hl':''}" data-col="${i}" onclick="sbpSelect(${i})">${s.dataIn.map(d=>`<span class="sbp-data">${d}</span>`).join('')}</div>`;});
  h+='<div class="sbp-rl">Output</div>';
  SBP.forEach((s,i)=>{h+=`<div class="sbp-cell${i===0?' hl':''}" data-col="${i}" onclick="sbpSelect(${i})">${s.dataOut.map(d=>`<span class="sbp-data">${d}</span>`).join('')}</div>`;});
  // Planes
  h+='<div class="sbp-sect">4-Plane engagement</div>';
  h+='<div class="sbp-rl">Planes</div>';
  SBP.forEach((s,i)=>{h+=`<div class="sbp-cell${i===0?' hl':''}" data-col="${i}" onclick="sbpSelect(${i})">${s.planes.map(p=>`<span class="sbp-plane sbp-${p.c}">${p.n}</span> ${p.d}`).join('<br>')}</div>`;});
  // Cross-cutting
  h+='<div class="sbp-sect">Governance guardrails (cross-cutting)</div>';
  h+='<div class="sbp-rl">Rules</div>';
  h+='<div class="sbp-cell" style="grid-column:span 4"><b style="color:var(--color-text-primary);font-size:9px">SafeMode 합성:</b> effective_decision = variant_coding(can_exist) && auth(authorized) && safe_mode(not_restricted) && flag_rule(should_expose_now)</div>';
  h+='<div class="sbp-cell" style="grid-column:span 4"><b style="color:var(--color-text-primary);font-size:9px">No-go 4원칙:</b> 안전 직접 토글 금지 · SafeMode 우회 금지 · Owner/TTL 없는 플래그 금지 · 도메인 간 상태 불일치 금지</div>';
  // Flag types
  h+='<div class="sbp-rl">Flag types</div>';
  h+='<div class="sbp-cell" style="grid-column:span 8;display:flex;flex-wrap:wrap;gap:3px;align-items:center"><span class="sbp-plane sbp-pl-c">Release 90d</span><span class="sbp-plane sbp-pl-v">Ops 30d</span><span class="sbp-plane sbp-pl-q">Experiment 45d</span><span class="sbp-plane sbp-pl-c">Permission 180d</span><span class="sbp-plane sbp-pl-g">Safety 30d</span><span class="sbp-plane sbp-pl-q">Shadow 60d</span><span style="font-size:8px;color:var(--color-text-tertiary);margin-left:4px">← 6종 + 기본 TTL</span></div>';
  // Feedback
  h+='<div class="sbp-fb"><b>↻ Feedback loop:</b> Monitor → Plan (Exposure 분석 → Feature Catalog → 다음 Sprint Phase 1) | <b>Deploy ≠ Release</b> | <b>Package ≠ Activation</b></div>';
  g.innerHTML=h;
}

function sbpSelect(i){
  sbpCur=i;sbpDtab='overview';
  // Highlight column
  document.querySelectorAll('.sbp-hdr').forEach((h,j)=>{if(j>0) h.classList.toggle('on',j-1===i);});
  document.querySelectorAll('.sbp-cell[data-col]').forEach(c=>{c.classList.toggle('hl',parseInt(c.dataset.col)===i);});
  // E2E highlight
  document.querySelectorAll('.sbp-e2e-step').forEach(e=>e.classList.remove('on'));
  SBP[i].e2e.forEach(n=>{const el=document.getElementById('sbpE'+n);if(el)el.classList.add('on');});
  // Show detail
  sbpShowDetail(i);
}

function sbpSwitchTab(tab){sbpDtab=tab;sbpShowDetail(sbpCur);}

function sbpShowDetail(i){
  const s=SBP[i],d=document.getElementById('sbpDetail');
  d.classList.add('on');
  const tabs=['overview','process','gate'];
  const labels={overview:'Overview',process:'Sub-Process & Actors',gate:'Gate & ASIL'};
  let tabH='<div class="sbp-dtabs">'+tabs.map(t=>`<div class="sbp-dtab${sbpDtab===t?' on':''}" onclick="sbpSwitchTab('${t}')">${labels[t]}</div>`).join('')+'</div>';

  let head=`<div class="sbp-d-head"><span class="sbp-ph ${s.phCls}">${s.ph}</span><div class="sbp-d-title">${s.n} — ${s.k}</div></div><div class="sbp-d-desc">${s.desc}</div>`;

  // Overview
  let plH=s.planes.map(p=>`<div class="sbp-d-plane sbp-${p.c}"><b>${p.n}</b>${p.d}</div>`).join('');
  let overH=`<div class="sbp-dpnl${sbpDtab==='overview'?' on':''}"><div class="sbp-d-grid"><div class="sbp-d-box"><div class="sbp-d-box-h">도구</div>${[...s.tools1,...s.tools2].map(t=>`<span class="sbp-tool">${t}</span>`).join(' ')}</div><div class="sbp-d-box"><div class="sbp-d-box-h">데이터 I/O</div><div style="margin-bottom:4px">${s.dataIn.map(d=>`<span class="sbp-data">→ ${d}</span>`).join(' ')}</div><div>${s.dataOut.map(d=>`<span class="sbp-data" style="border-color:#5DCAA5;color:#085041;background:#E1F5EE">${d} →</span>`).join(' ')}</div></div><div class="sbp-d-box"><div class="sbp-d-box-h">4-Plane</div>${plH}</div><div class="sbp-d-box"><div class="sbp-d-box-h">E2E Step 매핑</div><div style="font-size:10px">${s.e2e.map(n=>`<b>Step ${n}</b> ${SBP_E2E[n-1]}`).join(' · ')}</div></div></div></div>`;

  // Process
  let spH='<div class="sbp-sp">'+s.sp.map(x=>`<div class="sbp-sp-item"><div class="sbp-sp-num"></div><div style="flex:1">${x}</div></div>`).join('')+'</div>';
  let actH='<div style="margin-top:8px"><div class="sbp-d-box-h">담당 역할</div><div class="sbp-actors">'+s.actors.map(a=>`<div class="sbp-actor${a.p?' primary':''}">${a.p?'◆':'○'} ${a.name}</div>`).join('')+'</div></div>';
  let procH=`<div class="sbp-dpnl${sbpDtab==='process'?' on':''}">${spH}${actH}</div>`;

  // Gate & ASIL
  let gateH=`<div class="sbp-gate"><div class="sbp-gate-h">☑ Gate 조건</div><ul class="sbp-gate-list">${s.gates.map(g=>`<li>${g}</li>`).join('')}</ul></div>`;
  let asilH=`<table class="sbp-asil"><tr><th></th><th>QM</th><th>ASIL A-B</th><th>ASIL C-D</th></tr><tr><td style="font-weight:600">소요시간</td><td>${s.asil.qm.t}</td><td>${s.asil.ab.t}</td><td style="color:#a94442;font-weight:500">${s.asil.cd.t}</td></tr><tr><td style="font-weight:600">승인자</td><td>${s.asil.qm.a}</td><td>${s.asil.ab.a}</td><td>${s.asil.cd.a}</td></tr><tr><td style="font-weight:600">특이사항</td><td>${s.asil.qm.n}</td><td>${s.asil.ab.n}</td><td>${s.asil.cd.n}</td></tr></table>`;
  let gatePanel=`<div class="sbp-dpnl${sbpDtab==='gate'?' on':''}">${gateH}<div style="margin-top:6px"><div class="sbp-d-box-h">ASIL 등급별 분기</div>${asilH}</div></div>`;

  d.innerHTML=head+tabH+overH+procH+gatePanel;
}

sbpInit();sbpSelect(0);