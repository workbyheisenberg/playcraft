import React from 'react';
import {characters} from './game/characters';
import {Portrait} from './Portrait';
import {HeroMap} from './HeroMap';
import {shortAddress,type Wallet} from './wallet';

export function Landing({spacex,style,wallet,onPlay,onEquip,onCharacterPage,onShare}:{spacex:number;style:string;wallet:Wallet|null;onPlay:()=>void;onEquip:(id:string)=>void;onCharacterPage:()=>void;onShare:()=>void}){
 const free=characters.filter(c=>c.group!=='locked');
 return <>
  <section className="hero">
   <div className="hero-art" aria-hidden="true"><HeroMap/><div className="hero-shade"/></div>
   <div className="hero-copy">
   <span className="hero-kicker">VOXEL LUNAR HUNT · SANDBOX</span>
   <h1>Hunt the camp.<br/><em>Earn $SPACEX.</em></h1>
   <p>A calm voxel moon under a pale yellow sky. Hit the $SPACEX runners at the moon camp base, dock at the starship depot, and carve the 128 × 128 lunar surface block by block.</p>
    <div className="hero-actions">
     <button className="primary" onClick={onPlay}><span className="play-glyph">▶</span> Enter the valley</button>
     <button className="ghost" onClick={onCharacterPage}>Choose your character</button>
     <button className="ghost" onClick={onShare}>Share &amp; earn 10%</button>
    </div>
    <div className="hero-badges">
     <span className="badge-chip">{free.length} free legends</span>
     <span className="badge-chip green">+0.09 $SPACEX per runner</span>
     <span className="badge-chip">Moon camp base</span>
     {wallet&&<span className="badge-chip mono">{shortAddress(wallet.address)}</span>}
    </div>
   </div>
   <div className="hero-scroll">Scroll to play<span>▾</span></div>
  </section>
  <section className="stats">
   <div className="stat"><strong>{free.length}</strong><span>Free characters</span></div>
   <div className="stat"><strong>{(spacex/100).toFixed(2)}</strong><span>$SPACEX earned</span></div>
   <div className="stat"><strong>0.09</strong><span>$SPACEX per runner</span></div>
   <div className="stat"><strong>128 × 128</strong><span>Voxel world</span></div>
  </section>
  <section className="featured">
   <div className="section-head center">
    <span className="eyebrow">CHARACTERS</span>
    <h2>Choose your <em>legend</em></h2>
    <p>Every astronaut plays the same — pick the look you want to take across the lunar surface. Free to switch anytime.</p>
   </div>
   <div className="cards-grid">
    {characters.map(c=>{
     const locked=c.group==='locked',equipped=style===c.id;
     return <article className={locked?'game-card locked':equipped?'game-card equipped':'game-card'} key={c.id}>
      <div className="card-cover">
       <Portrait style={c.id} className="card-portrait"/>
       <span className={locked?'pill dark':'pill'}>{locked?'LOCKED':c.group==='default'?'STARTER':'FREE'}</span>
      </div>
      <div className="card-body">
       <h3>{c.name}</h3>
       <div className="card-tags">{c.tags.map(t=><span className="tag" key={t}>{t}</span>)}</div>
       <p className="card-desc">{c.tagline}</p>
      </div>
      <div className="card-foot">
       {locked?<button className="ghost small" disabled>Locked — coming soon</button>:equipped?<span className="equipped-tag">✓ Equipped</span>:<button className="primary small" onClick={()=>onEquip(c.id)}>Equip {c.short}</button>}
      </div>
     </article>;
    })}
   </div>
  </section>
 </>;
}
