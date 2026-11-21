"""Focused source, authoring-configuration and package checks for experimental RC5.
Does not claim browser or MathJax integration validation.
"""
from pathlib import Path
from xml.etree import ElementTree as ET
import hashlib, json, re
root=Path(__file__).resolve().parents[1]
checks=0
def check(msg, ok):
    global checks
    assert ok,msg
    checks+=1
    print('PASS',msg)
xml=(root/'source/main.ptx').read_text()
js={p.stem:p.read_text() for p in (root/'assets/code').glob('*.js')}
check('15 figures including original four',xml.count('<figure ')==15 and 'fig-linear' in xml and 'fig-transient-circle' in xml)
check('five independent PreTeXt sections',xml.count('<section ')==5)
check('all PreTeXt sources parse',all(ET.parse(root/p) is not None for p in ('project.ptx','source/main.ptx','publication/publication.ptx')))
check('all referenced author scripts present',all((root/'assets/code'/s).exists() for s in re.findall(r'code/([a-z-]+\.js)',xml)))
check('preferred modes required and automatic',"choiceBehavior:'required'" in js['preferred-required'] and "choiceBehavior:'automatic'" in js['preferred-automatic'])
check('preferred choices explicitly specify preferredId',all('preferredId' in js[x] for x in ('preferred-required','preferred-automatic','preferred-three-options')))
check('three alternative output choices',"selected.value===0?ys:[ys[1]]" in js['preferred-three-options'])
check('hidden variable names and tabs',"showVariableTabs:false,showVariableNamesInText:false" in js['hidden-variable-labels'])
check('all static demos explicitly displayOnly',all('displayOnly:true' in js[x] for x in ('display-only-linear','display-only-fraction','display-only-radical')))
check('all static demo slots have explicit types',all("type:'varying'" in js[x] for x in ('display-only-linear','display-only-fraction','display-only-radical')))
check('fractional power uses 3/5 LaTeX',r'\frac{3}{5}' in js['fractional-exponent'])
check('log notation',r'\log_{2}' in js['logarithm'])
check('cube root uses indexed LaTeX',r'\sqrt[3]{' in js['cube-root'])
check('transient output does not extend y array',"const ys=[yRoot(9,-1),yRoot(8,-1),yRoot(5,-1),yRoot(0,1)," in js['transient-circle'] and '4.59' not in js['transient-circle'].split('const ys=')[1].split(';')[0])
check('transient has both x signs', '-2.1' in js['transient-circle'] and '2.1' in js['transient-circle'])
check('prewarming enumerates callback outputs', 'configuration.permissibleOutputs(name,entry)' in js['formula-wheels'])
check('CSS denominator remains 9px', 'padding-top:9px; z-index:9' in (root/'assets/css/formula-wheels.css').read_text())
print(f'{checks}/{checks} extended fixture checks passed')
