'use strict';
const fs=require('fs');const path=require('path');const vm=require('vm');const assert=require('assert');
const src=fs.readFileSync(path.join(__dirname,'../src/iframe-scheduler.js'),'utf8');
function scenario(readyState='loading') {
  let clock=350,listener=null,events=[],timers=[],seq=0;
  const iframes=Array.from({length:10},(_,n)=>({
    id:'fw-'+(n+1), attrs:{src:'about:blank','data-fw-rc1-src':`fw-${n+1}-if.html`},
    getAttribute(k){return this.attrs[k]??null;},setAttribute(k,v){this.attrs[k]=v;}
  }));
  const doc={readyState,querySelectorAll(sel){assert.equal(sel,'iframe[data-fw-rc1-src]');return iframes;},
    addEventListener(type,fn){assert.equal(type,'DOMContentLoaded');listener=fn;}};
  const sandbox={document:doc,performance:{now:()=>clock},window:{},console,
    setTimeout(fn,ms){timers.push({fn,at:clock+ms,seq:seq++});}};
  vm.runInNewContext(src,sandbox);
  if(readyState==='loading'){assert(listener);listener();}
  assert.equal(iframes[0].getAttribute('src'),'fw-1-if.html');
  assert.equal(iframes[1].getAttribute('src'),'about:blank');
  while(timers.length){
    timers.sort((a,b)=>a.at-b.at||a.seq-b.seq);
    const next=timers.shift();clock=Math.max(next.at,clock);
    if(next.at>4000 && next.at<6000)clock+=700; // delayed event loop
    next.fn();
  }
  return {iframes,report:sandbox.window.FW_RC1_SCHEDULE};
}
for(const state of ['loading','complete']){
  const {iframes,report}=scenario(state);
  assert.equal(report.launchTimesMs.length,10);
  assert.equal(report.launchTimesMs[1]-report.launchTimesMs[0],3000);
  for(let i=2;i<10;i++)assert(report.launchTimesMs[i]-report.launchTimesMs[i-1]>=250);
  assert(report.completed);
  assert(iframes.every((f,i)=>f.getAttribute('src')===`fw-${i+1}-if.html`));
  console.log('PASS schedule '+state+': first now, second after 3000, rest spaced >=250');
}

// RC4: an oversized PreTeXt column must not grant its iframe more than
// the real visible phone width. The cap happens BEFORE the first navigation;
// returning to desktop removes our cap without altering authored CSS widths.
(function testMobileFrameConstraints() {
  let ready,resize,now=0;
  const styleValues=new Map();
  const style={
    setProperty(name,value,priority=''){styleValues.set(name,{value,priority});},
    removeProperty(name){styleValues.delete(name);},
    getPropertyValue(name){return styleValues.get(name)?.value||'';},
    getPropertyPriority(name){return styleValues.get(name)?.priority||'';}
  };
  const frame={id:'one',style,attrs:{src:'about:blank','data-fw-rc1-src':'fw-one-if.html'},
    getAttribute(k){return this.attrs[k]??null;},setAttribute(k,v){this.attrs[k]=v;},
    getBoundingClientRect(){return {left:18,width:styleValues.has('max-width')?
      Number.parseFloat(style.getPropertyValue('max-width')):650};}
  };
  const document={readyState:'loading',documentElement:{clientWidth:390},
    querySelectorAll(){return [frame];},
    addEventListener(type,fn){if(type==='DOMContentLoaded')ready=fn;}};
  const window={innerWidth:720,addEventListener(type,fn){if(type==='resize')resize=fn;}};
  vm.runInNewContext(src,{document,window,console,performance:{now:()=>now},setTimeout(){throw Error('only one iframe')}});
  ready();
  assert.equal(frame.attrs.src,'fw-one-if.html');
  assert.equal(style.getPropertyValue('max-width'),'364px'); // 390 - 18 - 8
  assert.equal(style.getPropertyPriority('max-width'),'important');
  assert.equal(style.getPropertyValue('min-width'),'0px');
  assert(resize);
  window.innerWidth=800;document.documentElement.clientWidth=800;
  resize();
  assert.equal(style.getPropertyValue('max-width'),'');
  assert.equal(style.getPropertyValue('min-width'),'');
  console.log('PASS mobile iframe constrained before load; desktop style restored');
})();
