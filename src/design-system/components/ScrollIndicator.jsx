import { useEffect, useRef } from "react";

// Progress bar for a native horizontal scroll-snap strip (home "Fresh Out of
// the Box" on touch, "More Work" on phones). Its thumb is 1/n of the bar and
// slides with scroll progress; written straight to the DOM so scrolling never
// re-renders. It is also a pointer control: drag the thumb, or press anywhere
// on the bar to jump there and keep dragging. It stays out of the
// accessibility tree and the tab order on purpose — the scroller itself is
// the keyboard and assistive-tech control, and a second tab stop for the
// same scrolling would only be noise.
//
// `scrollerRef` is the overflow element; `count` is how many cards it holds.
// Page gutters are the caller's: pass them (and any breakpoint hiding) in
// `className`.
export default function ScrollIndicator({ scrollerRef, count, className = "" }) {
  const thumbRef = useRef(null);
  const barRef = useRef(null);
  const gripRef = useRef(null);

  useEffect(() => {
    const clip = scrollerRef.current;
    const thumb = thumbRef.current;
    if (!clip || !thumb) return undefined;

    const update = () => {
      const max = clip.scrollWidth - clip.clientWidth;
      const progress = max > 0 ? clip.scrollLeft / max : 0;
      // The thumb is 1/n of the bar wide, so travelling the rest of the bar
      // is (n − 1) thumb-widths.
      thumb.style.transform = `translateX(${progress * (count - 1) * 100}%)`;
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
  }, [scrollerRef, count]);

  return (
    <div aria-hidden="true" className={`mt-300 flow-root ${className}`}>
      {/* The visible bar is 2px (Figma); the grip around it is the hit
          area. Its padding is cancelled by negative margins, so layout
          is unchanged. `touch-none` so dragging it on a touch screen
          moves the strip instead of scrolling the page. */}
      <div ref={gripRef} className="-my-200 cursor-pointer touch-none select-none py-200">
        <div ref={barRef} className="h-25 overflow-hidden bg-neutral-700">
          <div
            ref={thumbRef}
            className="h-full bg-neutral-0 light:bg-neutral-1000"
            style={{ width: `${100 / count}%` }}
          />
        </div>
      </div>
    </div>
  );
}
