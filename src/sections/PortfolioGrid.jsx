import { prefersReducedMotion } from "../lib/reducedMotion.js";
// Hover-velocity carousel.
//
// This replaces the pinned, scroll-scrubbed horizontal section that used to
// live here. Nothing about the strip is tied to scroll position any more: the
// page scrolls straight past the section at normal speed, and the strip is
// driven by where the cursor sits inside it.
//
//   cursor at the left edge   → full speed
//   cursor at the centre      → stationary
//   cursor at the right edge  → full speed, the other way
//   cursor outside the strip  → decelerates to a standstill
//
// Layout:
//   <section ref=sectionRef>
//     <div px-8>                         — heading wrapper (stays in flow)
//       <HeadingReveal />
//     </div>
//     <div ref=clipRef overflow-hidden>  — hard clip AND the hover surface
//       <div ref=trackRef flex-nowrap>   — the strip that translates
//         {cards} {cards…}               — n copies, see `copies` below
//       </div>
//     </div>
//   </section>
//
// The motion is a per-frame integration, not a tween:
//
//   speed  += (target − speed) · damping     ← smoothing, see RAMP_SECONDS
//   offset += speed · dt                     ← position
//   offset  = wrap(offset)                   ← the infinite loop
//
// A tween would need a start and an end; this has neither, because `target`
// changes continuously as the cursor moves and the loop never terminates.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import HeadingReveal from "../design-system/components/HeadingReveal";
import ProjectCard from "../design-system/components/ImageCard";
import { gsap, useGSAP } from "../design-system/animation";

// Strip px per second at the very edge of the clip, falling off linearly to 0
// at the centre. THE SPEED DIAL. Most of the strip's width maps to a small
// fraction of this — at a quarter of the way in from an edge the strip only
// moves at half of it — so the number reads faster than it feels.
const MAX_SPEED = 480;

// Damping, as the seconds the speed takes to cover ~63% of the gap to its
// target (an exponential time constant, so it is ~95% there after three of
// them). THE SMOOTHING DIAL, and the reason a flicked cursor doesn't snap the
// strip to a new velocity: pointermove only ever moves the TARGET, and the
// speed chases it on this curve. Raise it for a heavier, more elastic strip;
// lower it toward 0.05 to weld the strip to the cursor.
const RAMP_SECONDS = 0.25;

// Below this speed, in px/sec, a decelerating strip counts as stopped. Two
// reasons for a floor rather than letting the exponential approach zero
// forever: sub-pixel motion is invisible but still costs a transform write
// every frame, and without it the ticker could never take its idle
// short-circuit, so an untouched page would keep integrating for its whole
// lifetime.
const IDLE_SPEED = 0.5;

// The px-8 site gutter, as a number because the resting position is computed,
// not declared — see RESTING OFFSET below.
const GUTTER = 32;

const projects = [
  {
    title: "We Got You",
    client: "Toyota",
    src: "/images/portfolio-we-got-you-toyota.jpg",
  },
  {
    title: "Hola Mexico Film Festival",
    client: "McDonald's",
    src: "/images/portfolio-hola-mexico-mcdonalds.jpg",
    // videoSrc: {
    //   webm: "/videos/portfolio-hola-mexico-mcdonalds.webm",
    //   mp4: "/videos/portfolio-hola-mexico-mcdonalds.mp4",
    // },
  },
  {
    title: "Let's Admit It",
    client: "Best Buy Health",
    src: "/images/portfolio-lets-admit-it-best-buy-health.jpg",
  },
  {
    title: "Alex in the Wild",
    client: "Smart & Final",
    src: "/images/portfolio-alex-in-the-wild-smart-final.jpg",
  },
  {
    title: "Legendary Partners",
    client: "Los Angeles Lakers",
    src: "/images/portfolio-legendary-partners-lakers.jpg",
    to: "/work/lakers-and-toyota-legendary-partners",
  },
  {
    title: "Beyond The Arches",
    client: "McDonald's",
    src: "/images/portfolio-beyond-the-arches-mcdonalds.jpg",
  },
  {
    title: "Keys To Tech",
    client: "DICE",
    src: "/images/portfolio-keys-to-tech-dice.jpg",
  },
  {
    title: "Super Snorkel Tours",
    client: "Body Glove Cruises",
    src: "/images/portfolio-super-snorkel-body-glove.jpg",
  },
];

