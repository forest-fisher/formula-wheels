# Formula Wheels 22.0 — regression and future-update checklist

This is the acceptance checklist retained for future regressions. The author has accepted the 22.0 final release based on RC4. See `RELEASE_ACCEPTANCE.md` for what was and was not actually checked. To retest, build with `py tools/build_and_patch.py`, not PreTeXt alone.

## Corrective checks first

1. Extract Version 22.0 into a **new** directory. Run `py tools/build_and_patch.py`.
   It must report `PASS: patched 15 Formula Wheels children and N parent pages`
   (where N may be greater than one). **Do not proceed on `PATCH ERROR`.**
2. On a parent page with multiple Formula Wheels, check
   `window.FW_RC1_SCHEDULE?.frameCount` and `window.FW_RC1_SCHEDULE?.launchTimesMs`.
   The count must match the actual frames on that page. On a child iframe,
   `window.FW_RC1_CHILD_ACCESSIBILITY?.status` should report `PASS`.
3. Revisit Figures 1.4, 2.2 and 2.4 in Chrome and Firefox and check for
   vertical scrollbars at desktop size and at a narrower layout.
4. Revisit all display-only Figures 3.1, 3.2 and 3.3 in Chrome. The
   mathematical formula must visibly render, not merely report `READY`.
   Save any console errors and child accessibility status if it does not.

## Mobile responsiveness: previously accepted on RC4; recheck after future changes

1. On the same phone and local Wi-Fi setup used for RC2, open **page 2**, especially **Figure 2.4** (hidden variable tabs), then Figures 2.2 and 2.3. At portrait width, the **complete equation** should be visible and centered in the iframe with **no horizontal scrolling**. Confirm blank space is balanced rather than concentrated on the left. Inspect the iframe's scrollbar area, not just the page.
2. Check a short equation (`xy=0`) and a medium equation (`x²+1=y`) on the same phone: their wheel text and box proportions should appear consistent at the new **55% baseline** if the *parent viewport* is 351–420 CSS pixels wide. Only a genuinely too-long expression may invoke the existing additional content-fit fallback.
3. Check Figure 3.2 (display-only fraction) and all three display-only cases on mobile: both the formula and rightmost terms must be visible; no scrolling or extra blank width from the display-only sizing path.
4. Rotate to landscape and back to portrait. Check that width is refitted, without stale margins, clipped boxes, or new vertical scrollbars. The parent iframe cap should be removed on desktop/large landscape viewport and reapplied in portrait.
5. Recheck one-finger dragging, page scrolling, popup positioning/selection and touch-target sizes. The correction must not cause gesture regressions or hide overflow to pass visually.
6. Verify desktop Chrome and Firefox sample figures have unchanged scale and alignment, and the build still ends in `PASS: patched 15 ...` rather than `PATCH ERROR`. Check especially that scheduling and Firefox iframe accessibility reports remain unchanged.

Historical context: RC2 passed six touch/loading checks but failed horizontal fit; RC3 improved but still clipped. **RC4 subsequently passed the author’s real-phone portrait/landscape visual review and was promoted to final 22.0.**

## Smoke sequence

- Confirm each of five sections renders correctly in the browser.
- Confirm first child starts immediately after the parent scheduler runs, without waiting for `MathJax.startup.promise`.
- On a section with at least two wheels, confirm `FW_RC1_SCHEDULE.launchTimesMs[1] - launchTimesMs[0] >= 3000`. All later gaps must be >= 250 ms, including if the main thread is blocked.
- Check `FW_RC1_CHILD_ACCESSIBILITY.status` is `PASS` in representative child iframe contexts. Confirm parent enables generated speech and Braille and that the parent `MathJax.startup.promise` eventually resolves.
- Compare formula appearances against the previously accepted RC5 CommonHTML gallery: numerator/denominator, selected green/blue glyph centering, sqrt and cubert, fractional powers, logarithms and popups; check 95%-wide mobile layout.
- Exercise variable keyboard Arrow, Enter confirmation, mouse drag, alternative preferred/required and automatic outputs, dependent outputs, hidden labels, and display-only examples. Verify the linked JSXGraph point and temporary value pairing for `x=2.1, y=√4.59`.
- Check console for errors, verify the engine's Safe filter remains active, and inspect MathML and ARIA attributes.

## Recorded evidence

Save per-browser console results for `FW_RC1_SCHEDULE` (parent) and `FW_RC1_CHILD_ACCESSIBILITY` (child), screenshots or notes for the visual cases, and any errors. For a future change, requalify the affected areas before releasing it; do not assume that 22.0 acceptance transfers to later versions.

## Scope limits

These tests are browser functionality and rendering checks, not a complete assistive-technology usability study. The full 389 regression suite was historically run against the 21.x reference and the modular MathJax 3 gallery, not the assembled RC1 distribution; note this distinction in the final release record.
