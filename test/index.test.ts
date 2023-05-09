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

test("Usage with memoization", () => {
    let execCount = 0;
    const originalImpl = (a: number, b: number) => {
        execCount += 1;
        return a + b;
    }
    const computeSum = fn.memo(originalImpl);
    let res = computeSum(1, 2)
    assert.strictEqual(res, 3);
    assert.strictEqual(execCount, 1);
    res = computeSum(1, 2)
    assert.strictEqual(execCount, 1);
    res = computeSum(2, 1)
    assert.strictEqual(execCount, 2);
    computeSum.cache.clear?.();
    res = computeSum(2, 1)
    assert.strictEqual(execCount, 3);
})
