import React,{useEffect,useRef} from 'react';
import {looks} from './game/characters';
const S=4;
const hex=(c:number)=>'#'+c.toString(16).padStart(6,'0');
export function drawPortrait(g:CanvasRenderingContext2D,style:string){
 const look=looks[style]??looks.trencher,c=look.colors;
 const R=(x:number,y:number,w:number,h:number,col:number)=>{g.fillStyle=hex(col);g.fillRect(x*S,y*S,w*S,h*S);};
 g.clearRect(0,0,64,96);
 g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(32*S/4,88,24,3,0,0,Math.PI*2);g.fill();
 if(look.extras==='speed')R(3,8,10,7,0x14f195);
 if(look.extras==='hood')R(3,2,10,6,0x00c805);
 if(look.extras==='veil')R(3,2,10,6,0x0a0a0a);
 R(4,15,3,5,c.leg);R(9,15,3,5,c.leg);
 R(4,20,3,2,c.boot);R(9,20,3,2,c.boot);
 R(4,8,8,7,c.torso);R(2,8,2,6,c.arm);R(12,8,2,6,c.arm);
 R(4,14,8,1,c.belt);
 R(5,4,6,5,c.head);R(4,2,8,1,c.hair);R(4,3,8,1,c.hair);
 if(!['hood','veil','astro'].includes(look.extras||'')){R(4,4,1,2,c.hair);R(11,4,1,2,c.hair);}
 R(6,6,1,1,c.eye);R(9,6,1,1,c.eye);
 switch(look.extras){
  case 'astro':R(3,3,10,2,0xe9e4d6);R(4,1,8,3,0xe9e4d6);R(5,6,6,1,0x24384a);R(12,9,1,5,0xb8b2a2);R(13,10,1,2,0xe6c565);break;
  case 'trencher':R(4,1,8,2,0x4f5b52);R(4,3,8,1,0x4f5b52);R(6,7,1,1,0x9b7f63);R(9,7,1,1,0x9b7f63);R(6,8,4,1,0x6e6257);R(13,13,1,1,0x9aa0a6);break;
  case 'og':R(4,7,8,1,0xe6e6e6);R(4,8,8,3,0xe6e6e6);R(13,5,1,10,0x4a3527);R(13,4,1,1,0xf7931a);break;
  case 'diamond':R(4,0,8,1,0x8a9cf0);R(5,1,6,1,0x8a9cf0);R(7,10,2,2,0x8a9cf0);break;
  case 'speed':R(4,2,8,1,0x14f195);R(11,10,2,1,0x14f195);break;
  case 'wave':R(7,1,2,2,0x97fce4);R(2,11,2,1,0x97fce4);R(12,11,2,1,0x97fce4);break;
  case 'hood':R(4,4,1,2,0x00c805);R(11,4,1,2,0x00c805);R(4,5,1,1,0x00c805);R(11,5,1,1,0x00c805);R(13,9,1,4,0x6b4a2f);break;
  case 'veil':R(4,7,8,1,0x1c1c1c);R(4,8,1,1,0x1c1c1c);R(11,8,1,1,0x1c1c1c);R(5,9,6,1,0xf4b728);R(8,10,2,1,0xf4b728);break;
  case 'armor':R(1,8,3,2,0xf0b90b);R(12,8,3,2,0xf0b90b);R(6,0,4,2,0xf0b90b);R(7,10,2,2,0xf0b90b);break;
 }
}
export function Portrait({style,className='portrait'}:{style:string;className?:string}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const g=ref.current?.getContext('2d');if(g)drawPortrait(g,style);},[style]);
 return <canvas ref={ref} width={64} height={96} className={className}/>;
}
