import { env } from "./env.ts";

export const TWA_RETURN_URL = env("VITE_TWA_RETURN_URL");

export const SITE_URL =
	env("VITE_SITE_URL") ??
	(typeof window === "undefined" ? undefined : window.location.origin);
