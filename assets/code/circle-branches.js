(() => {
  'use strict';
  const container=document.getElementById('formula-wheels');
  if (!container) return;
  const status=document.createElement('div');
  status.className='fw-beta1-status';
  status.setAttribute('role','status');
  container.after(status);
  const number=n=>({id:String(n),latex:String(n),value:n,speech:String(n)});
  const xValues=[-3,-2,-1,0,1,2,3].map(number);
  const root=(n,sign)=>({
    id:(sign<0?'-':'')+'sqrt'+n,
    latex:(sign<0?'-':'')+`\\sqrt{${n}}`,
    value:sign*Math.sqrt(n),
    speech:(sign<0?'negative ':'')+'square root of '+n,
    branchKey:sign<0?'negative':'positive'
  });
  const yValues=[number(-3),root(8,-1),root(5,-1),number(0),root(5,1),root(8,1),number(3)];
  const near=(a,b)=>Math.abs(a-b)<1e-9;
  const configuration={
    choiceBehavior:'required',
    variables:{
      x:{values:xValues,initial:'0',valueOrder:'ascending',pixelsPerStep:70,showChangeIndicator:true},
      y:{values:yValues,initial:'3',valueOrder:'ascending',pixelsPerStep:70,showChangeIndicator:true},
      c:{fixed:9}
    },
    permissibleOutputs(changedVariable,selected){
      if(changedVariable==='x')return yValues.filter(y=>near(y.value*y.value+selected.value*selected.value,9));
      if(changedVariable==='y')return xValues.filter(x=>near(x.value*x.value+selected.value*selected.value,9));
      return [];
    },
    description:'Explore pairs of x and y whose squares sum to nine.'
  };
  const accessibleMathLatex=String.raw`x^2+y^2=9`;
  const preloadLatex=[];
  const formula=({slot,squared})=>`${squared('x')}<span class="mathop">+</span>`+
    `${squared('y')}<span class="equal">=</span>${slot('c')}`;

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
