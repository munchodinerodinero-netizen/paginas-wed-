import { test } from "node:test";
import assert from "node:assert/strict";
import { touristRefundPercent } from "../src/lib/policies";

test("política moderada", () => {
  assert.equal(touristRefundPercent("MODERATE", 72), 100);
  assert.equal(touristRefundPercent("MODERATE", 30), 50);
  assert.equal(touristRefundPercent("MODERATE", 2), 0);
});

test("política flexible y estricta", () => {
  assert.equal(touristRefundPercent("FLEXIBLE", 24), 100);
  assert.equal(touristRefundPercent("FLEXIBLE", 23), 0);
  assert.equal(touristRefundPercent("STRICT", 200), 50);
  assert.equal(touristRefundPercent("STRICT", 100), 0);
});
