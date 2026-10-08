// Composes a 1200x630 share card from the live character preview canvas: official logo
// top-left, character on the right, name and "Mine XAU. Get real XAU." on a light card.
function loadImage(src:string){return new Promise<HTMLImageElement>((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('image load failed'));i.src=src;});}
export async function composeShareCard(source:HTMLCanvasElement,name:string,link:string):Promise<string>{
 const W=1200,H=630;
 const c=document.createElement('canvas');c.width=W;c.height=H;
 const g=c.getContext('2d');if(!g)return '';
 const grad=g.createLinearGradient(0,0,W,H);grad.addColorStop(0,'#fdfdf6');grad.addColorStop(1,'#eef1e2');
 g.fillStyle=grad;g.fillRect(0,0,W,H);
 g.fillStyle='rgba(240,185,11,0.16)';g.beginPath();g.arc(W*0.76,H*0.5,300,0,Math.PI*2);g.fill();
 g.strokeStyle='#e0c26a';g.lineWidth=4;g.strokeRect(18,18,W-36,H-36);
 try{const logo=await loadImage('/playcraft-logo.png');const lh=60,lw=logo.width*(lh/logo.height);g.drawImage(logo,72,60,lw,lh);}
 catch{g.fillStyle='#33402c';g.font='800 30px Arial, sans-serif';g.fillText('PLAYCRAFT',72,100);}
 const ch=H*0.86,cw=source.width*(ch/source.height);
 g.drawImage(source,W-cw-30,(H-ch)/2+8,cw,ch);
 g.fillStyle='#33402c';g.font='800 66px Arial, sans-serif';
 const label=name.length>18?name.slice(0,17)+'…':name;
 g.fillText(label,72,H-150);
 g.fillStyle='#5b6d4d';g.font='600 27px Arial, sans-serif';g.fillText('Mine XAU. Get real XAU.',72,H-100);
 g.fillStyle='#8d9781';g.font='500 20px Arial, sans-serif';g.fillText(link.replace(/^https?:\/\//,''),72,H-56);
 return c.toDataURL('image/png');
}
