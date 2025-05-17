declare global {
	interface XMLHttpRequest {
		_interceptedURL?: string;
		_interceptedMethod?: string;
		_interceptedHeaders?: Record<string, string>;
		_modifiedHeaders?: Record<string, string>;
		_shouldIntercept?: boolean;
	}
}

export default defineContentScript({
	matches: ["*://*.hotstar.com/*"],
	runAt: "document_start",
	main() {
		console.log(
			"%c [ext] Content script is running on hotstar.com",
			"background: #2ecc71; color: white; padding: 5px; border-radius: 3px;",
		);

		const HEADER_NAME = "x-hs-client";
		const PATTERN_TO_REPLACE = /platform:web/g;
		const REPLACEMENT_VALUE = "platform:android";

		const shouldInterceptUrl = (url: string | URL): boolean => {
			let pathname = "";
			try {
				if (typeof url === "string") {
					const fullUrl = window.location.origin + url;
					pathname = new URL(fullUrl).pathname;
				} else {
					pathname = url.pathname;
				}

				return pathname.endsWith("/watch") || pathname.endsWith("/start");
			} catch (e) {
				console.error(e, url);
				return false;
			}
		};

		const modifyHeaderValue = (
			value: string,
		): { modified: boolean; value: string } => {
			const originalValue = value;
			const modifiedValue = value.replace(
				PATTERN_TO_REPLACE,
				REPLACEMENT_VALUE,
			);
			return {
				modified: originalValue !== modifiedValue,
				value: modifiedValue,
			};
		};

		const patchXMLHttpRequest = () => {
			const originalXHROpen = XMLHttpRequest.prototype.open;
			const originalXHRSetRequestHeader =
				XMLHttpRequest.prototype.setRequestHeader;
			const originalXHRSend = XMLHttpRequest.prototype.send;

			XMLHttpRequest.prototype.open = function (
				method: string,
				url: string | URL,
				async = true,
				username?: string | null,
				password?: string | null,
			) {
				this._interceptedURL = url.toString();
				this._interceptedMethod = method;
				this._interceptedHeaders = {};
				this._modifiedHeaders = {};
				this._shouldIntercept = shouldInterceptUrl(url);
				return originalXHROpen.call(
					this,
					method,
					url,
					async,
					username,
					password,
				);
			};

			XMLHttpRequest.prototype.setRequestHeader = function (
				name: string,
				value: string,
			) {
				if (!this._interceptedHeaders) this._interceptedHeaders = {};
				if (!this._modifiedHeaders) this._modifiedHeaders = {};

				this._interceptedHeaders[name] = value;

				if (this._shouldIntercept && name.toLowerCase() === HEADER_NAME) {
					const { modified, value: modifiedValue } = modifyHeaderValue(value);

					if (modified) {
						this._modifiedHeaders[name] = modifiedValue;
						return originalXHRSetRequestHeader.call(this, name, modifiedValue);
					}
				}

				return originalXHRSetRequestHeader.call(this, name, value);
			};

			XMLHttpRequest.prototype.send = function (
				body?: Document | XMLHttpRequestBodyInit | null,
			) {
				if (
					this._shouldIntercept &&
					this._modifiedHeaders &&
					Object.keys(this._modifiedHeaders).length > 0
				) {
					console.group(
						"%c XHR [INTERCEPTED]",
						"background: #9b59b6; color: white; padding: 3px; border-radius: 3px;",
					);
					console.log("%c URL:", "font-weight: bold;", this._interceptedURL);
					console.log(
						"%c Modified Headers:",
						"font-weight: bold; color: #e74c3c;",
					);
					console.table(this._modifiedHeaders);
					console.groupEnd();
				}

				return originalXHRSend.call(this, body);
			};
		};

		const createModifiedRequest = (
			request: Request,
			modifiedHeaders: Headers,
		): Request => {
			return new Request(request, {
				headers: modifiedHeaders,
				method: request.method,
				body: request.body,
				mode: request.mode,
				credentials: request.credentials,
				cache: request.cache,
				redirect: request.redirect,
				referrer: request.referrer,
				integrity: request.integrity,
			});
		};

		const processHeadersObject = (
			headerObj: Record<string, string>,
		): {
			headers: Record<string, string>;
			modified: Record<string, string>;
			isModified: boolean;
		} => {
			const newHeaders: Record<string, string> = {};
			const modifiedHeaders: Record<string, string> = {};
			let isModified = false;

			for (const key in headerObj) {
				if (key.toLowerCase() === HEADER_NAME) {
					const { modified, value } = modifyHeaderValue(headerObj[key]);

					newHeaders[key] = value;
					if (modified) {
						modifiedHeaders[key] = value;
						isModified = true;
					}
				} else {
					newHeaders[key] = headerObj[key];
				}
			}

			return { headers: newHeaders, modified: modifiedHeaders, isModified };
		};

		const processHeadersInstance = (
			headers: Headers,
		): {
			headers: Headers;
			modified: Record<string, string>;
			isModified: boolean;
		} => {
			const headerEntries: Record<string, string> = {};
			const modifiedHeaders: Record<string, string> = {};
			let isModified = false;

			headers.forEach((value, name) => {
				headerEntries[name] = value;
			});

			const newHeaders = new Headers();
			for (const [key, value] of Object.entries(headerEntries)) {
				if (key.toLowerCase() === HEADER_NAME) {
					const { modified, value: modifiedValue } = modifyHeaderValue(value);

					newHeaders.append(key, modifiedValue);
					if (modified) {
						modifiedHeaders[key] = modifiedValue;
						isModified = true;
					}
				} else {
					newHeaders.append(key, value);
				}
			}

			return { headers: newHeaders, modified: modifiedHeaders, isModified };
		};

		const patchFetch = () => {
			const originalFetch = window.fetch;

			window.fetch = (
				resource: RequestInfo | URL,
				init?: RequestInit,
			): Promise<Response> => {
				const url =
					resource instanceof Request ? resource.url : resource.toString();

				if (!shouldInterceptUrl(url)) {
					return originalFetch.call(window, resource, init);
				}

				const originalHeaders: Record<string, string> = {};
				const modifiedHeaders: Record<string, string> = {};
				let headersModified = false;
				let resourceToUse: RequestInfo | URL = resource;

				if (resource instanceof Request) {
					resource.headers.forEach((value, name) => {
						originalHeaders[name] = value;
					});

					if (resource.headers.has(HEADER_NAME)) {
						const {
							headers: newHeaders,
							modified,
							isModified,
						} = processHeadersInstance(resource.headers);

						if (isModified) {
							Object.assign(modifiedHeaders, modified);
							headersModified = true;
							resourceToUse = createModifiedRequest(resource, newHeaders);
						}
					}
				} else if (init?.headers) {
					if (init.headers instanceof Headers) {
						init.headers.forEach((value, name) => {
							originalHeaders[name] = value;
						});

						const {
							headers: newHeaders,
							modified,
							isModified,
						} = processHeadersInstance(init.headers);

						if (isModified) {
							Object.assign(modifiedHeaders, modified);
							headersModified = true;
							init.headers = newHeaders;
						}
					} else if (typeof init.headers === "object") {
						const headerObj = init.headers as Record<string, string>;
						Object.assign(originalHeaders, headerObj);

						const {
							headers: newHeaders,
							modified,
							isModified,
						} = processHeadersObject(headerObj);

						if (isModified) {
							Object.assign(modifiedHeaders, modified);
							headersModified = true;
							init.headers = newHeaders;
						}
					}
				}

				if (headersModified) {
					console.group(
						"%c Fetch [INTERCEPTED]",
						"background: #3498db; color: white; padding: 3px; border-radius: 3px;",
					);
					console.log("%c URL:", "font-weight: bold;", url);
					console.log("%c Original Headers:", "font-weight: bold;");
					console.table(originalHeaders);
					console.log(
						"%c Modified Headers:",
						"font-weight: bold; color: #e74c3c;",
					);
					console.table(modifiedHeaders);
					console.groupEnd();
				}

				return originalFetch.call(window, resourceToUse, init);
			};
		};

		patchXMLHttpRequest();
		patchFetch();

		console.log(
			"%c [ext] Header modification hooks installed successfully",
			"color: #2ecc71; font-weight: bold;",
		);
	},
});
