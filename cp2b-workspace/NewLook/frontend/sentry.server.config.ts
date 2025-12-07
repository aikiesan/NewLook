import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set environment based on NODE_ENV
  environment: process.env.NODE_ENV || "development",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Filter out certain errors
  ignoreErrors: [
    // Random network errors
    "NetworkError",
    "Network request failed",
    // Database connection timeouts (often transient)
    "ECONNREFUSED",
    "ETIMEDOUT",
  ],

  beforeSend(event, hint) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === "development" && !process.env.SENTRY_DEBUG) {
      return null;
    }
    return event;
  },
});
