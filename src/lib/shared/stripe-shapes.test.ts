import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  periodFromSubscription,
  planFromSubscriptionWithMap,
  priceIdFromSubscription,
  subscriptionIdFromInvoice,
} from "./stripe-shapes";

describe("stripe-shapes", () => {
  it("reads price and period from subscription items", () => {
    const sub = {
      id: "sub_1",
      metadata: {},
      items: {
        data: [
          {
            price: { id: "price_abc" },
            current_period_start: 1_700_000_000,
            current_period_end: 1_700_267_200,
          },
        ],
      },
    } as never;

    assert.equal(priceIdFromSubscription(sub), "price_abc");
    assert.deepEqual(periodFromSubscription(sub), {
      start: 1_700_000_000,
      end: 1_700_267_200,
    });
  });

  it("maps plan from price allowlist or metadata", () => {
    const sub = {
      id: "sub_1",
      metadata: { plan: "pro" },
      items: { data: [{ price: { id: "price_x" } }] },
    } as never;
    assert.equal(planFromSubscriptionWithMap(sub, { price_x: "starter" }), "starter");
    assert.equal(planFromSubscriptionWithMap(sub, {}), "pro");
  });

  it("extracts subscription id from invoice shapes", () => {
    assert.equal(
      subscriptionIdFromInvoice({
        parent: {
          type: "subscription_details",
          subscription_details: { subscription: "sub_xyz" },
        },
      } as never),
      "sub_xyz"
    );
    assert.equal(
      subscriptionIdFromInvoice({ subscription: "sub_legacy" } as never),
      "sub_legacy"
    );
  });
});
