import { env } from "@/config/env";
import { getCustomerToken } from "@/features/auth/customerSession";

export class ApiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(status: number, details: unknown) {
    super("API request failed (" + status + ")");
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/** Authentication and endpoint contracts must be agreed with the Laravel team. */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T | undefined> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  const token = getCustomerToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", "Bearer " + token);
  }
  if (typeof options.body === "string" && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  const response = await fetch(env.apiBaseUrl + "/" + path.replace(/^\//, ""), {
    ...options,
    headers,
  });
  const text = await response.text();
  let data: unknown = text || undefined;
  if (
    text &&
    response.headers.get("content-type")?.includes("application/json")
  )
    data = JSON.parse(text);
  if (!response.ok) throw new ApiError(response.status, data);
  return data as T | undefined;
}
