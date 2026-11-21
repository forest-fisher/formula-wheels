(() => {
  'use strict';
  const n=FWGallery.number, xs=[-2,-1,0,1,2].map(n);
  const configuration={
    variables:{x:{values:xs,initial:'0',valueOrder:'ascending'},y:{strictlyDependent:true},c:{fixed:1}},
    anonymousLabels:{x:'the input quantity',y:'the output quantity'},
    permissibleOutputs(variable,entry){return variable==='x'?[n(entry.value*entry.value+1)]:[];},
    description:'Input squared plus one equals output; labels are hidden in both boxes and prompts.'
  };
  FWGallery.run({name:'hidden-variable-labels',configuration,
    formula:({slot,squared})=>`${squared('x')}<span class="mathop">+</span>${slot('c')}<span class="equal">=</span>${slot('y')}`,
    accessibleMathLatex:String.raw`x^2+1=y`,
    presentation:{showVariableTabs:false,showVariableNamesInText:false},
    instructions:'Variable tabs hidden; check anonymous screen-reader labels.'});
})();
