// Static crash UI. Deliberately no GSAP, router or design-system imports: it
// renders when those may be what broke, and with the global timeline paused a
// TextReveal would sit invisible. Plain <a> on purpose — a full load is the
// recovery.
export default function ErrorPage({ chunk = false }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-surface-default px-300 pb-1000 pt-1200 text-center font-narrow font-light text-neutral-0 light:bg-neutral-0 light:text-neutral-1000 md:pt-1600">
      <h1 className="text-fluid-xl uppercase md:text-4xl">
        {chunk ? "Couldn’t load this page" : "Something went wrong"}
      </h1>
      <p className="max-w-xs text-fluid-md md:max-w-xl md:text-4xl">
        {chunk
          ? "The site was updated or your connection dropped."
          : "We hit an unexpected error."}
      </p>
      <div className="flex flex-wrap justify-center gap-200">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="flex items-center border border-current px-400 py-200 uppercase"
        >
          Reload
        </button>
        <a href="/" className="flex items-center border border-current px-400 py-200 uppercase">
          Back home
        </a>
      </div>
    </main>
  );
}
