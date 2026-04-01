(function(){
/* ============================================================
   DATA: E2E Steps
   ============================================================ */
const E2E_STEPS = [
  {id:'S1', label:'Feature\nRequest'},
  {id:'S2', label:'Flag Spec\nYAML'},
  {id:'S3', label:'CI/CD\nBuild'},
  {id:'S4', label:'Policy\nPublish'},
  {id:'S5', label:'Edge\nSync'},
  {id:'S6', label:'Vehicle\nDeliver'},
  {id:'S7', label:'Evaluate\n& Apply'},
  {id:'S8', label:'Exposure\nEvent'},
  {id:'S9', label:'Guardrail\nCheck'},
  {id:'S10',label:'Ring\nPromote'}
];

/* ============================================================
   DATA: Tiers  (Depth 1)
   ============================================================ */
const TIERS = [
  {
    id:'cloud', name:'Cloud — Policy + Campaign', badge:'Tier 1', badgeClass:'arch2-badge-cloud',
    sub:'Ch.11-12 · OpenFeature backend · Campaign engine',
    arrow:'↓ SSE / MQTT / gRPC ↓',
    planes:[
      {plane:'Control', cls:'arch2-plane-ctrl', icon:'⚙', desc:'Feature catalog, policy engine, targeting, campaign & A/B management',
       components:[
         {name:'OpenFeature Backend', desc:'Server-side flag evaluation compliant with OpenFeature spec. Provides evaluation API, bulk-evaluation, and flag metadata endpoints.',
          e2e:['S4','S5'], dataIn:['Flag Spec YAML (CI/CD)','Targeting rules (Admin)'], dataOut:['Evaluation result (Edge)','SSE stream (Vehicle)'],
          protocol:'gRPC + REST + SSE', asil:[{level:'QM',scope:'All cloud components',measure:'Standard SRE practices'}]},
         {name:'Policy Engine', desc:'Rule evaluation engine: user/vehicle attributes → targeting predicates → boolean/multivariate result.',
          e2e:['S4'], dataIn:['Targeting rules','Vehicle context (VIN, trim, region, HW)'], dataOut:['Evaluated flag value'],
          protocol:'Internal gRPC', asil:[{level:'QM',scope:'Policy logic',measure:'Unit + integration tests'}]},
         {name:'Campaign Engine', desc:'Manages staged rollout campaigns: ring assignment, scheduling, canary %, go/no-go gates.',
          e2e:['S4','S10'], dataIn:['Campaign config','Guardrail KPI'], dataOut:['Ring assignment','Rollout %'],
          protocol:'REST API', asil:[{level:'QM',scope:'Rollout orchestration',measure:'Approval workflow + guardrail gates'}]},
         {name:'A/B Engine', desc:'Experiment allocation with deterministic hashing. Statistical significance calculation and variant assignment.',
          e2e:['S4','S9','S10'], dataIn:['Experiment config','Exposure events'], dataOut:['Variant assignment','Significance report'],
          protocol:'REST + SSE', asil:[{level:'QM',scope:'Experiment logic',measure:'Hash determinism tests'}]},
         {name:'Targeting Service', desc:'Resolves targeting predicates: VIN, Trim, Region, HW capability, subscription tier.',
          e2e:['S4'], dataIn:['Vehicle identity','Subscription data'], dataOut:['Targeting match boolean'],
          protocol:'gRPC', asil:[{level:'QM',scope:'Targeting',measure:'Predicate unit tests'}]}
       ]},
      {plane:'Vehicle', cls:'arch2-plane-veh', icon:'🚗', desc:'N/A at cloud tier — vehicle context consumed, not hosted',
       components:[]},
      {plane:'Governance', cls:'arch2-plane-gov', icon:'🛡', desc:'RBAC, 4-eyes approval, audit trail, RXSWIN gate, ASPICE traceability',
       components:[
         {name:'Admin Console', desc:'Web UI for flag CRUD, campaign management, approval workflow, audit log viewing.',
          e2e:['S2','S4'], dataIn:['User input','Flag metadata'], dataOut:['Flag spec YAML','Approval request'],
          protocol:'HTTPS (SPA)', asil:[{level:'QM',scope:'UI',measure:'E2E UI tests + RBAC enforcement'}]},
         {name:'RBAC Gateway', desc:'Role-Based Access Control: owner, reviewer, approver, SRE roles. 4-eyes principle enforced on safety-guarded flags.',
          e2e:['S2','S4'], dataIn:['User identity (SSO)','Role mapping'], dataOut:['Authorization decision'],
          protocol:'OAuth2 / OIDC', asil:[{level:'QM',scope:'Access control',measure:'4-eyes audit + role matrix tests'}]},
         {name:'Audit Trail', desc:'Immutable log of all flag changes, approvals, deployments, and kill-switch activations.',
          e2e:['S4','S9'], dataIn:['All mutation events'], dataOut:['Audit records (tamper-evident)'],
          protocol:'Event streaming (Kafka)', asil:[{level:'QM',scope:'Audit',measure:'Immutability verification'}]},
         {name:'RXSWIN Gate', desc:'Regulatory gate: checks RXSWIN classification before allowing safety-relevant flag changes.',
          e2e:['S2','S3'], dataIn:['Flag ASIL class','RXSWIN registry'], dataOut:['Gate pass/fail'],
          protocol:'REST', asil:[{level:'ASIL B',scope:'Regulatory compliance',measure:'RXSWIN registry cross-check'}]}
       ]},
      {plane:'Quality', cls:'arch2-plane-qual', icon:'📊', desc:'Guardrail KPI, ML anomaly detection (2σ), ring go/no-go, statistical significance',
       components:[
         {name:'Guardrail Monitor', desc:'Real-time KPI monitoring: crash rate, latency P99, error rate. Triggers auto-rollback on 2σ anomaly.',
          e2e:['S9','S10'], dataIn:['Telemetry stream','KPI thresholds'], dataOut:['Anomaly alert','Auto-rollback trigger'],
          protocol:'Kafka + Prometheus', asil:[{level:'QM',scope:'Monitoring',measure:'Anomaly detection validation'}]},
         {name:'Ring Go/No-Go', desc:'Automated promotion gate: checks guardrail pass, minimum exposure count, statistical significance before ring advance.',
          e2e:['S10'], dataIn:['Guardrail status','Exposure count','Significance'], dataOut:['Promotion decision'],
          protocol:'Internal API', asil:[{level:'QM',scope:'Rollout gate',measure:'Gate criteria audit'}]}
       ]}
    ]
  },
  {
    id:'edge', name:'Edge — Cache + Proxy', badge:'Tier 2', badgeClass:'arch2-badge-edge',
    sub:'Ch.12 · Regional proxy (KR/NA/EU/CN) · Policy cache',
    arrow:'↓ COTA (config, SSE) / SOTA (binary, Uptane) ↓',
    planes:[
      {plane:'Control', cls:'arch2-plane-ctrl', icon:'⚙', desc:'Policy cache (Redis/embedded), TTL management, edge routing',
       components:[
         {name:'Edge Proxy (Rust)', desc:'High-performance proxy in each region. Receives SSE from cloud, caches policy snapshots, serves vehicle requests with <50ms P99.',
          e2e:['S5','S6'], dataIn:['SSE policy stream (Cloud)','Vehicle eval request'], dataOut:['Cached evaluation result'],
          protocol:'SSE inbound / gRPC outbound', asil:[{level:'QM',scope:'Edge proxy',measure:'Latency SLO tests + chaos testing'}]},
         {name:'Policy Cache', desc:'Redis/embedded KV store holding current policy snapshot per region. TTL-managed, invalidation on cloud push.',
          e2e:['S5'], dataIn:['Policy snapshot (Cloud SSE)'], dataOut:['Cached policy (Edge Proxy)'],
          protocol:'Redis protocol / embedded', asil:[{level:'QM',scope:'Cache layer',measure:'Cache hit ratio monitoring'}]}
       ]},
      {plane:'Vehicle', cls:'arch2-plane-veh', icon:'🚗', desc:'N/A at edge tier',
       components:[]},
      {plane:'Governance', cls:'arch2-plane-gov', icon:'🛡', desc:'Cache invalidation policy, edge-to-cloud sync rules',
       components:[
         {name:'Cache Invalidation', desc:'Policy-driven cache eviction: TTL expiry, forced invalidation on kill-switch, region-specific purge.',
          e2e:['S5'], dataIn:['TTL config','Kill-switch signal'], dataOut:['Cache purge event'],
          protocol:'Internal', asil:[{level:'QM',scope:'Cache policy',measure:'Invalidation correctness tests'}]}
       ]},
      {plane:'Quality', cls:'arch2-plane-qual', icon:'📊', desc:'Cache hit ratio, latency SLO, cloud disconnect resilience',
       components:[
         {name:'Edge Health Monitor', desc:'Tracks cache hit ratio (target >99%), latency P99 (<50ms), cloud connectivity status. Failover to stale cache on disconnect.',
          e2e:['S5','S9'], dataIn:['Request metrics','Cloud health'], dataOut:['Health status','Failover trigger'],
          protocol:'Prometheus metrics', asil:[{level:'QM',scope:'Edge health',measure:'SLO compliance dashboard'}]}
       ]}
    ]
  },
  {
    id:'vehicle', name:'Vehicle — FF SDK + Evaluator', badge:'Tier 3', badgeClass:'arch2-badge-vehicle',
    sub:'Ch.11, 13-15 · HPVC / Domain HPC · ara::com / ccOS / 42dot',
    arrow:'↓ Toggle point apply (IPC / ara::com) ↓',
    planes:[
      {plane:'Control', cls:'arch2-plane-ctrl', icon:'⚙', desc:'FF Evaluator on HPVC/HPC, policy local cache, NVRAM persistent default',
       components:[
         {name:'FF Evaluator', desc:'On-vehicle flag evaluation engine. Runs on HPVC or domain HPC. Local policy cache + NVRAM fallback. Deterministic evaluation.',
          e2e:['S6','S7'], dataIn:['Policy snapshot (Edge/Cloud)','Vehicle context'], dataOut:['Flag evaluation result (ECU)'],
          protocol:'ara::com (SOME/IP) / DDS', asil:[{level:'ASIL B',scope:'Evaluator core',measure:'MC/DC coverage for safety-guarded paths'},{level:'QM',scope:'Non-safety paths',measure:'Statement coverage'}]},
         {name:'NVRAM Cache', desc:'Non-volatile storage for last-known-good flag values. Fail-safe Level 3: survives power cycle, provides offline defaults.',
          e2e:['S6','S7'], dataIn:['Evaluated flag values'], dataOut:['Persisted defaults (on power cycle)'],
          protocol:'NVM block read/write', asil:[{level:'ASIL B',scope:'NVRAM integrity',measure:'CRC32 + dual-copy verification'}]},
         {name:'COTA Client', desc:'Configuration Over-The-Air receiver. Real-time config delivery via SSE/MQTT. Distinct from SOTA (binary update).',
          e2e:['S6'], dataIn:['Config payload (Cloud/Edge SSE)'], dataOut:['Policy update event (Evaluator)'],
          protocol:'SSE / MQTT', asil:[{level:'QM',scope:'Config delivery',measure:'Payload integrity check (SHA-256)'}]}
       ]},
      {plane:'Vehicle', cls:'arch2-plane-veh', icon:'🚗', desc:'FF SDK (Mobilgene ara::com / ccOS / 42dot), SafeMode synthesis, variant coding baseline ref',
       components:[
         {name:'FF SDK', desc:'Feature Flag SDK integrated into vehicle middleware. Provides getFlag() API. Abstracts evaluator access for application SWCs.',
          e2e:['S7'], dataIn:['Flag query (App SWC)','Evaluator result'], dataOut:['Flag value to application'],
          protocol:'ara::com service interface', asil:[{level:'ASIL B',scope:'SDK API for safety flags',measure:'Interface contract tests'},{level:'QM',scope:'Non-safety API',measure:'Unit tests'}]},
         {name:'SafeMode Guard', desc:'Synthesizes effective flag decision: variant_coding AND auth AND safe_mode AND flag_rule. Blocks unsafe combinations.',
          e2e:['S7'], dataIn:['Variant coding baseline','Auth status','SafeMode state','Flag rule result'], dataOut:['Effective decision (allow/block)'],
          protocol:'Internal (same process)', asil:[{level:'ASIL B',scope:'SafeMode logic',measure:'Formal verification of decision table'}]},
         {name:'Uptane Client', desc:'SOTA binary update client (Uptane-compliant). Handles ECU image delivery. Package != Activation (separated).',
          e2e:['S6'], dataIn:['Signed image (Cloud OTA)'], dataOut:['ECU image (UCM)'],
          protocol:'Uptane + TLS', asil:[{level:'ASIL B',scope:'Image delivery',measure:'Uptane metadata verification'}]}
       ]},
      {plane:'Governance', cls:'arch2-plane-gov', icon:'🛡', desc:'Flag metadata local store, owner/TTL/type validation',
       components:[
         {name:'Flag Metadata Store', desc:'Local copy of flag metadata: owner, type, TTL, ASIL class. Validates flag freshness and ownership before evaluation.',
          e2e:['S6','S7'], dataIn:['Metadata sync (Cloud)'], dataOut:['Validation result (Evaluator)'],
          protocol:'Local DB / file', asil:[{level:'QM',scope:'Metadata mgmt',measure:'Sync integrity tests'}]}
       ]},
      {plane:'Quality', cls:'arch2-plane-qual', icon:'📊', desc:'Exposure event buffer, async telemetry upload',
       components:[
         {name:'Exposure Logger', desc:'Buffers exposure events (flag evaluated + value + context) locally. Async upload to cloud telemetry on connectivity.',
          e2e:['S8','S9'], dataIn:['Evaluation events (Evaluator)'], dataOut:['Exposure batch (Cloud CIF)'],
          protocol:'MQTT / HTTP batch', asil:[{level:'QM',scope:'Telemetry',measure:'Event delivery guarantee (at-least-once)'}]}
       ]}
    ]
  },
  {
    id:'ecu', name:'ECU — Toggle Point + Execution', badge:'Tier 4', badgeClass:'arch2-badge-ecu',
    sub:'Ch.13-14 · Domain ECU / Zone Controller · AUTOSAR BSW',
    arrow:null,
    planes:[
      {plane:'Control', cls:'arch2-plane-ctrl', icon:'⚙', desc:'Eval point + apply point separation, latch-at-init pattern',
       components:[
         {name:'Toggle Point', desc:'Code location where flag value is consumed. Eval-point reads flag; Apply-point activates behavior. Separated for determinism.',
          e2e:['S7'], dataIn:['Flag value (FF SDK)'], dataOut:['Behavior branch selection'],
          protocol:'Function call (C/C++)', asil:[{level:'ASIL C-D',scope:'Safety-critical toggle points',measure:'MC/DC coverage + dual-channel for ASIL D'},{level:'QM',scope:'Comfort features',measure:'Statement coverage'}]},
         {name:'Latch-at-Init', desc:'Flag value latched at ECU initialization. Immutable during driving cycle. Prevents mid-drive behavior change for safety consistency.',
          e2e:['S7'], dataIn:['Flag value at init'], dataOut:['Latched constant (entire drive cycle)'],
          protocol:'Init sequence hook', asil:[{level:'ASIL B-D',scope:'Latch mechanism',measure:'Power cycle + fault injection tests'}]}
       ]},
      {plane:'Vehicle', cls:'arch2-plane-veh', icon:'🚗', desc:'Domain ECU / Zone Controller, AUTOSAR BSW NVM module',
       components:[
         {name:'AUTOSAR NVM', desc:'BSW NVM module storing flag defaults in ECU flash. Hardcoded fail-safe Level 4. Updated only via SOTA (Uptane).',
          e2e:['S6','S7'], dataIn:['Image update (Uptane)'], dataOut:['Flag default values'],
          protocol:'AUTOSAR NvM API', asil:[{level:'ASIL D',scope:'NVM data integrity',measure:'ECC + redundant storage blocks'}]}
       ]},
      {plane:'Governance', cls:'arch2-plane-gov', icon:'🛡', desc:'ASIL-level access control, dual-channel for ASIL C-D',
       components:[
         {name:'Dual-Channel Voter', desc:'For ASIL C-D flags: independent Channel A + Channel B evaluate flag. Voter compares results. Mismatch → safe default.',
          e2e:['S7'], dataIn:['Ch.A result','Ch.B result'], dataOut:['Voted decision or safe default'],
          protocol:'HW-assisted voter', asil:[{level:'ASIL D',scope:'Dual-channel voting',measure:'Common cause analysis + diversity metrics'}]},
         {name:'ASIL Access Control', desc:'Restricts flag access by ASIL level. ASIL C-D flags require privileged partition. QM apps cannot read safety flags directly.',
          e2e:['S7'], dataIn:['Access request + ASIL level'], dataOut:['Grant/deny'],
          protocol:'MPU / partition config', asil:[{level:'ASIL B-D',scope:'Access isolation',measure:'Partition boundary tests'}]}
       ]},
      {plane:'Quality', cls:'arch2-plane-qual', icon:'📊', desc:'DTC logging, fault injection, MC/DC coverage (ASIL C-D)',
       components:[
         {name:'DTC Logger', desc:'Diagnostic Trouble Code logger. Records flag evaluation failures, voter mismatches, latch errors as DTCs for dealer diagnostics.',
          e2e:['S8','S9'], dataIn:['Error events'], dataOut:['DTC records (UDS)'],
          protocol:'UDS (ISO 14229)', asil:[{level:'ASIL B',scope:'DTC recording',measure:'DTC coverage matrix'}]},
         {name:'Fault Injector', desc:'Test harness for injecting flag faults: stuck-at, bit-flip, timeout. Validates fail-safe paths during HIL/SIL testing.',
          e2e:['S9'], dataIn:['Fault scenario config'], dataOut:['Fault response log'],
          protocol:'XCP / test API', asil:[{level:'QM',scope:'Test tooling',measure:'Fault scenario coverage'}]}
       ]}
    ]
  }
];

/* ============================================================
   DATA: Cross-cutting
   ============================================================ */
const PRINCIPLES = [
  'Fail-safe by default — every flag has a safe fallback at compile time',
  'Offline evaluation — vehicle evaluates locally; cloud is optional at runtime',
  'Deterministic behavior — same input → same output, no randomness in safety paths',
  'ASIL-proportional rigor — QM: unit test, ASIL B: MC/DC partial, ASIL D: dual-channel + voter',
  'Exposure event mandatory — every evaluation emits a telemetry event',
  'Time-bounded (TTL) — every flag has a TTL; stale = revert to default',
  'Safety ≠ Feature separation — safety-guarded flags are a distinct type with extra gates'
];

const FLAG_TYPES = [
  {type:'Release', ttl:'90d', desc:'Long-lived feature gate'},
  {type:'Ops', ttl:'30d', desc:'Operational toggle (maintenance, incident)'},
  {type:'Experiment', ttl:'45d', desc:'A/B test variant assignment'},
  {type:'Permission', ttl:'180d', desc:'Entitlement / FoD subscription'},
  {type:'Safety-guarded', ttl:'30d', desc:'ASIL-classified, extra approval'},
  {type:'Shadow', ttl:'60d', desc:'Dark-launch, no user-visible effect'}
];

const INTERFACES = [
  {name:'ALM', desc:'Codebeamer → Flag Spec YAML trigger'},
  {name:'CI/CD', desc:'Build pipeline flag injection + gate'},
  {name:'OTA', desc:'COTA (config) + SOTA (binary, Uptane)'},
  {name:'ECU', desc:'ara::com / AUTOSAR NvM integration'},
  {name:'Telemetry', desc:'CIF exposure event + vehicle health'},
  {name:'A/B', desc:'Experiment allocation + significance'},
  {name:'Safety', desc:'ASIL classification + RXSWIN gate'},
  {name:'VCDM', desc:'Variant coding baseline reference'},
  {name:'Customer', desc:'FoD / Connect App / Dealer'}
];

const NOGO_RULES = [
  'Direct safety-function toggle — never use FF to enable/disable a safety function directly',
  'SafeMode bypass — no code path may skip SafeMode synthesis check',
  'Ownerless flag — every flag must have a designated owner with TTL',
  'Cross-domain inconsistency — same flag must resolve identically across all ECUs in same drive cycle'
];

/* ============================================================
   RENDER: E2E Bar
   ============================================================ */
function renderE2eBar(){
  const bar = document.getElementById('arch2E2eBar');
  bar.innerHTML = E2E_STEPS.map(s =>
    `<div class="arch2-e2e-step" data-step="${s.id}"><span class="arch2-step-num">${s.id}</span>${s.label.replace('\n','<br>')}</div>`
  ).join('');
}

/* ============================================================
   RENDER: Tiers (Depth 1 + Depth 2 + Depth 3 wiring)
   ============================================================ */
function renderTiers(){
  const container = document.getElementById('arch2TierContainer');
  let html = '';
  TIERS.forEach((tier, ti) => {
    html += `<div class="arch2-tier" id="arch2Tier_${tier.id}" onclick="arch2ToggleTier('${tier.id}')">`;
    html += `<div class="arch2-tier-header"><div class="arch2-tier-left"><span class="arch2-tier-badge ${tier.badgeClass}">${tier.badge}</span><span class="arch2-tier-name">${tier.name}</span></div><div><span class="arch2-tier-sub">${tier.sub}</span> <span class="arch2-tier-chevron">▶</span></div></div>`;
    // Depth 2
    html += `<div class="arch2-depth2">`;
    html += `<div class="arch2-plane-grid">`;
    tier.planes.forEach(p => {
      html += `<div class="arch2-plane-card ${p.cls}">`;
      html += `<div class="arch2-plane-title"><span class="arch2-plane-icon">${p.icon}</span>${p.plane}</div>`;
      html += `<div class="arch2-plane-desc">${p.desc}</div>`;
      if(p.components.length){
        html += `<div class="arch2-chip-row">`;
        p.components.forEach(c => {
          const cid = `${tier.id}_${c.name.replace(/[^a-zA-Z0-9]/g,'_')}`;
          html += `<span class="arch2-chip" data-cid="${cid}" onclick="event.stopPropagation();arch2ShowDetail('${tier.id}','${cid}')">${c.name}</span>`;
        });
        html += `</div>`;
      } else {
        html += `<div style="font-size:9px;opacity:.5;margin-top:3px">— N/A at this tier —</div>`;
      }
      html += `</div>`;
    });
    html += `</div>`; // plane-grid
    // Detail panel placeholder
    html += `<div class="arch2-detail-panel" id="arch2Detail_${tier.id}"></div>`;
    html += `</div>`; // depth2
    html += `</div>`; // tier
    if(tier.arrow){
      html += `<div class="arch2-arrow">${tier.arrow}</div>`;
    }
  });
  container.innerHTML = html;
}

/* ============================================================
   RENDER: Cross-cutting
   ============================================================ */
function renderCrossCut(){
  const el = document.getElementById('arch2CrossCut');
  let html = '<div class="arch2-xcut-grid">';
  // Principles
  html += '<div class="arch2-xcut-box"><b>7 Principles (Ch.11)</b>';
  PRINCIPLES.forEach(p => { html += `<div class="arch2-xcut-item">${p}</div>`; });
  html += '</div>';
  // Flag types
  html += '<div class="arch2-xcut-box"><b>6 Flag Types + TTL (Ch.11)</b>';
  html += '<div class="arch2-tag-row">';
  FLAG_TYPES.forEach(f => { html += `<span class="arch2-flag-tag" title="${f.desc}">${f.type} ${f.ttl}</span>`; });
  html += '</div>';
  // Interfaces
  html += '<div style="margin-top:8px"><b style="font-size:10px">9 Interfaces (Ch.16)</b></div>';
  html += '<div class="arch2-tag-row" style="margin-top:3px">';
  INTERFACES.forEach(i => { html += `<span class="arch2-intf-tag" title="${i.desc}">${i.name}</span>`; });
  html += '</div></div>';
  html += '</div>'; // grid row 1

  // Row 2: No-go rules
  html += '<div class="arch2-xcut-grid" style="margin-top:6px">';
  html += '<div class="arch2-xcut-box" style="grid-column:span 2"><b>4 No-Go Rules (Ch.11)</b>';
  NOGO_RULES.forEach(r => { html += `<div class="arch2-xcut-item arch2-nogo">🚫 ${r}</div>`; });
  html += '</div></div>';

  el.innerHTML = html;
}

/* ============================================================
   INTERACTION: Tier toggle (Depth 1 → Depth 2)
   ============================================================ */
window.arch2ToggleTier = function(tierId){
  const el = document.getElementById('arch2Tier_'+tierId);
  const wasOpen = el.classList.contains('arch2-tier-open');
  // close all
  document.querySelectorAll('.arch2-tier').forEach(t => {
    t.classList.remove('arch2-tier-open');
    const dp = t.querySelector('.arch2-detail-panel');
    if(dp){dp.classList.remove('arch2-detail-open');dp.innerHTML='';}
    t.querySelectorAll('.arch2-chip').forEach(c=>c.classList.remove('arch2-chip-active'));
  });
  if(!wasOpen) el.classList.add('arch2-tier-open');
  clearE2eHighlight();
};

/* ============================================================
   INTERACTION: Component detail (Depth 2 → Depth 3)
   ============================================================ */
window.arch2ShowDetail = function(tierId, cid){
  const tier = TIERS.find(t=>t.id===tierId);
  if(!tier) return;
  let comp = null;
  for(const p of tier.planes){
    for(const c of p.components){
      if(`${tierId}_${c.name.replace(/[^a-zA-Z0-9]/g,'_')}`===cid){ comp=c; break; }
    }
    if(comp) break;
  }
  if(!comp) return;
  // highlight chip
  const tierEl = document.getElementById('arch2Tier_'+tierId);
  tierEl.querySelectorAll('.arch2-chip').forEach(c=>c.classList.remove('arch2-chip-active'));
  tierEl.querySelector(`[data-cid="${cid}"]`).classList.add('arch2-chip-active');
  // highlight E2E steps
  highlightE2e(comp.e2e);
  // render detail
  const panel = document.getElementById('arch2Detail_'+tierId);
  let h = `<div class="arch2-detail-title">${comp.name}<span class="arch2-detail-close" onclick="event.stopPropagation();arch2CloseDetail('${tierId}')">✕</span></div>`;
  h += `<div class="arch2-detail-desc">${comp.desc}</div>`;
  // E2E steps
  h += `<div class="arch2-detail-section"><div class="arch2-detail-section-title">E2E Steps</div><div class="arch2-detail-e2e-steps">`;
  comp.e2e.forEach(s => {
    const step = E2E_STEPS.find(x=>x.id===s);
    h += `<span class="arch2-detail-e2e-tag">${s}: ${step?step.label.replace('\n',' '):''}</span>`;
  });
  h += `</div></div>`;
  // Data I/O
  h += `<div class="arch2-detail-section"><div class="arch2-detail-section-title">Data I/O</div><div class="arch2-detail-io">`;
  h += `<div class="arch2-detail-io-box"><b>↓ Input</b>`;
  comp.dataIn.forEach(d => { h += `<div style="font-size:9px">• ${d}</div>`; });
  h += `</div><div class="arch2-detail-io-box"><b>↑ Output</b>`;
  comp.dataOut.forEach(d => { h += `<div style="font-size:9px">• ${d}</div>`; });
  h += `</div></div></div>`;
  // Protocol
  h += `<div class="arch2-detail-section"><div class="arch2-detail-section-title">Protocol</div><div style="font-size:10px">${comp.protocol}</div></div>`;
  // ASIL table
  h += `<div class="arch2-detail-section"><div class="arch2-detail-section-title">ASIL Classification</div>`;
  h += `<table class="arch2-detail-table"><tr><th>Level</th><th>Scope</th><th>Measure</th></tr>`;
  comp.asil.forEach(a => { h += `<tr><td><b>${a.level}</b></td><td>${a.scope}</td><td>${a.measure}</td></tr>`; });
  h += `</table></div>`;

  panel.innerHTML = h;
  panel.classList.add('arch2-detail-open');
};

window.arch2CloseDetail = function(tierId){
  const panel = document.getElementById('arch2Detail_'+tierId);
  panel.classList.remove('arch2-detail-open');
  panel.innerHTML = '';
  const tierEl = document.getElementById('arch2Tier_'+tierId);
  tierEl.querySelectorAll('.arch2-chip').forEach(c=>c.classList.remove('arch2-chip-active'));
  clearE2eHighlight();
};

/* ============================================================
   E2E highlight helpers
   ============================================================ */
function highlightE2e(steps){
  clearE2eHighlight();
  steps.forEach(s => {
    const el = document.querySelector(`.arch2-e2e-step[data-step="${s}"]`);
    if(el) el.classList.add('arch2-e2e-active');
  });
}
function clearE2eHighlight(){
  document.querySelectorAll('.arch2-e2e-step').forEach(e=>e.classList.remove('arch2-e2e-active'));
}

/* ============================================================
   INIT
   ============================================================ */
renderE2eBar();
renderTiers();
renderCrossCut();
})();