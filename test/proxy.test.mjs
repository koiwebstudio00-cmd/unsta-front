import test from "node:test";
import assert from "node:assert/strict";
import {
  allowedRoute,
  validOrigin,
  sessionValue,
  backendPath,
} from "../src/lib/proxy-policy.mjs";
const id = "9786c860-f624-4aac-ad79-debf01308897";
test("proxy permits only evaluator routes and expected methods", () => {
  for (const path of [
    "me",
    "status",
    "catalog",
    "knowledge",
    "contacts",
    "followup",
    `conversations/${id}`,
    `contacts/${id}`,
  ])
    assert.equal(allowedRoute("GET", path.split("/")), true, path);
  for (const path of [
    "conversations",
    "logout",
    "openings",
    `conversations/${id}/messages`,
    `conversations/${id}/control`,
    `conversations/${id}/reply`,
    `contacts/${id}/notes`,
    `contacts/${id}/tasks`,
    `turns/${id}/retry`,
    `subscriptions/${id}/cancel`,
  ])
    assert.equal(allowedRoute("POST", path.split("/")), true, path);
  for (const path of [
    "agent",
    "auth/accept-invite",
    "../agent",
    "contacts/%2e%2e",
    `conversations/${id}/claim`,
    "https://evil.example",
    "contacts?admin=true",
  ])
    assert.equal(allowedRoute("POST", path.split("/")), false, path);
  assert.equal(allowedRoute("DELETE", ["contacts", id]), false);
  assert.equal(allowedRoute("GET", ["openings"]), false);
});
test("writes require exact panel origin", () => {
  assert.equal(
    validOrigin("http://localhost:3000", "http://localhost:3000"),
    true,
  );
  for (const origin of [
    null,
    "null",
    "http://localhost:3000.evil.test",
    "https://localhost:3000",
    "http://localhost:3001",
  ])
    assert.equal(validOrigin(origin, "http://localhost:3000"), false);
});
test("CRM routes allow creation and stage changes only through their methods", () => {
  assert.equal(allowedRoute("POST", ["contacts"]), true);
  assert.equal(allowedRoute("PATCH", ["contacts", id, "stage"]), true);
  for (const method of ["GET", "POST", "DELETE"])
    assert.equal(allowedRoute(method, ["contacts", id, "stage"]), false);
  assert.equal(allowedRoute("PATCH", ["contacts", "invalid", "stage"]), false);
});
test("cookie values cannot inject backend headers", () => {
  assert.equal(sessionValue("a".repeat(64)), "a".repeat(64));
  for (const value of [
    null,
    "a".repeat(63),
    "a".repeat(64) + "; admin=1",
    "a\r\nOrigin: evil",
  ])
    assert.equal(sessionValue(value), null);
});

test("demand routes preserve filters through the panel proxy", () => {
  for (const path of [["demand"], ["demand", "contacts"]]) {
    assert.equal(allowedRoute("GET", path), true);
    assert.equal(allowedRoute("POST", path), false);
  }
  const query =
    "?days=30&sede=central&kind=cursos&proposal_id=curso-social-media&pending=true";
  assert.equal(
    backendPath(
      "GET",
      ["demand", "contacts"],
      "http://localhost/api/demo/demand/contacts" + query,
    ),
    "demand/contacts" + query,
  );
  assert.equal(
    backendPath(
      "GET",
      ["contacts"],
      "http://localhost/api/demo/contacts?admin=true",
    ),
    "contacts",
  );
  assert.equal(allowedRoute("GET", ["demand", "contacts", "extra"]), false);
});