// The looping, cursor-driven strip is a desktop-only enhancement. It needs a
// mouse (`hover` + `fine` — a stylus reports `hover: hover` but gives no
// continuous position to read a velocity from) and room for it (lg+), and it
// is off under reduced motion. Everywhere else — phones, tablets, touch
// laptops, narrow windows — the strip is a plain native scroller (see
// `animated` below), which is what touch, keyboard and assistive tech drive.
const ANIMATED_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

function shouldAnimate() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(ANIMATED_QUERY).matches && !prefersReducedMotion();
}

export default function PortfolioGrid() {
  const sectionRef = useRef(null);
  const clipRef = useRef(null);
  const trackRef = useRef(null);

  // The ONLY thing the pointer handlers write. A ref, not state, because the
  // ticker reads it every frame and re-rendering on cursor movement would
  // rebuild the ticker sixty times a second.
  const targetSpeedRef = useRef(0);

  // Survives a rebuild of the ticker. The strip is re-measured on resize,
  // which changes the wrap distance and so has to restart the effect; without
  // this the strip would snap back to its resting position mid-glide.
  const offsetRef = useRef(null);

  // A render input, not something the ticker checks per frame: the section
  // renders differently (looping copies vs one native scroller). Kept in sync
  // with the media query so resizing a window across lg, or docking a
  // keyboard-and-mouse to a tablet, switches modes instead of stranding one.
  const [animated, setAnimated] = useState(shouldAnimate);

  useEffect(() => {
    const query = window.matchMedia(ANIMATED_QUERY);
    const sync = () => setAnimated(shouldAnimate());
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Scroll indicator (static scroller only). Its thumb is 1/n of the bar and
  // slides with scroll progress; written straight to the DOM so scrolling
  // never re-renders. It is also a pointer control: drag the thumb, or press
  // anywhere on the bar to jump there and keep dragging. It stays out of the
  // accessibility tree and the tab order on purpose — the scroller itself is
  // the keyboard and assistive-tech control, and a second tab stop for the
  // same scrolling would only be noise.
  const thumbRef = useRef(null);
  const barRef = useRef(null);
  const gripRef = useRef(null);

  useEffect(() => {
    if (animated) return undefined;
    const clip = clipRef.current;
    const thumb = thumbRef.current;
    if (!clip || !thumb) return undefined;

    const update = () => {
      const max = clip.scrollWidth - clip.clientWidth;
      const progress = max > 0 ? clip.scrollLeft / max : 0;
      // The thumb is 1/n of the bar wide, so travelling the rest of the bar
      // is (n − 1) thumb-widths.
      thumb.style.transform = `translateX(${progress * (projects.length - 1) * 100}%)`;
    };

    update();
    clip.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(clip);

    // Dragging. `grab` is where inside the thumb the pointer holds it (null =
    // not dragging); pressing the bar rather than the thumb centres the thumb
    // under the pointer first. Scroll-snap is switched off for the drag —
    // otherwise every programmatic scrollLeft write is pulled to the nearest
    // card and the thumb fights the pointer — and restored on release, which
    // lets the strip settle onto a card.
    const grip = gripRef.current;
    const bar = barRef.current;
    let grab = null;

    const scrollToPointer = (clientX) => {
      const barRect = bar.getBoundingClientRect();
      const thumbWidth = thumb.getBoundingClientRect().width;
      const travel = barRect.width - thumbWidth;
      if (travel <= 0) return;
      const progress = Math.min(1, Math.max(0, (clientX - barRect.left - grab) / travel));
      clip.scrollLeft = progress * (clip.scrollWidth - clip.clientWidth);
    };

    const onDown = (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const thumbRect = thumb.getBoundingClientRect();
      grab =
        event.clientX >= thumbRect.left && event.clientX <= thumbRect.right
          ? event.clientX - thumbRect.left
          : thumbRect.width / 2;
      clip.style.scrollSnapType = "none";
      grip.setPointerCapture(event.pointerId);
      scrollToPointer(event.clientX);
      event.preventDefault();
    };
    const onMove = (event) => {
      if (grab !== null) scrollToPointer(event.clientX);
    };
    const onUp = () => {
      if (grab === null) return;
      grab = null;
      clip.style.scrollSnapType = "";
    };

    grip.addEventListener("pointerdown", onDown);
    grip.addEventListener("pointermove", onMove);
    grip.addEventListener("pointerup", onUp);
    grip.addEventListener("pointercancel", onUp);

    return () => {
      clip.removeEventListener("scroll", update);
      observer.disconnect();
      grip.removeEventListener("pointerdown", onDown);
      grip.removeEventListener("pointermove", onMove);
      grip.removeEventListener("pointerup", onUp);
      grip.removeEventListener("pointercancel", onUp);
      clip.style.scrollSnapType = "";
    };
  }, [animated]);

  // `copies` is how many times the card set is repeated, and `setWidth` is the
  // exact px width of one repeat — the distance the strip wraps over. Both are
  // measurements, so they are state rather than constants.
  const [geometry, setGeometry] = useState({ copies: 1, setWidth: 0 });

  // Layout effect, not effect: the first measurement has to land before paint
  // or the strip flashes at the wrong offset.
  useLayoutEffect(() => {
    if (!animated) return undefined;
    const clip = clipRef.current;
    if (!clip) return undefined;

    const measure = () => {
      const cards = trackRef.current?.children;
      if (!cards) return;

      // setWidth is read off the DOM as the gap between a card and its own
      // copy one set later, rather than computed from card width + gap. That
      // makes it exact by construction — it picks up the flex `gap-x-8`, any
      // sub-pixel rounding, and any future change to the card's basis without
      // this file having to know about them. It does mean two sets have to be
      // on the page before it can be measured, hence the bootstrap below.
      if (cards.length < projects.length * 2) {
        setGeometry((previous) =>
          previous.copies >= 2 ? previous : { copies: 2, setWidth: 0 }
        );
        return;
      }

      const setWidth = cards[projects.length].offsetLeft - cards[0].offsetLeft;
      if (!setWidth) return;

      // The `+ 1` is load-bearing: at the far end of the wrap range the
      // content starts a whole set to the left, so there still has to be a
      // clip's worth of cards covering the visible area. In practice one set
      // of eight 32rem cards is already wider than any viewport, so this
      // resolves to 2 — the formula is here so it stays correct if the card
      // count or width ever drops.
      const copies = Math.max(2, Math.ceil(clip.clientWidth / setWidth) + 1);

      setGeometry((previous) =>
        previous.copies === copies && previous.setWidth === setWidth
          ? previous
          : { copies, setWidth }
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(clip);
    return () => observer.disconnect();
  }, [animated]);

  const { copies, setWidth } = geometry;

  useGSAP(
    () => {
      const track = trackRef.current;
      // Left the loop (resized below lg, reduced motion on): drop the strip's
      // leftover transform so the native scroller starts at its own origin.
      if (!animated) {
        gsap.set(track, { clearProps: "transform" });
        return undefined;
      }
      if (!setWidth) return undefined;

      // What makes it infinite: offset is folded back into a window exactly
      // one set wide every frame. Every copy is identical, so the two ends of
      // that window are pixel-identical and the fold is invisible.
      //
      // The window is shifted by GUTTER rather than being the obvious
      // [-setWidth, 0). Any half-open interval of length setWidth wraps
      // correctly, and this one puts the RESTING position (see below) at its
      // top edge, which is what keeps the real, content-bearing card set on
      // screen at rest instead of one of the decorative copies.
      const wrapX = gsap.utils.wrap(GUTTER - setWidth, GUTTER);

      // Bypasses the tween machinery for the per-frame write. This is a raw
      // transform update, not an animation with a start and an end.
      const setX = gsap.quickSetter(track, "x", "px");

      // RESTING OFFSET. The track carries no leading padding — it can't, or
      // the loop would be a gutter's width out of true every time it wrapped —
      // so the gutter that lines the first card up under the heading has to
      // come from the starting offset instead. Paired with the shifted wrap
      // window above, this leaves the first REAL card gutter-aligned and every
      // decorative copy off the right edge until the strip actually moves.
      let offset =
        offsetRef.current === null ? GUTTER : wrapX(offsetRef.current);
      let speed = 0;
      setX(offset);

      const tick = (_time, deltaMs) => {
        const target = targetSpeedRef.current;

        // Frame-rate independent damping. The naive `speed += (target −
        // speed) · k` form makes k mean something different at 120Hz than at
        // 60Hz, so the same strip would ramp twice as fast on a ProMotion
        // display; solving the exponential over the real frame time takes the
        // refresh rate out of the feel entirely.
        const dt = deltaMs / 1000;
        speed += (target - speed) * (1 - Math.exp(-dt / RAMP_SECONDS));

        if (!target && Math.abs(speed) < IDLE_SPEED) {
          speed = 0;
          // Idle short-circuit: no transform write while the strip is parked,
          // so an unhovered page pays nothing but this comparison per frame.
          return;
        }

        offset = wrapX(offset + speed * dt);
        offsetRef.current = offset;
        setX(offset);
      };

      gsap.ticker.add(tick);
      // useGSAP's context reverts tweens, but a raw ticker callback is not a
      // tween — it has to be removed by hand, or a re-measure would leave the
      // old one running against the previous wrap distance and the strip would
      // visibly jump at the fold.
      return () => gsap.ticker.remove(tick);
    },
    {
      scope: sectionRef,
      dependencies: [animated, setWidth],
      // useGSAP defers cleanup to unmount when there are dependencies, so
      // without this a re-measure would ADD a ticker callback rather than
      // replace one.
      revertOnUpdate: true,
    }
  );

  // Cursor position across the clip, as −1 (left edge) … 0 (centre) … +1
  // (right edge), scaled to a speed. Note the sign: a cursor on the RIGHT
  // drives the offset negative, i.e. the strip travels left and reveals the
  // cards that were off the right edge. Flip the sign here to reverse that.
  const handlePointerMove = (event) => {
    // Touch taps on a hybrid device fire pointermove too, and their matching
    // pointerleave can be arbitrarily late — a tap would leave the strip
    // gliding indefinitely. Hover means a mouse here.
    if (event.pointerType === "touch") return;
    const rect = clipRef.current.getBoundingClientRect();
    const centered = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    targetSpeedRef.current = gsap.utils.clamp(-1, 1, centered) * -MAX_SPEED;
  };

  // Decelerate to a stop. Setting the TARGET rather than the speed is what
  // makes leaving the strip a glide instead of a stall, and it means a cursor
  // skimming in and out across the edge nudges an already-smooth curve rather
  // than restarting anything.
  const handlePointerLeave = () => {
    targetSpeedRef.current = 0;
  };

  // Decorative loop copies exist only in the animated strip.
  const visibleCopies = animated ? copies : 1;

  return (
    <section id="portfolio-grid" ref={sectionRef} className="pb-0 pt-1000 lg:pt-3000">
      {/* Heading lives outside the clip so it isn't cropped by overflow-hidden */}
      <div className="px-300 lg:px-8">
        <HeadingReveal
          as="h2"
          text={`Fresh Out \nof the Box`}
          className="mb-400 font-display text-fluid-2xl uppercase leading-none md:text-8xl lg:mb-1000 lg:text-display-h3"
        />
      </div>

      {/* Clip boundary. Animated (desktop mouse): a hard overflow cut that is
          also the hover surface — the cursor's position across THIS box is
          what the velocity is read from. Otherwise: a native scroll-snap
          scroller. It is a labelled, focusable region so keyboard users can
          scroll it with the arrow keys (a scroller with no focusable child
          is unreachable otherwise). The native scrollbar is hidden
          everywhere: the indicator below is the scrollbar, and it can be
          dragged, so showing both would just be two bars. */}
      <div
        ref={clipRef}
        className={
          animated
            ? "w-full overflow-hidden"
            : "w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-px-300 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-neutral-0 light:focus-visible:outline-neutral-1000 lg:scroll-px-8 scrollbar-none"
        }
        role={animated ? undefined : "region"}
        aria-label={animated ? undefined : "Selected work"}
        tabIndex={animated ? undefined : 0}
        onPointerMove={animated ? handlePointerMove : undefined}
        onPointerLeave={animated ? handlePointerLeave : undefined}
        // pointercancel covers the browser taking the pointer away mid-hover
        // (a drag starting, the OS stealing focus) and never sending the leave
        // that would otherwise stop the strip.
        onPointerCancel={animated ? handlePointerLeave : undefined}
      >
        {/* The strip. Padded only in the static scroller: the looping version
            gets its left gutter from the resting offset instead, because a
            padded track cannot wrap seamlessly. The right gutter is a
            zero-width `after` item: padding on an overflowing flex container
            is not part of the scrollable area, but the gap before an item is. 1px
            wide, pulled back 1px, because a zero-area box is ignored there.
            `role="list"` because
            list-style: none makes Safari drop the list semantics. */}
        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- deliberate, see above */}
        <ul
          ref={trackRef}
          role="list"
          className={`flex gap-x-300 lg:gap-x-8 ${animated ? "" : "pl-300 after:-ml-px after:block after:w-px after:shrink-0 lg:pl-8"}`}
          style={{ willChange: "transform" }}
        >
          {Array.from({ length: visibleCopies }, (_, copy) =>
            projects.map((project, index) => (
              // Sizing lives on the item, not the card. Phones: card width is
              // the scroller minus the left gutter, a 40px (Scale/500) sliver
              // of the next card and the gap before it — the cue that it scrolls — capped at
              // 32rem so a wide phone or a landscape one doesn't get a card
              // taller than its screen.
              <li
                key={`${copy}-${index}`}
                // Loop copies repeat the eight case studies; hidden from
                // assistive tech so the list still reads as eight.
                aria-hidden={copy > 0 ? "true" : undefined}
                className="max-w-lg shrink-0 basis-[calc(100%-theme(spacing.500)-theme(spacing.300))] snap-start"
              >
                <ProjectCard {...project} decorative={copy > 0} />
              </li>
            ))
          )}
        </ul>
      </div>

      {!animated && (
        <div aria-hidden="true" className="mt-300 flow-root px-300 lg:px-8">
          {/* The visible bar is 2px (Figma); the grip around it is the hit
              area. Its padding is cancelled by negative margins, so layout
              is unchanged. `touch-none` so dragging it on a touch screen
              moves the strip instead of scrolling the page. */}
          <div ref={gripRef} className="-my-200 cursor-pointer touch-none select-none py-200">
            <div ref={barRef} className="h-25 overflow-hidden bg-neutral-700">
              <div
                ref={thumbRef}
                className="h-full bg-neutral-0 light:bg-neutral-1000"
                style={{ width: `${100 / projects.length}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
