export const SIZE=128, HEIGHT=48;
export const palette=[{name:'Meadow',color:'#7eaa50'},{name:'Earth',color:'#957052'},{name:'Stone',color:'#929a9b'},{name:'Sand',color:'#e0c68b'},{name:'Timber',color:'#866140'},{name:'Leaves',color:'#4d854c'},{name:'Clay',color:'#ba795c'},{name:'Chalk',color:'#e2dfce'},{name:'Gold trim',color:'#f0b90b'}];
export const GOLD=9;
// FED: monumental bank on the west side, facing the MUMUSPAD saloon across the valley.
export const FED={x0:5,x1:26,z0:55,z1:72};
export const FED_FLOOR=ground(16,64)+1;
export const FED_DOOR={x:29,z:64};
export const BAR={x0:98,x1:110,z0:59,z1:68};
export type Saved={revision:number;edits:Record<string,number>;position:number[];selected:number;appearance:string;usdg:number};
export const key=(x:number,y:number,z:number)=>`${x},${y},${z}`;
export function ground(x:number,z:number){return Math.floor(8+Math.sin(x*.085)*3+Math.cos(z*.095)*3+Math.sin((x+z)*.17)*1.5);}
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
 // FED: marble plaza, grand staircase, columned portico, gold-trimmed windows and a pediment.
 if(x>=3&&x<=36&&z>=53&&z<=74){
  const top=FED_FLOOR-Math.min(6,Math.max(0,x-29));
  if(y<=top)return y===top?8:y===top-1?3:2;
  if(y===FED_FLOOR+10&&x>=26&&x<=29&&z>=FED.z0&&z<=FED.z1)return 8;
  if(x>=26&&x<=29&&y>FED_FLOOR+10&&y<=FED_FLOOR+14)return Math.abs(z-63.5)<=[9,9,7,4,2][y-FED_FLOOR-10]?8:0;
  if(x===28&&y>FED_FLOOR&&y<=FED_FLOOR+9&&(z===56||z===59||z===62||z===65||z===68||z===71))return y===FED_FLOOR+9?GOLD:y===FED_FLOOR+1?3:8;
  if(x>=FED.x0&&x<=FED.x1&&z>=FED.z0&&z<=FED.z1){
   if(y===FED_FLOOR+11)return 3;
   if(y>FED_FLOOR&&y<FED_FLOOR+11&&(x===FED.x0||x===FED.x1||z===FED.z0||z===FED.z1)){
    if(x===FED.x1&&(z===63||z===64)&&y<=FED_FLOOR+3)return 0;
    if(x===FED.x1&&(z===62||z===65)&&y<=FED_FLOOR+3)return GOLD;
    if(x===FED.x1&&(z===63||z===64)&&y===FED_FLOOR+4)return GOLD;
    if(x===FED.x1&&(y===FED_FLOOR+6||y===FED_FLOOR+7)&&z%3===0)return GOLD;
    if((x===FED.x0||z===FED.z0||z===FED.z1)&&(y===FED_FLOOR+6||y===FED_FLOOR+7)&&(x+z)%4===0)return GOLD;
    return 8;
   }
   return 0;
  }
  return 0;
 }
 if(y<=h)return y===h?(h<7?4:1):y>h-3?2:3;
 for(let a=Math.floor((x-2)/9);a<=Math.floor((x+2)/9);a++)for(let b=Math.floor((z-2)/9);b<=Math.floor((z+2)/9);b++){const tx=a*9+4,tz=b*9+4;if((a*7+b*3)%5!==0)continue;const th=ground(tx,tz);if(th<8)continue;if(x===tx&&z===tz&&y<=th+4&&y>th)return 5;if(Math.abs(x-tx)<=2&&Math.abs(z-tz)<=2&&y>=th+3&&y<=th+5&&(Math.abs(x-tx)+Math.abs(z-tz)<4))return 6;}return 0;}
export class World{edits:Record<string,number>;constructor(edits:Record<string,number>={}){this.edits={...edits};}get(x:number,y:number,z:number){return this.edits[key(x,y,z)]??base(x,y,z);}set(x:number,y:number,z:number,id:number){if(y<=0||y>=HEIGHT||x<0||z<0||x>=SIZE||z>=SIZE)return false;this.edits[key(x,y,z)]=id;return true;}}
export function intersects(px:number,py:number,pz:number,x:number,y:number,z:number){return px+.29>x&&px-.29<x+1&&py+1.75>y&&py<y+1&&pz+.29>z&&pz-.29<z+1;}
export function collides(w:World,p:number[]){for(let x=Math.floor(p[0]-.29);x<=Math.floor(p[0]+.29);x++)for(let y=Math.floor(p[1]);y<=Math.floor(p[1]+1.75);y++)for(let z=Math.floor(p[2]-.29);z<=Math.floor(p[2]+.29);z++)if(w.get(x,y,z))return true;return false;}
export const spawn=()=>[62.5,ground(62,62)+1.02,62.5];
