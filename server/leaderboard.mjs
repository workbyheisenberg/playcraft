// Dummy leaderboard that grows realistically: each bot earns about 0.06 $SPACEX per
// second with a small deterministic wobble, from a day-start epoch so numbers keep
// rising. Values are $SPACEX amounts with two decimals.
const DAY=86400000;
const BOTS=[
 {wallet:'0x7f2a9c1e5b8d4a630f9c2e7b1a5d8f3c60e4b9a2',character:'bitcoin',base:158,rate:.056},
 {wallet:'0x3c8e1b6d9a4f2705e1c8b3d6a9f2c5e8b1d4a70f',character:'ethereum',base:171,rate:.051},
 {wallet:'0x91d4f7a2c5e8b1d460f3a6c9e2b5d8f1a4c7e0b3',character:'solana',base:184,rate:.058},
 {wallet:'0x5a0c3f6e9b2d5a8c1f4e7b0d3a6c9f2e5b8d1a40',character:'hyperliquid',base:197,rate:.047},
 {wallet:'0x0b4e7a1d4c7f2a5d8b1e4c7f0a3d6b9e2c5f8a10',character:'robinhood',base:211,rate:.053},
 {wallet:'0x8e1b4d7a0c3f6e9b2d5a8c1f4e7b0d3a6c9f2e50',character:'zcash',base:224,rate:.049},
 {wallet:'0x2d5a8c1f4e7b0d3a6c9f2e5b8d1a4c7f0e3b6d90',character:'binance',base:238,rate:.061},
 {wallet:'0x6b9e2c5f8a1d4b7e0c3f6a9d2b5e8c1f4a7d0b30',character:'bitcoin',base:251,rate:.05},
 {wallet:'0x4c7f0a3d6b9e2c5f8a1d4b7e0c3f6a9d2b5e8c10',character:'ethereum',base:266,rate:.055},
 {wallet:'0x9d2b5e8c1f4a7d0b3e6c9f2a5d8b1e4c7f0a3d60',character:'solana',base:282,rate:.059}
];
function hashSeed(value){let h=2166136261>>>0;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
export function leaderboard(now,user={}){
 const t=(now-Math.floor(now/DAY)*DAY)/1000;
 const players=BOTS.map((b,i)=>({wallet:b.wallet,character:b.character,spacex:Math.round((b.base+b.rate*t+(Math.sin(t/5+i*1.7)+1)*.06)*100)/100})).sort((a,b)=>b.spacex-a.spacex);
 const cents=Number.isInteger(user.spacex)&&user.spacex>0?user.spacex:0;
 const spacex=Math.round(cents)/100;
 // The first rank is a stable random value between 100 and 200, improving as $SPACEX grows.
 const base=user.seed?100+(hashSeed(String(user.seed))%101):200;
 const rank=Math.max(100,base-Math.floor(cents/250));
 return {updated:now,players,user:{rank,wallet:user.wallet??null,character:user.character||'trencher',spacex}};
}
