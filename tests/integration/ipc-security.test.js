const { describe, expect, test } = require("bun:test");
const { isAllowedNavigation, isTrustedIpcSender } = require("../../electron/security.cjs");

const allowedOrigins = new Set(["http://localhost:3000", "http://127.0.0.1:43821"]);

describe("Electron IPC and navigation security", () => {
  test("accepts a main-frame sender from the local application origin", () => {
    const event = {
      senderFrame: {
        isMainFrame: true,
        url: "http://localhost:3000/projects",
      },
    };

    expect(isTrustedIpcSender(event, allowedOrigins)).toBe(true);
  });

  test("rejects subframes and foreign origins", () => {
    expect(
      isTrustedIpcSender(
        { senderFrame: { isMainFrame: false, url: "http://localhost:3000/iframe" } },
        allowedOrigins,
      ),
    ).toBe(false);
    expect(
      isTrustedIpcSender(
        { senderFrame: { isMainFrame: true, url: "https://example.com/" } },
        allowedOrigins,
      ),
    ).toBe(false);
  });

  test("rejects missing or malformed sender frames", () => {
    expect(isTrustedIpcSender({}, allowedOrigins)).toBe(false);
    expect(isTrustedIpcSender({ senderFrame: { isMainFrame: true, url: "not a URL" } }, allowedOrigins)).toBe(false);
  });

  test("allows internal navigation and rejects external navigation", () => {
    expect(isAllowedNavigation("http://127.0.0.1:43821/settings", "http://127.0.0.1:43821")).toBe(true);
    expect(isAllowedNavigation("https://example.com", "http://127.0.0.1:43821")).toBe(false);
    expect(isAllowedNavigation("javascript:alert(1)", "http://127.0.0.1:43821")).toBe(false);
  });
});
