function isTrustedIpcSender(event, allowedOrigins) {
  const frame = event?.senderFrame;
  if (!frame || frame.isMainFrame !== true || typeof frame.url !== "string") {
    return false;
  }

  try {
    return allowedOrigins.has(new URL(frame.url).origin);
  } catch {
    return false;
  }
}

function isAllowedNavigation(targetUrl, appOrigin) {
  try {
    return new URL(targetUrl).origin === appOrigin;
  } catch {
    return false;
  }
}

module.exports = { isAllowedNavigation, isTrustedIpcSender };
