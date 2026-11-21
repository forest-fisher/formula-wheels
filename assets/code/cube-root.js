(() => {
  'use strict';
  const n=FWGallery.number, values=[1,8,27,64,125].map(n);
  const configuration={variables:{
    x:{values,initial:'8',valueOrder:'ascending'},y:{strictlyDependent:true}
  },permissibleOutputs(variable,entry){
    return variable==='x'?[{id:'cube-'+entry.id,latex:'\\sqrt[3]{'+entry.latex+'}',
      value:Math.cbrt(entry.value),speech:'cube root of '+entry.value}]:[];
  },description:'A value and its cube root, displayed in a determined box.'};
  FWGallery.run({name:'cube-root',configuration,
    formula:({slot})=>`${slot('y')}<sup class="power">3</sup><span class="equal">=</span>${slot('x')}`,
    accessibleMathLatex:String.raw`y^3=x`,
    instructions:'Initially show cube root of eight in blue.'});
})();
