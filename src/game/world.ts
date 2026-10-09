export const SIZE=128, HEIGHT=48;
export const palette=[{name:'Regolith',color:'#d8cea2'},{name:'Basalt',color:'#8b867a'},{name:'Bedrock',color:'#a8a291'},{name:'Moon dust',color:'#e8ddb4'},{name:'Alloy',color:'#9b9588'},{name:'Ice spire',color:'#c3d2d6'},{name:'Oxide rust',color:'#c0925e'},{name:'Moon chalk',color:'#efe9d2'},{name:'Gold trim',color:'#e6c565'}];
export const GOLD=9;
// MOON CAMP: habitat cluster on the west side, facing the STARSHIP DEPOT across the crater basin.
export const CAMP={x0:5,x1:26,z0:55,z1:72};
export const CAMP_FLOOR=ground(16,64)+1;
export const CAMP_DOOR={x:29,z:64};
export const DEPOT={x0:98,x1:110,z0:59,z1:68};
export type Saved={revision:number;edits:Record<string,number>;position:number[];selected:number;appearance:string;spacex:number};
export const key=(x:number,y:number,z:number)=>`${x},${y},${z}`;
export function ground(x:number,z:number){return Math.floor(8+Math.sin(x*.085)*3+Math.cos(z*.095)*3+Math.sin((x+z)*.17)*1.5);}
export const DEPOT_Y=(()=>{let m=0;for(let x=DEPOT.x0;x<=DEPOT.x1;x++)for(let z=DEPOT.z0;z<=DEPOT.z1;z++)m=Math.max(m,ground(x,z));return m+1;})();
export function base(x:number,y:number,z:number):number{
 if(x<0||z<0||x>=SIZE||z>=SIZE||y<0)return 3;
 if(y>=HEIGHT)return 0;
 const h=ground(x,z);
 // STARSHIP DEPOT: alloy deck, hangar walls, rust roof and an open rover bay.
 if(x>=DEPOT.x0-2&&x<=DEPOT.x1+1&&z>=DEPOT.z0-1&&z<=DEPOT.z1+1){
  if(y<=DEPOT_Y)return y===DEPOT_Y?3:2;
  if(y===DEPOT_Y+5)return 7;
  if(x<DEPOT.x0){if(x===DEPOT.x0-2&&(z===DEPOT.z0+1||z===DEPOT.z1-1)&&y<=DEPOT_Y+4)return 5;return 0;}
  if((x===DEPOT.x0||x===DEPOT.x1||z===DEPOT.z0||z===DEPOT.z1)&&y<=DEPOT_Y+4){
   if(x===DEPOT.x0&&y<=DEPOT_Y+2&&(z===DEPOT.z0+4||z===DEPOT.z0+5))return 0;
   if(x===DEPOT.x0&&y===DEPOT_Y+2&&(z===DEPOT.z0+2||z===DEPOT.z0+7))return 0;
   return 5;
  }
  if(y===DEPOT_Y+1&&x===DEPOT.x1-2&&z>DEPOT.z0+1&&z<DEPOT.z1-1)return 8;
  if(y===DEPOT_Y+2&&x===DEPOT.x1-2&&z>DEPOT.z0+1&&z<DEPOT.z1-1&&z%3===0)return 8;
  return 0;
 }
 // MOON CAMP BASE: paved landing pad, habitat block, cupola domes, gantry, airlock and solar arrays.
 if(x>=3&&x<=36&&z>=53&&z<=74){
  const top=CAMP_FLOOR-Math.min(6,Math.max(0,x-29));
  if(y<=top)return y===top?(x===30&&z>=62&&z<=66?GOLD:3):2;
  // solar arrays along the north and south rim of the pad
  if((z===53||z===74)&&x>=7&&x<=25&&y>top&&y<=top+2){if(x%3===0)return 3;if(y===top+1)return 5;}
  // landing-pad gantry with a gold platform at the north-east corner
  if(x>=27&&x<=28&&z>=55&&z<=58){
   if((x===27||x===28)&&(z===55||z===58)&&y>CAMP_FLOOR&&y<=CAMP_FLOOR+9)return 5;
   if(y===CAMP_FLOOR+10)return GOLD;
   return 0;
  }
  if(x>=CAMP.x0&&x<=CAMP.x1&&z>=CAMP.z0&&z<=CAMP.z1){
   if(y===CAMP_FLOOR+8)return 3;
   if(y>CAMP_FLOOR&&y<CAMP_FLOOR+8&&(x===CAMP.x0||x===CAMP.x1||z===CAMP.z0||z===CAMP.z1)){
    if(x===CAMP.x1&&(z===63||z===64)&&y<=CAMP_FLOOR+3)return 0;
    if(x===CAMP.x1&&(z===62||z===65)&&y<=CAMP_FLOOR+3)return GOLD;
    if(x===CAMP.x1&&(z===63||z===64)&&y===CAMP_FLOOR+4)return GOLD;
    if((y===CAMP_FLOOR+4||y===CAMP_FLOOR+5)&&(x+z)%4===0)return GOLD;
    return 8;
   }
   // central cupola and two habitat domes rising from the roof
   const cup=Math.hypot(x-16,z-64);
   if(cup<5){const cap=CAMP_FLOOR+8+Math.round((5-cup)*.9);if(y>CAMP_FLOOR+8&&y<=cap)return 8;}
   const small=Math.min(Math.hypot(x-9,z-60),Math.hypot(x-22,z-68));
   if(small<3){const cap=CAMP_FLOOR+8+Math.round((3-small)*1.1);if(y>CAMP_FLOOR+8&&y<=cap)return 8;}
   return 0;
  }
  return 0;
 }
 if(y<=h)return y===h?(h<7?4:1):y>h-3?2:3;
 // ice spires scattered across the regolith
 for(let a=Math.floor((x-2)/9);a<=Math.floor((x+2)/9);a++)for(let b=Math.floor((z-2)/9);b<=Math.floor((z+2)/9);b++){const tx=a*9+4,tz=b*9+4;if((a*7+b*3)%5!==0)continue;const th=ground(tx,tz);if(th<8)continue;if(x===tx&&z===tz&&y<=th+4&&y>th)return 5;if(Math.abs(x-tx)<=2&&Math.abs(z-tz)<=2&&y>=th+3&&y<=th+5&&(Math.abs(x-tx)+Math.abs(z-tz)<4))return 6;}return 0;}
export class World{edits:Record<string,number>;constructor(edits:Record<string,number>={}){this.edits={...edits};}get(x:number,y:number,z:number){return this.edits[key(x,y,z)]??base(x,y,z);}set(x:number,y:number,z:number,id:number){if(y<=0||y>=HEIGHT||x<0||z<0||x>=SIZE||z>=SIZE)return false;this.edits[key(x,y,z)]=id;return true;}}
export function intersects(px:number,py:number,pz:number,x:number,y:number,z:number){return px+.29>x&&px-.29<x+1&&py+1.75>y&&py<y+1&&pz+.29>z&&pz-.29<z+1;}
export function collides(w:World,p:number[]){for(let x=Math.floor(p[0]-.29);x<=Math.floor(p[0]+.29);x++)for(let y=Math.floor(p[1]);y<=Math.floor(p[1]+1.75);y++)for(let z=Math.floor(p[2]-.29);z<=Math.floor(p[2]+.29);z++)if(w.get(x,y,z))return true;return false;}
export const spawn=()=>[62.5,ground(62,62)+1.02,62.5];
