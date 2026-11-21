(() => {
  'use strict';
  const num=FWGallery.number;
  const xValues=[0,1,2,3].map(num);
  const root=(n,s)=>({id:(s<0?'-':'+')+'r'+n,latex:(s<0?'-':'')+`\\sqrt{${n}}`,value:s*Math.sqrt(n),speech:(s<0?'negative ':'')+'square root of '+n});
  const yValues=[num(-3),root(8,-1),root(5,-1),num(0),root(5,1),root(8,1),num(3)];
  const near=(a,b)=>Math.abs(a-b)<1e-8;
  const configuration={
    choiceBehavior:'automatic',
    variables:{x:{values:xValues,initial:'3',valueOrder:'ascending'},y:{values:yValues,initial:'0',valueOrder:'ascending'},c:{fixed:9}},
    permissibleOutputs(changedVariable,selected){
      const values=changedVariable==='x'
        ?yValues.filter(y=>near(y.value*y.value+selected.value*selected.value,9))
        :xValues.filter(x=>near(x.value*x.value+selected.value*selected.value,9));
      return {options:values,preferredId:values.find(v=>v.value<0)?.id??values[0]?.id??null};
    },
    description:'Automatic preferred negative branch: compare bold choice and faded alternative.'
  };
  FWGallery.run({name:'preferred-automatic',configuration,
    formula:({slot,squared})=>`${squared('x')}<span class="mathop">+</span>${squared('y')}<span class="equal">=</span>${slot('c')}`,
    accessibleMathLatex:String.raw`x^2+y^2=9`,exampleKey:'preferred-multi',
    instructions:'Change x to 1; inspect preferred/shadowed alternatives while moving.'});
})();
