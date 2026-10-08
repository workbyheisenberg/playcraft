// Static (Cloudflare Pages) backend: everything persists in localStorage and generated
// skins are canvas data URLs. Mirrors the small subset of /api used by the client so
// the React app and engine work unchanged. No server, no network, no real payments.
import {analyzeImage,describeLogo,generateSkinDataUrl} from './localimaging';

const PREFIX='letscraft.';
const DAY=86400000;
const missing=['Network and chain-specific adapter','Destination contract and payment event interface','Eligible token identities and integer decimals','Exact/minimum amount and under/overpayment rules','Confirmation and reorganization policy','Persistent account and signed-wallet attribution mechanism','Trusted logo source and usage rights','Logo-analysis provider','Skin-generation provider','Post-payment retry, uncertain-job reconciliation and refund policy','Approved concrete adapters and persistent paid-account ownership are not implemented'];
const states=['unavailable configuration','awaiting transfer','verifying','confirmed','analyzing logo','generating','ready','failed'];
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

type Stored={revision:number;edits:Record<string,number>;position:number[];selected:number;appearance:string;usdg:number};
function read<T>(key:string,def:T):T{try{const v=localStorage.getItem(PREFIX+key);return v?JSON.parse(v) as T:def;}catch{return def;}}
function write(key:string,value:unknown){try{localStorage.setItem(PREFIX+key,JSON.stringify(value));}catch{}}
function remove(key:string){try{localStorage.removeItem(PREFIX+key);}catch{}}
function uuid(){return crypto.randomUUID?crypto.randomUUID():`${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;}
function uid(){let id=read<string|null>('uid',null);if(!id){id=uuid();write('uid',id);}return id;}
const defaultWorld=():Stored=>({revision:0,edits:{},position:[],selected:0,appearance:'trencher',usdg:0});

const capabilities=()=>({live:false,amount:'100,000',state:'unavailable configuration',missing,states,recovery:'No transfer is requested. Progress is saved in this browser only. No refund or regeneration policy is promised.'});

function worldGet():Stored{const w=read<Stored|null>('world',null);return w?{...defaultWorld(),...w}:defaultWorld();}
function worldPut(data:Partial<Stored>){const cur=worldGet();if((data.revision??0)!==cur.revision)throw Error('Another tab saved this world. Reload before making more changes.');const next={...cur,...data,revision:cur.revision+1};write('world',next);return {revision:next.revision};}

function walletGet(){return {wallet:read<{address:string;chain:string}|null>('wallet',null)};}
function walletPost(data:{address?:string;chain?:string}){const address=typeof data?.address==='string'?data.address.trim():'';const chain=typeof data?.chain==='string'&&data.chain?data.chain.slice(0,32):'unknown';if(!/^0x[0-9a-fA-F]{40}$/.test(address))throw Error('Enter a valid wallet address (0x followed by 40 hex characters).');const wallet={address:address.toLowerCase(),chain};write('wallet',wallet);return {wallet};}

function hashSeed(value:string){let h=2166136261>>>0;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function leaderboard(){const now=Date.now();const t=(now-Math.floor(now/DAY)*DAY)/1000;const players=BOTS.map((b,i)=>({wallet:b.wallet,character:b.character,usdg:Math.round((b.base+b.rate*t+(Math.sin(t/5+i*1.7)+1)*.06)*100)/100})).sort((a,b)=>b.usdg-a.usdg);const w=worldGet();const wallet=read<{address:string}|null>('wallet',null);const cents=Number.isInteger(w.usdg)&&w.usdg>0?w.usdg:0;const base=100+(hashSeed(uid())%101);return {updated:now,players,user:{rank:Math.max(100,base-Math.floor(cents/250)),wallet:wallet?.address??null,character:w.appearance||'trencher',usdg:Math.round(cents)/100}};}

type Req={id:string;state:string;detail:string;created:string;updated:string;stage:string|null;verified:boolean;prompt:string|null;interpretation:string|null;blockers:string[];events:{state:string;detail:string;created:string}[]};
function requests():Req[]{return read<Req[]>('requests',[]);}
function appearances():Record<string,string>{return read<Record<string,string>>('appearances',{});}
function view(r:Req){return {...r,verified:!!r.verified,local:!!appearances()[r.id],appearance:appearances()[r.id]??null};}
function list(){return requests().map(view);}
function draft(){const items=requests();const existing=items.find(r=>r.state==='unavailable configuration');if(existing)return view(existing);const now=new Date().toISOString();const r:Req={id:uuid(),state:'unavailable configuration',detail:'Draft saved in this browser. No payment requested.',created:now,updated:now,stage:null,verified:false,prompt:null,interpretation:null,blockers:missing,events:[{state:'unavailable configuration',detail:'Draft saved in this browser.',created:now}]};items.unshift(r);write('requests',items);return view(r);}
function loadImage(src:string){return new Promise<HTMLImageElement>((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('That image could not be read. Try a PNG export.'));i.src=src;});}
async function generate(id:string,data:{image?:string;name?:string;symbol?:string}){const items=requests();const r=items.find(x=>x.id===id);if(!r)throw Error('Customization request not found');const image=typeof data?.image==='string'?data.image:'';if(!image)throw Error('Attach a PNG token logo before generating a character.');const img=await loadImage(image);const analysis=analyzeImage(img);const interpretation=describeLogo(analysis,{name:data.name,symbol:data.symbol});const prompt=`Create an original compatible LetsCraft block-character skin using this actual token-logo interpretation: ${interpretation}\nPNG atlas: 192×16 pixels, twelve 16×16 tiles left to right: torso, head, hair, left leg, right leg, left arm, right arm, left boot, right boot, left eye, right eye, belt. Each tile repeats on all six faces of its matching part. Preserve the standard geometry and mascot palette. No text, no changed proportions. Opaque pixel art.`;const appearanceId=uuid();try{localStorage.setItem(PREFIX+'skin.'+appearanceId,generateSkinDataUrl(img,analysis));}catch{}const map=appearances();map[id]=appearanceId;write('appearances',map);const now=new Date().toISOString();r.state='ready';r.stage=null;r.interpretation=interpretation;r.prompt=prompt;r.updated=now;r.events.push({state:'analyzing logo',detail:'Analyzed the uploaded token logo locally.',created:now},{state:'generating',detail:'Generated a compatible skin locally.',created:now},{state:'ready',detail:'Generated skin validated and ready to preview.',created:now});write('requests',items);try{localStorage.setItem(PREFIX+'logo.'+id,image);localStorage.setItem(PREFIX+'meta.'+id,JSON.stringify({name:data.name??'',symbol:data.symbol??''}));}catch{}return view(r);}
async function retry(id:string){const image=read<string|null>('logo.'+id,null);if(!image)throw Error('The uploaded logo was not kept; upload it again to regenerate.');const meta=read<{name?:string;symbol?:string}>('meta.'+id,{});return generate(id,{image,name:meta.name,symbol:meta.symbol});}

export async function localApi(url:string,method='GET',data?:unknown):Promise<unknown>{
 const path=url.split('?')[0];
 if(path==='capabilities')return capabilities();
 if(path==='world')return method==='PUT'?worldPut((data??{}) as Partial<Stored>):worldGet();
 if(path==='wallet'){if(method==='POST')return walletPost((data??{}) as {address?:string;chain?:string});if(method==='DELETE'){remove('wallet');return {wallet:null};}return walletGet();}
 if(path==='leaderboard')return leaderboard();
 if(path==='requests')return method==='POST'?{request:draft()}:{requests:list()};
 const m=/^requests\/([0-9a-fA-F-]{36})\/(logo|retry)$/.exec(path);
 if(m)return {request:m[2]==='logo'?await generate(m[1],(data??{}) as {image?:string;name?:string;symbol?:string}):await retry(m[1])};
 throw Error('Unknown local route: '+path);
}
