(() => {
  'use strict';
  const records=window.EVENTOS_930||[];
  const input=document.getElementById('query');
  const results=document.getElementById('results');
  const message=document.getElementById('message');
  const recentKey='fallas930_recientes';
  let recent=[];
  try {recent=JSON.parse(localStorage.getItem(recentKey)||'[]');if(!Array.isArray(recent))recent=[];} catch {recent=[];}
  const normalize=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const parse=s=>{
    const match=s.trim().match(/^(\d{1,3})(?:\s*[/:-]\s*(\d{1,3}))?$/);
    return match?{code:match[1].padStart(3,'0'),sub:match[2]?match[2].padStart(2,'0'):null}:null;
  };
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  function note(text,kind='notice'){message.replaceChildren(el('div',kind,text));}
  function remember(code){recent=[code,...recent.filter(x=>x!==code)].slice(0,7);try{localStorage.setItem(recentKey,JSON.stringify(recent));}catch{}}
  function field(parent,title,value){const d=el('details');const s=el('summary','',title);const p=el('p',value?'':'missing',value||'Sin texto registrado. Consultar el PDF de origen.');d.append(s,p);parent.append(d);}
  function card(record,openAll=false){
    const article=el('article','result-card');const top=el('div','result-top');
    top.append(el('span','code-badge',record.codigo),el('span','pages','PDF: pág. '+record.paginas.join(', ')));
    const title=el('h2','',record.descripcion||'Descripción pendiente de revisión');
    const state=el('p','warning',record.revision==='Verificado visualmente'?'':record.revision+' · Verifica el PDF antes de intervenir el equipo.');
    const details=el('div','details');
    field(details,'Limitaciones del evento',record.limitaciones);
    field(details,'Detección de la información',record.deteccion);
    field(details,'Guía para la detección de falla',record.guia);
    if(openAll)details.querySelectorAll('details').forEach(d=>d.open=true);
    article.append(top,title,state,details);return article;
  }
  function render(query,save=false){
    const raw=query.trim();results.replaceChildren();message.replaceChildren();
    if(!raw){note('Escribe un código o una palabra de la descripción para comenzar.','empty');return;}
    const parsed=parse(raw);let hits=[];
    if(parsed){
      hits=records.filter(r=>r.codigo===parsed.code);
      if(hits.length&&save)remember(parsed.code);
      if(parsed.sub){
        note(hits.length?
          `Consulta ${parsed.code}/${parsed.sub}: se encontró el evento ${parsed.code}. El subcódigo ${parsed.sub} no está separado ni validado en esta base; revisa la página del PDF antes de interpretarlo.`:
          `No se encontró el evento ${parsed.code}. El subcódigo ${parsed.sub} tampoco se puede validar.`);
      }
    } else {
      const q=normalize(raw);
      hits=records.filter(r=>normalize(r.descripcion).includes(q)||normalize(r.codigo).includes(q)).slice(0,25);
    }
    if(!hits.length){if(!parsed)note('Sin coincidencias. Prueba con el código numérico o una palabra más corta.','empty');return;}
    results.append(el('p','summary',hits.length===1?'1 evento encontrado':`${hits.length} eventos encontrados${!parsed?' (máximo 25)':''}`));
    hits.forEach(r=>results.append(card(r,hits.length===1)));
  }
  document.getElementById('search-form').addEventListener('submit',e=>{e.preventDefault();render(input.value,true);input.blur();});
  input.addEventListener('input',()=>render(input.value,false));
  document.querySelectorAll('[data-example]').forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.example;render(input.value,true);input.focus();}));
  document.getElementById('recent-toggle').addEventListener('click',()=>{
    input.value='';results.replaceChildren();message.replaceChildren();
    if(!recent.length){note('Aún no hay códigos consultados.','empty');return;}
    results.append(el('p','summary','Consultas recientes'));
    recent.map(code=>records.find(r=>r.codigo===code)).filter(Boolean).forEach(r=>results.append(card(r)));
  });
  if('serviceWorker' in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
  render('');
})();
