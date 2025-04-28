import { hc } from "hono/client";
import type { AppType } from "@/types";

export const client = hc<AppType>("http://localhost:4000/", {
  fetch: ((input, init) => {
    return fetch(input, {
      ...init,
      credentials: "include",
    });
  }) satisfies typeof fetch,
});
