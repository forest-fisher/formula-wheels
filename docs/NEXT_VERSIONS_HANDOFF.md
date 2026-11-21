# Formula Wheels — handoff from Version 22.0 to 22.1 and 22.2

## Current approved baseline

- Version **22.0 final**, approved by author **Forest Fisher** on **November 21, 2026**. The official release is a **documentation/metadata promotion** of the physically tested, approved `22.0-rc.4`: do not change its runtime merely to rename the version.
- Copyright **© 2026 Forest Fisher**, **MPL 2.0**, prominently disclose that the tool was **vibe coded with extensive ChatGPT (OpenAI) assistance**. Keep `LICENSE`, `NOTICE.md`, README and API attribution.
- Reusable canonical runtime: `src/formula-wheels.js`, `src/formula-wheels.css`. Mirrored PreTeXt assets: `assets/code/formula-wheels.js`, `assets/css/formula-wheels.css` (synchronize with `tools/sync_assets.py`). Per-exercise JS/CSS is separately authored; the HTML slate starts empty and the `formula()` callback constructs markup. JSXGraph, if used, occupies a separate slate and subscribes to wheel values. Do not change this model without a deliberate decision.
- MathJax **4.1.3 CommonHTML** in parent and iframe; parent enrichment/speech/Braille on; each child enrichment on but generated speech/Braille off. Children retain accessible ARIA live announcements, `aria-valuetext`, author `speech` descriptions, structural MathML from `accessibleMathLatex`. This is an optimization, **not** a claim of automatic child ClearSpeak/Braille translation or experienced screen-reader usability verification.
- Parent scheduler: first iframe at readiness, second **≥3000 ms** after first actual launch, subsequent **≥250 ms** apart; no wait on parent `MathJax.startup.promise`. Parent constrains child iframe to visible mobile width. Shared mobile equation baseline: **55% for 351–420px**, **52% ≤350px**, **76% 421–600px**, **100% >600px**, with an exceptional fit fallback. Phone portrait and landscape accepted. Preserve default behaviors.
- Interactive Formula Wheels requires **exactly two nonfixed quantities**; either both manipulable, or one manipulable and the other strictly dependent. Strictly dependent output can be hidden without ceasing to count as varying. Display-only permits 0–2 varying quantities.
- The tested build must run `py tools/build_and_patch.py` after source changes, because raw PreTeXt alone does not apply the scheduler/accessibility shims. The gallery has 15 child iframes; one successful build patched **20 parent pages**. Historical `FW_RC1_*` browser diagnostic identifiers and `.fw-rc1-unpatched` backups are deliberately retained.
- See `RELEASE_ACCEPTANCE.md` for actual acceptance scope. The full 389-check older 21.x suite was not rerun as a single 22.0 suite; Chrome child diagnostics were not repeated; expert screen-reader usability remains unverified.

## Version 22.1 — GitHub distribution and textbook-update pull requests

**Goal:** Put the standalone reusable library, integration tools, release documentation and examples in a versioned **GitHub repository**, and allow a separate PreTeXt textbook repository to **automatically receive GitHub Actions–generated update PRs** when new approved Formula Wheels versions are released. **Do not silently update or deploy the textbook.** The author reviews/merges proposed changes.

Suggested work sequence:

1. Inspect official 22.0 archive, `README.md`, `docs/API.md`, `SOURCE_PROVENANCE.json`, `RELEASE_MANIFEST_SHA256.json`, and tests. Propose a clean distributable library structure that keeps canonical engine/CSS distinct from author exercises and example gallery. Preserve MPL notices and AI disclosure in repository and release artifacts; document relevant third-party licenses and exclusions.
2. Establish version tags/releases (e.g. `v22.0`) and downloadable, integrity-checked release assets. Decide how consumers pin a **specific approved version** (e.g. committed vendor files with tracked upstream version + SHA-256, or a lockfile), and decide how the parent PreTeXt site receives the **post-build shims**, not just `formula-wheels.js` and CSS. Avoid relying on live, mutable CDN URLs for students.
3. Design a small update tool/manifest driven by GitHub release tags or release manifests. GitHub Actions in the **textbook repository** should detect a new appropriate Formula Wheels release, validate digests, update the pinned library and necessary companion scripts/assets, run appropriate tests/build checks, and open a reviewable PR with old/new version, changed files, tests and rollback instructions.
4. Determine author preferences before locking workflow details: GitHub repository name/visibility, which textbook repository/workflow is authorized, stable-release vs prerelease policy, desired version bump cadence, automated major-version policies, and preferred vendoring/lockfile approach. Obtain explicit user action for any GitHub publishing or repository mutations. Do **not** assume access or push automatically.
5. Verify that a 22.0 release can be consumed by a sample independent PreTeXt project and that the full page-level integration works (multi-page layout, scheduler, iframe MathJax config, mobile width and display-only modes). Include regression scenarios for same-origin and standalone behavior. Do not sacrifice the 22.0 acceptance baseline for packaging convenience.

