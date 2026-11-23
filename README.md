# Formula Wheels 1.0.0 — first public release (approved internal 22.0)

**Author:** Forest Fisher · **Copyright:** © 2026 Forest Fisher · **License:** [Mozilla Public License 2.0 (MPL-2.0)](LICENSE)  
**Development disclosure:** Formula Wheels was **vibe coded with extensive help from ChatGPT (OpenAI)**. Forest Fisher directed its design, mathematical requirements, testing and acceptance; ChatGPT provided extensive assistance with implementation, debugging, tests and documentation. See [NOTICE.md](NOTICE.md) for the detailed disclosure and third-party licensing boundaries.

**Version 22.0 is the accepted release, promoted from 22.0-rc.4 without changing the approved JavaScript, CSS, exercise examples, or scheduling/accessibility behavior.** The author accepted the final mobile layout on November 21, 2026, after testing on a physical phone over a local Wi-Fi network: horizontal overflow and wasted space were resolved; 55% portrait sizing remained usable; landscape showed appropriately larger, fitting equations; and rotation between orientations worked. Earlier Firefox and Chrome desktop acceptance confirmed all Formula Wheels loaded, the reported scrollbars were resolved, and the post-build integration completed. See [RELEASE_ACCEPTANCE.md](RELEASE_ACCEPTANCE.md) for evidence and limits. The public release tag **`v1.0.0`** maps to this approved internal **22.0** baseline. The original accepted ZIP is preserved byte-for-byte as the downloadable release asset. Repository additions provide GitHub distribution and validation; the independently installed PreTeXt integration and automatic textbook-update pull requests are still future work. See [GitHub distribution](docs/GITHUB_DISTRIBUTION.md).


## Optional authoring tools (added in v1.0.1)

Three Node.js command-line helpers in [`tools/authoring/`](tools/authoring/) generate numeric value arrays, propose spoken descriptions for static entries, and propose spoken descriptions for outputs of **author-authored** `permissibleOutputs()` callbacks. The callback tool creates a separate JavaScript file with an editable speech lookup and wrapper; it does **not** alter the mathematical callback or the approved Formula Wheels runtime.

From the repository root:

```bash
cd tools/authoring
npm install
npm test
cd ../..
node tools/authoring/generate-values.cjs --start -3 --end 3 --anchors 1 --output values.js
node tools/authoring/add-speech.cjs values.js
node tools/authoring/add-output-speech.cjs tools/authoring/examples/circle-logic.js
```

The tools run **only for authors**. They do not ship SRE into the students' browser, and ordinary PreTeXt builds do not invoke them. Review all speech suggestions before adopting the generated code. See the complete [authoring-tool command reference](docs/formula_wheels_authoring_tools.md).

## What Formula Wheels does

