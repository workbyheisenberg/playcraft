import React,{useEffect,useState} from 'react';
import {Portrait} from './Portrait';
import {shortAddress} from './wallet';
import {api} from './api';

type Row={wallet:string;character:string;spacex:number};
type Board={players:Row[];user:{rank:number;wallet:string|null;character:string;spacex:number}};

const cash=(n:number)=>n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});

function AvatarIcon({style}:{style:string}){
 return <Portrait style={style} className="lb-avatar"/>;
}

export function Leaderboard({liveSpacex,appearance,wallet}:{liveSpacex:number;appearance:string;wallet:string|null}){
 const[board,setBoard]=useState<Board|null>(null);const[error,setError]=useState('');
 useEffect(()=>{
  let alive=true;
  async function pull(){try{const j=await api('leaderboard');if(alive)setBoard(j as Board);}catch(e){if(alive)setError((e as Error).message);}}
  void pull();
  const timer=setInterval(()=>void pull(),5000);
  return()=>{alive=false;clearInterval(timer);};
 },[]);
 const user=board?.user;
 const userSpacex=Math.max(liveSpacex/100,user?.spacex??0);
 return <div className="leaderboard-layout">
  <section className="leaderboard">
   <div className="card-top"><span className="eyebrow">MOON CAMP LEADERBOARD</span><span className="pill">LIVE · $SPACEX</span></div>
   <ol className="lb-list">
    {(board?.players??[]).map((r,i)=><li key={r.wallet} className={i<3?`lb-row top${i+1}`:'lb-row'}><span className="lb-rank">{i+1}</span><AvatarIcon style={r.character}/><div className="lb-who"><strong>{shortAddress(r.wallet)}</strong><small>hunter</small></div><span className="lb-spacex">{cash(r.spacex)} <em>$SPACEX</em></span></li>)}
   </ol>
   <div className="lb-gap">···</div>
   <div className="lb-row me"><span className="lb-rank">{user?.rank??'—'}</span><AvatarIcon style={appearance}/><div className="lb-who"><strong>{wallet?shortAddress(wallet):'Your wallet'}</strong><small>you</small></div><span className="lb-spacex">{cash(userSpacex)} <em>$SPACEX</em></span></div>
   {error&&<p className="request-error">{error}</p>}
  </section>
  <aside className="spacex-banner">
   <span className="eyebrow">SPACEX REWARDS</span>
   <div className="spacex-rate"><strong>0.09 $SPACEX</strong><span>per camp runner</span></div>
   <p>Runners step out of the moon camp airlock every 10 seconds. Aim, hold click, and claim your stock.</p>
   <small>Sandbox rewards only. Nothing here transfers real assets.</small>
  </aside>
 </div>;
}
