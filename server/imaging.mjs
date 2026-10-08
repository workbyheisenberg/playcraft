// Sandbox logo analysis and skin generation. Everything runs locally with pngjs:
// no network fetch, no external AI provider, deterministic output per logo.
import {PNG} from 'pngjs';
import {WorkflowError} from './integrations.mjs';

const hex=c=>'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');
const parse=value=>{const m=/^#?([0-9a-f]{6})$/i.exec(value||'');if(!m)throw new WorkflowError(422,'Invalid palette color');const n=parseInt(m[1],16);return[(n>>16)&255,(n>>8)&255,n&255];};
const luminance=c=>0.2126*c[0]+0.7152*c[1]+0.0722*c[2];
const shade=(c,f)=>c.map(v=>Math.max(0,Math.min(255,Math.round(v*f))));
const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));

// Validation mirrors the customization boundary: PNG magic, CRC, dimensions, visible pixels.
function readPng(bytes){
  if(!Buffer.isBuffer(bytes)||bytes.length>2*1024*1024||bytes.length<24||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new WorkflowError(422,'Logo must be a PNG image under 2 MB');
  const w=bytes.readUInt32BE(16),h=bytes.readUInt32BE(20);
  if(w<1||h<1||w>1024||h>1024)throw new WorkflowError(422,'Logo dimensions are incompatible');
  const img=PNG.sync.read(bytes,{checkCRC:true});
  let visible=false;for(let i=3;i<img.data.length;i+=4)if(img.data[i]>0){visible=true;break;}
  if(!visible)throw new WorkflowError(422,'Logo image is empty');
  return img;
}
function background(img){const {width:w,height:h,data}=img;const bins=new Map();const push=(x,y)=>{const i=(y*w+x)*4;if(data[i+3]<200)return;const k=`${data[i]>>4},${data[i+1]>>4},${data[i+2]>>4}`;const e=bins.get(k)||[0,0,0,0];e[0]+=data[i];e[1]+=data[i+1];e[2]+=data[i+2];e[3]++;bins.set(k,e);};for(let x=0;x<w;x++){push(x,0);push(x,h-1);}for(let y=0;y<h;y++){push(0,y);push(w-1,y);}let top=null;for(const e of bins.values())if(!top||e[3]>top[3])top=e;return top?top.slice(0,3).map(v=>Math.round(v/top[3])):null;}

export function analyzeLogo(bytes){
  const img=readPng(bytes);const {width:w,height:h,data}=img;const bg=background(img);
  const near=(c,b,t=52)=>{const dr=c[0]-b[0],dg=c[1]-b[1],db=c[2]-b[2];return dr*dr+dg*dg+db*db<=t*t;};
  const fg=new Uint8Array(w*h);const bins=new Map();
  let count=0,minX=w,minY=h,maxX=-1,maxY=-1,sumL=0,sumSat=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=(y*w+x)*4,alpha=data[i+3],c=[data[i],data[i+1],data[i+2]];
    if(alpha<128||(bg&&near(c,bg)))continue;
    fg[y*w+x]=1;count++;
    if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
    sumL+=luminance(c);sumSat+=Math.max(...c)-Math.min(...c);
    const k=`${c[0]>>4},${c[1]>>4},${c[2]>>4}`;const e=bins.get(k)||[0,0,0,0];e[0]+=c[0];e[1]+=c[1];e[2]+=c[2];e[3]++;bins.set(k,e);
  }
  if(!count)throw new WorkflowError(422,'Logo has no visible artwork to analyze');
  let sym=0,tot=0;for(let y=0;y<h;y++)for(let x=0;x<Math.floor(w/2);x++){tot++;if(fg[y*w+x]===fg[y*w+(w-1-x)])sym++;}
  const ranked=[...bins.values()].sort((a,b)=>b[3]-a[3]).slice(0,6).map(e=>({rgb:e.slice(0,3).map(v=>Math.round(v/e[3])),share:e[3]/count}));
  const byLight=[...ranked].sort((a,b)=>luminance(a.rgb)-luminance(b.rgb));
  const primary=ranked[0].rgb,dark=byLight[0].rgb,light=byLight[byLight.length-1].rgb;
  const second=ranked[1]?.rgb??mix(primary,[255,255,255],.28),third=ranked[2]?.rgb??mix(primary,[0,0,0],.28);
  const bw=maxX-minX+1,bh=maxY-minY+1,fill=count/(bw*bh),coverage=count/(w*h),symmetry=tot?sym/tot:1;
  const brightness=sumL/count,saturation=sumSat/count;
  const analysis={
    width:w,height:h,coverage:Math.round(coverage*1000)/1000,symmetry:Math.round(symmetry*100),
    palette:ranked.map(e=>hex(e.rgb)),primary:hex(primary),secondary:hex(second),accent:hex(third),dark:hex(dark),light:hex(light),
    background:bg?hex(bg):null,brightness:Math.round(brightness),saturation:Math.round(saturation),
    bounding:[minX,minY,maxX,maxY]
  };
  analysis.interpretation=describeLogo(analysis);
  return analysis;
}

