import { Link } from "react-router-dom";
import HeadingReveal from "../design-system/components/HeadingReveal";
import TextReveal from "../design-system/components/TextReveal";
import StyledButton from "../design-system/components/Button.jsx";
import RotatingCube from "../components/RotatingCube.jsx";

// NavBar and Footer are not rendered here: Layout.jsx already mounts both
// around every route. Used both for the router's "*" catch-all and for a
// known route (e.g. /news/:slug) that can't resolve its own content, so it
// carries no route-specific copy.
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-start justify-center gap-600 bg-surface-default light:bg-neutral-0 px-2 py-0 font-narrow font-light text-neutral-0 light:text-neutral-1000 md:px-8">
      <RotatingCube />
      <HeadingReveal
        text="404"
        as="h1"
        fullyInView
        className="font-display text-6xl uppercase leading-none md:text-8xl"
      />
      <TextReveal
        text="Exploration is also part of our process, but you're lost."
        as="p"
        className="text-xl md:text-2xl"
      />
      <Link to="/">
        <StyledButton variant="solid" size="small">
          Back home
        </StyledButton>
      </Link>
    </main>
  );
}