Formula Wheels is a reusable JavaScript/CSS component for building interactive mathematical equations in [PreTeXt](https://pretextbook.org/) and in standalone HTML. Authors provide their own mathematical relationships, values, visual formula builders and accessible descriptions. The component supplies scroll/drag/keyboard wheels, selectable and strictly dependent results, branching choices, hidden values/boxes, display-only formulas, and optional coordination with a separate JSXGraph slate.

**Fundamental constraint:** An interactive instance has **exactly two nonfixed quantities**, either both directly manipulable or one manipulable and one strictly dependent. The dependent output can be concealed (`valueDisplay:'hidden'`) or its box omitted (`boxDisplay:'hidden'`), but it remains calculated and validated. Additional fixed quantities are allowed. Display-only mode permits zero, one or two varying quantities. See [the API reference](docs/API.md#fundamental-limitation-exactly-two-varying-quantities).

## Approved integration and accessibility

| Context | MathJax | Renderer | Semantic enrichment | MathJax-generated speech | MathJax-generated Braille |
|---|---|---|---|---|---|
| Parent PreTeXt page | 4.1.3 (tested) | CommonHTML | On | On | On |
| Formula Wheels iframe | 4.1.3 (tested) | CommonHTML | On | Off | Off |

Repeated MathJax speech/Braille generation inside each iframe is deliberately disabled to reduce startup work; **this does not disable Formula Wheels' own spoken interaction**. The component supports author-provided `speech` text, ARIA `aria-valuetext`, concise live announcements, keyboard-accessible wheels and structural MathML from `accessibleMathLatex`. The availability and quality of speech from MathML varies by assistive technology. It is **not** automatic MathJax/ClearSpeak translation or Braille translation inside child iframes, and browser diagnostics do **not** constitute expert screen-reader usability testing. Read the complete [accessibility rationale and authoring guidance](docs/API.md#accessibility-architecture-why-mathjax-speech-and-braille-are-disabled-inside-iframes).

The production parent scheduler launches the first iframe when ready, the second **at least 3,000 ms after the first actual launch**, and subsequent iframes **at least 250 ms apart**; it does not wait for the parent `MathJax.startup.promise`. The scheduler also constrains mobile iframes to the **actually visible width of the parent viewport**, before loading them. Formula Wheels uses a consistent shared baseline formula scale for a given parent viewport: **100% above 600 CSS px, 76% at 421–600, 55% at 351–420, and 52% at 350 or below**, with a fallback for truly oversized expressions. Portrait/landscape switching has been accepted on a physical phone.

`FW_RC1_SCHEDULE` and `FW_RC1_CHILD_ACCESSIBILITY` are retained diagnostic identifiers from early release candidates; the `RC1` substring **does not mean the installed library is RC1**. They are not public authoring API names. The child-configuration observation also retains a historical `version` label for diagnostic compatibility.

## Files and ownership

- `src/formula-wheels.js`, `src/formula-wheels.css`: **canonical runtime engine and stylesheet**. `assets/code/formula-wheels.js` and `assets/css/formula-wheels.css` are mirrored copies used by PreTeXt; keep them synchronized with `py tools/sync_assets.py` after future edits.
- `src/iframe-scheduler.js` and `src/child-mathjax-config.js`: production parent/child integration. These must be installed by the **post-build integration**, not loaded indiscriminately into authoring scripts.
- `assets/code/*.js` (excluding the engine), `assets/css/beta1-wheel.css`, `assets/css/linear-graph.css`: 15 gallery examples and author-specific styles/fixtures.
- `project.ptx`, `source/main.ptx`, `publication/publication.ptx`: complete five-section PreTeXt compatibility gallery with 15 Formula Wheels examples.
- `standalone-example/index.html`: standalone MathJax 4 CHTML example (requires network access to the CDN).
- `docs/API.md`: complete source-checked author-facing contract and design limitations.
- `tools/build_and_patch.py`, `tools/patch_pretext.py`: build and deployment tooling; `tests/`: regression tests and source-level validation.
- `LICENSE`, `NOTICE.md`, `RELEASE_NOTES.md`, `RELEASE_ACCEPTANCE.md`, `SOURCE_PROVENANCE.json`, `RELEASE_MANIFEST_SHA256.json`: licensing, disclosure, evidence and integrity metadata.
- `docs/NEXT_VERSIONS_HANDOFF.md`: project continuation plan for 22.1 and 22.2.

## Build in Windows / VSCodium

Extract the official ZIP into a **new folder** containing `project.ptx`. In PowerShell, from that folder:

```powershell
py tools/sync_assets.py
py tests/test_release.py
py tests/test_extended_gallery.py
node tests/test_fixture_semantics.js
node tests/test_css_refresh.js
node tests/test_mobile_layout.js
node tests/test_schedule.js
node tests/test_child_boot.js
py tests/test_postbuild.py
py tests/test_api_reference.py
py tests/test_licensing.py
py tests/test_gallery_status_layout.py
py tests/test_mobile_layout_browser.py

py tools/build_and_patch.py
py -m pretext view web
```

The last layout-browser test is optional if its headless Chromium dependency is unavailable. A normal PreTeXt build **alone is insufficient**: `build_and_patch.py` invokes the PreTeXt build and then injects the parent scheduler and per-child MathJax configuration. It should report `PASS: patched 15 Formula Wheels children and N parent pages`. The author's accepted build patched **20 parent HTML pages**, which is legitimate because PreTeXt may publish overlapping content at multiple URLs. The patcher is intentionally fail-closed, requires a fresh build for each run, and creates generated `*.fw-rc1-unpatched` backups for diff inspection.

The integration identifies Formula Wheels interactives under `source/**/*.ptx` by `source` reference and explicit unique `xml:id`, then expects child pages named `xml:id-if.html` in a flat `output/web` directory. A different textbook's output structure or directory layout may require an adapted matcher. Do not assume the current patcher works unmodified for arbitrary PreTeXt projects.

## Author-facing API

A typical PreTeXt HTML slate hosts an initially empty element:

```xml
<slate surface="html" aspect="2:1"><div xmlns="http://www.w3.org/1999/xhtml" id="formula-wheels" class="formula-wheels"></div></slate>
```

Use `source="code/formula-wheels.js code/my-exercise.js"` and `css="css/formula-wheels.css css/my-exercise.css"` on the `<interactive platform="javascript">`. The author script supplies `configuration`, `permissibleOutputs(changedVariable, selected)`, a `formula` builder and `accessibleMathLatex`:

```javascript
const instance = await createFormulaWheelsAsync({
  container: document.getElementById('formula-wheels'),
  configuration, formula, accessibleMathLatex,
  preloadLatex: []  // extra staticMath/shieldMath fragments, if needed
});
```

PreTeXt supplies MathJax 4; **do not load an additional MathJax script in the iframe**. Authors should consult [docs/API.md](docs/API.md) for the full documented API, including entry-level pointer dragging (`pixelsPerStep`, default 85), mouse wheel (`wheelPixelsPerStep`, default 90), trackpad (`trackpadPixelsPerStep`, default 40), authoring speech and hidden dependent outputs. For examples, see `assets/code/fraction-numerator.js`, `assets/code/circle-branches.js`, `assets/code/linear-graph.js` and `assets/code/transient-circle.js`.

## Release qualification and planned work

Desktop Firefox and Chrome checks, scheduler timing checks, Firefox child-accessibility configuration checks, and mobile load/touch/portrait/landscape acceptance are recorded in [RELEASE_ACCEPTANCE.md](RELEASE_ACCEPTANCE.md). Chrome's per-child accessibility diagnostic was **not** repeated after the author declined console re-entry, and experienced screen-reader usability has **not** been certified. The historical 389-check behavioral suite was passed for a 21.x/modular MathJax 3 baseline but was not rerun wholesale against this final assembled version. Local regression tests and hash verification pass for the Version 22.0 package.

**Next milestones:** Internal **22.1-B/C** — portable PreTeXt installation and reviewable textbook dependency-update pull requests (not silent auto-deployment). Internal **22.2** — optional **build-time** ClearSpeak/Speech Rule Engine authoring, with author overrides. Neither feature is shipped in public `v1.0.0`. See [handoff](docs/NEXT_VERSIONS_HANDOFF.md) and [GitHub distribution](docs/GITHUB_DISTRIBUTION.md).
