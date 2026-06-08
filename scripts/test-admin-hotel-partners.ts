/**
 * Admin hotel partner creation with optional initial code.
 *
 * Run: npm run test:admin-hotel-partners
 *
 * Manual test checklist:
 * 1. Sign in as admin and open /{locale}/admin/hotels/new — header shows "Create Hotel".
 * 2. Sidebar shows "Hotels" and "Hotel Codes" (no partner wording).
 * 3. Create hotel only (leave initial code blank) — hotel appears in list with 0 codes.
 * 4. Create hotel with initial code + discount — hotel shows 1 code; code appears on /admin/hotel-codes.
 * 5. Try duplicate initial code — form shows clear duplicate error; hotel is not created.
 * 6. Create inactive hotel with active initial code — blocked with inactive-hotel message.
 * 7. Create inactive hotel with inactive initial code — hotel and code saved inactive.
 * 8. Enter code without discount — client blocks before submit.
 * 9. Enter discount outside 0–100 — client blocks before submit.
 * 10. Booking form shows "Hotel Code" and summary shows "Hotel discount" (no partner wording).
 */
import "dotenv/config";
import assert from "node:assert/strict";

import {
  adminHotelPartnerCreateSchema,
  createAdminHotelPartner,
} from "../src/lib/admin/hotel-partners";
import { DuplicateHotelCodeError } from "../src/lib/admin/hotel-codes";
import { prisma } from "../src/lib/prisma";

const testSuffix = String(Date.now()).slice(-8);
const testPrefix = `HP${testSuffix}`;

async function cleanup(partnerIds: string[]) {
  for (const partnerId of partnerIds) {
    await prisma.hotelCode.deleteMany({ where: { hotelPartnerId: partnerId } }).catch(() => undefined);
    await prisma.hotelPartner.deleteMany({ where: { id: partnerId } }).catch(() => undefined);
  }
}

async function run() {
  const createdPartnerIds: string[] = [];

  try {
    const partnerOnlyPayload = {
      name: `${testPrefix} Partner Only`,
      isActive: true,
    };
    const partnerOnlyParsed = adminHotelPartnerCreateSchema.safeParse(partnerOnlyPayload);
    assert.equal(partnerOnlyParsed.success, true, "partner-only payload should pass schema");

    const partnerOnly = await createAdminHotelPartner(partnerOnlyParsed.data!);
    createdPartnerIds.push(partnerOnly.partner.id);
    assert.equal(partnerOnly.partner.hotelCodeCount, 0);
    assert.equal(partnerOnly.initialCode, undefined);

    const withCodePayload = {
      name: `${testPrefix} With Code`,
      isActive: true,
      initialCode: {
        code: ` ${testPrefix}-CODE `.toLowerCase(),
        discountPercent: 12.5,
        isActive: true,
      },
    };
    const withCodeParsed = adminHotelPartnerCreateSchema.safeParse(withCodePayload);
    assert.equal(withCodeParsed.success, true, "partner with initial code should pass schema");
    const expectedCode = `${testPrefix}-CODE`.toUpperCase();
    if (withCodeParsed.success) {
      assert.equal(withCodeParsed.data.initialCode?.code, expectedCode);
    }

    const withCode = await createAdminHotelPartner(withCodeParsed.data!);
    createdPartnerIds.push(withCode.partner.id);
    assert.ok(withCode.initialCode);
    assert.equal(withCode.initialCode.code, expectedCode);
    assert.equal(withCode.partner.hotelCodeCount, 1);

    const duplicateParsed = adminHotelPartnerCreateSchema.safeParse({
      name: `${testPrefix} Duplicate`,
      isActive: true,
      initialCode: {
        code: expectedCode,
        discountPercent: 5,
        isActive: true,
      },
    });
    assert.equal(duplicateParsed.success, true);

    let duplicateBlocked = false;
    try {
      await createAdminHotelPartner(duplicateParsed.data!);
    } catch (error) {
      duplicateBlocked = error instanceof DuplicateHotelCodeError;
    }
    assert.equal(duplicateBlocked, true, "duplicate initial code should throw DuplicateHotelCodeError");

    const inactivePartnerActiveCode = adminHotelPartnerCreateSchema.safeParse({
      name: `${testPrefix} Inactive Partner`,
      isActive: false,
      initialCode: {
        code: `${testPrefix}-INA`,
        discountPercent: 10,
        isActive: true,
      },
    });
    assert.equal(inactivePartnerActiveCode.success, false, "active code on inactive partner should fail schema");

    const inactiveBothParsed = adminHotelPartnerCreateSchema.safeParse({
      name: `${testPrefix} Inactive Both`,
      isActive: false,
      initialCode: {
        code: `${testPrefix}-INB`,
        discountPercent: 10,
        isActive: false,
      },
    });
    assert.equal(inactiveBothParsed.success, true);
    const inactiveBoth = await createAdminHotelPartner(inactiveBothParsed.data!);
    createdPartnerIds.push(inactiveBoth.partner.id);
    assert.equal(inactiveBoth.partner.isActive, false);
    assert.equal(inactiveBoth.initialCode?.isActive, false);

    const missingDiscount = adminHotelPartnerCreateSchema.safeParse({
      name: `${testPrefix} Missing Discount`,
      isActive: true,
      initialCode: {
        code: `${testPrefix}-ND`,
        discountPercent: "",
        isActive: true,
      },
    });
    assert.equal(missingDiscount.success, false, "initial code without discount should fail schema");

    const outOfRangeDiscount = adminHotelPartnerCreateSchema.safeParse({
      name: `${testPrefix} Bad Discount`,
      isActive: true,
      initialCode: {
        code: `${testPrefix}-BD`,
        discountPercent: 150,
        isActive: true,
      },
    });
    assert.equal(outOfRangeDiscount.success, false, "discount above 100 should fail schema");

    const emptyCodeIgnored = adminHotelPartnerCreateSchema.safeParse({
      name: `${testPrefix} Empty Code`,
      isActive: true,
      initialCode: {
        code: "   ",
        discountPercent: 10,
        isActive: true,
      },
    });
    assert.equal(emptyCodeIgnored.success, true);
    if (emptyCodeIgnored.success) {
      assert.equal(emptyCodeIgnored.data.initialCode, undefined);
    }

    const emptyCodePartner = await createAdminHotelPartner(emptyCodeIgnored.data!);
    createdPartnerIds.push(emptyCodePartner.partner.id);
    assert.equal(emptyCodePartner.initialCode, undefined);
    assert.equal(emptyCodePartner.partner.hotelCodeCount, 0);

    console.log("Admin hotel partner + initial code checks passed.");
  } finally {
    await cleanup(createdPartnerIds);
    await prisma.$disconnect();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
