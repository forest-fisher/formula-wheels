# Formula Wheels 22.0 — release acceptance record

**Release date:** November 21, 2026. **Approved by:** Forest Fisher. **Source baseline:** 22.0-rc.4. **Code:** Official 22.0 is byte-for-byte identical to the accepted RC4 release for engine JavaScript, stylesheets, iframe scheduler, child MathJax configuration, author examples and gallery source. Release-only documentation/metadata and the post-build command labels were updated.

## Acceptance evidence provided by the author

- **PreTeXt build:** RC2 and subsequent build procedure completed successfully with `PASS: patched 15 Formula Wheels children and 20 parent pages.` Twenty parent HTML pages is supported by the patcher's per-page matching design and need not imply 20 simultaneous iframe loads.
- **Desktop Firefox and Chrome (RC2):** All wheels loaded, including previously missing Chrome Figure 3.2; unexpected scrollbars disappeared from Figures 2.2 and 2.4 in both browsers and Figure 1.4 in Chrome. The author continued testing later mobile-focused RCs.
- **Scheduler:** On a four-iframe page, Firefox launch times `[788, 3789, 4041, 4320]` ms produced gaps `[3001, 252, 279]` ms. Chrome launch times `[148.7, 3157.7, 3417.7, 3670.4]` ms produced gaps approximately `[3009, 260, 253]` ms. Both satisfy the required first 3,000 ms minimum and later 250 ms minimum. `frameCount` was correct in both browsers.
- **Child accessibility configuration:** The author observed `PASS` in all four tested child iframes in Firefox. The same diagnostic was **not run in Chrome**, by choice; no claim is made that it was.
- **Initial real-phone testing over local Wi-Fi (RC2):** All Formula Wheels loaded; one-finger dragging, page scroll isolation, popup selection, and keyboard/control visibility passed; no unexpected internal vertical scrollbars. Horizontal fit failed initially; RC3 improved layout but did not fully resolve overflow.
- **Real-phone visual acceptance (RC4):** The author reported *very little to no unused horizontal space*, appropriate and usable **55% portrait scaling**, no remaining problematic horizontal layout, and good resizing when rotating portrait→landscape→portrait. Landscape formulas were larger while still fitting and were viewed as a useful option for students. The author explicitly stated that Version 22.0 was ready for full release.

## Technical and validation boundaries

- The author approved desktop and mobile behavior; the final promotion did **not** introduce new runtime changes. It did not repeat a full browser acceptance cycle following documentation-only promotion.
- Browser/ARIA and configuration verification is **not** an experienced screen-reader usability assessment. MathJax speech/Braille generation is retained in the parent and disabled only in children; children provide optimized ARIA/live announcements and author-supplied speech, not full automatic MathJax speech/Braille.
- The 389-check legacy 21.x behavioral suite was historically passed for an earlier/modular baseline; it has **not** been executed as a complete combined suite against this official 22.0 package. The included local source, semantics, integration and layout regression tests have been run separately.
- General third-party PreTeXt builds outside the included gallery and cross-browser assistive-technology performance beyond the recorded checks are not certified.

**Disposition:** Version **22.0 final — approved**. GitHub packaging/distribution/update PR automation is deferred to **22.1**; build-time optional ClearSpeak/SRE speech authoring is deferred to **22.2**.
