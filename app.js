const $=(s,c=document)=>c.querySelector(s);
const $$=(s,c=document)=>[...c.querySelectorAll(s)];

let xp=0;
const earned=new Set();
function award(key,n=10){
  if(earned.has(key)) return;
  earned.add(key); xp+=n; $('#xp').textContent=xp;
}

$$('[data-jump]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.jump)?.scrollIntoView({behavior:'smooth'})));
$$('.flip').forEach(card=>card.addEventListener('click',()=>card.classList.toggle('flipped')));

const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.07});
$$('.zone>*').forEach(el=>{el.classList.add('reveal');io.observe(el)});

addEventListener('scroll',()=>{
  const d=document.documentElement,max=d.scrollHeight-d.clientHeight;
  $('#progress').style.width=(max?d.scrollTop/max*100:0)+'%';
  let active='';
  $$('.zone').forEach(z=>{if(scrollY>=z.offsetTop-120)active=z.id});
  $$('nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+active));
},{passive:true});

addEventListener('pointermove',e=>{
  const g=$('.cursor-glow'); if(!g)return;
  g.style.left=e.clientX+'px';g.style.top=e.clientY+'px';
},{passive:true});

// GAME 1 — least privilege
const permissionRounds=[
  {
    title:'Bank teller: serve a customer.',
    goal:'Give the teller enough access to complete everyday customer service, but no unrelated power.',
    chip:'BANK TELLER',
    options:[
      ['read_customer','Read customer records','Needed to identify and assist the customer'],
      ['write_customer','Update customer records','Needed for normal teller work'],
      ['view_salary','View employee salary database','Unrelated sensitive information'],
      ['local_admin','Local administrator','Far more authority than the task requires'],
      ['disable_logs','Disable security logging','No legitimate teller requirement']
    ],
    required:['read_customer','write_customer']
  },
  {
    title:'Doctor: treat a patient during an emergency.',
    goal:'The doctor needs enough authority to work quickly without opening unrelated systems.',
    chip:'DOCTOR',
    options:[
      ['read_patient','Read patient record','Needed for treatment'],
      ['modify_patient','Modify patient record','Needed to record treatment'],
      ['care_session','Maintain a usable clinical session','Avoid a timeout that disrupts emergency care'],
      ['payroll','Read hospital payroll','Not required for patient care'],
      ['domain_admin','Domain administrator','Unrelated infrastructure control']
    ],
    required:['read_patient','modify_patient','care_session']
  },
  {
    title:'Developer: troubleshoot a production service.',
    goal:'Give the developer what is needed for the service problem, not blanket access to the business.',
    chip:'DEVELOPER',
    options:[
      ['read_logs','Read application logs','Needed to diagnose the service'],
      ['deploy_app','Deploy approved application build','Needed to correct the service'],
      ['salary','Read salary database','Unrelated to the task'],
      ['all_db','Access every database','Too broad'],
      ['security_off','Disable endpoint security','Dangerous and unnecessary']
    ],
    required:['read_logs','deploy_app']
  }
];
let permissionRound=0;
let permissionSelected=new Set();

function renderPermissionRound(){
  const r=permissionRounds[permissionRound];
  $('#roleTitle').textContent=r.title;
  $('#roleGoal').textContent=r.goal;
  $('#roleChip').innerHTML='<b>'+r.chip+'</b><small>job function ≠ administrator</small>';
  $('#doorStatus').textContent='DESIGN ACCESS';
  $('#permissionFeedback').textContent='Select permissions, then test the design.';
  $('#permissionFeedback').className='feedback';
  permissionSelected=new Set();
  const host=$('#permissionList'); host.innerHTML='';
  r.options.forEach(([id,label,why])=>{
    const b=document.createElement('button');
    b.innerHTML='<b>'+label+'</b><small>'+why+'</small>';
    b.addEventListener('click',()=>{
      if(permissionSelected.has(id)){permissionSelected.delete(id);b.classList.remove('selected')}
      else{permissionSelected.add(id);b.classList.add('selected')}
    });
    host.appendChild(b);
  });
}
$('#checkPermissions').addEventListener('click',()=>{
  const r=permissionRounds[permissionRound];
  const exact=r.required.length===permissionSelected.size && r.required.every(x=>permissionSelected.has(x));
  if(exact){
    $('#doorStatus').textContent='TASK FIT ✓';
    $('#permissionFeedback').textContent='Strong least-privilege design: the user can complete the task without unrelated authority.';
    $('#permissionFeedback').className='feedback good';
    award('perm'+permissionRound,15);
    setTimeout(()=>{permissionRound=(permissionRound+1)%permissionRounds.length;renderPermissionRound()},1250);
  }else{
    const missing=r.required.filter(x=>!permissionSelected.has(x)).length;
    const extra=[...permissionSelected].filter(x=>!r.required.includes(x)).length;
    $('#doorStatus').textContent=extra?'TOO MUCH ACCESS':'TASK BLOCKED';
    $('#permissionFeedback').textContent=missing&&extra?'You are both blocking required work and granting unrelated authority.':missing?'Too restrictive: the user cannot complete the mainstream task.':'Too permissive: remove authority unrelated to the task.';
    $('#permissionFeedback').className='feedback bad';
  }
});
renderPermissionRound();

// GAME 2 — intelligence-led penetration test ordering
const pentestSteps=[
  'Planning & preparation',
  'Threat intelligence collection',
  'System scanning (adversary TTPs)',
  'System exploitation (adversary TTPs)',
  'Analysis & countermeasures',
  'Documentation & reporting'
];
let pentestChosen=[];
function renderPentest(){
  const bank=$('#pentestBank'),target=$('#pentestTarget');bank.innerHTML='';target.innerHTML='';
  const shuffled=[...pentestSteps].sort(()=>Math.random()-.5);
  shuffled.forEach(step=>{
    const b=document.createElement('button');b.textContent=step;b.addEventListener('click',()=>{
      if(pentestChosen.includes(step))return;
      pentestChosen.push(step);renderPentestState(shuffled);
    });bank.appendChild(b);
  });
}
function renderPentestState(order){
  const bank=$('#pentestBank'),target=$('#pentestTarget');bank.innerHTML='';target.innerHTML='';
  order.forEach(step=>{
    if(!pentestChosen.includes(step)){
      const b=document.createElement('button');b.textContent=step;b.addEventListener('click',()=>{pentestChosen.push(step);renderPentestState(order)});bank.appendChild(b);
    }
  });
  pentestChosen.forEach((step,i)=>{
    const b=document.createElement('button');b.textContent=(i+1)+'. '+step;b.addEventListener('click',()=>{pentestChosen.splice(i,1);renderPentestState(order)});target.appendChild(b);
  });
}
$('#checkPentest').addEventListener('click',()=>{
  if(pentestChosen.length!==pentestSteps.length){$('#pentestFeedback').textContent='Place all six stages first.';$('#pentestFeedback').className='feedback bad';return}
  const ok=pentestSteps.every((s,i)=>pentestChosen[i]===s);
  $('#pentestFeedback').textContent=ok?'Correct. CTI collection shapes realistic TTP-driven scanning and exploitation before analysis and reporting.':'Not quite. Start with planning, collect CTI, then scan/exploit using adversary TTPs before analysis and reporting.';
  $('#pentestFeedback').className='feedback '+(ok?'good':'bad');
  if(ok)award('pentest',20);
});
$('#resetPentest').addEventListener('click',()=>{pentestChosen=[];renderPentest();$('#pentestFeedback').textContent='Click cards in order to build the process.';$('#pentestFeedback').className='feedback'});
renderPentest();

// Risk factor explainer
const factorText={
  threat:'Threat = the actor’s intent, capability and opportunity. Example: a financially motivated cybercriminal or an espionage-focused state actor.',
  vulnerability:'Vulnerability = the weakness: bugs, bad input validation, broken processes, hardware flaws or human error.',
  asset:'Asset = the valuable resource at risk: servers, endpoints, applications, intellectual property or personal data.'
};
const factorSeen=new Set();
$$('[data-factor]').forEach(b=>b.addEventListener('click',()=>{
  $$('[data-factor]').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  factorSeen.add(b.dataset.factor);$('#riskMeaning').textContent=factorText[b.dataset.factor];
  if(factorSeen.size===3)award('riskfactors',10);
}));

// GAME 3 — risk triage
const riskRounds=[
  {
    prompt:'A public web portal contains a known injection bug and holds millions of identity records.',
    cols:{
      Threat:[['cybercriminal','Financially motivated cybercriminal'],['insider','Unrelated office visitor'],['weather','Severe weather']],
      Vulnerability:[['injection','Known injection weakness'],['none','No software weakness'],['battery','Low laptop battery']],
      Asset:[['pii','Millions of identity records'],['poster','Public marketing poster'],['cafeteria','Lunch menu']]
    },
    answer:['cybercriminal','injection','pii']
  },
  {
    prompt:'A high-tech supplier uses an outdated third-party web server targeted by espionage actors.',
    cols:{
      Threat:[['state','Espionage-focused threat actor'],['spam','Generic newsletter sender'],['power','Power company']],
      Vulnerability:[['unpatched','Unpatched third-party server'],['keyboard','Keyboard layout'],['logo','Old company logo']],
      Asset:[['designs','Sensitive engineering designs'],['weather2','Public weather data'],['brochure','Public brochure']]
    },
    answer:['state','unpatched','designs']
  }
];
let riskRound=0,riskSelections={};
function renderRisk(){
  const r=riskRounds[riskRound];$('#riskScenario').textContent=r.prompt;riskSelections={};
  const host=$('#triageGrid');host.innerHTML='';
  Object.entries(r.cols).forEach(([name,opts])=>{
    const col=document.createElement('div');col.className='triage-col';col.innerHTML='<span>'+name.toUpperCase()+'</span>';
    opts.forEach(([id,label])=>{
      const b=document.createElement('button');b.textContent=label;b.addEventListener('click',()=>{
        $$('button',col).forEach(x=>x.classList.remove('selected'));b.classList.add('selected');riskSelections[name]=id;
      });col.appendChild(b);
    });host.appendChild(col);
  });
  $('#riskFeedback').textContent='Pick the threat, vulnerability and asset that complete the scenario.';$('#riskFeedback').className='feedback';
}
$('#scoreRisk').addEventListener('click',()=>{
  const r=riskRounds[riskRound];
  const selected=['Threat','Vulnerability','Asset'].map(x=>riskSelections[x]);
  if(selected.some(x=>!x)){$('#riskFeedback').textContent='Choose one item from each column.';$('#riskFeedback').className='feedback bad';return}
  const ok=r.answer.every((x,i)=>selected[i]===x);
  $('#riskFeedback').textContent=ok?'Correct. Risk becomes serious because a motivated threat can exploit a real weakness against a valuable asset.':'Re-check the relationship: who is motivated, what can they exploit, and what valuable asset is exposed?';
  $('#riskFeedback').className='feedback '+(ok?'good':'bad');
  if(ok){award('risk'+riskRound,15);setTimeout(()=>{riskRound=(riskRound+1)%riskRounds.length;renderRisk()},1200)}
});
renderRisk();

// GAME 4 — privacy vs security
const privacyRounds=[
  {q:'A customer database is encrypted, but the company collected the personal data without meaningful consent.',a:'Privacy problem',why:'Correct. The data may be technically protected while the collection itself still violates privacy expectations.'},
  {q:'A database is collected with valid consent, but attackers can read and modify it because access control is broken.',a:'Security problem',why:'Correct. The collection may be legitimate, but confidentiality and integrity are failing.'},
  {q:'A health app secretly shares sensitive data with an advertiser and also stores it without protection.',a:'Both',why:'Correct. Improper sharing is a privacy problem and weak protection is a security problem.'},
  {q:'Users are told what is collected, give meaningful consent, and the data is strongly protected.',a:'Neither',why:'Correct. This scenario describes both privacy and security being handled appropriately.'}
];
let privacyIndex=0;
function renderPrivacy(){
  const r=privacyRounds[privacyIndex];$('#privacyPrompt').textContent=r.q;
  const host=$('#privacyChoices');host.innerHTML='';
  ['Security problem','Privacy problem','Both','Neither'].forEach(opt=>{
    const b=document.createElement('button');b.textContent=opt;b.addEventListener('click',()=>{
      if(host.dataset.done)return;host.dataset.done='1';
      if(opt===r.a){b.classList.add('correct');$('#privacyFeedback').textContent=r.why;$('#privacyFeedback').className='feedback good';award('privacy'+privacyIndex,10)}
      else{b.classList.add('wrong');$$('button',host).find(x=>x.textContent===r.a).classList.add('correct');$('#privacyFeedback').textContent='Not quite. Separate “is the data protected?” from “should it be collected/used/shared this way?”';$('#privacyFeedback').className='feedback bad'}
      setTimeout(()=>{privacyIndex=(privacyIndex+1)%privacyRounds.length;host.dataset.done='';renderPrivacy()},1300);
    });host.appendChild(b);
  });
  $('#privacyFeedback').textContent='Classify the problem.';$('#privacyFeedback').className='feedback';
}
renderPrivacy();

// GAME 5 — phishing inbox
const emails=[
  {
    from:'Procurement',
    avatar:'P',
    subject:'Updated supplier contract for review',
    preview:'Please review the attached contract before 4 PM.',
    body:'Hi Alex, we have updated the supplier agreement discussed in yesterday’s procurement meeting. The document is in the normal internal document portal. Please review section 4 before 4 PM.',
    signals:['Expected context','Internal portal','Normal business request'],
    suspicious:false
  },
  {
    from:'Microsoft Security Team',
    avatar:'M',
    subject:'URGENT: mailbox will be deleted in 15 minutes',
    preview:'Verify password immediately to keep your account.',
    body:'Your mailbox has exceeded a security limit. To avoid deletion within 15 minutes, sign in at account-security-check.example and verify your password immediately.',
    signals:['Extreme urgency','Password request','Look-alike external domain','Threat of account loss'],
    suspicious:true
  },
  {
    from:'HR Learning',
    avatar:'H',
    subject:'October security awareness session',
    preview:'New session dates are available on the staff portal.',
    body:'The October awareness session timetable is now available in the existing staff learning portal. No action is required today.',
    signals:['Known portal','No credential request','Low urgency'],
    suspicious:false
  },
  {
    from:'Conference Organizer',
    avatar:'C',
    subject:'Your recent research — invitation',
    preview:'I enjoyed your work. Please open the attached paper.',
    body:'I enjoyed your recent research and would like to invite you to our event. Please open the attached paper before we discuss the opportunity. I found your contact details on your public profile.',
    signals:['Personalized pretext','Unsolicited attachment','Public-profile reconnaissance','Spearphishing pattern'],
    suspicious:true
  }
];
let selectedEmail=null;
function renderEmailList(){
  const host=$('#emailList');host.innerHTML='';
  emails.forEach((m,i)=>{
    const row=document.createElement('div');row.className='email-item';
    row.innerHTML='<div class="avatar">'+m.avatar+'</div><div><b>'+m.from+'</b><span>'+m.subject+'</span></div><small>'+m.preview+'</small>';
    row.addEventListener('click',()=>{
      $$('.email-item').forEach(x=>x.classList.remove('active'));row.classList.add('active');selectedEmail=i;
      $('#emailTitle').textContent=m.subject;$('#emailBody').textContent=m.body;
      $('#emailSignals').innerHTML=m.signals.map(s=>'<span>'+s+'</span>').join('');
      $('#classifyPhish').disabled=false;$('#phishFeedback').textContent='';
    });host.appendChild(row);
  });
}
$('#classifyPhish').addEventListener('click',()=>{
  if(selectedEmail===null)return;const m=emails[selectedEmail];
  if(m.suspicious){
    $('#phishFeedback').textContent='Good investigation choice. The message contains the kind of contextual, urgency or delivery signals that deserve escalation.';
    $('#phishFeedback').className='feedback good';award('phish'+selectedEmail,10);
  }else{
    $('#phishFeedback').textContent='This message has fewer suspicious indicators. Compare its expected context, normal portal use and lack of credential pressure with the risky messages.';
    $('#phishFeedback').className='feedback bad';
  }
});
renderEmailList();

// GAME 6 — mental model / UI
const uiRounds=[
  {
    q:'A downloaded executable is from an unknown source. Which warning best supports secure consent?',
    preview:'file: payroll-update.exe · source: unknown',
    opts:['Two equal buttons: RUN / CANCEL','Highlight “Cancel and scan” as the safe option, explain the risk','Hide the warning after 1 second'],
    a:1
  },
  {
    q:'A user tries to open quarantined malware. What should a usable constraint do?',
    preview:'Threat quarantined · user requests “Open anyway”',
    opts:['Silently fail','Block the action and clearly explain why it is blocked','Allow access because the user clicked twice'],
    a:1
  },
  {
    q:'A SIEM uses red, green and grey status indicators. Which convention is safest?',
    preview:'Alert severity design',
    opts:['Red means danger consistently across the tool','Change red to mean “safe” on some pages','Use random colors for novelty'],
    a:0
  },
  {
    q:'A download icon starts a malware scan before saving. What improves the affordance?',
    preview:'Download control',
    opts:['Use a clear label such as “Download + scan” with visible scan feedback','Use an unlabeled mystery icon','Start scanning but show nothing'],
    a:0
  }
];
let uiIndex=0;
function renderUI(){
  const r=uiRounds[uiIndex];$('#uiScenario').textContent=r.q;
  $('#uiPreview').innerHTML='<div class="mock-dialog"><span>SECURITY UI PREVIEW</span><h4>'+r.preview+'</h4><p>Choose the design that best aligns the interface, secure behavior and the user’s existing expectations.</p><div class="mock-buttons"><button>?</button><button class="safe">safe path</button></div></div>';
  const host=$('#uiChoices');host.innerHTML='';
  r.opts.forEach((opt,i)=>{
    const b=document.createElement('button');b.textContent=opt;b.addEventListener('click',()=>{
      if(host.dataset.done)return;host.dataset.done='1';
      if(i===r.a){b.classList.add('correct');$('#uiFeedback').textContent='Correct. Good usable security directs the user clearly instead of relying on perfect judgment.';$('#uiFeedback').className='feedback good';award('ui'+uiIndex,10)}
      else{b.classList.add('wrong');$$('button',host)[r.a].classList.add('correct');$('#uiFeedback').textContent='The safer design is highlighted. Security controls should be visible, understandable and difficult to bypass accidentally.';$('#uiFeedback').className='feedback bad'}
      setTimeout(()=>{uiIndex=(uiIndex+1)%uiRounds.length;host.dataset.done='';renderUI()},1250);
    });host.appendChild(b);
  });
  $('#uiFeedback').textContent='Choose the better security design.';$('#uiFeedback').className='feedback';
}
renderUI();

// GAME 7 — Design / Build / Run / Defend knowledge flow
const phaseData={
  design:{
    title:'DESIGN — shape the system before it exists.',
    text:'Threat models, requirements and controls belong here. Intelligence influences architecture from the start.',
    q:'Which item belongs most naturally in Design?',
    opts:['Threat model for a known adversary','Yesterday’s CPU temperature','Finished incident report'],
    a:0
  },
  build:{
    title:'BUILD — turn architecture into working components.',
    text:'Component lists, build procedures, intended behavior, logging and diagnostics translate design into implementation.',
    q:'Which knowledge belongs most naturally in Build?',
    opts:['Component list and intended logging behavior','Board-level risk appetite only','Attacker campaign motivation only'],
    a:0
  },
  run:{
    title:'RUN — operate and sustain the system.',
    text:'Runtime sustainability, configuration and operational constraints feed back into Design and Build and forward into Defend.',
    q:'Which item is strongest Run-phase feedback?',
    opts:['A production configuration that causes service instability','A marketing slogan','An unrelated privacy law title'],
    a:0
  },
  defend:{
    title:'DEFEND — turn adversary knowledge into visibility and action.',
    text:'Adversary objectives, TTPs, detection needs and observed behavior flow back to every other phase.',
    q:'Which item belongs most naturally in Defend?',
    opts:['Detection for known PowerShell behavior tied to an adversary TTP','Choosing office paint color','Designing a product logo'],
    a:0
  }
};
$$('[data-phase]').forEach(b=>b.addEventListener('click',()=>{
  $$('[data-phase]').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  const d=phaseData[b.dataset.phase];$('#phaseTitle').textContent=d.title;$('#phaseText').textContent=d.text;
  const host=$('#phaseChallenge');host.innerHTML='<b style="font-size:.72rem">'+d.q+'</b>';
  d.opts.forEach((opt,i)=>{
    const x=document.createElement('button');x.textContent=opt;x.addEventListener('click',()=>{
      if(host.dataset.done)return;host.dataset.done='1';
      if(i===d.a){x.classList.add('correct');award('phase-'+b.dataset.phase,10)}
      else{x.classList.add('wrong');$$('button',host)[d.a].classList.add('correct')}
    });host.appendChild(x);
  });host.dataset.done='';
}));

// Final quiz
const questions=[
  ['What is the core idea of least privilege?',['Give every employee admin rights','Give only the authority needed for the task','Block every risky task'],1],
  ['Why does the lecture recommend automatic restraint for clearly unauthorized access?',['It prevents the exposure by default instead of relying on the user','It makes passwords unnecessary','It removes monitoring'],0],
  ['What makes intelligence-led penetration testing different?',['It uses real adversary TTPs and CTI to shape the test','It never exploits anything','It ignores the organization’s assets'],0],
  ['In the lecture’s risk statement, which three elements are combined?',['Threat + vulnerability + asset','Password + firewall + antivirus','User + server + cloud'],0],
  ['Which statement about privacy is correct?',['Encryption automatically guarantees privacy','Privacy and security are related but not identical','Privacy only matters for biometrics'],1],
  ['Why is spearphishing often more convincing than mass phishing?',['It uses reconnaissance to tailor the lure to the target','It always uses stronger encryption','It cannot contain attachments'],0],
  ['What is an affordance?',['A visible clue about what an action/control does','A patch schedule','An attacker group'],0],
  ['What is a constraint in usable security?',['A design that prevents an unsafe or unauthorized action and explains why','A decorative color scheme','An unlogged exception'],0],
  ['Which five characteristics define the lecture’s defendable architecture?',['Resilience, threat modeling, verification, administration, countermeasures','Speed, cost, branding, storage, marketing','Cloud, LAN, Wi-Fi, USB, DNS'],0],
  ['What does “shift security left” mean in this lecture?',['Bring security and threat analysis into design and development early','Move the SOC to another building','Delay security until production'],0]
];
const qhost=$('#finalQuiz');let answered=0,score=0;
questions.forEach((q,i)=>{
  const card=document.createElement('article');card.className='final-q';card.innerHTML='<h3>'+(i+1)+'. '+q[0]+'</h3>';
  q[1].forEach((opt,j)=>{
    const b=document.createElement('button');b.textContent=opt;b.addEventListener('click',()=>{
      if(card.dataset.done)return;card.dataset.done='1';answered++;
      const bs=$$('button',card);bs.forEach(x=>x.disabled=true);
      if(j===q[2]){b.classList.add('correct');score++}else{b.classList.add('wrong');bs[q[2]].classList.add('correct')}
      updateFinal();
    });card.appendChild(b);
  });qhost.appendChild(card);
});
const result=document.createElement('div');result.className='final-result';result.textContent='Complete all 10 questions to reveal your score.';qhost.appendChild(result);
function updateFinal(){
  if(answered<questions.length){result.textContent=answered+'/10 complete · current score '+score+' · Lab XP '+xp;return}
  const pct=Math.round(score/questions.length*100);
  result.innerHTML='FINAL SCORE: '+score+'/10 ('+pct+'%) · LAB XP '+xp+'<br><span style="font-weight:600">'+(pct>=90?'Excellent — your design keeps security and usability working together.':pct>=70?'Good result — revisit the highlighted answers and deep-dive cards.':'Re-run the games and focus on why the secure choice must also be usable.')+'</span>';
}