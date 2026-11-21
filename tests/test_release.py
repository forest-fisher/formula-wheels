"""Local source and release invariant checks (not a real PreTeXt/browser test)."""
import hashlib, json, re, unittest
from pathlib import Path
from xml.etree import ElementTree as ET
root=Path(__file__).resolve().parents[1]
class Release(unittest.TestCase):
    def test_xml(self):
        for f in ('project.ptx','publication/publication.ptx','source/main.ptx'):
            ET.parse(root/f)
        self.assertEqual((root/'source/main.ptx').read_text().count('<figure '),15)
        self.assertEqual((root/'source/main.ptx').read_text().count('<interactive '),15)
    def test_core_source_immutable(self):
        manifest=json.loads((root/'SOURCE_PROVENANCE.json').read_text())
        for name,sub,expected in [('formula-wheels.js','code','coreSHA256'),('formula-wheels.css','css','cssSHA256')]:
            src=(root/'src'/name).read_bytes()
            self.assertEqual(hashlib.sha256(src).hexdigest(),manifest[expected])
            self.assertEqual(src,(root/'assets'/sub/name).read_bytes())
    def test_direct_api_and_no_profiler_dependency(self):
        scripts=list((root/'assets/code').glob('*.js'))
        self.assertEqual(len(scripts),17)
        for p in scripts:
            self.assertNotIn('FWStartupProfiler',p.read_text())
        self.assertNotIn('startup-profiler.js',(root/'source/main.ptx').read_text())
        self.assertIn('createFormulaWheelsAsync(', (root/'assets/code/gallery-fixture.js').read_text())
        for p in ['linear-graph.js','fraction-numerator.js','fraction-denominator.js','circle-branches.js']:
            self.assertIn('createFormulaWheelsAsync(', (root/'assets/code'/p).read_text())
    def test_immutable_security_and_math(self):
        text=(root/'src/formula-wheels.js').read_text()
        self.assertIn('safe.sanitize(data.math,data.document)',text)
        self.assertIn('configuration.permissibleOutputs(name,entry)',text)
        self.assertIn("doc.outputJax?.name !== 'CHTML'",text)
        self.assertIn('window.createFormulaWheelsAsync=createFormulaWheelsAsync',text)
        self.assertIn('window.createFormulaWheels=createFormulaWheels',text)
    def test_parent_child_separation(self):
        p=(root/'src/iframe-scheduler.js').read_text()
        c=(root/'src/child-mathjax-config.js').read_text()
        self.assertIn('const HEAD_START_MS = 3000',p)
        self.assertIn('const LATER_GAP_MS = 250',p)
        self.assertNotIn('MathJax.startup.promise',p)
        self.assertIn('enrich:true, speech:false, braille:false',c)
        self.assertNotIn('FW_DIAG_109',p+c)
    def test_manifest(self):
        manifest=json.loads((root/'RELEASE_MANIFEST_SHA256.json').read_text())
        actual={p.relative_to(root).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in root.rglob('*') if p.is_file() and not p.name.endswith('.pyc') and p.name!='RELEASE_MANIFEST_SHA256.json' and not any(part in ('output','generated-assets','__pycache__','.pretext','.git','.pytest_cache','dist','.venv','venv','node_modules','.cache') for part in p.relative_to(root).parts)}
        self.assertEqual(manifest['files'],actual)
if __name__=='__main__':unittest.main(verbosity=2)
