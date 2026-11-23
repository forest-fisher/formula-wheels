# Formula Wheels — Release notes

**Author:** Forest Fisher · **Copyright:** © 2026 Forest Fisher · **License:** MPL-2.0 (see `LICENSE`). **Development disclosure:** This tool was vibe coded with extensive assistance from ChatGPT (OpenAI). See `NOTICE.md`.

## Public v1.0.1 candidate (November 23, 2026): authoring toolkit only

Adds three optional Node.js command-line authoring tools: `generate-values.cjs`, `add-speech.cjs`, and `add-output-speech.cjs`. The third tool evaluates a trusted authored callback over canonical choices and writes a separate copy containing a generated SRE speech lookup and a wrapping callback. See `docs/formula_wheels_authoring_tools.md` for inputs, flags, limitations, and examples. There are **no changes** to any approved student-facing JavaScript, CSS, scheduler, or child MathJax configuration, and no SRE dependency in students' browsers. The original v1.0.0 release asset remains retained and byte-identical.

Full authoring-tool tests and the PreTeXt gallery/packaging CI must pass before publication; this locally assembled archive is a release candidate, not a published GitHub release.

## 22.0 final promotion (November 21, 2026)

**Approved by Forest Fisher after physical-phone testing of RC4.** Portrait equations fit with little to no unused horizontal space at the chosen 55% mobile scale, remained usable with touch, and scaled appropriately on rotation to landscape while fitting the screen. The desktop RC2 acceptance included Chrome/Firefox rendering/loading and scrollbar corrections; approved timing was directly observed in both browsers, and four Firefox child accessibility configuration checks passed. Chrome's separate accessibility check was not repeated. See [`RELEASE_ACCEPTANCE.md`](RELEASE_ACCEPTANCE.md) for precise evidence and exclusions.

**Runtime freeze:** The official 22.0 JavaScript, CSS, scheduler, child config, example exercise JS and PreTeXt gallery assets are byte-for-byte identical to user-approved 22.0-rc.4. The only updates are this official release metadata/documentation, release verification record, version labels in the Python build/patch tool messages (no logic changes), and manifest/provenance hashes. The original historical `FW_RC1_*` diagnostic identifiers remain unchanged.

**Next releases, not shipped:** 22.1 GitHub distribution and GitHub Actions-proposed textbook update pull requests; 22.2 optional build-time ClearSpeak/SRE speech authoring with author override support, without requiring student browsers to run SRE.

## RC4: visible-width layout and uniform 55% mobile scale (historical candidate notes)

- **User feedback on RC3:** the horizontal positioning improved, but real-phone screenshots still showed clipping and a horizontal scrollbar. The author requested both a more aggressive uniform baseline and a fix to actual viewport/position measurement.
- **Parent iframe correction:** `src/iframe-scheduler.js` now constrains each Formula Wheels iframe's maximum actual width to the space remaining in the parent page's *visible* mobile viewport **before** setting its `src`. A PreTeXt column wider than the phone cannot give a child iframe a fictitious usable width. On returning to desktop width the original inline min/max width rules are restored. The stagger policy remains first immediately, second ≥3000 ms, later ≥250 ms.
- **Actual breakpoint measurement:** the engine now takes the same-origin parent document's `documentElement.clientWidth` as the viewport width. This avoids mobile Chromium reporting a much larger `parent.innerWidth` when the article itself overflows. Standalone and cross-origin embeds fall back to their own viewport.
- **Uniform scale change:** **351–420px: 55% instead of 64%**. Breakpoints ≤350px (52%), 421–600px (76%) and >600px (100%) are unchanged. Fitted short and medium equations share one baseline across a page; the long-formula safety fallback still applies when needed.
- **No other feature changes:** author mathematical contracts, MathJax speech/Braille configuration, screen-reader and keyboard features, popups, pointer/touch gestures, and source-specific gallery logic are unchanged. This is a change to the engine, stylesheet, and parent iframe controller, not a documentation-only update.
- **Qualification:** local checks and synthetic Chromium mobile layouts are not a substitute for the author's PreTeXt build, browser and phone acceptance. At the time of RC4 packaging, final acceptance was pending; it was subsequently provided on November 21, 2026.

## RC3 mobile layout correction (requires phone retest)

- **RC2 accepted on desktop:** User verified PreTeXt post-build patched 15 children and 20 generated parent HTML pages; reported Chrome and Firefox loading and vertical scrollbar failures resolved; verified four Firefox child accessibility checks and Chrome/Firefox iframe scheduling.
- **RC2 mobile results:** Six mobile interaction and loading checks passed, but portrait Figure 2.4 and potentially other formulas overflowed horizontally. A screenshot shows unused horizontal space next to a clipped equation.
- **RC3 layout fix:** Keep 22.0's viewport-based baseline scale and the existing long-formula fallback. Compensate for CSS `transform:scale(...)`'s retained *unscaled flex layout width* with symmetrical inline margins. Cap the slate at `100vw` inside its iframe, and observe the root and assembled formula width so late PreTeXt/CHTML resizing triggers a refit. Apply the same helper to interactive and display-only modes; reset margins on destroy and static refit.
- **Unchanged:** No mathematical relationship/choice policy changes, gesture sensitivity changes, ARIA/speech configuration changes, new iframe scheduling policy, or clipped/hidden overflow workaround. The CSS and engine **do** change in RC3; hashes updated. New tests include 7 Node checks and optional headless Chromium iframe geometry.
- **Qualification:** RC3 has not yet been accepted in actual PreTeXt Firefox/Chrome or on the user's phone. The RC2 acceptance cannot be automatically transferred to RC3.

