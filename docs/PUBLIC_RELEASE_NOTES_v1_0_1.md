# Formula Wheels v1.0.1 — Authoring tools (release candidate)
Published candidate: November 23, 2026.

**Author:** Forest Fisher · **License:** MPL-2.0 · **Development:** vibe coded with extensive ChatGPT (OpenAI) assistance.

This patch release adds optional **author-only** Node.js command-line tools and documentation, without changing the approved Formula Wheels v1.0.0 student runtime.

- `generate-values.cjs`: exact decimal grids, zero-relative numeric anchor spacing, individual anchor values, positive-magnitude or symmetric noise, seeded randomness.
- `add-speech.cjs`: reviewable SRE descriptions for existing static JavaScript value entries, default ClearSpeak; MathSpeak/ChromeVox optional.
- `add-output-speech.cjs`: discovers speech for entries returned by a trusted `permissibleOutputs()` callback; writes a new authoring file with an editable lookup and a wrapper. Keeps mathematical results, `preferredId`, `branchKey`, and author speech.
- Complete CLI reference: [`docs/formula_wheels_authoring_tools.md`](formula_wheels_authoring_tools.md).

Dependencies are authoring-only. No SRE is loaded by student browsers or during ordinary PreTeXt builds. All generated speech must be reviewed before use. The historical approved v1.0.0 ZIP is retained unmodified. The new release includes a complete archive manifest, and the canonical runtime hashes are unchanged.

**Distribution note:** The separate textbook repository's v22.1-C vendoring allowlist must be updated to include the new authoring files before they can arrive in its reviewable automatic update PR. The update workflow never merges or deploys automatically.

**Validation:** Publish only after GitHub CI passes the existing gallery tests, the complete authoring tests, release verification, and ZIP checksum checks.
