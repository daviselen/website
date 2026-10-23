import posthog, { isPostHogConfigured } from "./posthog.js";

const posthogLogger = {
  info(message, attributes) {
    if (isPostHogConfigured) {
      posthog.logger.info(message, attributes);
    }
  },
  error(message, attributes) {
    if (isPostHogConfigured) {
      posthog.logger.error(message, attributes);
    }
  },
};

export default posthogLogger;
