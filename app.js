const C=window.JAB_CONFIG||{};const $=id=>document.getElementById(id);const states='AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC'.split(' ');
function validUrl(url){try{const u=new URL(url);return u.protocol==='https:'?u.href:null}catch{return null}}
function updateRecipient(data={}){const name=data.recipientName||C.recipientName;const note=data.recipientNote||C.recipientNote;const venmo=data.venmoUrl||C.venmoUrl;if($('recipientName'))$('recipientName').textContent=name||'Coming soon';if($('recipientNote'))$('recipientNote').textContent=note||'The host will announce the current recipient in the Facebook community.';if($('recipientVenmoHandle'))$('recipientVenmoHandle').textContent=data.recipientVenmoHandle||C.recipientVenmoHandle||'Awaiting update';if($('recipientLast4'))$('recipientLast4').textContent=data.recipientLast4||C.recipientLast4||'Awaiting update';const imgPath=data.venmoScreenshot||C.venmoScreenshot;const shot=$('venmoScreenshot'),wrap=$('venmoScreenshotWrap'),empty=$('venmoScreenshotEmpty');if(shot&&wrap&&empty){if(imgPath&&/^assets\/[a-zA-Z0-9_.-]+$/.test(imgPath)){shot.src=imgPath;wrap.hidden=false;empty.hidden=true}else{wrap.hidden=true;empty.hidden=false}};for(const b of [$('venmoBtn')]){if(!b)continue;const url=validUrl(venmo);if(url&&new URL(url).hostname.toLowerCase().match(/(^|\.)venmo\.com$/)){b.href=url;b.classList.remove('btn-disabled');b.removeAttribute('aria-disabled')}else{b.removeAttribute('href');b.classList.add('btn-disabled');b.setAttribute('aria-disabled','true');b.title='The host has not added the current recipient’s Venmo link yet.'}}}
function setupLinks(){for(const id of ['facebook','instagram','telegram','youtube']){const a=$(id);if(a){const url=validUrl(C[id+'Url']);if(url)a.href=url;else a.removeAttribute('href')}}}
async function getPublic(action='public',params={}){if(!C.apiUrl)return null;const u=new URL(C.apiUrl);u.searchParams.set('action',action);for(const [k,v] of Object.entries(params))u.searchParams.set(k,v);const r=await fetch(u);if(!r.ok)throw Error('Unable to load');const d=await r.json();if(d.error)throw Error(d.error);return d}
async function refresh(){try{const d=await getPublic('givers');if(d&&$('count'))$('count').textContent=Number(d.count||0).toLocaleString()}catch{if($('count'))$('count').textContent='—'}}
function showStatus(msg){const el=$('formStatus');if(el){el.classList.remove('hide');el.textContent=msg}}
function setupForm(){
  const f=$('entryForm'); if(!f)return;
  for(const s of states){const o=document.createElement('option');o.value=s;o.textContent=s;$('state').appendChild(o)}
  const submit=$('submitEntry');let pendingToken=null;let timeoutId=null;
  const finish=(message,success)=>{pendingToken=null;clearTimeout(timeoutId);submit.disabled=false;showStatus(message);if(success){f.reset();refresh()}};
  window.addEventListener('message',event=>{
    // The Google Apps Script HTML response is hosted on Google's usercontent domain.
    if(!/^https:\/\/([a-z0-9-]+\.)*googleusercontent\.com$/i.test(event.origin)&&
       !/^https:\/\/script\.google\.com$/i.test(event.origin))return;
    const d=event.data;
    if(!pendingToken||!d||d.type!=='JAB_REGISTRATION_RESULT'||d.token!==pendingToken)return;
    finish(d.ok?'Your entry was received!':('Submission failed: '+(d.error||'Please try again.')),!!d.ok);
  });
  f.addEventListener('submit',e=>{
    e.preventDefault();if(pendingToken)return;
    if(!C.apiUrl){showStatus('Registration is temporarily unavailable.');return}
    if(!f.reportValidity())return;
    const phone=$('phone').value.replace(/\D/g,'');const backup=$('backupPhone').value.replace(/\D/g,'');
    if(phone.length!==10||(backup&&backup.length!==10)){showStatus('Enter a valid 10-digit primary phone and, if provided, a valid secondary phone.');return}
    const fullName=[$('firstName').value.trim(),$('lastName').value.trim()].join(' ').trim();
    if(fullName.split(/\s+/).length<2){showStatus('Please enter your first and last name.');return}
    $('fullNameValue').value=fullName;$('designationValue').value=$('license').value;
    $('primaryPhoneValue').value=phone;$('secondaryPhoneValue').value=backup;
    pendingToken=crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(36).slice(2);
    $('submissionToken').value=pendingToken;
    f.action=C.apiUrl;submit.disabled=true;showStatus('Submitting your entry…');
    // Standard form POST avoids cross-origin fetch restrictions; result arrives by postMessage.
    timeoutId=setTimeout(()=>finish('No confirmation received. Check the Givers List or contact the organizer before trying again.',false),30000);
    HTMLFormElement.prototype.submit.call(f);
  });
}
setupLinks();updateRecipient();setupForm();refresh();
