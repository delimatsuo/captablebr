export async function register() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEV_AUTH === "true") {
    throw new Error(
      "FATAL: ENABLE_DEV_AUTH is set in production. " +
      "Remove ENABLE_DEV_AUTH from your production environment variables."
    );
  }
}