export function describeLogo(a,meta={}){
  const name=typeof meta.name==='string'&&meta.name.trim()?meta.name.trim().slice(0,60):'';
  const symbol=typeof meta.symbol==='string'&&meta.symbol.trim()?meta.symbol.trim().toUpperCase().slice(0,12):'';
  const label=symbol?`Token $${symbol}${name?` (${name})`:''}`:name?`Token "${name}"`:'The uploaded token logo';
  const tone=a.brightness>=170?'a light, airy palette':a.brightness<=80?'a deep, moody palette':'a balanced mid-tone palette';
  const sat=a.saturation>=120?'vivid, saturated colors':a.saturation<=40?'muted, near-neutral colors':'clearly readable colors';
  const shape=a.coverage>=.55?'a bold silhouette that fills the frame':a.coverage>=.28?'a solid centered emblem':'a compact centered mark';
  const symmetry=a.symmetry>=82?'highly symmetrical':a.symmetry>=60?'mostly symmetrical':'asymmetrical and dynamic';
  const palette=`primary ${a.primary}, secondary ${a.secondary}, accent ${a.accent}, deep ${a.dark}, light ${a.light}`;
  return `${label}: ${shape} with ${symmetry} composition on a ${a.background?a.background+' backdrop':'transparent backdrop'}. Character direction: use ${tone} with ${sat}; palette — ${palette}. Map the primary tone to the torso and arms, the deep tone to boots, hair and belt, the light tone to the face and eyes, and pixelate the dominant central mark into a 12×12 chest emblem. The artwork resolves into ${a.palette.length} sampled color families over ${Math.round(a.coverage*100)}% of the canvas.`;
}

function drawEmblem(out,img,a,x0,y0,size){
  const {data,width:w}=img;const [minX,minY,maxX,maxY]=a.bounding;const bw=maxX-minX+1,bh=maxY-minY+1;
  const bg=a.background?parse(a.background):null;const palette=[a.primary,a.secondary,a.accent,a.dark,a.light].map(parse);
  const near=(c,b,t=52)=>{if(!b)return false;const dr=c[0]-b[0],dg=c[1]-b[1],db=c[2]-b[2];return dr*dr+dg*dg+db*db<=t*t;};
  const scale=Math.min(size/bw,size/bh),ox=Math.floor((size-bw*scale)/2),oy=Math.floor((size-bh*scale)/2);
  const put=(x,y,c)=>{if(x<0||x>=192||y<0||y>=16)return;const i=(y*192+x)*4;out.data[i]=c[0];out.data[i+1]=c[1];out.data[i+2]=c[2];out.data[i+3]=255;};
  for(let ty=0;ty<size;ty++)for(let tx=0;tx<size;tx++){
    const destX=tx-ox,destY=ty-oy;if(destX<0||destY<0||destX>=bw*scale||destY>=bh*scale)continue;
    const sx=Math.min(maxX,minX+Math.floor(destX/scale)),sy=Math.min(maxY,minY+Math.floor(destY/scale));
    const i=(sy*w+sx)*4,alpha=data[i+3],c=[data[i],data[i+1],data[i+2]];
    if(alpha<128||(bg&&near(c,bg)))continue;
    let best=0,bestD=Infinity;palette.forEach((p,idx)=>{const d=(p[0]-c[0])**2+(p[1]-c[1])**2+(p[2]-c[2])**2;if(d<bestD){bestD=d;best=idx;}});
    const tone=palette[best];const boost=best===0?1.22:best===4?.86:((tx+ty)%2?.92:1.04);
    put(x0+tx,y0+ty,shade(tone,boost));
  }
}

