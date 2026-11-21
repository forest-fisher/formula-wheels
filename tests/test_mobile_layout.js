/* RC4 layout regression: the *visible* scale must occupy the actual flex footprint.
   No browser or MathJax dependency: test the exact helper copied from the engine. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const src=fs.readFileSync(path.join(__dirname,'../src/formula-wheels.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../src/formula-wheels.css'),'utf8');
const start=src.indexOf('    function applyEquationScale(equation,scale) {');
const end=src.indexOf('    const lifetime=new AbortController();',start);
assert(start>0 && end>start,'Extract shared layout helpers');
const helpers=src.slice(start,end);
const {apply,reset}=new Function(`${helpers}\nreturn {apply:applyEquationScale,reset:resetEquationScale};`)();
let count=0;
function check(label,fn){fn();console.log('PASS '+label);count++;}
const makeEquation=width=>({offsetWidth:width,style:{
  removeProperty(key){if(key==='margin-inline-start')delete this.marginInlineStart;
    if(key==='margin-inline-end')delete this.marginInlineEnd;}
}});
check('Short and medium formulas retain the SAME 0.55 mobile baseline',()=>{
  for(const width of [350,450]){
    const eq=makeEquation(width);apply(eq,.55);
    assert.equal(eq.style.transform,'scale(0.55)');
    assert.equal(Number.parseFloat(eq.style.marginInlineStart).toFixed(3),String((width*(.55-1)/2).toFixed(3)));
    assert.equal(eq.style.marginInlineStart,eq.style.marginInlineEnd);
    assert(Math.abs(width+2*Number.parseFloat(eq.style.marginInlineStart)-.55*width)<1e-8);
  }
});
check('Fitted long formula receives balanced footprint (no extra blank width)',()=>{
  const eq=makeEquation(880);const scale=340/880;apply(eq,scale);
  assert(Math.abs(eq.offsetWidth+2*Number.parseFloat(eq.style.marginInlineStart)-340)<1e-8);
  assert.equal(eq.style.transform,`scale(${scale})`);
});
check('Scaling above 1 expands flex footprint symmetrically',()=>{
  const eq=makeEquation(300);apply(eq,1.2);
  assert(Math.abs(Number.parseFloat(eq.style.marginInlineStart)-30)<1e-8);
  assert(Math.abs(Number.parseFloat(eq.style.marginInlineEnd)-30)<1e-8);
});
check('Unscaled equations retain zero margins, respecting desktop appearance',()=>{
  const eq=makeEquation(450);apply(eq,1);
  assert.equal(eq.style.marginInlineStart,'0px');
  assert.equal(eq.style.marginInlineEnd,'0px');
  assert.equal(eq.style.transform,'scale(1)');
});
check('Destroy/refit clears BOTH layout margins and transform',()=>{
  const eq=makeEquation(400);apply(eq,.55);reset(eq);
  assert.equal(eq.style.transform,'none');
  assert.equal(eq.style.marginInlineStart,undefined);
  assert.equal(eq.style.marginInlineEnd,undefined);
});
check('Both interactive and display-only paths use identical footprint helper',()=>{
  assert(src.includes('applyEquationScale(equation,fittedScale)'));
  assert(src.includes('applyEquationScale(equation,fittedEquationScale(equation))'));
  assert(src.includes('choiceObserver.observe(equationRoot)'),'interactive root resize observed');
  assert(src.includes('staticObserver.observe(equationRoot)'),'display-only root resize observed');
  assert(src.includes('staticObserver.observe(equation)'),'display-only late math width observed');
  assert(src.includes("choiceObserver.observe(eqById('equation'))"),'interactive assembled equation observed');
  assert(src.includes("resetEquationScale(eqById('equation'))"));
  assert(src.includes('resetEquationScale(equation);'));
});
check('Mobile scale uses the parent viewport for consistent sizing across unequal iframe widths',()=>{
  const begin=src.indexOf('    function responsiveBaselineScale() {');
  const end=src.indexOf('    function fittedEquationScale(equation) {',begin);
  assert(begin>0 && end>begin);
  const fn=new Function('window',src.slice(begin,end)+'\nreturn responsiveBaselineScale;');
  const savedDocument=global.document;
  global.document={documentElement:{clientWidth:390}};
  try {
    for(const iframeWidth of [310,340,380,500]) {
      const mock={innerWidth:iframeWidth,parent:{innerWidth:720,
        document:{documentElement:{clientWidth:390}}}};
      assert.equal(fn(mock)(),.55);
    }
    assert.equal(fn({innerWidth:390,parent:{innerWidth:390,
      document:{documentElement:{clientWidth:390}}}})(),.55);
    assert.equal(fn({innerWidth:500,parent:{get document(){throw Error('cross origin');}}})(),.55);
    global.document={documentElement:{clientWidth:330}};
    assert.equal(fn({innerWidth:330,parent:{innerWidth:330}})(),.52);
  } finally {global.document=savedDocument;}
});
check('Slate cap avoids assuming container width never exceeds mobile viewport',()=>{
  assert(/max-width\s*:\s*100vw/.test(css));
  assert(/transform-origin:\s*center/.test(css));
  assert(!/overflow\s*:\s*hidden/.test(css.slice(0,css.indexOf('.wheel-ribbon'))),
    'mobile overflow must not be hidden by clipping the slate');
});
console.log(`${count}/${count} RC4 mobile layout checks passed`);
