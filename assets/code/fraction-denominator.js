(() => {
  'use strict';
  const container=document.getElementById('formula-wheels');
  if (!container) return;
  const status=document.createElement('div');
  status.className='fw-beta1-status';
  status.setAttribute('role','status');
  container.after(status);
  const number=n=>({id:String(n),latex:String(n),value:n,speech:String(n)});
  const xValues=[-4,-3,-1,0,1,2,3,4].map(number); // x=-2 excluded.
  function yFor(x){
    const d=x.value+2;
    const abs=Math.abs(d);
    const latex=abs===1 ? `${d<0?'-':''}5` : abs===5 ? `${d<0?'-':''}1` :
      `${d<0?'-':''}\\frac{5}{${abs}}`;
    const speech=abs===1 ? `${d<0?'negative ':''}five` :
      abs===5 ? `${d<0?'negative ':''}one` :
      `${d<0?'negative ':''}five over ${abs}`;
    return {id:'recip-'+x.id,latex,value:5/d,speech};
  }
  const yValues=xValues.map(yFor).sort((a,b)=>a.value-b.value);
  const outputs=new Map(xValues.map(x=>[x.id,yFor(x)]));
  const inputs=new Map(xValues.map(x=>['recip-'+x.id,x]));
  const configuration={
    variables:{
      x:{values:xValues,initial:'0',valueOrder:'ascending',pixelsPerStep:75,showChangeIndicator:true},
      y:{values:yValues,initial:'recip-0',valueOrder:'ascending',pixelsPerStep:75,showChangeIndicator:true}
    },
    permissibleOutputs(changedVariable,selected){
      if(changedVariable==='x') return [outputs.get(selected.id)].filter(Boolean);
      if(changedVariable==='y') return [inputs.get(selected.id)].filter(Boolean);
      return [];
    },
    description:'Five divided by the quantity x plus two equals y. x cannot equal negative two.'
  };
  const accessibleMathLatex=String.raw`\frac{5}{x+2}=y`;
  const preloadLatex=['5','+2','='];
  const formula=({slot,staticMath,shieldMath})=>
    `<span class="interactive-fraction">`+
    `<span class="fraction-numerator">${shieldMath('5')}</span>`+
    `<span class="fraction-bar" aria-hidden="true"></span>`+
    `<span class="fraction-denominator">${slot('x')}${staticMath('+2')}</span></span>`+
    `<span class="equal">${staticMath('=')}</span><span class="term">${slot('y')}</span>`;

  (async()=>{
    try {
      status.textContent='Preparing MathJax…';
      const instance=await window.createFormulaWheelsAsync({
        container, configuration, formula, accessibleMathLatex,
        preloadLatex, presentation:{showVariableTabs:true,showChangeIndicators:true}
      });
      window.FW_BETA1_INSTANCE=instance;
      const report=window.FormulaWheelsMath.status();
      status.textContent='READY: '+report.mathJaxVersion+' '+report.renderer+'. Use arrow keys; Enter confirms.';
      document.documentElement.dataset.beta1Ready='true';
    } catch(error) {
      console.error('Formula Wheels beta.1 authoring example failed',error);
      status.textContent='ERROR: '+(error?.message||String(error));
      document.documentElement.dataset.beta1Ready='error';
    }
  })();
})();
