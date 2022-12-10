import test from "node:test";
import assert from "node:assert";
import { fn } from "../dist/index.js";

test("Basic usage", () => {
    const computeSum = fn(() => 1 + 1);
    assert.strictEqual(computeSum(), 2);
    const newImpl = () => 1 + 3;
    computeSum.override(() => newImpl);
    assert.strictEqual(computeSum(), 4);
    assert.strictEqual(computeSum.unwrap(), newImpl);
});
