import { PostHog } from "posthog-node";

const posthogKey = process.env.POSTHOG_PROJECT_TOKEN;
const posthogHost = process.env.POSTHOG_HOST;
const missingVariable = !posthogKey
  ? "POSTHOG_PROJECT_TOKEN"
  : !posthogHost
    ? "POSTHOG_HOST"
    : null;

if (missingVariable && process.env.NODE_ENV === "development") {
  throw new Error(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
  );
}

const posthog = missingVariable
  ? null
  : new PostHog(posthogKey, {
      host: posthogHost,
      enableExceptionAutocapture: true,
    });

async function captureServerException(error) {
  if (!posthog) return;

  try {
    await posthog.captureExceptionImmediate(error);
  } catch (captureError) {
    console.error("PostHog exception capture failed:", captureError);
  }
}

export { captureServerException, posthog };
