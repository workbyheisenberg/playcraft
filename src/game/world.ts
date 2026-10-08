export const SIZE=128, HEIGHT=48;
export const palette=[{name:'Meadow',color:'#7eaa50'},{name:'Earth',color:'#957052'},{name:'Stone',color:'#929a9b'},{name:'Sand',color:'#e0c68b'},{name:'Timber',color:'#866140'},{name:'Leaves',color:'#4d854c'},{name:'Clay',color:'#ba795c'},{name:'Chalk',color:'#e2dfce'},{name:'Gold ore',color:'#f0b90b'}];
export const GOLD=9;
export const MINE={x:16,z:64,r:6};
export const BAR={x0:98,x1:110,z0:59,z1:68};
export type Saved={revision:number;edits:Record<string,number>;position:number[];selected:number;appearance:string;mumus:number};
export const key=(x:number,y:number,z:number)=>`${x},${y},${z}`;
export function ground(x:number,z:number){return Math.floor(8+Math.sin(x*.085)*3+Math.cos(z*.095)*3+Math.sin((x+z)*.17)*1.5);}
// Rocky gold mountain on the west side, facing the MUMUSPAD saloon across the valley.
const R2=MINE.r+5;
const mount=(x:number,z:number)=>Math.max(0,Math.round((R2-Math.hypot(x-MINE.x,z-MINE.z))/3.2));
export const MINE_FLOOR=ground(MINE.x,MINE.z)+mount(MINE.x,MINE.z)-5;
export const MINE_ADIT_X=MINE.x+8;
export const BAR_Y=(()=>{let m=0;for(let x=BAR.x0;x<=BAR.x1;x++)for(let z=BAR.z0;z<=BAR.z1;z++)m=Math.max(m,ground(x,z));return m+1;})();
export function base(x:number,y:number,z:number):number{
 if(x<0||z<0||x>=SIZE||z>=SIZE||y<0)return 3;
 if(y>=HEIGHT)return 0;
 const h=ground(x,z);
 // MUMUSPAD saloon: flat timber deck, walls, porch and a clay roof.
 if(x>=BAR.x0-2&&x<=BAR.x1+1&&z>=BAR.z0-1&&z<=BAR.z1+1){
  if(y<=BAR_Y)return y===BAR_Y?4:3;
  if(y===BAR_Y+5)return 7;
  if(x<BAR.x0){if(x===BAR.x0-2&&(z===BAR.z0+1||z===BAR.z1-1)&&y<=BAR_Y+4)return 5;return 0;}
  if((x===BAR.x0||x===BAR.x1||z===BAR.z0||z===BAR.z1)&&y<=BAR_Y+4){
   if(x===BAR.x0&&y<=BAR_Y+2&&(z===BAR.z0+4||z===BAR.z0+5))return 0;
   if(x===BAR.x0&&y===BAR_Y+2&&(z===BAR.z0+2||z===BAR.z0+7))return 0;
   return 5;
  }
  if(y===BAR_Y+1&&x===BAR.x1-2&&z>BAR.z0+1&&z<BAR.z1-1)return 5;
  if(y===BAR_Y+2&&x===BAR.x1-2&&z>BAR.z0+1&&z<BAR.z1-1&&z%3===0)return 8;
  return 0;
 }
 // Gold mountain: rocky terraced slopes, gold veins, an open pit and an east-facing adit.
 const d=Math.hypot(x-MINE.x,z-MINE.z);
 if(d<=R2){
  const hh=h+mount(x,z);
  const frameX=x===MINE_ADIT_X;
  if(frameX&&(z===MINE.z-1||z===MINE.z+1)&&y>=MINE_FLOOR+1&&y<=MINE_FLOOR+4)return 5;
  if(frameX&&z>=MINE.z-1&&z<=MINE.z+1&&y===MINE_FLOOR+4)return 5;
  if(z>=MINE.z-1&&z<=MINE.z+1&&x>=MINE.x+MINE.r-1&&x<=MINE_ADIT_X&&y>=MINE_FLOOR+1&&y<=MINE_FLOOR+3)return 0;
  if(d<=MINE.r+1){
   if(y<=MINE_FLOOR)return y===MINE_FLOOR&&(x*7+z*3)%17===0?GOLD:(y===MINE_FLOOR?4:3);
   if(d<=MINE.r-1&&y<=hh)return 0;
   if(y<=hh){if(y>MINE_FLOOR&&(x*3+z*5+y*7)%11===0)return GOLD;return 3;}
   if((x===MINE.x-1||x===MINE.x+1)&&z===MINE.z&&y<=hh+3)return 5;
   if(z===MINE.z&&x>=MINE.x-2&&x<=MINE.x+2&&y===hh+4)return 5;
   return 0;
  }
  if(y<=hh){if(y===hh)return (x*5+z*7)%13===0?GOLD:3;return y>hh-3?2:3;}
  if(y===hh+1&&(x*11+z*3)%29===0)return 3;
  return 0;
 }
 if(y<=h)return y===h?(h<7?4:1):y>h-3?2:3;
 for(let a=Math.floor((x-2)/9);a<=Math.floor((x+2)/9);a++)for(let b=Math.floor((z-2)/9);b<=Math.floor((z+2)/9);b++){const tx=a*9+4,tz=b*9+4;if((a*7+b*3)%5!==0)continue;const th=ground(tx,tz);if(th<8)continue;if(x===tx&&z===tz&&y<=th+4&&y>th)return 5;if(Math.abs(x-tx)<=2&&Math.abs(z-tz)<=2&&y>=th+3&&y<=th+5&&(Math.abs(x-tx)+Math.abs(z-tz)<4))return 6;}return 0;}
export class World{edits:Record<string,number>;constructor(edits:Record<string,number>={}){this.edits={...edits};}get(x:number,y:number,z:number){return this.edits[key(x,y,z)]??base(x,y,z);}set(x:number,y:number,z:number,id:number){if(y<=0||y>=HEIGHT||x<0||z<0||x>=SIZE||z>=SIZE)return false;this.edits[key(x,y,z)]=id;return true;}}
export function intersects(px:number,py:number,pz:number,x:number,y:number,z:number){return px+.29>x&&px-.29<x+1&&py+1.75>y&&py<y+1&&pz+.29>z&&pz-.29<z+1;}
export function collides(w:World,p:number[]){for(let x=Math.floor(p[0]-.29);x<=Math.floor(p[0]+.29);x++)for(let y=Math.floor(p[1]);y<=Math.floor(p[1]+1.75);y++)for(let z=Math.floor(p[2]-.29);z<=Math.floor(p[2]+.29);z++)if(w.get(x,y,z))return true;return false;}
export const spawn=()=>[62.5,ground(62,62)+1.02,62.5];
