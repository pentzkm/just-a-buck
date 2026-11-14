const C=window.JAB_CONFIG||{};const $=id=>document.getElementById(id);const states='AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC'.split(' ');
function validUrl(url){try{const u=new URL(url);return u.protocol==='https:'?u.href:null}catch{return null}}
function updateRecipient(data={}){const name=data.recipientName||C.recipientName;const note=data.recipientNote||C.recipientNote;const venmo=data.venmoUrl||C.venmoUrl;if($('recipientName'))$('recipientName').textContent=name||'Coming soon';if($('recipientNote'))$('recipientNote').textContent=note||'The host will announce the current recipient in the Facebook community.';if($('recipientVenmoHandle'))$('recipientVenmoHandle').textContent=data.recipientVenmoHandle||C.recipientVenmoHandle||'Awaiting update';if($('recipientLast4'))$('recipientLast4').textContent=data.recipientLast4||C.recipientLast4||'Awaiting update';const imgPath=Object.prototype.hasOwnProperty.call(data,'venmoScreenshot')?data.venmoScreenshot:C.venmoScreenshot;const shot=$('venmoScreenshot'),wrap=$('venmoScreenshotWrap'),empty=$('venmoScreenshotEmpty');if(shot&&wrap&&empty){if(imgPath&&/^assets\/[a-zA-Z0-9_.-]+$/.test(imgPath)){shot.src=imgPath;wrap.hidden=false;empty.hidden=true}else{wrap.hidden=true;empty.hidden=false}};for(const b of [$('venmoBtn')]){if(!b)continue;const url=validUrl(venmo);if(url&&new URL(url).hostname.toLowerCase().match(/(^|\.)venmo\.com$/)){b.href=url;b.classList.remove('btn-disabled');b.removeAttribute('aria-disabled')}else{b.removeAttribute('href');b.classList.add('btn-disabled');b.setAttribute('aria-disabled','true');b.title='The host has not added the current recipient’s Venmo link yet.'}}}
function setupLinks(){for(const id of ['facebook','instagram','telegram','youtube']){const a=$(id);if(a){const url=validUrl(C[id+'Url']);if(url)a.href=url;else a.removeAttribute('href')}}}
async function getPublic(action='public',params={}){if(!C.apiUrl)return null;const u=new URL(C.apiUrl);u.searchParams.set('action',action);for(const [k,v] of Object.entries(params))u.searchParams.set(k,v);const r=await fetch(u);if(!r.ok)throw Error('Unable to load');const d=await r.json();if(d.error)throw Error(d.error);return d}
async function refresh(){try{const d=await getPublic('givers');if(d&&$('count'))$('count').textContent=Number(d.count||0).toLocaleString()}catch{if($('count'))$('count').textContent='—'}}
function showStatus(msg){const el=$('formStatus');if(el){el.classList.remove('hide');el.textContent=msg}}
function setupForm(){
  const f=$('entryForm');if(!f)return;
  for(const s of states){const o=document.createElement('option');o.value=s;o.textContent=s;$('state').appendChild(o)}
  {const o=document.createElement('option');o.value='N/A';o.textContent='Not applicable (outside US)';$('state').appendChild(o)}
  const countries=[['US','🇺🇸 United States (+1)','+1'],['CA','🇨🇦 Canada (+1)','+1'],['GB','🇬🇧 United Kingdom (+44)','+44'],['AU','🇦🇺 Australia (+61)','+61'],['IN','🇮🇳 India (+91)','+91'],['PH','🇵🇭 Philippines (+63)','+63'],['NZ','🇳🇿 New Zealand (+64)','+64'],['IE','🇮🇪 Ireland (+353)','+353'],['ZA','🇿🇦 South Africa (+27)','+27']];
  for(const id of ['primaryCountry','secondaryCountry']){
    for(const [country,label,code] of countries){const o=document.createElement('option');o.value=country+'|'+code;o.textContent=label;$(id).appendChild(o)}
  }
  function updateState(){const isUS=$('primaryCountry').value.startsWith('US|');$('state').required=isUS;$('state').disabled=!isUS;if(!isUS)$('state').value='N/A';}
  $('primaryCountry').addEventListener('change',updateState);updateState();
  const submit=$('submitEntry');
  function fullPhone(countryId,phoneId,required){
    const raw=$(phoneId).value.trim();if(!raw&&!required)return '';
    const [country,code]=$(countryId).value.split('|');
    let digits=raw.replace(/\D/g,'');const prefix=code.replace(/\D/g,'');
    if(raw.startsWith('+')&&digits.startsWith(prefix))digits=digits.slice(prefix.length);
    if(code==='+1'&&digits.length===11&&digits.startsWith('1'))digits=digits.slice(1);
    if(code==='+1'&&digits.length!==10)throw Error('US and Canadian phone numbers need 10 digits.');
    if(digits.length<4||digits.length+prefix.length>15)throw Error('Check the '+(required?'primary':'secondary')+' phone number.');
    return code+digits;
  }
  f.addEventListener('submit',e=>{
    e.preventDefault();if(!C.apiUrl){showStatus('Registration is temporarily unavailable.');return}
    if(!f.reportValidity())return;
    try{
      const fullName=[$('firstName').value.trim(),$('lastName').value.trim()].join(' ').trim();
      if(fullName.split(/\s+/).length<2)throw Error('Enter first and last name.');
      $('fullNameValue').value=fullName;$('designationValue').value=$('license').value;
      $('primaryPhoneValue').value=fullPhone('primaryCountry','phone',true);
      $('secondaryPhoneValue').value=fullPhone('secondaryCountry','backupPhone',false);
      if(!$('confirmed').checked||!$('privacy').checked)throw Error('Please check both confirmation boxes.');
      // State is only applicable to US entries. International entries store N/A.
      $('state').disabled=false;if(!$('primaryCountry').value.startsWith('US|'))$('state').value='N/A';
      $('submissionToken').value='';
      f.action=C.apiUrl;
      $('resultWrap').hidden=false;
      showStatus('Submitting… Your registration result will appear below.');
      HTMLFormElement.prototype.submit.call(f);
      if(!$('primaryCountry').value.startsWith('US|')){$('state').value='N/A';$('state').disabled=true}
    }catch(err){showStatus(err.message)}
  });
  $('jabSubmissionFrame').addEventListener('load',()=>{if(!$('resultWrap').hidden)showStatus('Read the registration result below. The public count may take a moment to update.');});
}
async function refreshFeaturedRecipient(){
  try{
    const d=await getPublic('recipient');
    if(!d || !d.recipientName || !d.recipientVenmoHandle || !d.recipientLast4) return;
    const handle=String(d.recipientVenmoHandle).trim();
    if(!/^@[A-Za-z0-9_-]{2,}$/.test(handle)) return;
    updateRecipient({
      recipientName:String(d.recipientName),
      recipientNote:'Featured nurse · Current gifting round',
      recipientVenmoHandle:handle,
      recipientLast4:String(d.recipientLast4),
      venmoUrl:'https://www.venmo.com/'+encodeURIComponent(handle.slice(1)),
      venmoScreenshot:''
    });
  }catch(err){console.warn('Featured nurse could not be refreshed:',err)}
}
setupLinks();updateRecipient();setupForm();refresh();refreshFeaturedRecipient();

