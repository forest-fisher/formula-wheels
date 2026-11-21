# Local validation — Version 22.0 (promoted from 22.0-rc.4, November 2026)

This package changes the core mobile baseline and parent iframe viewport sizing compared with RC3. The RC3 engine layout-footprint correction is retained.
All local source, mathematics, configuration, post-build and layout checks were
re-run. **The author subsequently confirmed successful PreTeXt builds and accepted the RC4 phone layout; see `RELEASE_ACCEPTANCE.md`.**

| Script | Result | Scope |
|---|---:|---|
| `python tests/test_release.py` | 6/6 | XML, provenance digests, core/asset equality, security, scheduler and archive manifest |
| `python tests/test_extended_gallery.py` | 17/17 | 15 PreTeXt interactive fixtures, root/notation/author requirements |
| `node tests/test_fixture_semantics.js` | 10/10 | Preferred choices, roots, fractions, transient branch provenance |
| `node tests/test_css_refresh.js` | 6/6 | MathJax 4 CHTML stylesheet adapter |
| `node tests/test_schedule.js` | 3/3 | Timing plus mobile iframe max-width before launch and desktop restoration |
| `node tests/test_child_boot.js` | 1/1 | Parent/child MathJax accessibility configuration guard |
| `python tests/test_postbuild.py` | 8/8 | Simulated PreTeXt output, duplicate parents, atomic patching, re-patch rejection |
| `python tests/test_licensing.py` | 4/4 | MPL-2.0, copyright, Forest Fisher, ChatGPT development disclosure |
| `python tests/test_gallery_status_layout.py` | 2/2 | Gallery READY overlay height regression |
| `node tests/test_mobile_layout.js` | 8/8 | Scale footprint, 55% parent breakpoint, destroy/reset, ResizeObserver coverage |
| `python tests/test_mobile_layout_browser.py` | 1/1 | Optional local Chromium, oversized parent iframe and equation visual footprint, real sizing helpers |
| `python tests/test_api_reference.py` | PASS | 54 author-facing names, drag vs wheel sensitivity, accessibility architecture, two-variable constraint |

The 22.0-rc.2 user acceptance verified desktop Firefox and Chrome behavior,
all Formula Wheels loading, correct scheduler gaps, and four Firefox iframe
accessibility results. A physical phone over a local Wi-Fi network passed six
interaction/loading checks but showed horizontal clipping and a scrollbar in
portrait (Figure 2.4). The author later tested the changed RC4 layout on a physical phone and approved its release, as recorded in `RELEASE_ACCEPTANCE.md`.

The optional headless Chromium test emulates narrow frames in an oversized
PreTeXt-like parent with an artificial fixed-width equation. It does **not** render a real PreTeXt document or MathJax
4 and does not establish that the user's phone scrollbar has disappeared.
The full 389-check 21.x behavioral regression suite has not been freshly
executed against the consolidated 22.0-rc.4 distribution.
