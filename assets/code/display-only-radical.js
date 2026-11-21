(() => {
  'use strict';
  const configuration={variables:{
    x:{type:'varying',latex:'2'},
    y:{type:'varying',latex:String.raw`\sqrt{5}`},
    c:{type:'fixed',latex:'9'}
  },description:'Display-only squares sum to nine; radical occupies a static green box.'};
  FWGallery.run({name:'display-only-radical',configuration,displayOnly:true,
    formula:({slot,squared})=>`${squared('x')}<span class="mathop">+</span>${squared('y')}<span class="equal">=</span>${slot('c')}`,
    accessibleMathLatex:String.raw`x^2+y^2=9`,instructions:'Check radical sizing without scrolling.'});
})();
