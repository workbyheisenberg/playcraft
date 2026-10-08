import React,{useRef,useState} from 'react';
import {api} from './api';
import {GeneratedPreview} from './Requests';

type Result={appearance:string|null;interpretation:string|null;prompt:string|null;state:string;detail:string};

async function toPng(file:File):Promise<string>{
 const url=URL.createObjectURL(file);
 try{
  const img=await new Promise<HTMLImageElement>((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('That image could not be read. Try a PNG export.'));i.src=url;});
  const scale=Math.min(1,256/Math.max(img.width,img.height));
  const w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));
  const c=document.createElement('canvas');c.width=w;c.height=h;
  const g=c.getContext('2d');if(!g)throw Error('Canvas is unavailable in this browser.');
  g.drawImage(img,0,0,w,h);
  return c.toDataURL('image/png');
 }finally{URL.revokeObjectURL(url);}
}

export function TokenStudio({onEquipped}:{onEquipped:(style:string)=>Promise<void>}){
 const input=useRef<HTMLInputElement>(null);
 const[logo,setLogo]=useState('');const[fileName,setFileName]=useState('');
 const[name,setName]=useState('');const[symbol,setSymbol]=useState('');
 const[busy,setBusy]=useState(false);const[error,setError]=useState('');const[result,setResult]=useState<Result|null>(null);const[equipped,setEquipped]=useState(false);
 async function pick(file?:File){
  if(!file)return;setError('');
  if(!file.type.startsWith('image/')){setError('Choose a PNG, JPEG or WebP image of your token logo.');return;}
  try{setLogo(await toPng(file));setFileName(file.name);setResult(null);setEquipped(false);}catch(e){setError((e as Error).message);}
 }
 async function create(){
  if(!logo||busy)return;setBusy(true);setError('');
  try{const{request}=await api('requests','POST') as {request:{id:string}};const done=await api(`requests/${request.id}/logo`,'POST',{image:logo,name,symbol}) as {request:Result};setResult(done.request);}
  catch(e){setError((e as Error).message);}
  finally{setBusy(false);}
 }
 async function equip(){
  if(!result?.appearance||busy)return;setBusy(true);setError('');
  try{await onEquipped('generated:'+result.appearance);setEquipped(true);}
  catch(e){setError((e as Error).message);}
  finally{setBusy(false);}
 }
 return <div className="token-studio">
  <div className={logo?'logo-drop filled':'logo-drop'} role="button" tabIndex={0} onClick={()=>input.current?.click()} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')input.current?.click();}}>
   <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/*" hidden onChange={e=>{void pick(e.target.files?.[0]);e.target.value='';}}/>
   {logo?<img src={logo} alt="Selected token logo"/>:<><strong>Upload your token logo</strong><span>PNG, JPEG or WebP · any size</span></>}
  </div>
  {fileName&&<p className="tiny logo-name">{fileName} — click to replace</p>}
  <div className="studio-inputs">
   <label>Token name<input value={name} maxLength={60} onChange={e=>setName(e.target.value)} placeholder="e.g. Sunrise" disabled={busy}/></label>
   <label>Symbol<input value={symbol} maxLength={12} onChange={e=>setSymbol(e.target.value.toUpperCase())} placeholder="e.g. SUN" disabled={busy}/></label>
  </div>
  <button className="primary create-token" disabled={!logo||busy} onClick={()=>void create()}>{busy?'Analyzing logo…':'Analyze logo & create character'}</button>
  <p className="tiny">Runs locally in this sandbox: the logo is analyzed, a character prompt is written, and a skin is generated. Nothing is transferred or charged.</p>
  {error&&<p role="alert" className="request-error">{error}</p>}
  {result?.state==='ready'&&result.appearance&&<div className="token-result">
   <h4>Logo interpretation</h4><p>{result.interpretation}</p>
   <GeneratedPreview id={result.appearance}/>
   <details><summary>Generation prompt</summary><p>{result.prompt}</p></details>
   <button className="secondary" disabled={busy||equipped} onClick={()=>void equip()}>{equipped?'✓ Equipped in your world':'Equip this character'}</button>
  </div>}
 </div>;
}
