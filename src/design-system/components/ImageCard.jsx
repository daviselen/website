import { useRef, useState } from "react";
import { gsap, useGSAP, REVEAL_DURATION, EASE_REVEAL } from "../animation";
import HorizontalReveal from "../components/HorizontalReveal";
import TextReveal from "../components/TextReveal";

// 1. The top-to-bottom mask reveal. Inset 100% from the bottom hides the
// card; animating to 0% wipes it in downward.
const CARD_HIDDEN = "inset(0% 0% 100% 0%)";
const CARD_VISIBLE = "inset(0% 0% 0% 0%)";

// 2. Scroll-scrubbed card height. Same two ratios the old hover state
// toggled between (`aspect-[55/36]` -> `aspect-[11/4]`), as numbers so a
// height in px can be derived from the card's own width. The card lives at
// TALL and is scrubbed down to SHORT while pinned.
const ASPECT_TALL = 55 / 36;
const ASPECT_SHORT = 11 / 4;

// Seconds the height takes to catch up to the scroll position. This is the
// dial for how soft the shrink feels: 0 (or `true`) locks it to the scrollbar,
// higher values let it glide on after the wheel stops. Past ~1s the card is
// still visibly moving well after the page has settled, which reads as lag
// rather than smoothness.
const SCRUB_DAMPING = 0.6;

// How much scrolling the shrink is spread over, as a multiple of the height
// the card loses. 1 is the natural runway — the card stays pinned for exactly
// the distance the content below it would have travelled anyway. 2 holds the
// pin for twice that, so the same shrink is metered out over twice the
// scrolling and reads at half the speed.
//
// The cost of going above 1 is that the pin stops being distance-neutral:
// `pinSpacing` pads the runway out to the full end value, so the extra travel
// is scroll where the card is fixed and shrinking but the page around it has
// nothing left to do. At 2 that's one card-height of quiet scroll per card,
// which is the intended slow hold. Much past 2 it starts reading as the page
// being stuck rather than the card being deliberate.
const PIN_RUNWAY_MULTIPLIER = 2;

