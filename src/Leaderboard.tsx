import React,{useEffect,useState} from 'react';
import {Portrait} from './Portrait';
import {shortAddress} from './wallet';
import {api} from './api';

type Row={wallet:string;character:string;usdg:number};
type Board={players:Row[];user:{rank:number;wallet:string|null;character:string;usdg:number}};

const cash=(n:number)=>n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});

function AvatarIcon({style}:{style:string}){
 return <Portrait style={style} className="lb-avatar"/>;
}

export function Leaderboard({liveUsdg,appearance,wallet}:{liveUsdg:number;appearance:string;wallet:string|null}){
 const[board,setBoard]=useState<Board|null>(null);const[error,setError]=useState('');
 useEffect(()=>{
  let alive=true;
  async function pull(){try{const j=await api('leaderboard');if(alive)setBoard(j);}catch(e){if(alive)setError((e as Error).message);}}
  void pull();
  const timer=setInterval(()=>void pull(),5000);
  return()=>{alive=false;clearInterval(timer);};
 },[]);
 const user=board?.user;
 const userUsdg=Math.max(liveUsdg/100,user?.usdg??0);
 return <div className="leaderboard-layout">
  <section className="leaderboard">
   <div className="card-top"><span className="eyebrow">FED HUNTERS LEADERBOARD</span><span className="pill">LIVE · $USDG</span></div>
   <ol className="lb-list">
    {(board?.players??[]).map((r,i)=><li key={r.wallet} className={i<3?`lb-row top${i+1}`:'lb-row'}><span className="lb-rank">{i+1}</span><AvatarIcon style={r.character}/><div className="lb-who"><strong>{shortAddress(r.wallet)}</strong><small>hunter</small></div><span className="lb-usdg">{cash(r.usdg)} <em>$USDG</em></span></li>)}
   </ol>
   <div className="lb-gap">···</div>
   <div className="lb-row me"><span className="lb-rank">{user?.rank??'—'}</span><AvatarIcon style={appearance}/><div className="lb-who"><strong>{wallet?shortAddress(wallet):'Your wallet'}</strong><small>you</small></div><span className="lb-usdg">{cash(userUsdg)} <em>$USDG</em></span></div>
   {error&&<p className="request-error">{error}</p>}
  </section>
  <aside className="usdg-banner">
   <span className="eyebrow">USDG REWARDS</span>
   <div className="usdg-rate"><strong>0.09 $USDG</strong><span>per Fed runner</span></div>
   <p>Runners pour out of the FED door every 10 seconds. Aim, hold click, and cash in.</p>
   <small>Sandbox rewards only. Nothing here transfers real assets.</small>
  </aside>
 </div>;
}
