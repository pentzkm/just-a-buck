const C=window.JAB_CONFIG||{};const $=id=>document.getElementById(id);const states='AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC'.split(' ');
function validUrl(url){try{const u=new URL(url);return u.protocol==='https:'?u.href:null}catch{return null}}
function updateRecipient(data={}){const name=data.recipientName||C.recipientName;const note=data.recipientNote||C.recipientNote;const venmo=data.venmoUrl||C.venmoUrl;if($('recipientName'))$('recipientName').textContent=name||'Coming soon';if($('recipientNote'))$('recipientNote').textContent=note||'The host will announce the current recipient in the Facebook community.';if($('recipientVenmoHandle'))$('recipientVenmoHandle').textContent=data.recipientVenmoHandle||C.recipientVenmoHandle||'Awaiting update';if($('recipientLast4'))$('recipientLast4').textContent=data.recipientLast4||C.recipientLast4||'Awaiting update';const imgPath=data.venmoScreenshot||C.venmoScreenshot;const shot=$('venmoScreenshot'),wrap=$('venmoScreenshotWrap'),empty=$('venmoScreenshotEmpty');if(shot&&wrap&&empty){if(imgPath&&/^assets\/[a-zA-Z0-9_.-]+$/.test(imgPath)){shot.src=imgPath;wrap.hidden=false;empty.hidden=true}else{wrap.hidden=true;empty.hidden=false}};for(const b of [$('venmoBtn')]){if(!b)continue;const url=validUrl(venmo);if(url&&new URL(url).hostname.toLowerCase().match(/(^|\.)venmo\.com$/)){b.href=url;b.classList.remove('btn-disabled');b.removeAttribute('aria-disabled')}else{b.removeAttribute('href');b.classList.add('btn-disabled');b.setAttribute('aria-disabled','true');b.title='The host has not added the current recipient’s Venmo link yet.'}}}
function setupLinks(){for(const id of ['facebook','instagram','telegram','youtube']){const a=$(id);if(a){const url=validUrl(C[id+'Url']);if(url)a.href=url;else a.removeAttribute('href')}}}
async function getPublic(action='public',params={}){if(!C.apiUrl)return null;const u=new URL(C.apiUrl);if(action==='givers')u.pathname=u.pathname.replace(/\/$/,'')+'/givers';else u.searchParams.set('action',action);for(const [k,v] of Object.entries(params))u.searchParams.set(k,v);const r=await fetch(u);if(!r.ok)throw Error('Unable to load');const d=await r.json();if(d.error)throw Error(d.error);return d}
async function refresh(){try{const d=await getPublic();if(d){updateRecipient(d);if($('count'))$('count').textContent=Number(d.count||0).toLocaleString();if($('roundLabel'))$('roundLabel').textContent=d.roundLabel||'Current round';if($('submitEntry')&&d.status!=='OPEN'){$('submitEntry').disabled=true;showStatus('Registration is currently closed.')}}}catch{if($('count'))$('count').textContent='—'}}
function showStatus(msg){const el=$('formStatus');if(el){el.classList.remove('hide');el.textContent=msg}}
function setupForm(){
 const f=$('entryForm'); if(!f)return;
 for(const s of states){const o=document.createElement('option');o.value=s;o.textContent=s;$('state').appendChild(o)}
 let waiting=false;
 const allowedOrigins=['https://script.google.com','https://script.googleusercontent.com'];
 window.addEventListener('message',function(event){
   if(!allowedOrigins.includes(event.origin) && !/^https:\/\/[a-z0-9-]+\.script\.googleusercontent\.com$/.test(event.origin))return;
   const d=event.data;
   if(!d||d.type!=='JAB_REGISTRATION_RESULT'||!waiting||d.token!==f.dataset.token)return;
   waiting=false;
   $('submitEntry').disabled=false;
   if(d.ok){
     showStatus(d.status==='already_registered'?'You are already registered for this round.':'Success! Your entry has been received.');
     if(d.status==='registered')f.reset();
     refresh();
   }else showStatus('Submission failed: '+(d.error||'Please try again.'));
 });
 f.addEventListener('submit',function(e){
   e.preventDefault(); if(waiting)return;
   if(!C.apiUrl){showStatus('Registration is not connected yet.');return}
   const phone=$('phone').value.replace(/\D/g,'');
   const backup=$('backupPhone').value.replace(/\D/g,'');
   if(phone.length!==10||(backup&&backup.length!==10)){showStatus('Please enter valid 10-digit phone numbers.');return}
   const fullName=[$('firstName').value.trim(),$('lastName').value.trim()].join(' ');
   const token=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now())+'-'+Math.random();
   f.dataset.token=token;
   const payload={fullName,email:$('email').value.trim(),designation:$('license').value,state:$('state').value,primaryPhone:phone,secondaryPhone:backup,facebookName:$('facebookName').value.trim(),confirmed:'true',token};
   const frame=document.createElement('iframe');
   frame.name='jab_submission_'+Date.now();frame.title='Registration response';frame.style.display='none';document.body.appendChild(frame);
   const postForm=document.createElement('form');postForm.method='POST';postForm.action=C.apiUrl;postForm.target=frame.name;postForm.style.display='none';
   for(const [key,value] of Object.entries(payload)){const input=document.createElement('input');input.type='hidden';input.name=key;input.value=value;postForm.appendChild(input)}
   document.body.appendChild(postForm);
   waiting=true;$('submitEntry').disabled=true;showStatus('Submitting your entry…');
   postForm.submit();postForm.remove();
   // Keep the hidden frame until Google sends a confirmed response.
   frame.addEventListener('load',()=>{if(!waiting)frame.remove()});
 });
}
setupLinks();updateRecipient();setupForm();refresh();

