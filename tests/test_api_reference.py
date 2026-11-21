"""Verify that the source-audited author API property inventory stays documented."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
doc=(root/'docs/API.md').read_text()
engine=(root/'src/formula-wheels.js').read_text()
required={
 'factory': ['container','configuration','formula','accessibleMathLatex','accessibleEquationLatex','accessibleMathLabel','exampleKey','choiceMode','presentation','displayOnly','preloadLatex'],
 'configuration': ['variables','permissibleOutputs','choiceBehavior','anonymousLabels','description'],
 'variables': ['values','initial','fixed','strictlyDependent','valueDisplay','hiddenValueLabel','boxDisplay','type','valueOrder','showChangeIndicator','pageStep','pixelsPerStep','wheelPixelsPerStep','trackpadPixelsPerStep','latex'],
 'entries':['id','latex','value','speech','branchKey'],
 'presentation':['showVariableTabs','showVariableNamesInText','showChangeIndicators','equationScale','noOutputsLabel'],
 'helpers':['slot','squared','staticMath','shieldMath'],
 'instances':['getValues','subscribe','setPresentation','destroy','refit','debug'],
 'math':['prepare','tex2node','status']
}
for group,items in required.items():
 for item in items:
  assert item in doc, (group,item)
  assert item in engine, (group,item,'not in source')
print('PASS API reference: all',sum(map(len,required.values())),'inventoried names present in source and documentation')
assert 'variables[drag.name].pixelsPerStep ?? 85' in engine
assert '(config.wheelPixelsPerStep ?? DEFAULT_WHEEL_PIXELS_PER_STEP)' in engine
assert '(config.trackpadPixelsPerStep ?? DEFAULT_TRACKPAD_PIXELS_PER_STEP)' in engine
assert 'pointer dragging sensitivity' in doc.lower() or 'controls **dragging**' in doc
assert 'does **not** read that property' not in doc
assert 'ineffective legacy example field' not in doc
print('PASS three distinct, source-verified sensitivity controls')
child=(root/'src/child-mathjax-config.js').read_text()
assert 'enrich:true, speech:false, braille:false' in child
assert 'MathJax.tex2mml(symbolicLatex)' in engine
assert "slot.setAttribute('aria-valuetext',spokenValue(entry))" in engine
assert "announcement.setAttribute('role','status')" in engine
assert 'entry.speech === undefined' in engine
for phrase in ('MathJax-generated speech', 'MathJax-generated Braille', 'Braille translation', 'accessibleMathLatex', 'aria-valuetext', 'role="status"', 'parent textbook document', 'nonexpert'):
 assert phrase.lower() in doc.lower(), phrase
print('PASS accessibility rationale, parent/child split and optimized spoken interactions')

# Release-level conceptual constraint: two interactive varying quantities,
# exactly one of which may be strictly dependent and visually concealed.
assert '## Fundamental limitation: exactly two varying quantities' in doc
for phrase in ('exactly two varying quantities', 'Two manipulable quantities',
               'One manipulable quantity and one strictly dependent quantity',
               'cannot be manipulated directly', "valueDisplay:'hidden'",
               "boxDisplay:'hidden'", 'Display-only exception',
               'still calculates and validates it'):
    assert phrase.lower() in doc.lower(), phrase
assert 'Interactive formulas require exactly two varying quantities' in engine
assert 'strictlyDependent requires exactly two varying quantities, only one strictly dependent' in engine
print('PASS documented interactive two-variable limitation, strict dependence, concealment and display-only exception')
