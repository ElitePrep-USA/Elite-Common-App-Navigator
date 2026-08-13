(() => {
  'use strict';
  const requirements = window.COMMON_APP_REQUIREMENTS || [];
  const meta = window.COMMON_APP_REQUIREMENTS_META || {};
  const guides = window.COMMON_APP_GUIDES || [];
  const glossary = window.COMMON_APP_GLOSSARY || [];
  const STORAGE_KEY = 'eliteCommonAppNavigatorCollegeIdsV1';
  const CHECK_KEY = 'eliteCommonAppNavigatorChecksV1';
  const state = { currentView:'home', selectedCollege:null, guideId:guides[0]?.id || 'start', savedIds:loadSaved(), checks:loadChecks() };

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const escapeHtml = (value='') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const val = v => v && String(v).trim() ? String(v).trim() : 'Not indicated';
  const yesNo = v => v === 'Y' ? 'Required / Yes' : (v ? v : 'Not indicated');
  const byId = id => requirements.find(r => r.id === id);

  function loadSaved(){ try { const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); return Array.isArray(x)?x:[]; } catch { return []; } }
  function loadChecks(){ try { const x=JSON.parse(localStorage.getItem(CHECK_KEY)||'{}'); return x && typeof x==='object'?x:{}; } catch { return {}; } }
  function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedIds)); localStorage.setItem(CHECK_KEY, JSON.stringify(state.checks)); updateCounts(); }
  function updateCounts(){ const n=state.savedIds.length; $('#navCount').textContent=n; $('#homeSavedCount').textContent=n; $('#homeCollegeCount').textContent=meta.count || requirements.length; }

  function setView(view){
    state.currentView=view;
    $$('.view').forEach(v=>v.classList.toggle('active-view', v.id===`view-${view}`));
    $$('.nav-link').forEach(b=>b.classList.toggle('active', b.dataset.view===view));
    $('#primaryNav').classList.remove('open'); $('#mobileNavButton').setAttribute('aria-expanded','false');
    window.scrollTo({top:0,behavior:'smooth'});
    if(view==='planner') renderPlanner();
    if(view==='glossary') renderGlossary($('#glossarySearch')?.value || '');
  }

  function renderGuide(){
    const sidebar=$('#guideSidebar');
    sidebar.innerHTML=guides.map(g=>`<button class="guide-tab ${g.id===state.guideId?'active':''}" data-guide="${escapeHtml(g.id)}">${escapeHtml(g.title)}</button>`).join('');
    const g=guides.find(x=>x.id===state.guideId)||guides[0];
    if(!g) return;
    $('#guideContent').innerHTML=`<div class="eyebrow">${escapeHtml(g.eyebrow)}</div><h2>${escapeHtml(g.title)}</h2><p class="guide-summary">${escapeHtml(g.summary)}</p><div class="step-list">${g.steps.map(s=>`<div class="step-item">${escapeHtml(s)}</div>`).join('')}</div><div class="tip-box"><strong>Elite Counselor Tip</strong>${escapeHtml(g.tip)}</div><div class="guide-source">Based on uploaded Common App resource: ${escapeHtml(g.source)}.</div>`;
  }

  function searchColleges(q){
    const s=q.trim().toLowerCase(); if(!s) return [];
    const starts=[], includes=[];
    requirements.forEach(r=>{ const n=r.display_name.toLowerCase(); if(n.startsWith(s)) starts.push(r); else if(n.includes(s)) includes.push(r); });
    return [...starts,...includes].slice(0,18);
  }
  function renderCollegeResults(q){
    const box=$('#collegeResults'); const rows=searchColleges(q);
    if(!q.trim()){box.classList.remove('show');box.innerHTML='';return;}
    box.classList.add('show');
    box.innerHTML=rows.length?rows.map(r=>`<button class="result-button" data-college-id="${escapeHtml(r.id)}"><strong>${escapeHtml(r.display_name)}</strong><span>${escapeHtml(r.school_type)} · grid p. ${r.page}</span></button>`).join(''):`<div style="padding:14px 16px;color:#65717f">No matching college found.</div>`;
  }
  function testPolicyLabel(code){ return meta.test_policy_codes?.[code] || val(code); }
  function renderCollege(r){
    state.selectedCollege=r;
    const added=state.savedIds.includes(r.id);
    const dates=[['Early Decision',r.ed],['Early Decision II',r.edii],['Early Action',r.ea],['Early Action II',r.eaii],['Restrictive Early Action',r.rea],['Regular / Rolling',r.rd_rolling]].filter(([,v])=>v);
    const recommendation=[['Teacher Evaluations (TE)',r.te],['Other Evaluations (OE)',r.oe],['Midyear Report (MR)',r.mr],['Counselor Recommendation (CR)',r.cr],['Saves forms',r.saves_forms]];
    $('#collegeDetail').className='college-detail';
    $('#collegeDetail').innerHTML=`<article class="college-profile"><header class="college-profile-header"><div><h2>${escapeHtml(r.display_name)}</h2><p>${escapeHtml(r.school_type)} · Common App Requirements Grid page ${r.page}</p></div><div class="profile-actions"><button class="button ${added?'secondary':'primary'}" id="toggleCollege">${added?'Remove from My Applications':'Add to My Applications'}</button></div></header><div class="profile-grid">
      <section class="profile-section"><h3>Application plans</h3><dl class="kv-grid">${dates.length?dates.map(([k,v])=>`<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join(''):'<dt>Deadline</dt><dd>Not indicated</dd>'}</dl></section>
      <section class="profile-section"><h3>Fees & fee waiver</h3><dl class="kv-grid"><dt>U.S. application fee</dt><dd>${escapeHtml(val(r.fee_us))}</dd><dt>International fee</dt><dd>${escapeHtml(val(r.fee_intl))}</dd><dt>Common App fee waiver</dt><dd>${escapeHtml(val(r.fee_waiver))}</dd></dl></section>
      <section class="profile-section"><h3>Common App & supplements</h3><dl class="kv-grid"><dt>Personal essay</dt><dd>${escapeHtml(yesNo(r.personal_essay))}</dd><dt>Courses & Grades</dt><dd>${escapeHtml(yesNo(r.courses_grades))}</dd><dt>Portfolio</dt><dd>${escapeHtml(r.portfolio ? `${r.portfolio} — ${meta.portfolio_codes?.[r.portfolio]||r.portfolio}` : 'Not indicated')}</dd><dt>Writing supplement field</dt><dd>${escapeHtml(yesNo(r.writing))}</dd></dl></section>
      <section class="profile-section"><h3>Testing</h3><dl class="kv-grid"><dt>Test policy</dt><dd><span class="code-chip">${escapeHtml(r.test_policy||'—')}</span> ${escapeHtml(testPolicyLabel(r.test_policy))}</dd><dt>SAT/ACT tests used</dt><dd>${escapeHtml(val(r.sat_act))}</dd><dt>English proficiency</dt><dd>${escapeHtml(val(r.english_proficiency))}</dd></dl></section>
      <section class="profile-section"><h3>Recommendations & reports</h3><dl class="kv-grid">${recommendation.map(([k,v])=>`<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v==='Y'?'Yes':val(v))}</dd>`).join('')}</dl></section>
      <section class="profile-section"><h3>How to read this profile</h3><p style="color:#53606e;margin:0">Blank cells in the source grid are shown as “Not indicated.” “See Website” means Common App directs applicants to the institution because the requirement is too complex for the grid. The writing-supplement field should not be treated as a complete inventory of every college-specific essay question.</p></section>
    </div><div class="profile-footnote">Source: 2026-27 Common App First-Year Deadlines, Fees and Requirements grid, updated 08-10-2026. Verify current policies before submitting.</div></article>`;
    $('#toggleCollege').addEventListener('click',()=>toggleSaved(r.id));
  }
  function toggleSaved(id){
    const i=state.savedIds.indexOf(id); if(i>=0) state.savedIds.splice(i,1); else state.savedIds.push(id); saveState();
    if(state.selectedCollege?.id===id) renderCollege(state.selectedCollege); if(state.currentView==='planner') renderPlanner();
  }

  function requirementCount(list, key){ return list.filter(r=>r[key] && r[key] !== 'N' && r[key] !== 'None').length; }
  function renderPlanner(){
    const list=state.savedIds.map(byId).filter(Boolean);
    $('#plannerEmpty').hidden=list.length>0; $('#plannerContent').hidden=list.length===0;
    if(!list.length) return;
    const essayCount=list.filter(r=>r.personal_essay==='Y').length;
    const cgCount=list.filter(r=>r.courses_grades==='Y').length;
    const teacherCount=list.filter(r=>r.te && r.te!=='0').length;
    $('#plannerSummary').innerHTML=[['Colleges',list.length],['Personal essay required',essayCount],['Courses & Grades required',cgCount],['Teacher evaluations listed',teacherCount]].map(([lab,n])=>`<div class="summary-card"><strong>${n}</strong><span>${escapeHtml(lab)}</span></div>`).join('');
    const rows=[
      ['ED',r=>r.ed],['ED II',r=>r.edii],['EA',r=>r.ea],['EA II',r=>r.eaii],['REA',r=>r.rea],['RD / Rolling',r=>r.rd_rolling],['U.S. fee',r=>r.fee_us],['Fee waiver',r=>r.fee_waiver],['Personal essay',r=>r.personal_essay==='Y'?'Yes':val(r.personal_essay)],['Courses & Grades',r=>r.courses_grades==='Y'?'Yes':val(r.courses_grades)],['Portfolio',r=>val(r.portfolio)],['Writing supplement field',r=>r.writing==='Y'?'Yes':val(r.writing)],['Testing policy',r=>`${r.test_policy||'—'} — ${testPolicyLabel(r.test_policy)}`],['Teacher evals',r=>val(r.te)],['Midyear report',r=>r.mr==='Y'?'Yes':val(r.mr)],['Counselor rec',r=>r.cr==='Y'?'Yes':val(r.cr)]
    ];
    $('#comparisonTable').innerHTML=`<thead><tr><th>Requirement</th>${list.map(r=>`<th><div class="college-col-head"><span>${escapeHtml(r.display_name)}</span><button class="mini-remove" data-remove="${escapeHtml(r.id)}" aria-label="Remove ${escapeHtml(r.display_name)}">×</button></div></th>`).join('')}</tr></thead><tbody>${rows.map(([lab,fn])=>`<tr><td><strong>${escapeHtml(lab)}</strong></td>${list.map(r=>`<td>${escapeHtml(fn(r))}</td>`).join('')}</tr>`).join('')}</tbody>`;
    renderChecklist(list);
  }

  function buildChecklist(list){
    const common=[
      ['common-profile','Complete Profile section','Shared Common App section'],['common-family','Complete Family section','Shared Common App section'],['common-education','Complete Education section','Shared Common App section'],['common-testing','Review Testing section','Confirm college-specific testing policies'],['common-activities','Complete Activities section','Review descriptions and ordering'],['common-writing','Complete the Common App personal essay if needed','Required by '+list.filter(r=>r.personal_essay==='Y').length+' of your selected colleges'],['common-ferpa','Complete FERPA Release Authorization','Needed before managing recommenders']
    ];
    const groups=[{title:'Shared Common App',items:common}];
    list.forEach(r=>{
      const items=[];
      const deadlines=[r.ed&&`ED ${r.ed}`,r.edii&&`ED II ${r.edii}`,r.ea&&`EA ${r.ea}`,r.eaii&&`EA II ${r.eaii}`,r.rea&&`REA ${r.rea}`,r.rd_rolling&&`RD/Rolling ${r.rd_rolling}`].filter(Boolean).join(' · ');
      items.push([`${r.id}-deadline`,'Choose your application plan and confirm deadline',deadlines||'No deadline indicated in grid']);
      if(r.personal_essay==='Y') items.push([`${r.id}-essay`,'Confirm Common App personal essay is complete','Grid marks personal essay as required']);
      if(r.courses_grades==='Y') items.push([`${r.id}-cg`,'Complete Courses & Grades','Grid marks Courses & Grades as required']);
      if(r.portfolio) items.push([`${r.id}-portfolio`,'Review portfolio requirement',r.portfolio==='SR'?'SlideRoom integrated with Common App':r.portfolio==='COL'?'College uses its own portfolio system':r.portfolio]);
      if(r.writing==='Y') items.push([`${r.id}-writing`,'Complete writing supplement','Grid marks writing supplement as required']);
      if(r.test_policy) items.push([`${r.id}-testing`,'Confirm testing policy',`${r.test_policy} — ${testPolicyLabel(r.test_policy)}${r.sat_act?` · ${r.sat_act}`:''}`]);
      if(r.te) items.push([`${r.id}-te`,'Arrange teacher evaluation(s)',`${r.te} teacher evaluation(s) listed`]);
      if(r.cr==='Y') items.push([`${r.id}-cr`,'Confirm counselor recommendation','Counselor recommendation marked required']);
      if(r.mr==='Y') items.push([`${r.id}-mr`,'Plan for Midyear Report','Midyear Report marked required']);
      items.push([`${r.id}-review`,'Review college-specific questions and submission','Verify any items not fully represented in the grid']);
      groups.push({title:r.display_name,items});
    }); return groups;
  }
  function renderChecklist(list){
    const groups=buildChecklist(list);
    $('#checklist').innerHTML=groups.map(g=>`<section class="check-group"><h3>${escapeHtml(g.title)}</h3>${g.items.map(([id,label,note])=>`<div class="check-row"><input type="checkbox" id="check-${escapeHtml(id)}" data-check-id="${escapeHtml(id)}" ${state.checks[id]?'checked':''}><label for="check-${escapeHtml(id)}"><strong>${escapeHtml(label)}</strong><small>${escapeHtml(note)}</small></label></div>`).join('')}</section>`).join('');
  }

  function renderGlossary(query=''){
    const q=query.trim().toLowerCase();
    const rows=glossary.filter(x=>!q || x.term.toLowerCase().includes(q) || x.definition.toLowerCase().includes(q));
    $('#glossaryList').innerHTML=rows.length?rows.map(x=>`<article class="glossary-item"><h2>${escapeHtml(x.term)}</h2><p>${escapeHtml(x.definition)}</p><div class="glossary-source">Source: ${escapeHtml(x.source)}</div></article>`).join(''):'<div class="empty-state"><h2>No matching term</h2><p>Try a broader search.</p></div>';
  }

  document.addEventListener('click',e=>{
    const nav=e.target.closest('[data-view]'); if(nav){setView(nav.dataset.view);return;}
    const go=e.target.closest('[data-go]'); if(go){ if(go.dataset.guideId){state.guideId=go.dataset.guideId;renderGuide();} setView(go.dataset.go);return; }
    const guide=e.target.closest('[data-guide]'); if(guide){state.guideId=guide.dataset.guide;renderGuide();return;}
    const college=e.target.closest('[data-college-id]'); if(college){const r=byId(college.dataset.collegeId); if(r){renderCollege(r); $('#collegeResults').classList.remove('show'); $('#collegeSearch').value=r.display_name;} return;}
    const rem=e.target.closest('[data-remove]'); if(rem){toggleSaved(rem.dataset.remove);return;}
  });
  $('#collegeSearch').addEventListener('input',e=>renderCollegeResults(e.target.value));
  $('#clearCollegeSearch').addEventListener('click',()=>{ $('#collegeSearch').value=''; renderCollegeResults(''); $('#collegeSearch').focus(); });
  $('#glossarySearch').addEventListener('input',e=>renderGlossary(e.target.value));
  $('#mobileNavButton').addEventListener('click',()=>{const nav=$('#primaryNav');const open=nav.classList.toggle('open');$('#mobileNavButton').setAttribute('aria-expanded',String(open));});
  $('#clearPlanner').addEventListener('click',()=>{ if(state.savedIds.length && confirm('Clear all colleges from My Applications?')){state.savedIds=[];state.checks={};saveState();renderPlanner();} });
  $('#resetChecks').addEventListener('click',()=>{state.checks={};saveState();renderPlanner();});
  $('#checklist').addEventListener('change',e=>{ if(e.target.matches('[data-check-id]')){state.checks[e.target.dataset.checkId]=e.target.checked;saveState();} });

  updateCounts(); renderGuide(); renderGlossary('');
})();
