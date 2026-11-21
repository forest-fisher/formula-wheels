# Formula Wheels — public distribution

**Public release:** `v1.0.0` · **Approved internal baseline:** `22.0` (November 21, 2026)  
**Author:** Forest Fisher · **Copyright:** © 2026 Forest Fisher · **License:** MPL 2.0.  
**Development disclosure:** Vibe coded with extensive ChatGPT (OpenAI) assistance; see [NOTICE.md](../NOTICE.md).

## Why the two version labels differ

The first public release uses semantic version `1.0.0` because the prior `21.x` and `22.x` identifiers were internal development milestones. `v1.0.0` maps **exactly** to the accepted internal `22.0` runtime. Historical references to `22.0`, release candidates, and diagnostic `RC1` identifiers remain intact; they are not claims that the public release is a candidate. The accepted full ZIP is not rewritten or repacked when given the public-facing asset filename `formula-wheels-v1.0.0.zip`.

The checked-in file [`PUBLIC_VERSION.json`](../PUBLIC_VERSION.json) records the mapping, ZIP SHA-256 and hashes of all four canonical runtime/integration files.

## What this initial public release includes

- Canonical engine and CSS: `src/formula-wheels.js`, `src/formula-wheels.css` (with their synchronized PreTeXt mirrors).
- Required parent scheduler and child MathJax accessibility configuration in `src/`.
- PreTeXt compatibility gallery with 15 examples, build/post-build patching scripts, standalone example, API and tests.
- Full MPL 2.0 license and attribution / extensive AI-assistance disclosure.
- A **byte-for-byte preserved approved 22.0 ZIP** offered under the `v1.0.0` GitHub Release asset name.

## Scope and installation caution

The included `tools/patch_pretext.py` is tailored to the **included gallery layout**. A generic, independent textbook installer and an update-checking/PR workflow are **not shipped in `v1.0.0`**. They are planned for internal milestones 22.1-B and 22.1-C and will be acceptance-tested against `forest-fisher/college-algebra-from-here` using PreTeXt 2.56.2. Until then, authors must build the included gallery with `python tools/build_and_patch.py`; using `pretext build web` without the patcher omits necessary runtime configuration.

The browser-facing student site must host its own approved JS/CSS and patched HTML; there are no mutable CDN version references for Formula Wheels.

## How the GitHub release is verified

- `python tools/verify_public_release.py` checks the exact ZIP SHA-256, file inventory, historical signed-by-digest manifest, approved runtime bytes, license and disclosure.
- `python tests/test_release.py` checks the current **repository** source manifest. The historical approved ZIP has its own unchanged `RELEASE_MANIFEST_SHA256.json` and is checked separately.
- `python tools/package_public_release.py` creates `dist/` assets only from the preverified archived ZIP and public metadata.
- GitHub Actions runs local Python/JavaScript tests and an attempted PreTeXt gallery build before publishing an immutable-version-tagged GitHub Release.

The current test suite is not an expert screen-reader usability certification, and the historical 389-check 21.x suite has not been rerun as a single 22.0 suite. See `RELEASE_ACCEPTANCE.md`.

## Future releases

The initial GitHub workflow intentionally recognizes `v1.0.0` and its preserved approved artifact. Future versioned bundles should be explicitly added to the public metadata and release packaging logic, with their own verified source manifests and compatibility tests. Do not update this public version field or release by merely renaming a Git tag.
