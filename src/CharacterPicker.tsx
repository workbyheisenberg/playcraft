import React,{useEffect,useRef,useState} from 'react';
import {characters} from './game/characters';
import {preview} from './game/engine';

function BigPreview({id}:{id:string}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{try{return preview(ref.current!,id);}catch{}},[id]);
 return <div className="picker-preview" ref={ref}/>;
}

export function CharacterPicker({onPick}:{onPick:(id:string)=>void}){
 const[choice,setChoice]=useState('trencher');
 const selected=characters.find(c=>c.id===choice)??characters[0];
 return <div className="picker-overlay">
  <div className="picker-card">
   <div className="picker-head"><span className="eyebrow">FIRST TIME IN THE VALLEY</span><h2>Choose your character</h2><p>Every character is free. You can switch anytime on the Character page.</p></div>
   <div className="picker-body">
    <div className="picker-stage"><BigPreview id={choice}/><div className="picker-name"><h3>{selected.name}</h3><p>{selected.tagline}</p></div></div>
    <div className="picker-grid">
     {characters.map(c=><button key={c.id} className={c.group==='locked'?'picker-option locked':choice===c.id?'picker-option active':'picker-option'} disabled={c.group==='locked'} onClick={()=>setChoice(c.id)}><i style={{background:c.swatch}}/><div><strong>{c.short}</strong><small>{c.name}</small></div>{c.group==='locked'?<span className="pill">LOCKED</span>:choice===c.id&&<span className="picker-check">✓</span>}</button>)}
     <div className="picker-option soon"><i className="soon-dot"/><div><strong>Customize Trenchero</strong><small>Coming soon</small></div><span className="pill">SOON</span></div>
    </div>
   </div>
   <div className="picker-actions"><button className="secondary" onClick={()=>onPick('trencher')}>Keep The Trencher</button><button className="primary" onClick={()=>onPick(choice)}>Play as {selected.short}</button></div>
  </div>
 </div>;
}
