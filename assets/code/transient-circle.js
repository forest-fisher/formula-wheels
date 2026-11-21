(() => {
  'use strict';
  const n=FWGallery.number;
  // Intentionally includes both +2.1 and -2.1 in the permanent x wheel.
  // Crucially, +/-sqrt(4.59) are NEVER added to y's permanent array.
  const xs=[-3,-2.2,-2.1,-2,-1,0,1,2,2.1,2.2,3].map(n);
  const square=(v)=>v*v;
  const near=(a,b)=>Math.abs(a-b)<1e-7;
  function labelRadicand(value) {return Number(value.toFixed(2)).toString();}
  function yRoot(radicand,sign){
    const label=labelRadicand(radicand);
    if (radicand<1e-8) return {id:'y-0',latex:'0',value:0,speech:'zero'};
    const root=Math.sqrt(radicand);
    const magnitude=Number.isInteger(root) ? String(root) : `\\sqrt{${label}}`;
    const neg=sign<0;
    return {id:'y-'+(neg?'neg':'pos')+'-'+label,latex:(neg?'-':'')+magnitude,
      value:(neg?-1:1)*root,speech:(neg?'negative ':'')+(Number.isInteger(root)?magnitude:'square root of '+label)};
  }
  const ys=[yRoot(9,-1),yRoot(8,-1),yRoot(5,-1),yRoot(0,1),
            yRoot(5,1),yRoot(8,1),yRoot(9,1)];
  const configuration={
    choiceBehavior:'required',
    variables:{x:{values:xs,initial:'3',valueOrder:'ascending',pixelsPerStep:80},
               y:{values:ys,initial:'y-0',valueOrder:'ascending',pixelsPerStep:80},c:{fixed:9}},
    permissibleOutputs(changedVariable,selected){
      if(changedVariable==='x'){
        const rem=9-square(selected.value);
        if(rem < -1e-8) return [];
        return rem<1e-8?[yRoot(0,1)]:[yRoot(rem,-1),yRoot(rem,1)];
      }
      if(changedVariable==='y') {
        const rem=9-square(selected.value);
        if(rem < -1e-8) return [];
        const mag=Math.sqrt(Math.max(0,rem));
        return xs.filter(x=>near(Math.abs(x.value),mag));
      }
      return [];
    },
    description:'Transient outputs for x squared plus y squared equals nine. Choose x 2.1 and see square root of 4.59, which is not a permanent y option.'
  };
  FWGallery.run({name:'transient-circle',configuration,exampleKey:'multi',
    formula:({slot,squared})=>`${squared('x')}<span class="mathop">+</span>${squared('y')}<span class="equal">=</span>${slot('c')}`,
    accessibleMathLatex:String.raw`x^2+y^2=9`,
    instructions:'Select x=2.1; choose +sqrt(4.59); scroll y away/back.'});
})();
