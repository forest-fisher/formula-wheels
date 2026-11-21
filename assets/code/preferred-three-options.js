(() => {
  'use strict';
  const n=FWGallery.number, xs=[0,1,2].map(n), ys=[-2,0,2].map(n);
  const configuration={
    choiceBehavior:'required',
    variables:{x:{values:xs,initial:'1',valueOrder:'ascending'},y:{values:ys,initial:'0',valueOrder:'ascending'},c:{fixed:0}},
    permissibleOutputs(changedVariable,selected){
      const options=changedVariable==='x'
        ? (selected.value===0?ys:[ys[1]])
        : (selected.value===0?xs:[xs[0]]);
      return {options,preferredId:options.find(v=>v.value===0)?.id??null};
    },
    description:'For x times y equals zero, x equals zero permits three sample y values; zero is highlighted.'
  };
  FWGallery.run({name:'preferred-three-options',configuration,
    formula:({slot})=>`${slot('x')}<span class="mathop">×</span>${slot('y')}<span class="equal">=</span>${slot('c')}`,
    accessibleMathLatex:String.raw`xy=0`,exampleKey:'preferred-multi',
    instructions:'Choose x=0; check three options and bold zero.'});
})();
