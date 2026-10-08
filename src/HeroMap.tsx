import React,{useEffect,useRef} from 'react';
import {World,SIZE,HEIGHT,palette,ground} from './game/world';
const rgb=(hex:string)=>{const n=parseInt(hex.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255] as [number,number,number];};
const mix=(a:number[],b:number[],t:number)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
const shade=(c:number[],f:number)=>c.map(v=>Math.max(0,Math.min(255,Math.round(v*f))));
const css=(c:number[])=>`rgb(${c[0]},${c[1]},${c[2]})`;
export function renderHeroMap(g:CanvasRenderingContext2D,W:number,H:number){
 const sky=g.createLinearGradient(0,0,0,H);
 sky.addColorStop(0,'#0a0e1a');sky.addColorStop(.55,'#0e1424');sky.addColorStop(1,'#141c30');
 g.fillStyle=sky;g.fillRect(0,0,W,H);
 for(let i=0;i<420;i++){const x=Math.random()*W,y=Math.random()*H*.72,b=140+Math.random()*115;g.fillStyle=`rgba(${b|0},${b|0},255,${.35+Math.random()*.5})`;g.fillRect(x,y,1.6,1.6);}
 const halo=g.createRadialGradient(1330,140,10,1330,140,130);
 halo.addColorStop(0,'rgba(226,233,255,.45)');halo.addColorStop(.35,'rgba(206,216,255,.14)');halo.addColorStop(1,'rgba(206,216,255,0)');
 g.fillStyle=halo;g.fillRect(1150,0,420,340);
 g.fillStyle='#e9eeff';g.beginPath();g.arc(1330,140,44,0,Math.PI*2);g.fill();
 g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.arc(1330,140,30,0,Math.PI*2);g.fill();
 const s=5.6,sx=s,sy=s*.465,sz=s*.71,ox=W/2,oy=252;
 const w=new World({});
 const tops=new Int16Array(SIZE*SIZE).fill(-1),ids=new Uint8Array(SIZE*SIZE);
 for(let x=0;x<SIZE;x++)for(let z=0;z<SIZE;z++){const gc=ground(x,z);for(let y=Math.min(HEIGHT-1,gc+17);y>=0;y--){const v=w.get(x,y,z);if(v){tops[x+z*SIZE]=y;ids[x+z*SIZE]=v;break;}}}
 const night=[30,40,80],nightL=[16,24,52],nightR=[20,28,60];
 const poly=(pts:number[][],c:number[])=>{g.fillStyle=css(c);g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();g.fill();};
 for(let d=0;d<=2*(SIZE-1);d++){
  for(let x=Math.max(0,d-SIZE+1);x<=Math.min(SIZE-1,d);x++){
   const z=d-x,i=x+z*SIZE,top=tops[i];if(top<0)continue;
   const px=ox+(x-z)*sx;
   if(top<=5){poly([[px,oy+d*sy-5.1*sz-sy],[px+sx,oy+d*sy-5.1*sz],[px,oy+d*sy-5.1*sz+sy],[px-sx,oy+d*sy-5.1*sz]],mix([52,102,158],night,.3));continue;}
   const py=oy+d*sy-top*sz;
   const col=rgb(palette[ids[i]-1].color);
   const tR=x+1<SIZE?tops[(x+1)+z*SIZE]:-1,tL=z+1<SIZE?tops[x+(z+1)*SIZE]:-1;
   const dR=Math.max(1,Math.min(44,top-(tR<0?4:tR)));
   const dL=Math.max(1,Math.min(44,top-(tL<0?4:tL)));
   poly([[px-sx,py],[px,py+sy],[px,py+sy+dL*sz],[px-sx,py+dL*sz]],mix(shade(col,.42),nightL,.52));
   poly([[px+sx,py],[px,py+sy],[px,py+sy+dR*sz],[px+sx,py+dR*sz]],mix(shade(col,.60),nightR,.5));
   const gold=ids[i]===9;
   poly([[px,py-sy],[px+sx,py],[px,py+sy],[px-sx,py]],gold?mix(shade(col,1.35),[255,200,60],.25):mix(shade(col,.97),night,.45));
  }
 }
 const fx=ox+(16-64)*sx,fy=oy+80*sy-27*sz;
 const glow=g.createRadialGradient(fx,fy,4,fx,fy,150);
 glow.addColorStop(0,'rgba(240,185,11,.20)');glow.addColorStop(1,'rgba(240,185,11,0)');
 g.fillStyle=glow;g.fillRect(fx-160,fy-160,320,320);
 const vig=g.createRadialGradient(W*.5,H*.46,H*.18,W*.5,H*.5,H*.85);
 vig.addColorStop(0,'rgba(4,6,12,0)');vig.addColorStop(1,'rgba(4,6,12,.82)');
 g.fillStyle=vig;g.fillRect(0,0,W,H);
}
export function HeroMap(){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const cv=ref.current;if(!cv)return;const g=cv.getContext('2d');if(!g)return;
  const id=window.setTimeout(()=>renderHeroMap(g,cv.width,cv.height),40);
  return()=>window.clearTimeout(id);
 },[]);
 return <canvas ref={ref} width={1680} height={950} className="hero-map"/>;
}
