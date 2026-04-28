import test from "node:test";
import assert from "node:assert/strict";
import { validateWaitlistEmail } from "@/lib/waitlist/validateWaitlistEmail";

test("rejects malformed email", () => {
  const result = validateWaitlistEmail("not-an-email");
  assert.equal(result.ok, false);
  assert.equal(result.errorCode, "INVALID_EMAIL");
});

test("normalizes and accepts valid email", () => {
  const result = validateWaitlistEmail("  Founder@Example.com  ");
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value, "founder@example.com");
});
