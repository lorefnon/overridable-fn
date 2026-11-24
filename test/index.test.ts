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


test("Memoized cache can be replaced", () => {
    let execCount = 0;
    const double = fn.memo((a: number) => {
        execCount += 1;
        return a * 2;
    });
    double(1);
    double(1);
    assert.strictEqual(execCount, 1);

    const newCache = new Map();
    double.cache = newCache;
    assert.strictEqual(double.cache, newCache);
    assert.strictEqual(newCache.size, 0);

    double(1);
    assert.strictEqual(execCount, 2);
    assert.strictEqual(newCache.size, 1);
    double(1);
    assert.strictEqual(execCount, 2);
})


test("Overrides of memoized functions are memoized", () => {
    let origCount = 0;
    let overrideCount = 0;
    const double = fn.memo((a: number) => {
        origCount += 1;
        return a * 2;
    });
    assert.strictEqual(double(2), 4);
    assert.strictEqual(origCount, 1);

    const { restore } = double.override(() => (a: number) => {
        overrideCount += 1;
        return a * 3;
    });
    assert.strictEqual(double(2), 6);
    assert.strictEqual(double(2), 6);
    assert.strictEqual(overrideCount, 1);
    assert.strictEqual(double.cache.has(2), true);
    assert.strictEqual(double.cache.get(2), 6);

    restore();
    assert.strictEqual(double(2), 4);
    assert.strictEqual(origCount, 1);
    assert.strictEqual(overrideCount, 1);
})


test("Nested overrides of memoized functions keep separate caches", () => {
    let origCount = 0;
    let overrideCount = 0;
    const inc = fn.memo((a: number) => {
        origCount += 1;
        return a + 1;
    });
    inc(1);
    const first = inc.override((cur) => (a: number) => {
        overrideCount += 1;
        return cur(a) * 10;
    });
    assert.strictEqual(inc(1), 20);
    assert.strictEqual(inc(1), 20);
    assert.strictEqual(overrideCount, 1);
    // previous impl is memoized and reuses its cached result
    assert.strictEqual(origCount, 1);

    const second = inc.override(() => (a: number) => a + 100);
    assert.strictEqual(inc(1), 101);
    second.restore();
    assert.strictEqual(inc(1), 20);
    first.restore();
    assert.strictEqual(inc(1), 2);
    assert.strictEqual(origCount, 1);
})
