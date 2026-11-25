import { REVEAL_DURATION } from "../animation";
import HeadingReveal from "./HeadingReveal";
import TextReveal from "./TextReveal";

export default function Channel({ channel, title, children }) {
  return (
    <section className="px-300 pt-1000 md:pt-3000 lg:px-8">
      <div className="flex flex-col gap-200 border-t-2 border-neutral-100 pt-400 light:border-neutral-800">
        <HeadingReveal
          as="h2"
          text={channel}
          className="font-display text-fluid-lg uppercase md:text-7xl lg:text-display-h5"
        />
        {/* Starts as the heading's wipe ends; both fire off the same scroll
            position, so the heading's own duration is the offset. */}
        {title && (
          <TextReveal
            className="text-fluid-sm md:text-xl lg:text-pre-title"
            text={title}
            delay={REVEAL_DURATION}
          />
        )}
      </div>
      {children && (
        <div className="mt-600 flex flex-col gap-400 lg:mt-1000 lg:gap-1000">
          {children}
        </div>
      )}
    </section>
  );
}
