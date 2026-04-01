/**
 * App Controller — Page Router & Module Loader
 *
 * 페이지 로딩 방식:
 *   1. 모듈화된 페이지 (modules[id] 정의): template + css + model + view + controller 개별 로드
 *   2. 레거시 페이지 (legacy[id] 정의): 기존 monolithic HTML (inline style+script) 로드
 *   3. SVG 파일: 직접 삽입
 */

const modules = {
  p2:  { template:'templates/arch-v2.html',          css:'css/pages/arch-v2.css',          view:'js/views/arch-v2-view.js' },
  p6:  { template:'templates/lifecycle.html',         css:'css/pages/lifecycle.css',         view:'js/views/lifecycle-view.js' },
  p7:  { template:'templates/devops-flow.html',       css:'css/pages/devops-flow.css',       view:'js/views/devops-flow-view.js' },
  p8:  { template:'templates/single-blueprint.html',  css:'css/pages/single-blueprint.css',  view:'js/views/single-blueprint-view.js' },
  p9:  { template:'templates/vmodel.html',            css:'css/pages/vmodel.css',            view:'js/views/vmodel-view.js' },
  p11: { template:'templates/e2e-process.html',       css:'css/pages/e2e-process.css',       view:'js/views/e2e-process-view.js' },
  p12: { template:'templates/rr-matrix.html',         css:'css/pages/rr-matrix.css',         view:'js/views/rr-matrix-view.js' },
};

const legacy = {
  p1:  'ff_4plane_4tier_architecture.html',
  p3:  'ff_architecture_blueprint_part3.html',
  p4:  'ff_arch_blueprint_mono.html',
  p5:  'ff_arch_blueprint_mono_v2.html',
  p10: 'devops_infinity_ff_bill_of_features.svg',
};

const loaded = {};

// --- Utility: Dynamic CSS/JS loader ---
function loadCSS(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = href;
  document.head.appendChild(link);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.body.appendChild(s);
  });
}

// --- Page Loader ---
async function loadPage(id) {
  if (loaded[id]) return;
  const container = document.getElementById('content-' + id);
  if (!container) return;

  try {
    // 1. Modular page
    if (modules[id]) {
      const m = modules[id];
      loadCSS(m.css);
      const tmpl = await fetch(m.template);
      container.innerHTML = await tmpl.text();
      if (m.model) await loadScript(m.model);
      if (m.view) await loadScript(m.view);
      if (m.ctrl) await loadScript(m.ctrl);
      if (m.init && window[m.init]) window[m.init]();
      loaded[id] = true;
      return;
    }

    // 2. Legacy page (monolithic HTML with inline style+script)
    const url = legacy[id];
    if (!url) return;

    // SVG
    if (url.endsWith('.svg')) {
      const svgText = await (await fetch(url)).text();
      container.innerHTML = svgText;
      const svg = container.querySelector('svg');
      if (svg) { svg.style.maxWidth = '100%'; svg.style.height = 'auto'; }
      loaded[id] = true;
      return;
    }

    // HTML (legacy: extract inline style + script)
    const html = await (await fetch(url)).text();
    const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    let body = html;
    if (styleMatch) body = body.replace(styleMatch[0], '');
    if (scriptMatch) body = body.replace(scriptMatch[0], '');

    if (styleMatch) {
      const scopedStyle = document.createElement('style');
      scopedStyle.textContent = styleMatch[1];
      container.appendChild(scopedStyle);
    }
    const div = document.createElement('div');
    div.className = 'w wrap';
    div.innerHTML = body.trim();
    container.appendChild(div);

    if (scriptMatch) {
      const script = document.createElement('script');
      script.textContent = scriptMatch[1];
      container.appendChild(script);
    }
    loaded[id] = true;
  } catch (e) {
    container.innerHTML = '<p style="color:red">Failed to load: ' + (modules[id]?.template || legacy[id]) + '</p>';
  }
}

// --- Navigation ---
function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(pageId)?.classList.add('active');
  document.querySelector(`[data-page="${pageId}"]`)?.classList.add('active');
  if (pageId !== 'overview') loadPage(pageId);
}

function goTo(pageId) { switchPage(pageId); }

// --- Init ---
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => switchPage(tab.dataset.page));
});
