import { Link } from "react-router-dom";
import HeadingReveal from "../design-system/components/HeadingReveal";
import TextReveal from "../design-system/components/TextReveal";
import StyledButton from "../design-system/components/Button.jsx";
import RotatingCube from "../components/RotatingCube.jsx";

// NavBar and Footer are not rendered here: Layout.jsx already mounts both
// around every route. Used both for the router's "*" catch-all and for a
// known route (e.g. /news/:slug) that can't resolve its own content, so it
// carries no route-specific copy.
//
// The panel stands in for a masthead: same frame ratio, same page gutters and
// bottom spacing as MastheadImage, with the 404 heading where a masthead's
// title would sit. Below md there is no fixed ratio — the panel just wraps
// its content.
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-surface-default px-300 pb-1000 font-narrow font-light text-neutral-0 light:bg-neutral-0 light:text-neutral-1000 sm:pb-1200 md:pb-1400 lg:px-8 lg:pb-1800">
      <div className="flex items-center justify-between rounded-md bg-surface-alt px-300 py-500 light:bg-neutral-100 md:aspect-contact-masthead md:px-300 md:py-0 lg:px-8">
        <HeadingReveal
          as="h1"
          text="404"
          className="font-display text-fluid-2xl uppercase leading-none md:text-7xl lg:text-display-h2"
        />
        <div aria-hidden="true" className="mr-200 md:mr-400 lg:mr-600 xl:mr-800">
          <RotatingCube size="clamp(80px, 12vw, 240px)" />
        </div>
      </div>
      <div className="mt-500 flex flex-col gap-400 md:mt-700 lg:mt-800 lg:grid lg:grid-cols-12 lg:gap-400 xl:mt-1000">
        <div className="flex flex-col items-start gap-400 lg:col-span-6 lg:col-start-7 lg:pr-600">
          <TextReveal
            text="Exploration is also part of our process, but you're lost."
            as="p"
            className="text-fluid-sm md:text-xl lg:text-pre-title"
          />
          <StyledButton as={Link} to="/" variant="solid" size="big">
            Back home
          </StyledButton>
        </div>
      </div>
    </main>
  );
}
