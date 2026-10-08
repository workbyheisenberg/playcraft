import React,{useEffect,useRef} from 'react';
import {preview} from './game/engine';

function TutorialPreview({style}:{style:string}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{try{return preview(ref.current!,style);}catch{}},[style]);
 return <div className="tutorial-stage" ref={ref}/>;
}

export function Tutorial({onDone}:{onDone:()=>void}){
 return <div className="tutorial-overlay" role="dialog" aria-label="How to earn $USDG">
  <div className="tutorial-card">
   <span className="eyebrow">FIRST MISSION</span>
   <h2>Hunt the <em>Fed runners</em></h2>
   <p>The big marble <strong>FED</strong> building on the west side of the valley sends out a runner every 10 seconds. Each one carries <strong>$USDG</strong>.</p>
   <div className="tutorial-figure">
    <div className="tutorial-ring"><TutorialPreview style="usdg"/></div>
    <div className="tutorial-target">
     <span className="tutorial-tag">TARGET</span>
     <strong>The Fed Runner</strong>
     <small>Black suit, top hat, gold chain and a green $USDG badge. Hit this one — not the locals.</small>
     <span className="tutorial-reward">+0.09 $USDG per hit</span>
    </div>
   </div>
   <ol className="tutorial-steps">
    <li><span>1</span> Head <b>west</b> to the FED building.</li>
    <li><span>2</span> Wait for a runner to step out of the door.</li>
    <li><span>3</span> Aim and <b>hold left click</b> to hit it — works while running.</li>
   </ol>
   <button className="primary" onClick={onDone}>Got it — let&apos;s hunt</button>
  </div>
 </div>;
}
