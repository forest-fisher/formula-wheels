'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync(path.join(__dirname,'../src/child-mathjax-config.js'),'utf8');
let now=0,timers=[];
const window={};
const context={window,performance:{now:()=>now},console,setTimeout(fn,n){timers.push({fn,at:now+n});}};
vm.runInNewContext(src,context);
assert.deepStrictEqual(JSON.parse(JSON.stringify(window.MathJax.options.menuOptions.settings)),{enrich:true,speech:false,braille:false});
window.MathJax={options:{menuOptions:{settings:{enrich:false,speech:true,braille:true}}}};
assert.deepStrictEqual(JSON.parse(JSON.stringify(window.MathJax.options.menuOptions.settings)),{enrich:true,speech:false,braille:false});
window.MathJax.version='4.1.3';
window.MathJax.startup={document:{options:{enableEnrichment:true,enableSpeech:false,enableBraille:false,menuOptions:{settings:{enrich:true,speech:false,braille:false}}},outputJax:{name:'CHTML'}}};
while(timers.length){timers.sort((a,b)=>a.at-b.at);let t=timers.shift();now=t.at;t.fn();}
assert.equal(window.FW_RC1_CHILD_ACCESSIBILITY.status,'PASS');
assert.equal(Object.getOwnPropertyDescriptor(window,'MathJax').writable,true);
console.log('PASS: early/overwritten config protected; six effective fields and CHTML checked; property restored');
