export async function register() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEV_AUTH === "true") {
    throw new Error(
      "FATAL: ENABLE_DEV_AUTH is set in production. " +
      "Remove ENABLE_DEV_AUTH from your production environment variables."
    );
  }

  // Crash handlers — catch silent deaths on Cloud Run
  process.on("uncaughtException", (err) => {
    console.error("[FATAL] Uncaught exception:", err);
    setTimeout(() => process.exit(1), 500);
  });
  process.on("unhandledRejection", (reason) => {
    console.error("[FATAL] Unhandled rejection:", reason);
    setTimeout(() => process.exit(1), 500);
  });
  process.on("SIGTERM", () => {
    console.log("[INFO] Received SIGTERM — shutting down gracefully");
    setTimeout(() => process.exit(0), 500);
  });
}
