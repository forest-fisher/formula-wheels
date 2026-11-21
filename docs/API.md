# Formula Wheels 22.0 — author-facing API reference

**Author and copyright:** Forest Fisher · © 2026 · **License:** [MPL-2.0](../LICENSE). **Development disclosure:** Formula Wheels was **vibe coded with extensive ChatGPT (OpenAI) assistance** under Forest Fisher's direction. See [NOTICE.md](../NOTICE.md) for the full authorship statement and third-party distinction.

**Scope and source of truth.** This reference describes the public author-facing contract actually implemented by the approved `src/formula-wheels.js` in Version 22.0 (developed from the tested RC5 CommonHTML baseline and mobile layout corrections). It covers both interactive and display-only instances. The property names and behavior below are checked against the engine, including separate sensitivity settings for pointer dragging, mouse wheels and trackpads. These APIs are for trusted textbook authors, not arbitrary untrusted JavaScript.

## Fundamental limitation: exactly two varying quantities

**An interactive Formula Wheels instance requires exactly two varying quantities (variables that are not fixed).** You may include additional fixed quantities, but you cannot create an interactive with only one varying quantity or with three or more. The two varying quantities can be configured in either of these ways:

- **Two manipulable quantities:** Both are green wheels, each with its own `values` array and `initial` entry. The author implements `permissibleOutputs(changedVariable, selected)` for changes to either wheel.
- **One manipulable quantity and one strictly dependent quantity:** The first is an adjustable green wheel. The second has `strictlyDependent:true`, is determined by the first, and **cannot be manipulated directly**. It is still counted as the second varying quantity even if its value or box is hidden. The strictly dependent quantity does not need its own `values` array or `initial` entry; for each selected input the callback supplies **zero or one** dependent output, not several choices.

The author can control how this strictly dependent output appears:

```js
// Visible computed result in a blue box:
y: {strictlyDependent:true}

// Keep the blue box, but hide the computed value:
y: {strictlyDependent:true, valueDisplay:'hidden', hiddenValueLabel:'?'}

// Omit the blue box itself from the displayed formula:
y: {strictlyDependent:true, boxDisplay:'hidden'}
```

In the second case, `hiddenValueLabel` may be omitted (default `?`) or customized. In the third case, the formula builder must account for operators and spacing around the omitted box. **Hiding the dependent value or box does not remove the quantity from the underlying two-variable relationship:** `permissibleOutputs()` still calculates and validates it, and dependent state remains available to the component's ordinary state/subscription mechanisms. See [Three dependent-output variants](#three-dependent-output-variants) for the detailed restrictions, including which concealment options cannot be combined.

