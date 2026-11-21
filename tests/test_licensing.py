"""License/attribution checks for the RC1 source release (does not assess legal sufficiency)."""
from pathlib import Path
import hashlib
import json
import unittest

root=Path(__file__).resolve().parents[1]
class Licensing(unittest.TestCase):
    def test_mpl_full_license(self):
        license=(root/'LICENSE').read_text(encoding='utf-8')
        self.assertTrue(license.startswith('Mozilla Public License Version 2.0'))
        for line in ['1. Definitions', '2. License Grants and Conditions',
                     '3. Responsibilities', 'Exhibit A - Source Code Form License Notice',
                     'Exhibit B - "Incompatible With Secondary Licenses" Notice']:
            self.assertIn(line,license)
        self.assertGreater(len(license),15000)
    def test_authorship_and_disclosure(self):
        for p in ('README.md','docs/API.md','RELEASE_NOTES.md','NOTICE.md'):
            text=(root/p).read_text().lower()
            for term in ('forest fisher','2026','chatgpt','vibe coded','mpl'):
                self.assertIn(term,text,(p,term))
    def test_notice_and_third_party(self):
        notice=(root/'NOTICE.md').read_text()
        self.assertIn('This Source Code Form is subject to the terms of the Mozilla Public License',notice)
        for p in ('PreTeXt','MathJax','JSXGraph'):
            self.assertIn(p,notice)
        self.assertIn('does not relicense',notice)
    def test_original_source_provenance(self):
        provenance=json.loads((root/'SOURCE_PROVENANCE.json').read_text())
        self.assertEqual(hashlib.sha256((root/'src/formula-wheels.js').read_bytes()).hexdigest(),provenance['coreSHA256'])
        self.assertEqual(hashlib.sha256((root/'src/formula-wheels.css').read_bytes()).hexdigest(),provenance['cssSHA256'])
if __name__=='__main__':unittest.main(verbosity=2)
