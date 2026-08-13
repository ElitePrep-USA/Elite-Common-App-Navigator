(() => {
  'use strict';
  const requirements = window.COMMON_APP_REQUIREMENTS || [];
  const meta = window.COMMON_APP_REQUIREMENTS_META || {};
  const guides = window.COMMON_APP_GUIDES || [];
  const sections = window.COMMON_APP_SECTIONS || [];
  const glossary = window.COMMON_APP_GLOSSARY || [];
  const STORAGE_KEY = 'eliteCommonAppNavigatorCollegeIdsV11';
  const state = {
    currentView:'home',
    selectedCollege:null,
    guideId:guides[0]?.id || 'start',
    sectionId:sections[0]?.id || 'profile',
    savedIds:loadSaved()
  };

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const escapeHtml = (value='') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const val = v => v && String(v).trim() ? String(v).trim() : 'Not indicated';
  const yesNo = v => v === 'Y' ? 'Required / Yes' : (v ? v : 'Not indicated');
  const byId = id => requirements.find(r => r.id === id);

  function loadSaved(){
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
      if(Array.isArray(current)) return current;
      const old = JSON.parse(localStorage.getItem('eliteCommonAppNavigatorCollegeIdsV1')||'[]');
      return Array.isArray(old) ? old : [];
    } catch { return []; }
  }
  function saveState(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedIds));
    updateCounts();
  }
  function updateCounts(){
    const n=state.savedIds.length;
    $('#navCount').textContent=n;
    $('#homeSavedCount').textContent=n;
    $('#homeCollegeCount').textContent=meta.count || requirements.length;
  }

  function setView(view){
    state.currentView=view;
    $$('.view').forEach(v=>v.classList.toggle('active-view', v.id===`view-${view}`));
    $$('.nav-link').forEach(b=>b.classList.toggle('active', b.dataset.view===view));
    $('#primaryNav').classList.remove('open');
    $('#mobileNavButton').setAttribute('aria-expanded','false');
    window.scrollTo({top:0,behavior:'smooth'});
    if(view==='planner') renderPlanner();
    if(view==='glossary') renderGlossary($('#glossarySearch')?.value || '');
    if(view==='ask') renderAsk();
    if(view==='sections') renderSectionMap();
    if(view==='guides') renderGuide();
  }

  function renderSectionMap(){
    const map=$('#appSectionMap');
    const detail=$('#sectionDetail');
    if(!map || !detail) return;
    map.innerHTML=sections.map((s,i)=>`<button type="button" class="section-node ${s.id===state.sectionId?'active':''}" data-section="${escapeHtml(s.id)}"><span class="section-node-num">${String(i+1).padStart(2,'0')}</span><strong>${escapeHtml(s.title)}</strong><span>${escapeHtml(s.kicker)}</span></button>`).join('');
    const s=sections.find(x=>x.id===state.sectionId)||sections[0];
    if(!s) return;
    detail.innerHTML=`<header class="section-detail-header"><div><div class="eyebrow">${escapeHtml(s.kicker)}</div><h2>${escapeHtml(s.title)}</h2><p>${escapeHtml(s.summary)}</p></div><div class="subsection-count">${s.subsections.length}<span>areas</span></div></header>
      <div class="subsection-grid">${s.subsections.map((sub,i)=>`<section class="subsection-card"><div class="subsection-number">${String(i+1).padStart(2,'0')}</div><h3>${escapeHtml(sub.name)}</h3><p>${escapeHtml(sub.what)}</p><div class="mini-tip"><strong>Elite tip</strong>${escapeHtml(sub.tip)}</div></section>`).join('')}</div>
      <div class="section-source-row"><span>${escapeHtml(s.note||'')}</span><span>Source basis: ${escapeHtml(s.source||'Common App')}</span></div>`;
  }

  function renderGuide(){
    const sidebar=$('#guideSidebar');
    const content=$('#guideContent');
    if(!sidebar || !content) return;
    sidebar.innerHTML=guides.map(g=>`<button class="guide-tab ${g.id===state.guideId?'active':''}" data-guide="${escapeHtml(g.id)}">${escapeHtml(g.title)}</button>`).join('');
    const g=guides.find(x=>x.id===state.guideId)||guides[0];
    if(!g) return;
    content.innerHTML=`<div class="eyebrow">${escapeHtml(g.eyebrow)}</div><h2>${escapeHtml(g.title)}</h2><p class="guide-summary">${escapeHtml(g.summary)}</p><div class="step-list">${g.steps.map(s=>`<div class="step-item">${escapeHtml(s)}</div>`).join('')}</div><div class="tip-box"><strong>Elite Counselor Tip</strong>${escapeHtml(g.tip)}</div><div class="guide-source">Based on uploaded Common App resource: ${escapeHtml(g.source)}.</div>`;
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
    box.innerHTML=rows.length?rows.map(r=>`<button class="result-button" data-college-id="${escapeHtml(r.id)}"><strong>${escapeHtml(r.display_name)}</strong><span>${escapeHtml(r.school_type)} · grid p. ${r.page}</span></button>`).join(''):`<div class="search-empty">No matching college found.</div>`;
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
      <section class="profile-section"><h3>How to read this profile</h3><p class="muted-copy">Blank cells in the source grid are shown as “Not indicated.” “See Website” means Common App directs applicants to the institution because the requirement is too complex for the grid. The writing-supplement field should not be treated as a complete inventory of every college-specific essay question.</p></section>
    </div><div class="profile-footnote">Source: 2026-27 Common App First-Year Deadlines, Fees and Requirements grid, updated 08-10-2026. Verify current policies before submitting.</div></article>`;
    $('#toggleCollege').addEventListener('click',()=>toggleSaved(r.id));
  }
  function toggleSaved(id){
    const i=state.savedIds.indexOf(id);
    if(i>=0) state.savedIds.splice(i,1); else state.savedIds.push(id);
    saveState();
    if(state.selectedCollege?.id===id) renderCollege(state.selectedCollege);
    if(state.currentView==='planner') renderPlanner();
    if(state.currentView==='ask') renderAsk();
  }

  function renderPlanner(){
    const list=state.savedIds.map(byId).filter(Boolean);
    const printBtn=$('#printApplications');
    if(printBtn){ printBtn.disabled=list.length===0; printBtn.title=list.length?'Print this report or save it as a PDF.':'Add at least one college to My Applications to print or save a PDF.'; }
    $('#plannerEmpty').hidden=list.length>0;
    $('#plannerContent').hidden=list.length===0;
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
    const groups=[];
    list.forEach(r=>{
      const items=[];
      const deadlines=[r.ed&&`ED ${r.ed}`,r.edii&&`ED II ${r.edii}`,r.ea&&`EA ${r.ea}`,r.eaii&&`EA II ${r.eaii}`,r.rea&&`REA ${r.rea}`,r.rd_rolling&&`RD/Rolling ${r.rd_rolling}`].filter(Boolean).join(' · ');
      items.push(['Application plan / deadline',deadlines||'No deadline indicated in grid']);
      items.push(['Personal essay',r.personal_essay==='Y'?'Required':'Not indicated as required']);
      if(r.courses_grades==='Y') items.push(['Courses & Grades','Required']);
      if(r.portfolio) items.push(['Portfolio',r.portfolio==='SR'?'SlideRoom integrated with Common App':r.portfolio==='COL'?'College uses its own portfolio system':r.portfolio]);
      if(r.writing==='Y') items.push(['Writing supplement','Required in the grid']);
      items.push(['Testing',`${r.test_policy||'—'} — ${testPolicyLabel(r.test_policy)}${r.sat_act?` · ${r.sat_act}`:''}`]);
      if(r.te) items.push(['Teacher evaluations',`${r.te} listed`]);
      if(r.cr==='Y') items.push(['Counselor recommendation','Required']);
      if(r.mr==='Y') items.push(['Midyear report','Required']);
      items.push(['College-specific questions','Review in My Colleges; not fully represented by the Requirements Grid']);
      groups.push({title:r.display_name,items});
    });
    return groups;
  }
  function renderChecklist(list){
    const groups=buildChecklist(list);
    $('#checklist').innerHTML=groups.map(g=>`<section class="check-group"><h3>${escapeHtml(g.title)}</h3>${g.items.map(([label,note])=>`<div class="requirement-row"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(note)}</span></div>`).join('')}</section>`).join('');
  }

  const askQuestions = [
    {id:'essay',label:'Which colleges require the Common App personal essay?'},
    {id:'writing',label:'Which colleges require a writing supplement?'},
    {id:'teacher',label:'Which colleges require teacher evaluations?'},
    {id:'counselor',label:'Which colleges require a counselor recommendation?'},
    {id:'midyear',label:'Which colleges require a Midyear Report?'},
    {id:'cg',label:'Which colleges require Courses & Grades?'},
    {id:'testing',label:'What are the testing policies for my colleges?'},
    {id:'fee',label:'Which colleges accept the Common App fee waiver?'},
    {id:'portfolio',label:'Which colleges list a portfolio?'},
    {id:'deadlines',label:'What deadlines are listed for my colleges?'}
  ];
  function renderAsk(){
    const list=state.savedIds.map(byId).filter(Boolean);
    const box=$('#askQuestions');
    if(!box) return;
    box.innerHTML=askQuestions.map(q=>`<button type="button" class="ask-question" data-ask="${q.id}">${escapeHtml(q.label)}</button>`).join('');
    const answer=$('#askAnswer');
    if(!list.length){
      answer.className='ask-answer empty-state';
      answer.innerHTML=`<div class="empty-icon">＋</div><h2>Add colleges first</h2><p>Ask the Navigator works from the colleges saved in My Applications.</p><button class="button primary" data-go="requirements">Find colleges</button>`;
    } else if(!answer.dataset.hasAnswer){
      answer.className='ask-answer empty-state';
      answer.innerHTML=`<div class="empty-icon">?</div><h2>${list.length} college${list.length===1?'':'s'} ready</h2><p>Select a question to calculate an answer from your saved list.</p>`;
    }
  }
  function askResult(id){
    const list=state.savedIds.map(byId).filter(Boolean);
    const answer=$('#askAnswer');
    if(!list.length){ renderAsk(); return; }
    let title='', intro='', rows=[];
    const names = arr => arr.map(r=>r.display_name);
    if(id==='essay'){
      const yes=list.filter(r=>r.personal_essay==='Y'), other=list.filter(r=>r.personal_essay!=='Y');
      title='Common App personal essay';
      intro=`${yes.length} of ${list.length} selected colleges mark the personal essay as required.`;
      rows=[['Required',names(yes)],['Not marked required / not indicated',names(other)]];
    } else if(id==='writing'){
      const yes=list.filter(r=>r.writing==='Y'), other=list.filter(r=>r.writing!=='Y');
      title='Writing supplement';
      intro=`${yes.length} of ${list.length} selected colleges are marked “Yes” in the Requirements Grid writing-supplement field.`;
      rows=[['Writing supplement marked required',names(yes)],['Not marked required / not indicated',names(other)]];
    } else if(id==='teacher'){
      const yes=list.filter(r=>r.te && r.te!=='0'), other=list.filter(r=>!r.te || r.te==='0');
      title='Teacher evaluations';
      intro=`${yes.length} of ${list.length} selected colleges list at least one Teacher Evaluation (TE).`;
      rows=[['Teacher evaluation(s) listed',yes.map(r=>`${r.display_name} — ${r.te}`)],['None listed / not indicated',names(other)]];
    } else if(id==='counselor'){
      const yes=list.filter(r=>r.cr==='Y'), other=list.filter(r=>r.cr!=='Y');
      title='Counselor recommendations';
      intro=`${yes.length} of ${list.length} selected colleges mark Counselor Recommendation (CR) as required.`;
      rows=[['Required',names(yes)],['Not marked required / not indicated',names(other)]];
    } else if(id==='midyear'){
      const yes=list.filter(r=>r.mr==='Y'), other=list.filter(r=>r.mr!=='Y');
      title='Midyear Reports';
      intro=`${yes.length} of ${list.length} selected colleges mark the Midyear Report (MR) as required.`;
      rows=[['Required',names(yes)],['Not marked required / not indicated',names(other)]];
    } else if(id==='cg'){
      const yes=list.filter(r=>r.courses_grades==='Y'), other=list.filter(r=>r.courses_grades!=='Y');
      title='Courses & Grades';
      intro=`${yes.length} of ${list.length} selected colleges mark Common App Courses & Grades as required.`;
      rows=[['Required',names(yes)],['Not marked required / not indicated',names(other)]];
    } else if(id==='testing'){
      title='Testing policies';
      intro='Testing policies are grouped below using the codes and definitions in the Common App Requirements Grid.';
      const groups={};
      list.forEach(r=>{const key=`${r.test_policy||'—'} — ${testPolicyLabel(r.test_policy)}`;(groups[key] ||= []).push(r.display_name);});
      rows=Object.entries(groups);
    } else if(id==='fee'){
      title='Common App fee waivers';
      intro='The grid distinguishes colleges that accept the waiver, limit it to U.S. applicants, or do not accept it.';
      const groups={};
      list.forEach(r=>{const key=val(r.fee_waiver);(groups[key] ||= []).push(r.display_name);});
      rows=Object.entries(groups);
    } else if(id==='portfolio'){
      const yes=list.filter(r=>r.portfolio), other=list.filter(r=>!r.portfolio);
      title='Portfolios';
      intro=`${yes.length} of ${list.length} selected colleges show a portfolio code in the grid.`;
      rows=[['Portfolio listed',yes.map(r=>`${r.display_name} — ${r.portfolio}${meta.portfolio_codes?.[r.portfolio]?` (${meta.portfolio_codes[r.portfolio]})`:''}`)],['No portfolio code shown',names(other)]];
    } else if(id==='deadlines'){
      title='Application deadlines';
      intro='All listed deadlines are shown by college and application plan.';
      rows=list.map(r=>[r.display_name,[r.ed&&`ED ${r.ed}`,r.edii&&`ED II ${r.edii}`,r.ea&&`EA ${r.ea}`,r.eaii&&`EA II ${r.eaii}`,r.rea&&`REA ${r.rea}`,r.rd_rolling&&`RD/Rolling ${r.rd_rolling}`].filter(Boolean)]);
    }
    answer.dataset.hasAnswer='true';
    answer.className='ask-answer';
    answer.innerHTML=`<div class="eyebrow">Calculated from My Applications</div><h2>${escapeHtml(title)}</h2><p class="ask-intro">${escapeHtml(intro)}</p><div class="ask-result-groups">${rows.map(([label,items])=>`<section class="ask-result-group"><h3>${escapeHtml(label)}</h3>${items && items.length?`<ul>${items.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`:'<p>None of your selected colleges.</p>'}</section>`).join('')}</div><div class="ask-caution">Blank cells in the source grid are not interpreted as “No.” They are reported as not indicated. Verify time-sensitive policies before submitting.</div>`;
  }

  function renderGlossary(query=''){
    const q=query.trim().toLowerCase();
    const rows=glossary.filter(x=>!q || x.term.toLowerCase().includes(q) || x.definition.toLowerCase().includes(q));
    $('#glossaryList').innerHTML=rows.length?rows.map(x=>`<article class="glossary-item"><div class="glossary-title-row"><h2>${escapeHtml(x.term)}</h2>${x.applies?`<span class="audience-badge">${escapeHtml(x.applies)}</span>`:''}</div><p>${escapeHtml(x.definition)}</p><div class="glossary-source">Source: ${escapeHtml(x.source)}</div></article>`).join(''):'<div class="empty-state"><h2>No matching term</h2><p>Try a broader search.</p></div>';
  }

  function formatPrintDate(){
    const d=new Date();
    try{return new Intl.DateTimeFormat('en-US',{year:'numeric',month:'long',day:'numeric'}).format(d);}
    catch{return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;}
  }

  function printApplications(){
    const list=state.savedIds.map(byId).filter(Boolean);
    if(!list.length) return;
    const dateNode=$('#printDate');
    if(dateNode) dateNode.textContent=`Printed ${formatPrintDate()}`;
    document.body.classList.add('printing-applications');
    const cleanup=()=>document.body.classList.remove('printing-applications');
    window.addEventListener('afterprint',cleanup,{once:true});
    window.print();
    setTimeout(cleanup,1500);
  }

  document.addEventListener('click',e=>{
    const nav=e.target.closest('[data-view]'); if(nav){setView(nav.dataset.view);return;}
    const go=e.target.closest('[data-go]'); if(go){
      if(go.dataset.guideId){state.guideId=go.dataset.guideId;}
      if(go.dataset.sectionId){state.sectionId=go.dataset.sectionId;}
      setView(go.dataset.go);return;
    }
    const section=e.target.closest('[data-section]'); if(section){state.sectionId=section.dataset.section;renderSectionMap();return;}
    const guide=e.target.closest('[data-guide]'); if(guide){state.guideId=guide.dataset.guide;renderGuide();return;}
    const college=e.target.closest('[data-college-id]'); if(college){const r=byId(college.dataset.collegeId); if(r){renderCollege(r); $('#collegeResults').classList.remove('show'); $('#collegeSearch').value=r.display_name;} return;}
    const rem=e.target.closest('[data-remove]'); if(rem){toggleSaved(rem.dataset.remove);return;}
    const ask=e.target.closest('[data-ask]'); if(ask){askResult(ask.dataset.ask);return;}
  });

  $('#collegeSearch').addEventListener('input',e=>renderCollegeResults(e.target.value));
  $('#clearCollegeSearch').addEventListener('click',()=>{ $('#collegeSearch').value=''; renderCollegeResults(''); $('#collegeSearch').focus(); });
  $('#glossarySearch').addEventListener('input',e=>renderGlossary(e.target.value));
  $('#mobileNavButton').addEventListener('click',()=>{const nav=$('#primaryNav');const open=nav.classList.toggle('open');$('#mobileNavButton').setAttribute('aria-expanded',String(open));});
  $('#clearPlanner').addEventListener('click',()=>{ if(state.savedIds.length && confirm('Clear all colleges from My Applications?')){state.savedIds=[];saveState();renderPlanner();} });
  $('#printApplications').addEventListener('click',printApplications);

  updateCounts();
  renderSectionMap();
  renderGuide();
  renderGlossary('');
  renderAsk();
})();