**Display-only exception:** With `displayOnly:true`, Formula Wheels renders a noninteractive mathematical figure, so **zero, one, or two varying quantities** are permitted. This exception does not apply to interactive wheels; see [Display-only formulas](#display-only-formulas-displayonlytrue).

## Quick start

Include `formula-wheels.css` and `formula-wheels.js` in your PreTeXt interactive's CSS/source attributes, along with a separate author-owned exercise script. Supply a host `<div id="formula-wheels"></div>` in the HTML slate. PreTeXt supplies MathJax 4; **do not load another MathJax script in the iframe**. The textbook build must also apply the included child-accessibility and parent-scheduling post-build integration; that deployment behavior is separate from the component API. See the package `README.md`.

```js
const n = value => ({id:String(value), latex:String(value), value});
const xs = [0,1,2,3].map(n);
const ys = [1,3,5,7].map(n);
const configuration = {
  variables: {
    x: {values:xs, initial:'0', valueOrder:'ascending'},
    y: {strictlyDependent:true},
    c: {fixed:2}
  },
  permissibleOutputs(changedVariable, selected) {
    if (changedVariable !== 'x') return [];
    return [n(2*selected.value+1)];
  },
  description:'Twice x plus one equals y.'
};
const instance = await createFormulaWheelsAsync({
  container:document.getElementById('formula-wheels'),
  configuration,
  formula:({slot,staticMath}) =>
    `${slot('c')}${slot('x')}${staticMath('+1')}${staticMath('=')}${slot('y')}`,
  accessibleMathLatex:String.raw`2x+1=y`,
  preloadLatex:['+1','=']
});
```

The code above uses a **strictly dependent** `y` (a blue, non-manipulable output). It does not impose a mathematical solver: `permissibleOutputs` supplies the relationship. If you instead want *both* `x` and `y` to be manipulable, configure a selectable `values` array and a valid `initial` ID for **each**, and implement the callback in both directions.

## Entry points and top-level options

`await createFormulaWheelsAsync(options)` is the recommended entry point for MathJax 4. It prepares/reuses MathJax CommonHTML, installs/verifies MathJax Safe filtering, prewarms authored expressions, then constructs the instance. It returns a promise of the instance. `createFormulaWheels(options)` is the synchronous factory, appropriate only after the mathematical expressions have been prepared (or in the established MathJax 3 legacy environment). `createEquationWheels` is a deprecated alias of the synchronous factory.

| `options` property | Accepted value; default | Effect / rules |
|---|---|---|
| `container` | DOM `Element`; **required** | Host; only one live Formula Wheels instance per host. Call `destroy()` before remounting. An empty host works; interactive scaffold is generated as needed. |
| `configuration` | Object with `variables`; **required** | Quantities, math callback, text and optional choice defaults; detailed below. |
| `formula` | `({slot,squared,staticMath,shieldMath}) => string`; default `null` | Returns HTML assembling the formula. **Provide explicitly** for ordinary authoring; if omitted, the engine attempts a legacy gallery-only `FWExampleFormulaBuilders(exampleKey,helpers)` hook. |
| `accessibleMathLatex` | Nonempty LaTeX string or `null`; default omitted | Complete *symbolic* equation/expression rendered as structural MathML for assistive technology. Strongly recommended; not the same as numerical wheel labels. |
| `accessibleEquationLatex` | Same; legacy compatibility alias | Use instead of (never together with) `accessibleMathLatex`. |
| `accessibleMathLabel` | Nonempty string; default `'Equation'` | Text preceding accessible MathML; `Expression` is also valid. Trailing colons are normalized. |
| `exampleKey` | String; default `'custom'` | Legacy gallery lookup/class hooks. Ordinary exercise code should not rely on special demo keys. |
| `choiceMode` | `'required'` or `'automatic'`; default `null` | Overrides `configuration.choiceBehavior`; with both omitted the effective mode is `'required'`. Interactive only. |
| `presentation` | Object; default `{}` | Initial presentation options; see below. |
| `displayOnly` | Boolean; default `false` | Makes a static mathematical figure, without wheels or interactions. Uses a distinct variable schema; see below. |
| `preloadLatex` | Array of LaTeX fragments; default `[]` | **Async entry point only**: extra strings used with `staticMath()` / `shieldMath()` that need MathJax 4 preparation before synchronous formula rendering. |

`preloadLatex` is passed to `FormulaWheelsMath.prepare`, **not** to the synchronous factory. The engine also prewarms configured values, fixed values, outputs returned by the callback, and `accessibleMathLatex`. Supply static formula fragments such as `+2`, `=`, or arbitrary authored LaTeX in `preloadLatex` as needed. An unprepared MathJax 4 fragment causes an explicit error rather than falling back to unsafe/untracked conversion.

## Configuration object — every supported property

```js
const configuration = {
  variables: { /* name -> variable specification */ },
  permissibleOutputs(changedVariable, selected) { /* ... */ },
  choiceBehavior: 'required',
  anonymousLabels: {x:'the input quantity', y:'the output quantity'},
  description: 'An accessible description for the formula group.'
};
```

| Property | Value; default | Effect |
|---|---|---|
| `variables` | Object mapping author-defined names to variable specs; required | Interactive mode needs **exactly two varying quantities**, plus any fixed quantities. Display-only mode permits **zero to two varying quantities**. |
| `permissibleOutputs` | Function; required in interactive mode; optional in display-only | Describes valid counterpart outputs for any selected wheel entry. See the return contract. |
| `choiceBehavior` | `'required'` or `'automatic'`; default `'required'` | Specifies multi-output choice behavior unless overridden by top-level `choiceMode`. |
| `anonymousLabels` | Object `variableName -> text`; default `{}` | Alternative names used **in spoken prompts and announcements** when `showVariableNamesInText:false`. Missing/falsy labels fall back to `the <name> value`. This does not rename configured variables or alter mathematical MathML. |
| `description` | Text; optional | Assigned to the host's `aria-label` when not `null`/`undefined`. Original host label is preserved/restored on destroy. |

Unrecognized additional keys on the configuration object are not part of the supported API. `permissibleOutputs` is **author code**; it must implement mathematics and choose deterministic outputs. Do not depend on a built-in algebra solver.

## Interactive variable specifications — complete property list

The object at `configuration.variables.x` may use the following **actual engine-read** properties:

| Property | Values; default | Meaning / constraints |
|---|---|---|
| `values` | Nonempty array of entry objects | Declares a **manipulable green wheel**. Required for every non-dependent varying quantity. The entries are displayed in array order; IDs must be unique within that wheel. |
| `initial` | String ID present in `values` | **Required** for each manipulable wheel; not a numeric index or raw LaTeX. |
| `fixed` | A fixed value (usually a number/string) | Declares a **gray fixed box** instead of a wheel. It is rendered as `String(fixed)` through MathJax. Do not combine with `strictlyDependent:true`. |
| `strictlyDependent` | Boolean; default `false` | Declares a **blue, non-manipulable varying output** determined by the other wheel. No selectable `values` or `initial` is required; if supplied, those are not used for the dependent wheel. Interactive mode permits exactly one dependent quantity and one manipulable quantity when this is true. |
| `valueDisplay` | `'visible'` (default), `'hidden'` | Conceals **the value inside** a strictly dependent blue box but keeps the box. Not valid for independent wheels or fixed quantities. |
| `hiddenValueLabel` | String; default `'?'` when value concealed | Literal replacement shown inside a concealed blue box; may be `''`. Requires both `strictlyDependent:true` and `valueDisplay:'hidden'`. Text is escaped rather than interpreted as HTML. |
| `boxDisplay` | `'visible'` (default), `'hidden'` | Omits the **entire blue box** from generated formula markup. Requires `strictlyDependent:true`; cannot be combined with value concealment or `hiddenValueLabel`. The author must also omit/rework any surrounding visible operators. |
| `type` | `'varying'` / `'fixed'`; usually omitted in interactive mode | If supplied, must agree with role inferred from `values`, `fixed` or strict dependence. **Required in display-only mode**. |
| `valueOrder` | `'ascending'` (default), `'descending'`, `'unordered'` | Describes the meaning of change direction for indicators; does **not** sort or reverse the authored `values` array. Invalid strings are rejected. `unordered` suppresses directional semantics. |
| `showChangeIndicator` | Truthy/falsy; default absent (=off) | Enables visual up/down/unchanged direction indicators for this quantity. Separate from the global presentation switch. Useful for concealed values and repeated variable appearances. |
| `pageStep` | Number; default `10` | Number of array entries moved by Page Up/Down during wheel editing (clamped to endpoints). |
| `pixelsPerStep` | Number; default `85` | **Pointer dragging sensitivity** (mouse/touch/pen): distance in CSS pixels per wheel entry, adjusted for equation scale. This is an actively supported property used by the drag path. Use a finite positive number; unlike wheel/trackpad sensitivity, the drag path does not explicitly validate this value at runtime. |
| `wheelPixelsPerStep` | Positive finite number; default `90` | Mouse-wheel input sensitivity, interpreted as pixel-equivalent movement per entry. Invalid positive-number settings fail when used. |
| `trackpadPixelsPerStep` | Positive finite number; default `40` | Trackpad scrolling sensitivity, likewise pixels per entry. |
| `latex` | String; primarily display-only | In **display-only** mode supplies the initially shown static notation, instead of `values`/`initial`. Not used to set interactive wheel entries. |

**Three distinct gesture sensitivities:** `pixelsPerStep` controls **dragging**, `wheelPixelsPerStep` controls **mouse-wheel events**, and `trackpadPixelsPerStep` controls **trackpad scrolling**. They are independent per-variable settings, not old and new names for the same option. The existing examples correctly set `pixelsPerStep` to adjust drag movement; omitting the other properties uses their defaults.

### Three dependent-output variants

```js
// Blue box shows the computed value:
y: {strictlyDependent:true}

// Blue box remains, but its value is replaced by literal text:
y: {strictlyDependent:true, valueDisplay:'hidden', hiddenValueLabel:'?'}

// Entire blue box is absent (formula builder must handle surrounding markup):
y: {strictlyDependent:true, boxDisplay:'hidden'}
```

The callback **still executes and its outputs are still validated** for hidden-value and omitted-box modes. Concealment is a presentation decision, not a way to bypass mathematical consistency checks. When a dependent output is omitted, its value remains available through snapshots/subscriptions if the callback supplies it. A strictly dependent output must yield **zero or one** result for its input; never multiple branches.

## Accessibility architecture: why MathJax speech and Braille are disabled inside iframes

**This is a performance optimization, not a decision to make Formula Wheels non-speaking.** The parent textbook page and each embedded Formula Wheels exercise are separate MathJax 4 documents. The approved PreTeXt configuration is:

| MathJax 4 feature | Parent textbook document | Formula Wheels iframe |
|---|---|---|
| CommonHTML (CHTML) rendering | Enabled | Enabled |
| Semantic enrichment | Enabled | Enabled |
| MathJax-generated speech | Enabled | **Disabled** |
| MathJax-generated Braille | Enabled | **Disabled** |

The reason is startup cost. PreTeXt's parent document benefits from its full MathJax accessibility processing, but running MathJax's speech/Braille generation independently in every embedded exercise duplicates expensive work as pages accumulate iframes. Our Chrome and Firefox performance experiments supported keeping the parent configuration unchanged and reducing that per-iframe processing. The production `src/child-mathjax-config.js` applies `{enrich:true, speech:false, braille:false}` *only in the child document*, before MathJax initializes; `src/iframe-scheduler.js` separately gives the parent a three-second head start after the first child launch. Neither intervention disables MathJax accessibility processing on the parent page.

### What the Formula Wheels component provides instead

- **Whole-equation structural mathematics:** When the author supplies `accessibleMathLatex`, the engine converts that LaTeX into real, visually hidden **MathML** via `MathJax.tex2mml()`, preceded by `accessibleMathLabel` (default `Equation`). Assistive technology can encounter the mathematical structure independently of the decorative layout. This is *not* a precomputed speech string and it is *not* a replacement implementation of MathJax's Speech Rule Engine. Actual MathML speech depends on the assistive technology and browser.
- **Spoken values authored for the exercise:** Each entry may supply `speech:'square root of five'` (a nonempty plain-text string). The engine uses this in wheel `aria-valuetext`, choice descriptions, and announcements after changes. The built-in fallback covers straightforward text and a limited square-root substitution; it is **not** a general LaTeX-to-speech engine. Authors should supply `speech` for complex expressions, exponents, roots and ambiguous notation.
- **Direct interaction accessibility:** Manipulable values expose `role="spinbutton"`, readable names, `aria-valuenow`/`aria-valuetext`, keyboard guidance, and Enter-to-confirm behavior. Output boxes and choice controls carry appropriate labels and roles. Confirmed changes produce concise announcements through a `role="status"` live region; speculative previews are not repeatedly announced.
- **Meaningful concealment:** For `valueDisplay:'hidden'`, the output's accessible description says that its value is hidden, rather than reading the concealed result aloud. When `boxDisplay:'hidden'`, the omitted output box is not announced as an on-screen box. Authors are responsible for ensuring the separate `accessibleMathLatex` accurately represents the mathematical relationship they intend students to encounter.
- **Optional anonymity:** `showVariableNamesInText:false` uses `configuration.anonymousLabels` in prompts and announcements; `showVariableTabs:false` hides the visible box tabs without removing the quantity's mathematical identity.

**Important distinction for accessibility reviews:** We preserve *speech accessibility through semantic MathML and our own targeted ARIA text/announcements*, while **disabling MathJax's automatic speech and Braille generation inside each iframe**. We do **not** promise that Formula Wheels replicates all of MathJax's generated math-speech rules or its Braille translation. Braille access to the iframe's MathML may depend on the screen reader and Braille software. The parent retains its normal MathJax-generated speech and Braille. Previous Firefox/NVDA work was a functionality smoke test by a nonexpert, not a full assistive-technology usability certification.

**Authoring guidance:** Supply accurate `accessibleMathLatex` for the entire expression/equation; add `speech` for any entry whose LaTeX is not naturally spoken; test wheel changes, output selection, concealment and announcements with a screen reader. The configuration shim exposes `window.FW_RC1_CHILD_ACCESSIBILITY` for verifying effective child settings, but this diagnostic does **not** prove what a screen reader or Braille device actually announces. See `README.md` and `TEST_PLAN.md` for the production build procedure and acceptance checks.

## Value entry schema — complete supported fields

For entries in `values` and entries returned by `permissibleOutputs`:

| Field | Value; required? | Meaning |
|---|---|---|
| `id` | String; **required** | Stable identity used for selection, pairing, initial state, and preferred choice; not the displayed text. Permanent wheel IDs must be unique within that wheel. |
| `latex` | String; **required** | MathJax-renderable mathematical notation; need not be equal to `id` or `value`. |
| `value` | Finite number; **required** | Approximate numerical value used for ordering, movement, comparisons and visualization; not an exact symbolic algebra engine. |
| `speech` | Nonempty plain-text string; optional | Author-supplied spoken form for a value; overrides the simple built-in LaTeX-to-speech fallback in dynamic announcements and ARIA value text. Empty/whitespace-only strings are rejected. |
| `branchKey` | String; optional **on returned outputs** | Accepted and type-checked as auxiliary branch metadata. No author-facing branch-selection behavior beyond carrying metadata is guaranteed in Version 22.0. |

Other custom entry properties may pass through in snapshots but are **not guaranteed as public behavior**. Prefer immutable entry objects and stable IDs. `numberEntry(n)` is available only as a legacy **debug helper**, not an exported authoring API; define your own entry factory as in the quick start.

## `permissibleOutputs(changedVariable, selected)`

`changedVariable` is the **configured variable-name string**, for example `'x'`. `selected` is the complete entry object (including `id`, `latex`, `value`, optional `speech`). Callbacks may be invoked during MathJax prewarming, initial rendering, wheel previews and confirmed interactions: **make them synchronous, deterministic, and side-effect-free**. Do not make network requests, mutate arrays or rely on a precise invocation count.

Two equivalent return shapes are supported:

```js
return [entry1, entry2];
// or
return {options:[entry1, entry2], preferredId:entry2.id};
```

`[]` means **no permitted output**, not an exception. One output is selected automatically regardless of choice mode. When multiple outputs exist:

| Effective mode | Valid `preferredId` supplied | No valid `preferredId` |
|---|---|---|
| `'required'` | Show alternatives; emphasize preferred entry but require explicit confirmation | Show alternatives; require explicit confirmation |
| `'automatic'` | Select specified preferred entry without popup | Show alternatives; require explicit confirmation; **never silently select first** |

`preferredId` must be the string ID of an entry in `options` to have an effect. Missing, unrecognized or nonstring IDs behave as no preference. This metadata does not reorder choices. All returned entries are checked for `id`, `latex`, finite `value`, optional valid `speech`, and optional string `branchKey`. A strictly dependent output may return only `[]` or `[entry]` (or corresponding `{options:...}`). For two manipulable wheels, implement valid results **in either direction**.

**Temporary results:** A callback may return an output not in the other wheel's permanent `values`. The engine can insert it temporarily for interaction without mutating that canonical array, retaining the original pairing when the user revisits it; it is discarded on completing a drag at a different entry. IDs and numeric values should remain stable across calls.

## Formula builder and MathJax fragments

`formula(helpers)` runs during creation and must return one HTML string. Four helpers are supplied:

| Helper | Return | Usage |
|---|---|---|
| `slot(name)` | HTML string | Renders that configured quantity: green wheel, blue determined output or gray fixed value. Repeated calls for the same variable stay synchronized but have distinct DOM IDs. For `boxDisplay:'hidden'`, this returns `''`. Unknown variable names error. |
| `squared(name)` | HTML string | Convenience markup enclosing `slot(name)` in parentheses followed by visual superscript 2. |
| `staticMath(latex)` | HTML string | Inserts a MathJax CommonHTML-rendered static fragment. Include its LaTeX in `preloadLatex` if not already prewarmed. |
| `shieldMath(latex)` | HTML string | Like `staticMath`, wrapped with the component's `.math-shield` layout/occlusion span (useful around fractions). |

The author controls operators, parentheses, equals signs, and fraction layout via HTML/CSS. There is **no automatic LaTeX-to-interactive-equation parser**. `accessibleMathLatex` provides a separate complete symbolic MathML version for screen readers. The component sanitizes MathJax conversion via its Safe setup, but **the formula builder itself returns trusted author-supplied HTML**: do not interpolate untrusted strings into it.

## Presentation options — all supported properties

Provide `presentation:{...}` at creation. Interactive instances can update these using `instance.setPresentation({...})`:

| Property | Default | Meaning |
|---|---|---|
| `showVariableTabs` | `true` | Show the small visible variable-name tabs attached to boxes. `false` hides them but does not change the variable's internal name. |
| `showVariableNamesInText` | `true` | Controls whether prompts/announcements use names (`x`) or anonymous labels. With `false`, supply `configuration.anonymousLabels` for clear spoken alternatives. Affects the text/prompt presentation, **not** structural MathML and not the mathematical variable identity. |
| `showChangeIndicators` | `true` | Global visibility of directional indicators; an individual quantity also needs `showChangeIndicator:true`. |
| `equationScale` | `1` | Positive finite multiplier for the assembled formula, subject to responsive fitting. Does not independently scale numeric glyph fonts. |
| `noOutputsLabel` | `'none'` | Literal placeholder shown for a determined output with zero valid choices. Any string (including empty) is permitted. |

The initial `presentation` is merged with these defaults. `setPresentation` converts the three visibility options to booleans; `equationScale` and `noOutputsLabel` receive explicit type validation. The settings change appearance and wording, not callback mathematics.

**Responsive layout (22.0):** Formula Wheels uses a shared baseline for assembled equations, chosen from the *parent page's visible viewport width* when the parent is same-origin: **100% above 600px; 76% at 421–600px; 55% at 351–420px; and 52% at 350px or narrower**. Standalone or cross-origin embeds use the iframe's own viewport instead. Use `document.documentElement.clientWidth` rather than `window.innerWidth` for the breakpoint: mobile browsers can report an inflated `innerWidth` when the parent document contains oversized content. On phone-width PreTeXt pages, the parent integration also caps each Formula Wheels iframe to the visible horizontal space remaining from its left edge *before* loading the child, and restores original inline width constraints at desktop widths. The parent cap requires the bundled post-build integration; copying only the reusable engine/CSS does not install it.

The engine compensates for the flex-layout width retained by `transform: scale(...)`, centers the visible equation inside its actual iframe width, and refits interactive and display-only instances after slate or equation widths change. Short and medium formulas that fit at the baseline retain the **same scale on a single page**. The existing fit-to-content reduction still applies to genuinely long formulas; identical baseline does **not** guarantee identical final scale for exceptionally wide equations. The author-facing `equationScale` multiplier remains available. No mathematics, wheel gestures, or keyboard semantics changed in this release.

**Display-only difference:** Only `showVariableTabs` and `equationScale` are recognized by the display-only instance's `setPresentation`. Although creation merges the common presentation state, `showVariableNamesInText`, `showChangeIndicators`, and `noOutputsLabel` have no documented effect on a static figure.

## Display-only formulas (`displayOnly:true`)

A display-only instance presents the styled mathematical boxes **without** keyboard controls, pointer wheels, popups, math-response callbacks, or subscribers. The formula-builder helper contract remains the same. Its variables need an **explicit `type`**:

```js
const instance = await createFormulaWheelsAsync({
  container:document.getElementById('formula-wheels'),
  displayOnly:true,
  configuration:{variables:{
    a:{type:'varying',latex:String.raw`\frac12`},
    b:{type:'varying',strictlyDependent:true,latex:'3'},
    k:{type:'fixed',latex:'5'}
  }, description:'A fixed snapshot of a mathematical relationship.'},
  formula:({slot,staticMath})=>`${slot('a')}${staticMath('+')}${slot('k')}${staticMath('=')}${slot('b')}`,
  accessibleMathLatex:String.raw`a+k=b`,
  preloadLatex:['+','=']
});
```

A display-only variable can have `latex:''` for an empty value face. `strictlyDependent:true` gives a nonadjustable blue appearance and can also use `valueDisplay:'hidden'`/`hiddenValueLabel` or `boxDisplay:'hidden'`. The fixed/varying role comes from `type`, not `values`; no `initial` or `permissibleOutputs` is needed. Do not expect `getValues`, `subscribe` or interactive controls on the static return object.

## Returned instance and subscriptions

**Interactive instance** (object is frozen; do not mutate it):

| Member | Contract |
|---|---|
| `getValues()` | Returns a fresh plain-data copy of the most recent snapshot, or `null` after destruction. |
| `subscribe(callback)` | Immediately invokes `callback(snapshot)` if a snapshot exists; then calls it when published mathematical state changes. Returns an unsubscribe function. Throws after destruction or if callback is not a function. Subscriber exceptions are logged without stopping the component. |
| `setPresentation(options)` | Updates recognized presentation options; see above. No effect after destruction. |
| `destroy()` | Tears down listeners, gestures, popups, observers, caches, and subscriptions; safe to call repeatedly. Allows mounting again in the same host. |
| `debug` | Development/diagnostic-only state and counters. **Not** a stable authoring API. |

The interactive snapshot includes:

```js
{
  example: 'custom',
  phase: 'committed', // also 'preview', 'pending', 'unresolved'
  active: null,       // currently edited variable name or null
  inputVariable: 'x',
  outputVariable: 'y',
  choiceBehavior: 'required',
  values: {
    x:[{id:'1',latex:'1',value:1}],
    y:[{id:'3',latex:'3',value:3}],
    c:[{id:'fixed-c',latex:'2',value:2}]
  },
  preferredId: {x:null,y:null,c:null},
  revision: 1
}
```

This is an **illustrative shape, not guaranteed values**. `values[name]` is always an array. In preview/pending, the determined quantity can have multiple permissible outputs in author-defined order; an unresolved counterpart is `[]`. The `preferredId` map supplies per-variable preferred-choice metadata, not a selected final entry. Revision increases when a new distinct snapshot is published. Subscribers receive independent copies, not live state references.

```js
const unsubscribe = instance.subscribe(snapshot => {
  const x = snapshot.values.x[0]?.value;
  const yOptions = snapshot.values.y.map(entry => entry.value);
  // Update your own JSXGraph object or other linked visualization here.
});
// Later: unsubscribe(); instance.destroy();
```

**Display-only instance:** `displayOnly` (getter returning `true`), `refit()` (remeasure after a custom layout transition), `setPresentation()` (two supported properties described above), and `destroy()`; no interactive snapshot or subscription interface.

## Advanced preparation and diagnostics

```js
await FormulaWheelsMath.prepare({
  configuration,
  accessibleMathLatex:String.raw`2x+1=y`,
  preloadLatex:['+1','=']
});
const instance = createFormulaWheels({container,configuration,formula,
  accessibleMathLatex:String.raw`2x+1=y`});
```

`FormulaWheelsMath.prepare` returns a preparation report (`mathJaxVersion`, `renderer`, `safeStatus`, `preparedExpressions`, `chtmlStylesheet` under MathJax 4); `FormulaWheelsMath.status()` reports the last preparation state, and `FormulaWheelsMath.tex2node(latex,options)` is a lower-level converter intended mainly for the component/advanced integration. All use the already available MathJax environment. MathJax 4 preparation requires an existing **CHTML** output document, arranges Safe filtering, and refreshes the generated CommonHTML stylesheet. It rejects incompatible or unprepared rendering rather than loading a separate SVG renderer.

The engine's public `window` symbols are `createFormulaWheelsAsync`, `createFormulaWheels`, `createEquationWheels` (deprecated), and `FormulaWheelsMath`. The retained release-candidate-named application-level globals `FW_RC1_SCHEDULE` and `FW_RC1_CHILD_ACCESSIBILITY` are **deployment diagnostics**, not per-instance authoring settings. `instance.debug` is likewise internal/development-oriented; inspect it for tests but don't build student-facing activities around its structure.

## Validation and errors

Initialization rejects invalid containers/configuration, incompatible variable roles, bad `values`/`initial` IDs, more than two varying quantities, duplicate entry IDs, unsupported `valueOrder`, invalid concealment combinations, bad callback results, malformed speech overrides, missing formula markup, unprepared MathJax 4 fragments, or a second live instance in the same container. An interactive constructor requires **two varying quantities**, even when one is strictly dependent; a *single varying quantity* is only available as a display-only figure in Version 22.0.

In the interactive factory, author errors during mounting trigger rollback of host nodes/attributes and removal of newly created listeners, leaving the host available for correction/remounting. If your authored callback fails or returns invalid entries, fix it rather than masking exceptions. The production scheduler and child configuration injection are separate build-time pieces; consult `README.md` and `TEST_PLAN.md` for those requirements.

## Compatibility notes and intentionally unsupported features

- `choiceMode` (top-level) overrides `configuration.choiceBehavior`; `'required'` and `'automatic'` are the only supported modes.
- There is **no** automated ClearSpeak / Speech Rule Engine speech authoring in 22.0. Use entry-level `speech` text for dynamic spoken values and `accessibleMathLatex` for complete structural MathML. See **Accessibility architecture** above for what disabling MathJax speech/Braille in child documents does and does not mean.
- There is **no** property that changes the scheduler's 3-second/250-ms policy per instance; it belongs to the parent integration.
- There is **no** MathJax SVG mode in this approved Version 22.0 branch. The MathJax 3 legacy gallery remains a historical testing reference, not a production rendering option.
- Do not rely on gallery-only `FWExampleFormulaBuilders`, `FWGallery`, `exampleKey` styling, or `instance.debug` as stable author-facing extension mechanisms. `pixelsPerStep` **is** a supported, per-variable drag-sensitivity setting.

**Examples:** `assets/code/fraction-numerator.js`, `linear-graph.js`, `circle-branches.js`, `preferred-required.js`, `preferred-automatic.js`, `hidden-variable-labels.js`, `display-only-fraction.js`, `transient-circle.js`, and the 15-interactive `source/main.ptx` gallery.
