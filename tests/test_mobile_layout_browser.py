"""Optional Chromium geometry regression for RC4 mobile iframe sizing.

Uses the exact engine and scheduler sizing helpers in a synthetic oversized
PreTeXt-like article. This is not a real PreTeXt build or a physical-phone test.
"""
import unittest
from html import escape
from pathlib import Path

root=Path(__file__).resolve().parents[1]
css=(root/'src/formula-wheels.css').read_text(encoding='utf-8')
js=(root/'src/formula-wheels.js').read_text(encoding='utf-8')
scheduler=(root/'src/iframe-scheduler.js').read_text(encoding='utf-8')
start=js.index('    function responsiveBaselineScale() {')
end=js.index('    const lifetime=new AbortController();',start)
child_helpers=js[start:end]
start=scheduler.index('  const originalFrameStyles = new WeakMap();')
end=scheduler.index('  function start() {',start)
parent_helpers=scheduler[start:end]

class BrowserLayout(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from playwright.sync_api import sync_playwright
        import shutil
        executable=shutil.which('chromium') or shutil.which('google-chrome')
        if not executable:raise unittest.SkipTest('Local Chromium not installed')
        cls.playwright=sync_playwright().start()
        try:
            cls.browser=cls.playwright.chromium.launch(executable_path=executable,headless=True,args=['--no-sandbox'])
        except Exception:
            cls.playwright.stop()
            raise

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def test_oversized_article_parent_and_consistent_mobile_scale(self):
        # A 710px article column on a 390px phone: in RC3 the iframe could
        # remain ~675px, centering a correctly scaled equation beyond the
        # visible phone width. RC4 must constrain the iframe itself.
        child=(
            '<!doctype html><html><head><style>'+css+'</style></head>'
            '<body style="margin:0">'
            '<div id="root" data-slate="equation" '
            'style="width:100%;height:238px;min-height:238px;padding:64px 3px 68px">'
            '<div id="eq" class="equation" style="width:570px;height:70px">'
            '<span class="slot available"></span>+'
            '<span class="slot available"></span>='
            '<span class="slot fixed"></span></div></div></body></html>'
        )
        parent=(
            '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">'
            '<style>body{margin:0}.article{width:710px;margin-left:18px}'
            'iframe{display:block;border:0;width:95%;height:300px;min-width:630px}</style></head>'
            '<body><div class="article"><iframe id="fw" srcdoc="'+escape(child,quote=True)+'"></iframe>'
            '</div></body></html>'
        )
        for viewport in [375,390,430,600,750,900]:
            with self.subTest(viewport=viewport):
                page=self.browser.new_page(viewport={'width':viewport,'height':800},is_mobile=True,has_touch=True,device_scale_factor=2)
                try:
                    page.set_content(parent)
                    parent_result=page.evaluate('''() => {'''+parent_helpers+'''
                        const frame=document.querySelector('#fw');
                        const before=frame.getBoundingClientRect().width;
                        constrainMobileFrames([frame]);
                        const r=frame.getBoundingClientRect();
                        return {before,after:r.width,left:r.left,right:r.right};
                    }''')
                    if viewport<=600:
                        self.assertGreater(parent_result['before'],viewport)
                        self.assertLessEqual(parent_result['right'],viewport-7)
                    frame=page.frame_locator('#fw')
                    data=frame.locator('body').evaluate('''() => {
                        const root=document.querySelector('#root');
                        const equationRoot=root;
                        const equation=document.querySelector('#eq');
                        const presentationState={equationScale:1};
                        '''+child_helpers+'''
                        const fitted=fittedEquationScale(equation);
                        applyEquationScale(equation,fitted);
                        const r=equation.getBoundingClientRect();
                        const stage=root.getBoundingClientRect();
                        const first={scale:fitted,left:r.left,right:r.right,width:r.width,
                          stageLeft:stage.left,stageRight:stage.right,
                          iframeWidth:innerWidth,scrollWidth:document.documentElement.scrollWidth};
                        equation.style.width='400px';
                        const shortScale=fittedEquationScale(equation);
                        applyEquationScale(equation,shortScale);
                        return {first,shortScale,baseline:responsiveBaselineScale()};
                    }''')
                    self.assertGreaterEqual(data['first']['left'],data['first']['stageLeft']-1)
                    self.assertLessEqual(data['first']['right'],data['first']['stageRight']+1)
                    self.assertLessEqual(data['first']['scrollWidth'],data['first']['iframeWidth']+1)
                    baseline=.55 if viewport<=420 else .76 if viewport<=600 else 1
                    self.assertAlmostEqual(data['baseline'],baseline,delta=.001)
                    self.assertAlmostEqual(data['shortScale'],baseline,delta=.001)
                    if viewport==430:
                        # This width genuinely needs the exceptional fit fallback.
                        self.assertLess(data['first']['scale'],baseline)
                    else:
                        self.assertAlmostEqual(data['first']['scale'],baseline,delta=.001)
                finally:
                    page.close()

if __name__=='__main__':unittest.main(verbosity=2)