**Expected outputs:** GitHub repository/release layout, versioned source/release ZIP, documented installation/updating contract for textbook authors, GitHub Actions workflow for proposing textbook updates, SHA-256 validation, tests and PR/rollback documentation.

## Version 22.2 — ClearSpeak/SRE build-time authoring tool

**Goal:** Provide **optional author-time/build-time speech generation** using Speech Rule Engine (SRE)/ClearSpeak for values and mathematical content, while preserving explicit author-written `speech` overrides. **Do not add SRE/ClearSpeak runtime loading in each student's browser**; this version concerns authoring tools, not restoring automatic MathJax speech inside iframes.

Suggested work sequence:

1. Research and prototype SRE/ClearSpeak in an **isolated authoring tool**, without modifying the approved 22.0 runtime or updating MathJax until measurements justify it. Establish supported input (LaTeX/MathML), generated speech syntax, locale/verbosity conventions, reproducibility and test fixtures. Do not assume all expressions can be automatically verbalized correctly.
2. Specify a clear precedence policy: **explicit author `speech` wins**, generated speech used only when opted into/needed, and default behavior remains backward compatible. Decide how proposals are stored (generated source files, optional metadata, or a preview/review UI) and how regenerated speech is diffed and approved.
3. Use real example inventory: fractions in numerators/denominators, square and cube roots, fractional exponents, logarithms, negatives, transients, and outputs offering multiple options. Consider all places the component speaks—wheel choices, dependent outputs, popups, no-output messages, live announcements—without changing the tested DOM/keyboard mechanics unnecessarily.
4. Verify optional generated speech works when `valueDisplay:'hidden'` or `boxDisplay:'hidden'` and under both strictly dependent and dual-manipulable modes; ensure screen-reader output does not unintentionally disclose concealed mathematical values. Test with Firefox/NVDA and, if practical, experienced users. Distinguish automatic speech text quality from browser-based screen-reader tests and from Braille support.
5. Add deterministic tests and API/docs examples; isolate any new tool dependency to development/build time. Only modify runtime APIs when the author explicitly approves a necessary change. Existing 22.0 author-provided `speech` and `accessibleMathLatex` must continue to work unchanged.

**Expected outputs:** optional SRE/ClearSpeak speech-authoring generator or preview workflow, configurable author overrides, example transformations, regression tests and accessibility documentation. The exact UX and publication format are *not yet decided*; investigate before implementing.

## What to upload to the new chat

**Required:** the official **`formula_wheels_v22_0_release.zip`**. It contains the engine, CSS, full gallery, PreTeXt source, integration and tests, README, API, license, manifests and this handoff. The handoff is also available separately as **`formula_wheels_22_1_22_2_handoff.md`** for easy pasting.

**Useful only when needed:** a ZIP or link to the actual **textbook repository/project** into which updates will be proposed (particularly its PreTeXt build files and GitHub Actions workflows), and the author's GitHub repository preferences. For 22.2, sample author-created speech phrases, any previously approved `speech` override fixtures, and assistive-technology observations would be helpful. Do **not** start with 21.7.x or RC1–RC4 archives unless investigating a regression; 22.0 final is the canonical baseline.

**First action for the new chat:** unpack and inspect the exact official 22.0 archive. Preserve its accepted behavior, separate the 22.1 distribution work from 22.2 author-time speech tooling, and do not treat the 22.0 release ZIP as an already-published GitHub repository.
