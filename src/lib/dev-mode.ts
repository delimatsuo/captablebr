/**
 * Centralized DEV_MODE feature flag.
 * All dev-mode checks should import from here.
 */

if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEV_AUTH === "true") {
  throw new Error(
    "FATAL: ENABLE_DEV_AUTH is set in production. This is a security misconfiguration. " +
    "Remove ENABLE_DEV_AUTH from your production environment variables."
  );
}

export const DEV_MODE =
  process.env.ENABLE_DEV_AUTH === "true" && process.env.NODE_ENV === "development";

export const DEV_USER_UID = "dev-user-001";