## RC2 corrections following first real-browser acceptance

- **PreTeXt parent duplication:** RC1 emitted `PATCH ERROR` after an otherwise successful build because its global validation counted the same 15 children twice, as two parent HTML pages referenced them. RC2 validates duplicate iframe references per parent page, not globally, and verifies coverage of all expected child filenames across the union of pages. Child configuration and first/3-second/250-ms parent scheduling are therefore installed in every applicable generated parent, including duplicate article/landing-page routes. The underlying scheduler and child configuration JavaScript are unchanged.
- **Gallery scrollbar mitigation:** The READY/ERROR testing status in `assets/css/beta1-wheel.css` no longer participates in the height of the PreTeXt slate; it is a fixed, pointer-transparent iframe overlay. No global overflow suppression or clipping was introduced. The user's scrollbar observations in Chrome and Firefox require a new browser check.
- **Chrome display-only loading:** The unpatched RC1 build launched iframes without the approved stagger or the child speech/Braille optimization. This is a credible explanation for extreme Chrome contention but not proof that every loading anomaly is resolved. Figure 3.2 should be explicitly rechecked after a successful RC2 patch.
- **Preservation:** Core engine, core CSS, authoring scripts, MathJax CHTML adapter, and scheduling policy are unchanged. RC2 does not claim final Firefox/Chrome acceptance yet.

## Scope

Consolidates version 22.0's reusable component, MathJax 4 CommonHTML integration, per-iframe accessibility configuration and tested fixed-head-start policy. It does not change the engine's mathematical API or its known visual behavior.

## Retained from previous milestones

- 21.7.3: reference for mathematics, appearance and author-supplied spoken descriptions; a nonexpert NVDA functional smoke test was performed previously.
- 22.0-alpha.1: MathJax 4 integration within PreTeXt.
- 22.0-alpha.2: reusable engine and CSS extraction, separate exercise JS and JSXGraph subscription model.
- 22.0-beta.1: multiple independent PreTeXt interactives within one document.
- Ad hoc CommonHTML/RC5 study (originally proposed as 22.3): renderer adoption and 15-case compatibility gallery; engine SHA-256 remains `4feec1853e7d91b45a8d32d77c43dfe2f3577d78c961fe04907db64437e3cb6b`.
- v1.0.9 performance experiment: 24 three-round reports, 10/10 children each, 200 math prewarm conversions per child; approved 3-second start followed by >=250 ms gaps, independent of parent MathJax completion.

## RC1-specific integration changes

- Remove diagnostic startup profiling as a normal exercise dependency. Fifteen example author modules use the public `createFormulaWheelsAsync()` directly.
- Add a small production scheduler with the approved launch policy.
- Add an early child MathJax 4 configuration shim: enrichment on; generated speech and Braille off; parent settings untouched.
- Add a source-ID-scoped, validated, post-build PreTeXt integration tool; preserve generated original HTML in backup files.
- Include a CommonHTML standalone authoring example, complete PreTeXt project, manifest and test commands.

## Validation state

Local structural, semantic, CommonHTML adapter, timing, configuration-guard and postbuild simulations pass. Source/asset equivalence and SHA-256 are checked by tests. These are **not** a substitute for running `py tools/build_and_patch.py` on an actual PreTeXt installation and accepting visual/interactive behavior in Firefox and Chrome. No claim of final release status is made.

## Documentation addendum (no runtime changes)

Added `docs/API.md`, a comprehensive source-checked reference for the complete author-facing API, and linked it from the README. Corrected the documentation error about `pixelsPerStep`: it remains supported for pointer dragging (default 85), distinct from mouse-wheel and trackpad sensitivity controls. Expanded the accessibility rationale and documented the targeted spoken interaction/MathML support that remains when MathJax-generated speech and Braille are disabled in child iframes. Engine, styling, child configuration, scheduling logic, and exercise scripts are unchanged.
## API constraint clarification (no runtime changes)

Added an upfront API subsection documenting that interactive Formula Wheels requires exactly two varying quantities, either both manipulable or one manipulable and one strictly dependent/non-manipulable. Explained that the dependent quantity may have its value concealed or its box omitted without removing it from the mathematical model, and distinguished the display-only exception. Linked the subsection from the README. No implementation or example files changed.

## Licensing and provenance addendum (no runtime changes)

Added the complete, unmodified Mozilla Public License 2.0 text as `LICENSE`; added `NOTICE.md` with the project-wide Exhibit A notice, Forest Fisher's 2026 copyright attribution, an explicit account of extensive ChatGPT-assisted vibe coding, and an explanation of external-library licensing boundaries. Brought authorship, licensing, and AI assistance to the top of the README and API reference. Original JavaScript, CSS, Python, and PreTeXt sources remain byte-for-byte identical to the previous documentation-corrected RC1 archive. 
