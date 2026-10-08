import React,{useEffect,useRef,useState} from 'react';
import {preview} from './game/engine';
import {shortAddress} from './wallet';
import {api} from './api';

type Row={wallet:string;character:string;xau:number};
type Board={players:Row[];user:{rank:number;wallet:string|null;character:string;xau:number}};

function AvatarIcon({style}:{style:string}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{try{return preview(ref.current!,style);}catch{}},[style]);
 return <div className="lb-avatar" ref={ref}/>;
}

export function Leaderboard({liveXau,appearance,wallet}:{liveXau:number;appearance:string;wallet:string|null}){
 const[board,setBoard]=useState<Board|null>(null);const[error,setError]=useState('');
 useEffect(()=>{
  let alive=true;
  async function pull(){try{const j=await api('leaderboard');if(alive)setBoard(j);}catch(e){if(alive)setError((e as Error).message);}}
  void pull();
  const timer=setInterval(()=>void pull(),5000);
  return()=>{alive=false;clearInterval(timer);};
 },[]);
 const user=board?.user;
 const userXau=Math.max(liveXau,user?.xau??0);
 return <div className="leaderboard-layout">
  <section className="leaderboard">
   <div className="card-top"><span className="eyebrow">MINERS LEADERBOARD</span><span className="pill">LIVE · +5 $XAU/S</span></div>
   <ol className="lb-list">
    {(board?.players??[]).map((r,i)=><li key={r.wallet} className={i<3?`lb-row top${i+1}`:'lb-row'}><span className="lb-rank">{i+1}</span><AvatarIcon style={r.character}/><div className="lb-who"><strong>{shortAddress(r.wallet)}</strong><small>miner</small></div><span className="lb-xau">{r.xau.toLocaleString()} <em>$XAU</em></span></li>)}
   </ol>
   <div className="lb-gap">···</div>
   <div className="lb-row me"><span className="lb-rank">{user?.rank??'—'}</span><AvatarIcon style={appearance}/><div className="lb-who"><strong>{wallet?shortAddress(wallet):'Your wallet'}</strong><small>you</small></div><span className="lb-xau">{userXau.toLocaleString()} <em>$XAU</em></span></div>
   {error&&<p className="request-error">{error}</p>}
  </section>
  <aside className="xau-banner">
   <span className="eyebrow">REAL XAU POOL</span>
   <div className="xau-rate"><strong>1 $XAU</strong><span>=</span><strong>0.00002 USD</strong></div>
   <p>of real XAU from pool</p>
   <small>Reference rate for the pool-backed $XAU. Mining in the valley does not transfer real assets.</small>
  </aside>
 </div>;
}
