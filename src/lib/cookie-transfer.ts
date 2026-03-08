export const COOKIE_TRANSFER_VERSION = 1;

export type CookieSameSite =
  | "no_restriction"
  | "lax"
  | "strict"
  | "unspecified";

export interface CookieNameSelector {
  exact?: string[];
  startsWith?: string[];
}

export interface SerializableCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite?: CookieSameSite;
  expirationDate?: number;
  hostOnly?: boolean;
  session?: boolean;
}

export interface CookieTransferPayload {
  version: number;
  sourceUrl: string;
  exportedAt: string;
  cookies: SerializableCookie[];
}

export interface ExportCookiesRequest {
  url: string;
  selector?: CookieNameSelector;
}

export interface ExportCookiesResponse {
  payload: CookieTransferPayload;
  matchedCount: number;
}

export interface ImportCookiesRequest {
  url: string;
  payload: CookieTransferPayload;
}

export interface ImportCookiesResponse {
  importedCount: number;
  failedCookies: string[];
}

function toBase64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function fromBase64Utf8(value: string): string {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new TextDecoder().decode(bytes);
}

const VALID_SAME_SITE: Set<CookieSameSite> = new Set([
  "no_restriction",
  "lax",
  "strict",
  "unspecified",
]);

export function matchesCookieName(
  cookieName: string,
  selector?: CookieNameSelector,
): boolean {
  if (!selector) {
    return true;
  }

  const exactMatches = selector.exact ?? [];
  const startsWithMatches = selector.startsWith ?? [];

  if (exactMatches.includes(cookieName)) {
    return true;
  }

  return startsWithMatches.some((prefix) => cookieName.startsWith(prefix));
}

export function encodeCookieTransferPayload(
  payload: CookieTransferPayload,
): string {
  return toBase64Utf8(JSON.stringify(payload));
}

export function decodeCookieTransferPayload(
  rawValue: string,
): CookieTransferPayload {
  const normalizedValue = rawValue.trim();
  let decodedPayload = normalizedValue;

  // Backward compatibility: older exports were plain JSON.
  if (!normalizedValue.startsWith("{")) {
    decodedPayload = fromBase64Utf8(normalizedValue);
  }

  const parsed = JSON.parse(decodedPayload) as Partial<CookieTransferPayload>;

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !Array.isArray(parsed.cookies) ||
    typeof parsed.sourceUrl !== "string" ||
    typeof parsed.exportedAt !== "string"
  ) {
    throw new Error("Invalid cookie payload format");
  }

  if (
    typeof parsed.version !== "number" ||
    parsed.version !== COOKIE_TRANSFER_VERSION
  ) {
    throw new Error("Unsupported cookie payload version");
  }

  for (const cookie of parsed.cookies) {
    const sameSite = (cookie as Partial<SerializableCookie>).sameSite;
    const expirationDate = (cookie as Partial<SerializableCookie>).expirationDate;
    const hostOnly = (cookie as Partial<SerializableCookie>).hostOnly;
    const session = (cookie as Partial<SerializableCookie>).session;

    if (
      !cookie ||
      typeof cookie !== "object" ||
      typeof cookie.name !== "string" ||
      typeof cookie.value !== "string" ||
      typeof cookie.domain !== "string" ||
      typeof cookie.path !== "string" ||
      typeof cookie.secure !== "boolean" ||
      typeof cookie.httpOnly !== "boolean" ||
      (sameSite !== undefined &&
        (typeof sameSite !== "string" ||
          !VALID_SAME_SITE.has(sameSite as CookieSameSite))) ||
      (expirationDate !== undefined && typeof expirationDate !== "number") ||
      (hostOnly !== undefined && typeof hostOnly !== "boolean") ||
      (session !== undefined && typeof session !== "boolean")
    ) {
      throw new Error("Invalid cookie entry in payload");
    }
  }

  return parsed as CookieTransferPayload;
}
