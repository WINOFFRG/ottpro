import {
  COOKIE_TRANSFER_VERSION,
  type ExportCookiesRequest,
  type ExportCookiesResponse,
  type ImportCookiesRequest,
  type ImportCookiesResponse,
  matchesCookieName,
  type SerializableCookie,
} from "@/lib/cookie-transfer";

function toAbsoluteUrl(url: string): URL {
  return new URL(url, "https://example.com");
}

function normalizeCookieDomain(domain: string): string {
  return domain.startsWith(".") ? domain.slice(1) : domain;
}

function toCookieSetUrl(cookie: SerializableCookie, fallbackUrl: URL): string {
  const scheme = cookie.secure ? "https:" : fallbackUrl.protocol;
  const hostname = cookie.domain
    ? normalizeCookieDomain(cookie.domain)
    : fallbackUrl.hostname;
  const rawPath = cookie.path || "/";
  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

  return `${scheme}//${hostname}${path}`;
}

export async function exportCookies(
  request: ExportCookiesRequest,
): Promise<ExportCookiesResponse> {
  const normalizedUrl = toAbsoluteUrl(request.url);
  const browserCookies = await browser.cookies.getAll({
    url: normalizedUrl.toString(),
  });

  const selectedCookies = browserCookies.filter((cookie) =>
    matchesCookieName(cookie.name, request.selector),
  );

  const payloadCookies: SerializableCookie[] = selectedCookies.map((cookie) => ({
    name: cookie.name,
    value: cookie.value,
    domain: cookie.domain,
    path: cookie.path,
    secure: cookie.secure,
    httpOnly: cookie.httpOnly,
    sameSite: cookie.sameSite,
    expirationDate: cookie.expirationDate,
    hostOnly: cookie.hostOnly,
    session: cookie.session,
  }));

  return {
    matchedCount: payloadCookies.length,
    payload: {
      version: COOKIE_TRANSFER_VERSION,
      sourceUrl: normalizedUrl.toString(),
      exportedAt: new Date().toISOString(),
      cookies: payloadCookies,
    },
  };
}

export async function importCookies(
  request: ImportCookiesRequest,
): Promise<ImportCookiesResponse> {
  const normalizedUrl = toAbsoluteUrl(request.url);
  const failedCookies: string[] = [];
  let importedCount = 0;

  for (const cookie of request.payload.cookies) {
    try {
      const setCookieDetails: Parameters<typeof browser.cookies.set>[0] = {
        url: toCookieSetUrl(cookie, normalizedUrl),
        name: cookie.name,
        value: cookie.value,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
      };

      if (!cookie.hostOnly && cookie.domain) {
        setCookieDetails.domain = cookie.domain;
      }

      if (typeof cookie.expirationDate === "number") {
        setCookieDetails.expirationDate = cookie.expirationDate;
      }

      if (cookie.sameSite) {
        setCookieDetails.sameSite = cookie.sameSite;
      }

      await browser.cookies.set(setCookieDetails);
      importedCount += 1;
    } catch {
      failedCookies.push(cookie.name);
    }
  }

  return {
    importedCount,
    failedCookies,
  };
}
