import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function ListMaskReveal({
  items = [],
  barClassName = 'bg-current',
  duration = 0.4,
  start = 'top 85%',
  className = '',
  itemClassName = '',
  renderItem,
  ...props
}) {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      if (!items.length) return;

      const rows = gsap.utils.toArray('[data-reveal-item]', containerRef.current);

      rows.forEach((row) => {
        const bar = row.querySelector('[data-reveal-bar]');
        const text = row.querySelector('[data-reveal-text]');

        gsap
          .timeline({
            scrollTrigger: {
              trigger: row,
              start: start,
              toggleActions: 'play none none reverse',
            },
          })
          .to(bar, {
            scaleX: 1,
            duration,
            ease: 'power2.inOut',
            transformOrigin: 'left center',
          })
          .set(text, { opacity: 1 })
          .to(bar, {
            scaleX: 0,
            duration,
            ease: 'power2.inOut',
            transformOrigin: 'right center',
          });
      });
    },
    { scope: containerRef, dependencies: [items, start, duration] }
  );

  return (
    <ul
      ref={containerRef}
      className={`p-0 m-0 list-none ${className}`.trim()}
      {...props}
    >
      {items.map((item, index) => (
        <li
          key={index}
          data-reveal-item
          className={`relative inline-flex items-center overflow-hidden mb-100 ${itemClassName}`.trim()}
        >
          {/* Masking Rectangle */}
          <span
            data-reveal-bar
            className={`absolute inset-0 z-10 pointer-events-none scale-x-0 origin-left ${barClassName}`}
            aria-hidden="true"
          />
          <div className="flex items-center gap-6">
            {/* Square Bullet */}
            <span className="h-3 w-3 bg-current shrink-0" role="none" />
            {/* Text Content */}
            <span data-reveal-text className="relative z-0 opacity-0" style={{paddingBlockStart: "0.075em", paddingBlockEnd: "0.1625em"}}>
              {renderItem ? renderItem(item, index) : item}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}