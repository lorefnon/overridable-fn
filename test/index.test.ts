import test from "node:test";
import assert from "node:assert";
import { fn } from "../dist/index.js";

test("Basic usage", () => {
    const originalImpl = (a: number, b: number) => a + b
    const computeSum = fn(originalImpl);
    assert.strictEqual(computeSum(1, 1), 2);
    const newImpl = () => 1 + 3;
    const { restore } = computeSum.override(() => newImpl);
    assert.strictEqual(computeSum(1, 1), 4);
    assert.strictEqual(computeSum.unwrap(), newImpl);
    restore()
    assert.strictEqual(computeSum(1, 1), 2);
    assert.strictEqual(computeSum.unwrap(), originalImpl);
});
