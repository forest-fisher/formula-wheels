/* No third-party dependencies. Tests the extracted adapter function with fake DOM. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../assets/code/formula-wheels.js'),'utf8');
const begin=source.indexOf('    function ensureCommonHTMLStylesheet(mj) {');
const end=source.indexOf('    // MathJax 4 ui/safe',begin);
assert(begin>=0 && end>begin,'CHTML adapter function exists');
const definition=source.slice(begin,end).trim();
assert(definition.endsWith('}'),'function extraction complete');
let passed=0;
function check(label,fn){fn();console.log('PASS '+label);passed++;}
function withDom(dom){return new Function('document',`return (${definition});`)(dom);}
check('Refresh an existing style node after prewarming',()=>{
  const sheet={tagName:'STYLE'};let calls=0,appended=0;
  const test=withDom({getElementById:()=>sheet,head:{appendChild(){appended++;}}});
  assert.equal(test({chtmlStylesheet(){calls++;return sheet;}}),'refreshed');
  assert.equal(calls,1);assert.equal(appended,0);
});
check('Install a new stylesheet after prewarming',()=>{
  const sheet={tagName:'STYLE'};let calls=0,appended=null;
  const test=withDom({getElementById:()=>null,head:{appendChild(node){appended=node;}}});
  assert.equal(test({chtmlStylesheet(){calls++;return sheet;}}),'installed');
  assert.equal(calls,1);assert.equal(appended,sheet);
});
check('Reject an unrelated existing stylesheet rather than overwriting it',()=>{
  let appended=0;
  const test=withDom({getElementById:()=>({tagName:'STYLE'}),head:{appendChild(){appended++;}}});
  assert.throws(()=>test({chtmlStylesheet(){return {tagName:'STYLE'};}}),/differs/);
  assert.equal(appended,0);
});
check('Reject missing MathJax stylesheet function',()=>{
  const test=withDom({getElementById:()=>null,head:{appendChild(){}}});
  assert.throws(()=>test({}),/unavailable/);
});
check('Reject malformed MathJax stylesheet node',()=>{
  const test=withDom({getElementById:()=>null,head:{appendChild(){}}});
  assert.throws(()=>test({chtmlStylesheet(){return null;}}),/missing CommonHTML style/);
});
check('Adapter refresh is called after all prewarming',()=>{
  const prefix=source.slice(source.indexOf('    async function prepare('),source.indexOf('    function tex2node('));
  assert(prefix.includes('await doc.convertPromise(latex,{display:false})'));
  assert(prefix.indexOf('const chtmlStylesheet=ensureCommonHTMLStylesheet(mj)') >
    prefix.indexOf("await doc.convertPromise('0',{display:false})"));
});
console.log(`${passed}/${passed} adapter checks passed`);
