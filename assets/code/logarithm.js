(() => {
  'use strict';
  const n=FWGallery.number, values=[1,2,4,8,16,32].map(n);
  const configuration={variables:{
    x:{values,initial:'8',valueOrder:'ascending'},y:{strictlyDependent:true}
  },permissibleOutputs(variable,entry){
    return variable==='x'?[{id:'log-'+entry.id,
      latex:String.raw`\log_{2}(`+entry.latex+')',
      value:Math.log2(entry.value),speech:'logarithm base two of '+entry.value}]:[];
  },description:'Base two logarithm of the input.'};
  FWGallery.run({name:'logarithm',configuration,
    formula:({slot,staticMath})=>`${staticMath(String.raw`\log_{2}`)}`+
      `<span class="paren">(</span>${slot('x')}<span class="paren">)</span>`+
      `<span class="equal">=</span>${slot('y')}`,
    accessibleMathLatex:String.raw`\log_{2}(x)=y`,preloadLatex:[String.raw`\log_{2}`],
    instructions:'Check logarithm in fixed expression and blue value.'});
})();
