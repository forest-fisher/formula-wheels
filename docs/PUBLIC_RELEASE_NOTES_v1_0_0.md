# Formula Wheels 1.0.0 — first public release

This is the first publicly versioned release of **Formula Wheels** by **Forest Fisher** (© 2026), licensed under **Mozilla Public License 2.0**. It is the **approved internal Version 22.0** (November 21, 2026), not a rewrite or a feature update. The attached `formula-wheels-v1.0.0.zip` is **byte-for-byte identical** to the original official `formula_wheels_v22_0_release.zip`, with only the attachment filename changed.

**Development disclosure:** Formula Wheels was **vibe coded with extensive ChatGPT (OpenAI) assistance**, directed, tested, and approved by Forest Fisher. See `NOTICE.md` for details and the third-party licensing boundaries.

- Reusable JavaScript/CSS math interaction engine and 15-example PreTeXt gallery.
- MathJax 4.1.3 CommonHTML, optimized accessible child iframe behavior, and parent scheduler (first iframe immediately, second ≥3000 ms later, later ≥250 ms apart).
- Accepted mobile width adaptation: shared baseline 55% at parent widths 351–420 CSS px, 52% ≤350px, 76% at 421–600px, 100% above 600px, with exceptional content fit.
- API, provenance and SHA-256 manifests, full source, tests, release acceptance record and standalone example.

**Integration requirement:** The included gallery must be built with `python tools/build_and_patch.py`; building raw PreTeXt alone does not install the approved iframe scheduler and MathJax accessibility configuration. A portable installer for independent textbooks and textbook update PR automation are **not included in v1.0.0** and are planned separately.

**Acceptance limits:** Mobile layout was author-tested and approved on a physical phone; the 389-check older suite was not rerun in full against this assembled release; experienced screen-reader usability has not been independently validated. Read `RELEASE_ACCEPTANCE.md` for scope.

**Approved ZIP SHA-256:** `c0c48f8b29836d636629635b9ebec22fe516857d49fda5ca896d12fc05b93e93`
