/**
 * E2E Data Flow — 10-Step Happy Path (Single Source of Truth)
 * 모든 페이지가 이 데이터를 공유하여 정합성 보장
 */

const E2E_STEPS_SHARED = [
  { id:1, title:'Flag Management',   short:'Flag Mgmt',    loc:'Cloud',         planes:['control','governance'] },
  { id:2, title:'ALM/PLM Sync',      short:'ALM Sync',     loc:'Cloud',         planes:['control','governance'] },
  { id:3, title:'Control Plane Config', short:'CP Config',  loc:'Cloud',         planes:['control','governance'] },
  { id:4, title:'Uptane Signing',     short:'Uptane Sign',  loc:'Cloud',         planes:['control','governance'] },
  { id:5, title:'Distribution',       short:'Distribution', loc:'Cloud → Edge',  planes:['control','vehicle'] },
  { id:6, title:'Vehicle Receive',    short:'Vehicle Rx',   loc:'Vehicle',       planes:['vehicle','governance'] },
  { id:7, title:'Local Evaluation',   short:'Local Eval',   loc:'Vehicle',       planes:['vehicle','quality'] },
  { id:8, title:'ECU Distribution',   short:'ECU Dist',     loc:'Vehicle → ECU', planes:['vehicle'] },
  { id:9, title:'Telemetry Return',   short:'Telemetry',    loc:'Vehicle → Cloud', planes:['vehicle','quality'] },
  { id:10,title:'Quality Analysis',   short:'Quality',      loc:'Cloud',         planes:['quality','control'] }
];

const E2E_EXCEPTIONS_SHARED = [
  { id:1, title:'Offline Fallback',      triggerSteps:[6],   severity:'medium' },
  { id:2, title:'Kill-Switch Trigger',   triggerSteps:[7],   severity:'critical' },
  { id:3, title:'Canary Health Fail',    triggerSteps:[9,10], severity:'high' },
  { id:4, title:'SOTA In-Flight',        triggerSteps:[6],   severity:'medium' },
  { id:5, title:'Safety FFI Violation',  triggerSteps:[7,8], severity:'critical' },
  { id:6, title:'Cross-ECU Conflict',    triggerSteps:[8],   severity:'high' },
  { id:7, title:'RXSWIN Miss',           triggerSteps:[2,3], severity:'high' },
  { id:8, title:'FoD Entitlement Revoke',triggerSteps:[7],   severity:'medium' }
];

const E2E_DATA_OBJECTS_SHARED = {
  cloudToVehicle: [
    { name:'Flag Manifest',   steps:[1,3,4,5] },
    { name:'Targeting Rules',  steps:[3,5] },
    { name:'Rollback Event',   steps:[3,5] },
    { name:'Approval Record',  steps:[1,3] },
    { name:'COTA Package',     steps:[4,5,6] }
  ],
  vehicleToCloud: [
    { name:'Decision Log',     steps:[7,9] },
    { name:'Exposure Event',   steps:[7,9] },
    { name:'Telemetry Events', steps:[9,10] },
    { name:'Vehicle Version Manifest', steps:[6,9] }
  ],
  bidirectional: [
    { name:'Feature Brief',    steps:[1,2] },
    { name:'Test Matrix',      steps:[2,10] },
    { name:'Context Schema',   steps:[3,7] },
    { name:'Audit Compliance Record', steps:[2,10] }
  ]
};

/**
 * 용어 사전 — 전문용어 쉬운 설명 (Glossary)
 */
const FF_GLOSSARY = {
  'COTA': 'Configuration OTA — 코드 변경 없이 설정값(FF ON/OFF)만 무선 전달. 1KB~500KB, 초~분 소요.',
  'SOTA': 'Software OTA — 실제 소프트웨어 바이너리 업데이트. 50MB~2GB, 10~60분.',
  'FOTA': 'Firmware OTA — ECU 펌웨어 업데이트. 500MB~5GB+, 30분~2시간+. 리스크 가장 높음.',
  'Uptane': '차량 SW 업데이트 보안 프레임워크. Image Repo(무결성) + Director Repo(타겟팅) 이중 서명.',
  'Ring': '단계적 배포 전략. Canary 0.1% → Ring1 1% → Ring2 5% → Ring3 25% → Ring4 50% → GA 100%.',
  'HPVC': 'High-Performance Vehicle Computer — 차량 내 중앙 컴퓨팅 유닛. FF SDK가 여기서 실행.',
  'TCU': 'Telematics Control Unit — 차량 통신 모듈. COTA 패키지를 클라우드에서 수신.',
  'UCM': 'Update Configuration Manager — AUTOSAR 표준 업데이트 관리자. Safety Path에 사용.',
  'NVRAM': 'Non-Volatile RAM — 전원 꺼져도 유지되는 메모리. Fail-safe L3 기본값 저장.',
  'Latch-at-Init': '부팅 시 1회만 플래그 값을 평가하고 세션 중 고정. 런타임 변경 방지 (Safety 필수).',
  'FFI': 'Freedom from Interference — QM 코드가 ASIL 코드에 간섭하지 않음을 증명.',
  'RXSWIN': 'Rx Software Identification Number — R156 규제 대상 SW의 형식승인 식별 번호.',
  'SUMS': 'Software Update Management System — R156에 따른 SW 업데이트 관리 시스템.',
  'FoD': 'Feature on Demand — 구독/결제 기반 기능 활성화 (예: 후석 엔터테인먼트).',
  'SDK': 'Software Development Kit — 차량 내: OpenFeature 기반 FF 평가 엔진. 외부: 협력사용 API 인터페이스.'
};
