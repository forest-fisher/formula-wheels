"""Simulate PreTeXt's generated HTML before and after production patching."""
import importlib.util, tempfile, unittest
from pathlib import Path
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('patcher',root/'tools/patch_pretext.py')
patcher=importlib.util.module_from_spec(spec);spec.loader.exec_module(patcher)
class Postbuild(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.out=Path(self.tmp.name)
        self.refs=patcher.interactives()
        for id in self.refs:
            (self.out/id).write_text('<!doctype html><html><head><title>child</title>\n<script src="mathjax_startup.js"></script></head><body><script src="external/code/formula-wheels.js"></script></body></html>')
        first=''.join(f'<iframe id="{idx}" loading="lazy" src="{name}"></iframe>' for idx,name in enumerate(self.refs,1))
        # Also leave a non-Formula Wheels iframe that must remain untouched.
        (self.out/'part-one.html').write_text('<html><head><title>Parent</title></head><body>'+first+'<iframe src="other.html"></iframe></body></html>')
    def tearDown(self):self.tmp.cleanup()
    def test_full_fixture(self):
        updates,originals=patcher.stage(self.out)
        self.assertEqual(len(updates),len(self.refs)+1)
        parent=updates[self.out/'part-one.html']
        self.assertEqual(parent.count('data-fw-rc1-src='),len(self.refs))
        self.assertEqual(parent.count('loading="eager"'),len(self.refs))
        self.assertIn('<iframe src="other.html"></iframe>',parent)
        self.assertIn('FW_RC1_PARENT_SCHEDULER',parent)
        for name in self.refs:
            child=updates[self.out/name]
            self.assertIn('FW_RC1_CHILD_MATHJAX_CONFIG',child)
            self.assertLess(child.index('FW_RC1_CHILD_MATHJAX_CONFIG'),child.index('mathjax_startup.js'))
    def test_duplicate_article_parent_is_valid(self):
        # PreTeXt can generate both index.html and article.html, with identical
        # figure iframe references. Both need their own scheduler and each
        # child must still be patched just once.
        page=self.out/'part-one.html'
        (self.out/'index.html').write_text(page.read_text())
        updates,originals=patcher.stage(self.out)
        self.assertEqual(len(updates),len(self.refs)+2)
        self.assertEqual(len(originals),len(updates))
        self.assertIn('FW_RC1_PARENT_SCHEDULER',updates[self.out/'index.html'])
        self.assertIn('FW_RC1_PARENT_SCHEDULER',updates[page])
        self.assertEqual(updates[self.out/'index.html'].count('data-fw-rc1-src='),len(self.refs))
    def test_split_references_across_two_parents(self):
        # Two pages can divide the Formula Wheels rather than duplicate them.
        names=list(self.refs)
        page=self.out/'part-one.html'
        original=page.read_text()
        first_half=names[:len(names)//2]
        second_half=names[len(names)//2:]
        for name in second_half:original=original.replace(f'<iframe id="{names.index(name)+1}" loading="lazy" src="{name}"></iframe>','')
        page.write_text(original)
        second='<html><head><title>Part two</title></head><body>'+''.join(f'<iframe src="{name}"></iframe>' for name in second_half)+'</body></html>'
        (self.out/'part-two.html').write_text(second)
        updates,_=patcher.stage(self.out)
        self.assertEqual(len(updates),len(names)+2)
        self.assertEqual(updates[page].count('data-fw-rc1-src='),len(first_half))
        self.assertEqual(updates[self.out/'part-two.html'].count('data-fw-rc1-src='),len(second_half))
    def test_throws_on_missing_child_no_modifications(self):
        (self.out/next(iter(self.refs))).unlink()
        with self.assertRaisesRegex(ValueError,'missing'):patcher.stage(self.out)
        self.assertNotIn('FW_RC1_PARENT',(self.out/'part-one.html').read_text())
    def test_throws_on_duplicate_and_missing_refs(self):
        p=self.out/'part-one.html';s=p.read_text()
        name=next(iter(self.refs))
        p.write_text(s.replace(f'<iframe id="1"',f'<iframe src="{name}" id="duplicate"></iframe><iframe id="1"'))
        with self.assertRaisesRegex(ValueError,'Repeated'):patcher.stage(self.out)
    def test_child_repatch_rejected(self):
        updates,_=patcher.stage(self.out)
        for p,s in updates.items():p.write_text(s)
        with self.assertRaisesRegex(ValueError,'Already patched'):patcher.stage(self.out)
    def test_atomic_missing_parent_entry(self):
        parent=self.out/'part-one.html';parent.write_text(parent.read_text().replace(next(iter(self.refs)),'missing-this-one.html'))
        with self.assertRaisesRegex(ValueError,'do not reference all'):patcher.stage(self.out)
    def test_valid_heading_only(self):
        with self.assertRaisesRegex(ValueError,'complete HTML'):
            patcher.inject_first_head('headless', 'alert(1);','ID')
if __name__=='__main__':unittest.main(verbosity=2)
