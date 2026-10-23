import posthog from "posthog-js";

const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST;
const missingVariable = !posthogKey
  ? "VITE_POSTHOG_KEY"
  : !posthogHost
    ? "VITE_POSTHOG_HOST"
    : null;
const isPostHogConfigured = !missingVariable;

if (missingVariable) {
  if (import.meta.env.DEV) {
    throw new Error(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`
    );
  }
} else {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    defaults: "2026-05-30",
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
    },
    logs: {
      serviceName: "davis-elen-website",
      environment: import.meta.env.MODE,
    },
  });
}

export { isPostHogConfigured };
export default posthog;
