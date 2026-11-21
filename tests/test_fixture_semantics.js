/* Author-callback semantic tests, not a browser renderer test. */
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path'), assert = require('assert');
const root=path.resolve(__dirname,'..','assets','code');
function fixture(name) {
  let options=null;
  const sandbox={FWGallery:{number(value){return {id:String(value),latex:String(value),value,speech:String(value)};},run(v){options=v;}},Math,Number,String,console};
  vm.runInNewContext(fs.readFileSync(path.join(root,name+'.js'),'utf8'),sandbox,{filename:name+'.js'});
  assert(options, `No fixture ${name}`);
  return options;
}
let count=0;
function check(message,fn){fn();count++;console.log('PASS',message);}
const nr=fixture('preferred-required');
check('preferred required x=1 lists positive/negative sqrt(8)',()=>{
  const r=nr.configuration.permissibleOutputs('x',nr.configuration.variables.x.values[1]);
  assert.strictEqual(r.options.length,2);
  assert(r.options.some(v=>v.value<0));
  assert(r.options.find(v=>v.id===r.preferredId).value>0);
  assert.strictEqual(nr.configuration.choiceBehavior,'required');
});
const na=fixture('preferred-automatic');
check('preferred automatic x=1 picks negative root',()=>{
  const r=na.configuration.permissibleOutputs('x',na.configuration.variables.x.values[1]);
  assert.strictEqual(r.options.length,2);
  assert(r.options.find(v=>v.id===r.preferredId).value<0);
  assert.strictEqual(na.configuration.choiceBehavior,'automatic');
});
const three=fixture('preferred-three-options');
check('zero-product fixture has exactly three options and valid inverse',()=>{
  const r=three.configuration.permissibleOutputs('x',three.configuration.variables.x.values[0]);
  assert.strictEqual(r.options.length,3);
  assert.strictEqual(r.preferredId,'0');
  const inverse=three.configuration.permissibleOutputs('y',three.configuration.variables.y.values[2]);
  assert.strictEqual(inverse.options.length,1);
  assert.strictEqual(inverse.options[0].value,0);
});
check('hidden labels use both presentation flags',()=>{
  const v=fixture('hidden-variable-labels');
  assert.strictEqual(v.presentation.showVariableTabs,false);
  assert.strictEqual(v.presentation.showVariableNamesInText,false);
  assert.strictEqual(v.configuration.permissibleOutputs('x',{value:2})[0].value,5);
});
check('three display-only fixtures have no wheel config',()=>{
  for(const name of ['display-only-linear','display-only-fraction','display-only-radical']) {
    const v=fixture(name);
    assert.strictEqual(v.displayOnly,true);
    assert(Object.values(v.configuration.variables).every(s=>s.type));
    assert(Object.values(v.configuration.variables).every(s=>!Object.hasOwn(s,'values')));
  }
});
check('fractional exponent gives 2^(3/5)',()=>{
  const v=fixture('fractional-exponent');
  const o=v.configuration.permissibleOutputs('x',v.configuration.variables.x.values[0]);
  assert.strictEqual(o.length,1);
  assert(o[0].latex.includes('^{\\frac{3}{5}}'));
  assert(Math.abs(o[0].value-Math.pow(2,3/5))<1e-12);
});
check('logarithm gives correct value and TeX',()=>{
  const v=fixture('logarithm');
  const o=v.configuration.permissibleOutputs('x',v.configuration.variables.x.values.find(x=>x.value===8));
  assert.strictEqual(o[0].value,3);
  assert(o[0].latex.includes('\\log_{2}(8)'));
});
check('cube root uses optional-index TeX and correct value',()=>{
  const v=fixture('cube-root');
  const o=v.configuration.permissibleOutputs('x',v.configuration.variables.x.values.find(x=>x.value===8));
  assert.strictEqual(o[0].value,2);
  assert.strictEqual(o[0].latex,'\\sqrt[3]{8}');
});
const temp=fixture('transient-circle');
check('2.1 yields ±sqrt(4.59) absent from permanent y array',()=>{
  const x=temp.configuration.variables.x.values.find(x=>x.value===2.1);
  const r=temp.configuration.permissibleOutputs('x',x);
  assert.strictEqual(r.length,2);
  assert.deepStrictEqual([...r].map(o=>o.latex),['-\\sqrt{4.59}','\\sqrt{4.59}']);
  assert(r.every(v=>!temp.configuration.variables.y.values.some(y=>y.id===v.id)));
  assert(r.every(y=>Math.abs(y.value*y.value+x.value*x.value-9)<1e-10));
});
check('mathematically valid inverse has both signs, so provenance must suppress -2.1',()=>{
  const x=temp.configuration.variables.x.values.find(x=>x.value===2.1);
  const y=temp.configuration.permissibleOutputs('x',x)[1];
  const inverse=temp.configuration.permissibleOutputs('y',y);
  assert.strictEqual(inverse.length,2);
  assert(inverse.some(v=>v.value===-2.1));
  assert(inverse.some(v=>v.value===2.1));
});
console.log(`${count}/${count} authoring semantics checks passed`);
