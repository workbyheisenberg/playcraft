import React,{useEffect,useRef,useState} from 'react';
import {preview} from './game/engine';
import {composeShareCard} from './sharecard';

function ShareAvatar({style,onCanvas}:{style:string;onCanvas:(c:HTMLCanvasElement)=>void}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{try{const cleanup=preview(ref.current!,style,{preserve:true});const t=setTimeout(()=>{const cv=ref.current?.querySelector('canvas');if(cv)onCanvas(cv);},700);return()=>{clearTimeout(t);cleanup?.();};}catch{}},[style]);
 return <div className="share-avatar" ref={ref}/>;
}

export function ShareModal({appearance,name,referral,onClose}:{appearance:string;name:string;referral:string;onClose:()=>void}){
 const[text,setText]=useState(`the fed pays in $USDG! join my valley ${referral}`);
 const[card,setCard]=useState('');
 const[copied,setCopied]=useState(false);
 const intent=`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
 function copy(){const p=navigator.clipboard?.writeText(text);if(!p)return;void p.then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1500);}).catch(()=>{});}
 async function grab(canvas:HTMLCanvasElement){try{setCard(await composeShareCard(canvas,name,referral));}catch{}}
 function download(){if(!card)return;const a=document.createElement('a');a.href=card;a.download='letscraft-card.png';document.body.appendChild(a);a.click();a.remove();}
 return <div className="share-overlay" onClick={onClose}>
  <div className="share-card" onClick={e=>e.stopPropagation()}>
   <button className="close" aria-label="Close" onClick={onClose}>×</button>
   <div className="share-head">
    <span className="eyebrow">SHARE LETSCRAFT</span>
    <h2>Invite friends, earn $USDG</h2>
    <p>Share LetsCraft and invite your friend to earn $USDG — you get a <strong>10% bonus</strong> of the $USDG they earn.</p>
   </div>
   <div className="share-body">
    <div className="share-stage"><ShareAvatar style={appearance} onCanvas={grab}/><small>Your miner · {name}</small></div>
    <div className="share-tweet">
     <label>Tweet ready to post</label>
     <textarea value={text} onChange={e=>setText(e.target.value)} rows={4}/>
     <div className="share-card-preview">{card?<img src={card} alt="Share card"/>:<span>Rendering your share card…</span>}</div>
     <div className="share-actions">
      <a className="primary share-tweet-btn share-x" href={intent} target="_blank" rel="noopener noreferrer">Tweet this ↗</a>
      <button className="secondary" onClick={copy}>{copied?'Copied ✓':'Copy tweet'}</button>
      <button className="secondary" onClick={download} disabled={!card}>Download card</button>
     </div>
     <p className="tiny">Referral link: <code>{referral}</code></p>
    </div>
   </div>
  </div>
 </div>;
}
