"""Check diagnostic status cannot expand an iframe or suppress wheel scrolling.

Source-level regression only: visual confirmation remains a browser test.
"""
from pathlib import Path
import re
import unittest
root=Path(__file__).resolve().parents[1]
class GalleryStatus(unittest.TestCase):
    def test_diagnostic_is_out_of_flow(self):
        css=(root/'assets/css/beta1-wheel.css').read_text()
        rule=re.search(r'\.fw-beta1-status\s*\{([^}]+)\}',css,re.S)
        self.assertIsNotNone(rule)
        body=rule.group(1)
        self.assertRegex(body,r'position\s*:\s*fixed')
        self.assertRegex(body,r'pointer-events\s*:\s*none')
        self.assertNotRegex(body,r'overflow\s*:\s*hidden')
    def test_reusable_css_is_not_changed(self):
        # Canonical engine & CSS still match recorded RC5 source hashes.
        import hashlib,json
        info=json.loads((root/'SOURCE_PROVENANCE.json').read_text())
        for filename,key in [('formula-wheels.css','cssSHA256'),('formula-wheels.js','coreSHA256')]:
            self.assertEqual(hashlib.sha256((root/'src'/filename).read_bytes()).hexdigest(),info[key])
if __name__=='__main__': unittest.main(verbosity=2)
