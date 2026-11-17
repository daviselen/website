import { Link } from "react-router-dom";
import TextReveal from "../design-system/components/TextReveal";
import StyledButton from "../design-system/components/Button.jsx";
import RotatingCube from "../components/RotatingCube.jsx";

// NavBar and Footer are not rendered here: Layout.jsx already mounts both
// around every route. Used both for the router's "*" catch-all and for a
// known route (e.g. /news/:slug) that can't resolve its own content, so it
// carries no route-specific copy.
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-surface-default px-300 pb-1000 pt-1200 text-center font-narrow font-light text-neutral-0 light:bg-neutral-0 light:text-neutral-1000 md:pt-1600 lg:gap-16 lg:px-8 lg:pb-1600 lg:pt-2000">
      <h1 className="sr-only">404</h1>
      {/* The cube stands in for the zero. */}
      <div
        aria-hidden="true"
        className="flex items-center justify-center font-display text-fluid-3xl uppercase leading-none md:text-display-h4 lg:text-display-h3"
      >
        <span>4</span>
        <RotatingCube />
        <span>4</span>
      </div>
      <TextReveal
        text="Exploration is also part of our process, but you're lost."
        as="p"
        className="max-w-xs text-fluid-md md:max-w-xl md:text-4xl lg:max-w-3xl"
      />
      <StyledButton as={Link} to="/" variant="solid" size="big">
        Back home
      </StyledButton>
    </main>
  );
}
