export function parseQuery(codeValue,subValue=''){
 const value=String(codeValue??'').trim();const supplied=String(subValue??'').trim();
 const m=value.match(/^(\d{1,3})(?:\s*[/\-.:]\s*(\d{1,2}))?$/);
 if(!m)throw new Error('Ingresa un código numérico, por ejemplo 36 o 36/4.');
 if(supplied&&!/^\d{1,2}$/.test(supplied))throw new Error('El subíndice debe tener uno o dos dígitos.');
 if(m[2]&&supplied&&Number(m[2])!==Number(supplied))throw new Error('Los dos subíndices no coinciden. Corrige uno de los campos.');
 return {code:String(Number(m[1])).padStart(3,'0'),sub:(supplied||m[2])?String(Number(supplied||m[2])).padStart(2,'0'):null};
}
export function resolveEvent(events,query){
 const event=events.find(e=>e.code===query.code);if(event)return {event,alias:false};
 // The supplied manual defines 100–199 for inverter 1 and 200–299 for inverter 2.
 const n=Number(query.code);if(n>=200&&n<=299){const base=events.find(e=>Number(e.code)===n-100);if(base&&/Inversor\s*1\s*\/\s*2/i.test(base.title))return {event:{...base,code:query.code,baseCode:base.code},alias:true};}
 return null;
}
export function getGuides(event,sub){
 const selected=sub?Number(sub):null;
 return {specific:false,steps:event.steps.map(step=>({...step,selected:selected!==null&&step.number===selected})),context:''};
}
export const keyOf=q=>`${q.code}${q.sub?'/'+q.sub:''}`;
export function sourceLink(doc,page){const part=doc.parts.find(p=>page>=p.start&&page<=p.end)||doc.parts[0];return part.file+(page?'#page='+(page-part.start+1):'');}
