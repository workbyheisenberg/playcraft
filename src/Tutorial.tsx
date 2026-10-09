import React,{useEffect,useRef} from 'react';
import {preview} from './game/engine';

function TutorialPreview({style}:{style:string}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{try{return preview(ref.current!,style);}catch{}},[style]);
 return <div className="tutorial-stage" ref={ref}/>;
}

export function Tutorial({onDone}:{onDone:()=>void}){
 return <div className="tutorial-overlay" role="dialog" aria-label="How to earn $SPACEX">
  <div className="tutorial-card">
   <span className="eyebrow">FIRST MISSION</span>
   <h2>Hunt the <em>camp runners</em></h2>
   <p>The big <strong>MOON CAMP</strong> base on the west side of the surface sends out a runner every 10 seconds. Each one carries <strong>$SPACEX</strong>.</p>
   <div className="tutorial-figure">
    <div className="tutorial-ring"><TutorialPreview style="spacex"/></div>
    <div className="tutorial-target">
     <span className="tutorial-tag">TARGET</span>
     <strong>The SpaceX Runner</strong>
     <small>White suit, astro helmet, gold-trimmed visor and a $SPACEX badge. Hit this one — not the locals.</small>
     <span className="tutorial-reward">+0.09 $SPACEX per hit</span>
    </div>
   </div>
   <ol className="tutorial-steps">
    <li><span>1</span> Head <b>west</b> to the MOON CAMP base.</li>
    <li><span>2</span> Wait for a runner to step out of the airlock.</li>
    <li><span>3</span> Aim and <b>hold left click</b> to hit it — works while running.</li>
   </ol>
   <button className="primary" onClick={onDone}>Got it — let&apos;s hunt</button>
  </div>
 </div>;
}
