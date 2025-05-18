import { hc } from "hono/client";
import type { AppType } from "@/types";

const API_BASE_URL = typeof window !== "undefined" && window.location.origin.includes("localhost")
  ? "http://localhost:4000/"
  : (import.meta.env.VITE_BETTER_AUTH_URL || window.location.origin + "/");

export const client = hc<AppType>(API_BASE_URL, {
  fetch: ((input, init) => {
    return fetch(input, {
      ...init,
      credentials: "include",
    });
  }) satisfies typeof fetch,
});
