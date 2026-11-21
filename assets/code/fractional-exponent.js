(() => {
  'use strict';
  const n=FWGallery.number, values=[2,4,8,16,32].map(n);
  const power=String.raw`\frac{3}{5}`;
  const configuration={variables:{
    x:{values,initial:'2',valueOrder:'ascending'},y:{strictlyDependent:true}
  },permissibleOutputs(variable,entry){
    return variable==='x'?[{id:'pow-'+entry.id,latex:entry.latex+'^{'+power+'}',
      value:Math.pow(entry.value,3/5),speech:entry.value+' to the three fifths power'}]:[];
  },description:'Fractional exponent, including two to the three fifths.'};
  FWGallery.run({name:'fractional-exponent',configuration,
    formula:({slot,staticMath})=>`<span class="term">${slot('x')}<sup class="power">${staticMath(power)}</sup></span>`+
      `<span class="equal">=</span>${slot('y')}`,
    accessibleMathLatex:String.raw`x^{3/5}=y`,preloadLatex:[power],
    instructions:'Initially show 2 to the 3/5 power in blue.'});
})();
