import assert from "node:assert/strict";

import { hashAdminPassword, verifyAdminPassword } from "../src/lib/admin-auth/password";
import {
  extractLocaleFromPathname,
  isAdminLoginPath,
  isAdminProtectedPath,
  isAdminRoutePath,
} from "../src/lib/admin-auth/path-utils";

async function run() {
  const hash = await hashAdminPassword("test-password-123");
  assert.equal(await verifyAdminPassword("test-password-123", hash), true);
  assert.equal(await verifyAdminPassword("wrong-password", hash), false);

  assert.equal(isAdminRoutePath("/en/admin"), true);
  assert.equal(isAdminLoginPath("/en/admin/login"), true);
  assert.equal(isAdminProtectedPath("/en/admin/login"), false);
  assert.equal(isAdminProtectedPath("/en/admin"), true);
  assert.equal(isAdminProtectedPath("/en/admin/bookings"), true);
  assert.equal(isAdminRoutePath("/booking"), false);
  assert.equal(extractLocaleFromPathname("/mt/admin"), "mt");

  console.log("Admin auth verification checks passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
