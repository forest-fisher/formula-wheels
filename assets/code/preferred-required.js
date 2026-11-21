(() => {
  'use strict';
  const num=FWGallery.number;
  const xValues=[0,1,2,3].map(num);
  const yValues=[
    {id:'-3',latex:'-3',value:-3,speech:'negative three'},
    {id:'-r8',latex:String.raw`-\sqrt{8}`,value:-Math.sqrt(8),speech:'negative square root of eight'},
    {id:'-r5',latex:String.raw`-\sqrt{5}`,value:-Math.sqrt(5),speech:'negative square root of five'},
    num(0),
    {id:'+r5',latex:String.raw`\sqrt{5}`,value:Math.sqrt(5),speech:'square root of five'},
    {id:'+r8',latex:String.raw`\sqrt{8}`,value:Math.sqrt(8),speech:'square root of eight'},
    num(3)
  ];
  const near=(a,b)=>Math.abs(a-b)<1e-8;
  const positiveOutput=arr=>arr.find(v=>v.value>=0)?.id??null;
  const configuration={
    choiceBehavior:'required',
    variables:{
      x:{values:xValues,initial:'0',valueOrder:'ascending'},
      y:{values:yValues,initial:'3',valueOrder:'ascending'},
      c:{fixed:9}
    },
    permissibleOutputs(changedVariable,selected) {
      const list=changedVariable==='x'
        ? yValues.filter(v=>near(v.value*v.value+selected.value*selected.value,9))
        : xValues.filter(v=>near(v.value*v.value+selected.value*selected.value,9));
      return {options:list,preferredId:positiveOutput(list)};
    },
    description:'Square sum nine; positive alternatives are highlighted but require an explicit selection.'
  };
  FWGallery.run({name:'preferred-required',configuration,
    formula:({slot,squared})=>`${squared('x')}<span class="mathop">+</span>${squared('y')}<span class="equal">=</span>${slot('c')}`,
    accessibleMathLatex:String.raw`x^2+y^2=9`,exampleKey:'preferred-multi',
    instructions:'Choose x=1; inspect bold preferred popup value.'});
})();
