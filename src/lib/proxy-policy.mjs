const uuid =
  "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";
const routes = {
  GET: [
    /^demand(?:\/contacts)?$/,
    /^(me|status|catalog|knowledge|contacts|followup)$/,
    new RegExp(`^(conversations|contacts)/${uuid}$`),
  ],
  POST: [
    /^(conversations|contacts)$/,
    /^logout$/,
    /^openings$/,
    new RegExp(`^conversations/${uuid}/(messages|control|reply)$`),
    new RegExp(`^contacts/${uuid}/(notes|tasks)$`),
    new RegExp(`^subscriptions/${uuid}/cancel$`),
    new RegExp(`^turns/${uuid}/retry$`),
  ],
  PATCH: [
    new RegExp(`^(contacts|interests|tasks)/${uuid}$`),
    new RegExp(`^contacts/${uuid}/stage$`),
  ],
};
export function allowedRoute(method, segments) {
  if (
    !Array.isArray(segments) ||
    segments.some((s) => typeof s !== "string" || !s || /[/.%?#\\]/.test(s))
  )
    return false;
  return (routes[method] ?? []).some((r) => r.test(segments.join("/")));
}
export function validOrigin(origin, expected) {
  return typeof origin === "string" && origin === expected;
}
export function sessionValue(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value)
    ? value
    : null;
}

export function backendPath(method, segments, url) {
  const path = segments.join("/");
  return (
    path +
    (method === "GET" && segments[0] === "demand" ? new URL(url).search : "")
  );
}
