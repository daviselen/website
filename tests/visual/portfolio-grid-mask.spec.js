import { test, expect } from "@playwright/test";
import { preparePage } from "./support/prepare-page.js";

// Regression test for a GSAP ScrollTrigger measurement-ordering bug.
//
// PortfolioGrid.jsx pins `sectionRef` via a ScrollTrigger on the `clip` div
// (`pin: sectionRef.current`). Every ImageCard's own clip-path mask-reveal
// ScrollTrigger also targets that same `sectionRef` (`trigger: sectionRef`,
// `end: "bottom top"`, passed down via scrollTriggerConfig) so the card
// stays revealed for the entire pin.
//
// Both triggers defaulted to the same refreshPriority, so GSAP's refresh
// pass could measure the mask's "bottom top" before the pin's spacer was
// built — landing the mask's `end` at sectionRef's *unpinned* natural
// height (~1839px past its start) instead of the true pinned range
// (~4072px). The mask then reversed and wiped the card back to hidden while
// the user was still scrolling forward through the pin, well before it
// released. See investigation.md for the full repro.
//
// The fix gives the pin a higher refreshPriority so it resolves (and builds
// its pin spacer) first. This test pins that invariant directly on the live
// ScrollTrigger instances rather than simulating scroll frames, since the
// bug is a measurement-time ordering issue, not a runtime one.
test("portfolio-grid card mask stays revealed for at least the whole pin", async ({
  page,
}) => {
  await preparePage(page);
  await page.locator("#portfolio-grid").scrollIntoViewIfNeeded();

  const { pin, mask } = await page.evaluate(async () => {
    const { ScrollTrigger } = await import("/src/design-system/animation.js");
    // Force a full, synchronous refresh so the assertion doesn't depend on
    // the ResizeObserver/fonts.ready timing in animation.js — the ordering
    // bug this guards is about refresh-time measurement, not paint timing.
    ScrollTrigger.refresh();

    const section = document.querySelector("#portfolio-grid");
    const triggers = ScrollTrigger.getAll();

    const pinTrigger = triggers.find((st) => st.pin === section);
    const maskTrigger = triggers.find(
      (st) => st.trigger === section && st.pin !== section,
    );

    return {
      pin: pinTrigger && { start: pinTrigger.start, end: pinTrigger.end },
      mask: maskTrigger && { start: maskTrigger.start, end: maskTrigger.end },
    };
  });

  expect(pin, "expected PortfolioGrid's pin ScrollTrigger to exist").toBeTruthy();
  expect(
    mask,
    "expected an ImageCard mask ScrollTrigger targeting sectionRef",
  ).toBeTruthy();

  // The point of `trigger: sectionRef` on the mask is that it stays revealed
  // for the full pin. A small tolerance covers rounding/anticipatePin, not
  // the ~3300px this bug was off by.
  expect(mask.end).toBeGreaterThanOrEqual(pin.end - 10);
});