export default function ProjectCard({ title, client, src, videoSrc, startColumn2 }) {
  const containerRef = useRef(null);
  const maskRef = useRef(null);

    const videoRef = useRef(null);
    const [isRevealed, setIsRevealed] = useState(false);

    // isRevealed gates whether the caption children RENDER at all (see note
    // 4 below), so the timeline has to report back into React state — this
    // is the one place in the migration where an animation callback still
    // drives a re-render. motion did it via onAnimationComplete(variant);
    // GSAP splits the same two cases across onComplete/onReverseComplete.
    useGSAP(
      () => {
        gsap.fromTo(
          maskRef.current,
          { clipPath: CARD_HIDDEN },
          {
            clipPath: CARD_VISIBLE,
            duration: REVEAL_DURATION,
            ease: EASE_REVEAL,
            onComplete: () => setIsRevealed(true),
            onReverseComplete: () => setIsRevealed(false),
            scrollTrigger: {
              trigger: containerRef.current,
              // useInView's `amount: 0.2` meant "20% of the ELEMENT is
              // visible". The percentage in the first half of a start/end
              // string is measured against the trigger's own height, so
              // "top+=20% bottom" is that same threshold — note this is NOT
              // "top bottom-=20%", which would measure 20% of the viewport.
              start: "top+=20% bottom",
              end: "bottom-=20% top",
              // once: false — the card re-hides on exit and replays on
              // re-entry, in both scroll directions.
              toggleActions: "play reverse play reverse",
            },
          }
        );
        // The pinned height scrub. Separate tween, not part of the mask
        // reveal: the reveal is a toggleActions play/reverse, this one is a
        // scrub tied to scroll position, so they can't share a timeline.
        //
        // Sequence: the card scrolls up at full height, pins when its centre
        // hits the viewport centre, shrinks in place while pinned, then
        // unpins and carries on up.
        //
        // Heights are tweened in PIXELS, not as `aspectRatio`. Pinning writes
        // an inline `height` onto the element (ScrollTrigger has to freeze the
        // box before taking it out of flow), and an explicit height beats
        // `aspect-ratio` in the cascade — so an aspect-ratio tween would
        // silently do nothing for exactly the stretch of scroll where it
        // matters.
        //
        // The values are functions so `invalidateOnRefresh` re-reads them at
        // the current column width instead of baking in the width from first
        // paint.
        const tallHeight = () => containerRef.current.offsetWidth / ASPECT_TALL;
        const shortHeight = () => containerRef.current.offsetWidth / ASPECT_SHORT;

        gsap.fromTo(
          containerRef.current,
          { height: tallHeight },
          {
            height: shortHeight,
            // `ease: "none"` because scrub already maps progress linearly to
            // scroll — any other ease would double-apply a curve.
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              // "centre of the card meets centre of the viewport".
              start: "center center",
              // Pin runway = the height the card is about to lose, times
              // PIN_RUNWAY_MULTIPLIER. At 1 the scroll distance spent pinned
              // equals the distance the content below would have travelled
              // anyway; the multiplier stretches the shrink over more
              // scrolling to slow it down. `pinSpacing` reserves whatever
              // this returns, so the unpin still lands without a jump at any
              // multiplier — see the constant for what the stretch costs.
              end: () =>
                `+=${(tallHeight() - shortHeight()) * PIN_RUNWAY_MULTIPLIER}`,
              pin: true,
              pinSpacing: true,
              // Damped, not locked: the height eases toward the scroll
              // position over SCRUB_DAMPING seconds instead of tracking it
              // frame-for-frame, which takes the mechanical edge off a wheel
              // notch or a trackpad flick.
              scrub: SCRUB_DAMPING,
              // No anticipatePin. It pre-fires the pin in proportion to
              // scroll velocity, which is what you want when a smooth-scroll
              // library is interpolating scroll position — but this site
              // scrolls natively, so it just pins early and the card
              // teleports: measured a 128px snap (top 478 -> 230 in one wheel
              // step) at flick speed, and nothing at all when creeping.
              // Velocity-dependent jump = the thing being reported.
              invalidateOnRefresh: true,
              // Unpinning restores the inline styles ScrollTrigger cached at
              // pin start — including the height, which by then the scrub has
              // rewritten. Left alone the card snaps back to full height the
              // moment it unpins (measured: 304px -> 440px in a single frame).
              //
              // This re-assert hangs off onScrubComplete rather than
              // onLeave/onLeaveBack precisely BECAUSE the scrub is damped. On
              // exit the tween is still easing toward its end value, so an
              // immediate set would slam the card to 244 while the tween is
              // mid-flight at ~280 and the next frame would drag it back up —
              // trading the snap for a bounce. onScrubComplete fires once the
              // catch-up has settled, and the progress check keeps it to the
              // two ends, where the restore is the only thing that can have
              // touched the height.
              onScrubComplete: (self) => {
                if (self.progress === 1) {
                  gsap.set(containerRef.current, { height: shortHeight() });
                } else if (self.progress === 0) {
                  gsap.set(containerRef.current, { height: tallHeight() });
                }
              },
            },
          }
        );
      },
      { scope: containerRef }
    );

    const handleMouseEnter = () => {
        videoRef.current?.play().catch((error) => {
            console.warn("Autoplay blocked:", error);
        });
    };

    const handleMouseLeave = () => {
        if (videoSrc && videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0; // Resets video back to 0:00 frame
        }
    };
  
    return (
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        itemScope
        itemType="https://schema.org/CreativeWork"
        // No `aspect-[…]` class and no `transition-all` any more: height is
        // owned by the scrub tween above, and a CSS transition on the same
        // property would fight it every frame. The tall start value is
        // inline so it's correct on first paint, before GSAP runs.
        style={{ aspectRatio: ASPECT_TALL }}
        className={`relative mb-1000 w-full overflow-hidden rounded-md break-inside-avoid ${
          startColumn2 ? "break-before-column" : ""
        }`}
      >
        <meta itemProp="creator" content="Davis Elen Advertising" />
        <div
          // Aspect is 55/36 (880/480), same as From The Inside Out, per direct
          // correction — not the 880/576 (≈1.527, noticeably narrower) this
          // had before.
          //
          // Real case studies, so each card is its own schema.org CreativeWork
          // item (title -> name, client -> about, plus a hidden creator meta —
          // true and already established elsewhere in the codebase, e.g.
          // DeLogo's alt text, not invented for this). This is a separate
          // itemScope from the page's outer Organization item in HomePage.jsx,
          // not nested inside it — that's normal; a page can contain multiple
          // independent schema.org Items.
          // 3. The mask element the timeline above drives. Its hidden state is
          // inline so it's correct on first paint, before GSAP runs.
          ref={maskRef}
          className="relative h-full w-full overflow-hidden rounded-md"
          style={{ clipPath: CARD_HIDDEN, willChange: "clip-path" }}
        >
        {videoSrc ? (
            <video
                ref={videoRef}
                // poster={src}
                muted
                playsInline
                preload="auto"
                itemProp="image"
                className={`absolute inset-0 h-full w-full min-w-full min-h-full max-w-none object-cover`}
            >
              <source src={videoSrc.webm} type="video/webm" />
              <source src={videoSrc.mp4} type="video/mp4" />
            </video>
        ) : (
          <img
            src={src}
            alt={`${title} — ${client} project photo`}
            itemProp="image"
            className={`absolute inset-0 h-full w-full object-cover`}
          />
        )}
        {/* Corrected per direct confirmation (I can't see the actual Figma
            component myself — no way to view it beyond what get_design_context
            returns, and that data was ambiguous enough that I misread it as
            per-card variation last time). It's ONE unified gradient across
            every card, not per-photo tuning: angled (not straight vertical),
            and — the important bit — the darkest stop sits OUTSIDE the
            visible image, so the bottom edge never actually reaches full
            solid black, only a partial shade. The raw values I'd pulled
            earlier (angles clustering ~191–199deg; a couple of end stops at
            100.3%/105.2%, i.e. already past the visible edge) partially
            supported this and I didn't weight it correctly — treated those
            as per-card noise instead of the real, consistent shape.
            195deg / 60% / 130% below are my best approximation of "angled,
            ends past 100%" — if you can read the exact angle/stop values off
            the Figma inspector, give me those and I'll use them exactly
            instead.
  
            Inline `style` instead of a Tailwind `bg-[linear-gradient(...)]`
            arbitrary class: confirmed via a real screenshot of the deployed
            site that the Tailwind-class version wasn't rendering at all on
            every single card, bright or dark — no darkening was visible
            anywhere, even on light illustrated backgrounds where it should
            have been obvious. HumanAI.jsx's grid-line background uses inline
            `style` for its own multi-layer background-image and does render
            correctly on the same deploy, which is why this moved to the
            same mechanism rather than debugging the Tailwind JIT/purge
            pipeline blind. */}
        <div
          className="absolute inset-0 pointer-events-none chrome-gradient-adjust"
          style={{ backgroundImage: "linear-gradient(195deg, transparent 60%, black 130%)" }}
        />
        <div className="absolute inset-x-8 bottom-8 flex flex-col gap-300 text-neutral-0">
          {/* 4. Conditionally render the text components. 
              Because this wrapper is 'absolute', deferring the render of 
              the text won't break the layout or height of the card. */}
          {isRevealed && (
            <>
              <TextReveal 
                itemProp="name" 
                className="font-narrow font-light text-base leading-6 md:text-2xl md:leading-8"
                text={title}
              >
                {title}
              </TextReveal>
              <HorizontalReveal
                as="h3"
                itemProp="about"
                className="font-display text-4xl uppercase leading-none md:text-6xl lg:text-display-card"
                text={client}
              >
                {client}
              </HorizontalReveal>
            </>
          )}
        </div>
        </div>
      </div>
    );
}