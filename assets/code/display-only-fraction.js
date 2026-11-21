(() => {
  'use strict';
  const configuration={variables:{
    x:{type:'varying',latex:String.raw`\frac{1}{2}`},
    y:{type:'varying',strictlyDependent:true,latex:String.raw`\frac{1}{2}`},
    d:{type:'fixed',latex:'5'}
  },description:'Display-only fraction with CommonHTML fractions in the numerator and the determined box.'};
  FWGallery.run({name:'display-only-fraction',configuration,displayOnly:true,
    formula:({slot,staticMath})=>`<span class="interactive-fraction">`+
      `<span class="fraction-numerator">${slot('x')}${staticMath('+2')}</span>`+
      `<span class="fraction-bar" aria-hidden="true"></span>`+
      `<span class="fraction-denominator">${slot('d')}</span></span>`+
      `<span class="equal">${staticMath('=')}</span>${slot('y')}`,
    accessibleMathLatex:String.raw`\frac{x+2}{5}=y`,preloadLatex:['+2','='],
    instructions:'Inspect fixed denominator, static fraction, blue value.'});
})();
