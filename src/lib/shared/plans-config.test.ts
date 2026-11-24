import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_PLAN_MINUTES,
  isPaidSubscriptionStatus,
  normalizePlanId,
  remainingSeconds,
  resolveIncludedMinutes,
  validatePriceAllowlist,
} from "./plans-config";

describe("plans-config", () => {
  it("normalizes plan ids", () => {
    assert.equal(normalizePlanId("Starter"), "starter");
    assert.equal(normalizePlanId("PRO"), "pro");
    assert.equal(normalizePlanId("nope"), null);
  });

  it("uses safer default minutes", () => {
    assert.equal(DEFAULT_PLAN_MINUTES.starter, 100);
    assert.equal(DEFAULT_PLAN_MINUTES.growth, 300);
    assert.equal(DEFAULT_PLAN_MINUTES.pro, 1000);
  });

  it("allows env overrides for minutes", () => {
    assert.equal(resolveIncludedMinutes("growth", { growth: 500 }), 500);
  });

  it("validates price allowlist", () => {
    const allowed = {
      price_starter: "starter" as const,
      price_growth: "growth" as const,
    };
    assert.equal(validatePriceAllowlist("price_starter", allowed), "starter");
    assert.equal(validatePriceAllowlist("price_evil", allowed), null);
  });

  it("gates paid statuses", () => {
    assert.equal(isPaidSubscriptionStatus("active"), true);
    assert.equal(isPaidSubscriptionStatus("trialing"), true);
    assert.equal(isPaidSubscriptionStatus("past_due"), false);
    assert.equal(isPaidSubscriptionStatus("canceled"), false);
  });

  it("computes remaining seconds without going negative", () => {
    assert.equal(
      remainingSeconds({
        includedSeconds: 100,
        usedSeconds: 80,
        reservedSeconds: 30,
      }),
      0
    );
    assert.equal(
      remainingSeconds({
        includedSeconds: 6000,
        usedSeconds: 1000,
        reservedSeconds: 500,
      }),
      4500
    );
  });
});