// LetsCraft atlas v1: opaque 192×16 PNG, twelve 16×16 tiles:
// torso, head, hair, left leg, right leg, left arm, right arm, left boot, right boot, left eye, right eye, belt.
export function generateSkin(bytes,meta={}){
  const a=meta.analysis||analyzeLogo(bytes);
  const img=readPng(bytes);
  const P=parse(a.primary),S=parse(a.secondary),A=parse(a.accent),D=parse(a.dark),L=parse(a.light);
  const out=new PNG({width:192,height:16});out.data.fill(0);
  const set=(x,y,c)=>{if(x<0||x>=192||y<0||y>=16)return;const i=(y*192+x)*4;out.data[i]=c[0];out.data[i+1]=c[1];out.data[i+2]=c[2];out.data[i+3]=255;};
  const rect=(x0,y0,w,h,c)=>{for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)set(x,y,c);};
  const tile=i=>i*16;
  // torso: primary with dithered weave and the logo emblem on the chest
  rect(tile(0),0,16,16,P);
  for(let y=0;y<16;y++)for(let x=0;x<16;x++)if((x+y)%4===0)set(tile(0)+x,y,shade(P,1.08));
  drawEmblem(out,img,a,tile(0)+2,2,12);
  // head: light tone with a soft jaw shade
  rect(tile(1),0,16,16,L);
  for(let x=0;x<16;x++){set(tile(1)+x,15,shade(L,.82));set(tile(1)+x,0,shade(L,1.06));}
  // hair: deep tone with pixel texture
  rect(tile(2),0,16,16,D);
  for(let y=0;y<16;y++)for(let x=0;x<16;x++)if((x*3+y)%5===0)set(tile(2)+x,y,shade(D,1.25));
  // legs: secondary over a darker sole
  for(let t of [3,4]){rect(tile(t),0,16,16,S);for(let x=0;x<16;x++)set(tile(t)+x,15,shade(D,.95));}
  // arms: primary with accent cuffs
  for(let t of [5,6]){rect(tile(t),0,16,16,P);for(let y=12;y<16;y++)for(let x=0;x<16;x++)set(tile(t)+x,y,A);}
  // boots: deep tone with highlight rim
  for(let t of [7,8]){rect(tile(t),0,16,16,D);for(let x=0;x<16;x++)set(tile(t)+x,0,shade(D,1.3));}
  // eyes: light tile with a deep pupil
  for(let t of [9,10]){rect(tile(t),0,16,16,L);rect(tile(t)+6,4,4,7,D);rect(tile(t)+7,5,2,2,shade(L,1.1));}
  // belt: accent with a light buckle
  rect(tile(11),0,16,16,A);
  for(let y=0;y<16;y++)if(y===0||y===15)for(let x=0;x<16;x++)set(tile(11)+x,y,shade(A,.8));
  rect(tile(11)+5,5,6,6,L);rect(tile(11)+7,7,2,2,shade(A,.7));
  return PNG.sync.write(out);
}
