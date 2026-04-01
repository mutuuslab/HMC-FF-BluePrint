(function(){
  /* Phase switching (Depth 1) */
  window.lcPhase=function(i){
    document.querySelectorAll('.lc-tab').forEach(function(t,j){t.classList.toggle('lc-on',j===i)});
    document.querySelectorAll('.lc-pnl').forEach(function(p,j){p.classList.toggle('lc-on',j===i)});
    /* highlight E2E bar segments */
    document.querySelectorAll('.lc-e2e-seg').forEach(function(s){
      s.classList.toggle('lc-on',parseInt(s.dataset.phase)===i);
    });
    /* close any open detail panels in new phase */
    document.querySelectorAll('.lc-detail').forEach(function(d){d.classList.remove('lc-on')});
    document.querySelectorAll('.lc-step').forEach(function(s){s.classList.remove('lc-on')});
  };

  /* E2E bar click -> switch to that phase */
  window.lcE2eClick=function(phase){
    lcPhase(phase);
  };

  /* Step click (Depth 2) */
  window.lcStep=function(phase,step){
    var pnl=document.getElementById('lcP'+phase);
    /* toggle step highlight */
    pnl.querySelectorAll('.lc-step').forEach(function(s,j){s.classList.toggle('lc-on',j===step)});
    /* toggle detail panel */
    pnl.querySelectorAll('.lc-detail').forEach(function(d,j){
      if(j===step){
        d.classList.toggle('lc-on');
        if(d.classList.contains('lc-on')){
          /* reset sub-tabs to first */
          d.querySelectorAll('.lc-stab').forEach(function(t,k){t.classList.toggle('lc-on',k===0)});
          d.querySelectorAll('.lc-spnl').forEach(function(p,k){p.classList.toggle('lc-on',k===0)});
          d.scrollIntoView({behavior:'smooth',block:'nearest'});
        }
      } else {
        d.classList.remove('lc-on');
      }
    });
  };

  /* Close detail */
  window.lcClose=function(phase,step){
    var d=document.getElementById('lcD'+phase+'_'+step);
    if(d)d.classList.remove('lc-on');
    var pnl=document.getElementById('lcP'+phase);
    pnl.querySelectorAll('.lc-step').forEach(function(s){s.classList.remove('lc-on')});
  };

  /* Sub-tab switching (Depth 3) */
  window.lcSub=function(el,idx){
    var detail=el.closest('.lc-detail');
    detail.querySelectorAll('.lc-stab').forEach(function(t,j){t.classList.toggle('lc-on',j===idx)});
    detail.querySelectorAll('.lc-spnl').forEach(function(p,j){p.classList.toggle('lc-on',j===idx)});
  };
})();