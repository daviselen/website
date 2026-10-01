import { Link } from "react-router-dom";
import HeadingReveal from "../design-system/components/HeadingReveal";
import TextReveal from "../design-system/components/TextReveal";
import StyledButton from "../design-system/components/Button.jsx";

// NavBar and Footer are not rendered here: Layout.jsx already mounts both
// around every route. Used both for the router's "*" catch-all and for a
// known route (e.g. /news/:slug) that can't resolve its own content, so it
// carries no route-specific copy.
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-start justify-center gap-600 bg-surface-default px-2 py-1800 font-narrow font-light text-neutral-0 md:px-8">
      <HeadingReveal
        text="404"
        as="h1"
        fullyInView
        className="font-display text-6xl uppercase leading-none md:text-8xl"
      />
      <TextReveal
        text="That page doesn't exist."
        as="p"
        className="text-lg md:text-xl"
      />
      <Link to="/">
        <StyledButton variant="solid" size="small">
          Back home
        </StyledButton>
      </Link>
    </main>
  );
}
