import type { MapCache } from "lodash";
import assign from "lodash.assign";
import memoize from "lodash.memoize";

export interface FnImpl<TArgs extends any[], TRet> {
    (...args: TArgs): TRet;
}

export interface WrappedFnImpl<TArgs extends any[], TRet> {
    (...args: TArgs): TRet;
    unwrap: () => FnImpl<TArgs, TRet>;
    override: (
        provideImpl: (curImpl: FnImpl<TArgs, TRet>) => FnImpl<TArgs, TRet>
    ) => {
        restore: () => void
    }
}

export interface MemoizedWrappedFnImpl<TArgs extends any[], TRet> extends WrappedFnImpl<TArgs, TRet> {
    cache: MapCache
}

const _fn = <TArgs extends any[], TRet>(
    defaultImpl: FnImpl<TArgs, TRet>
): WrappedFnImpl<TArgs, TRet> => {
    let impl = defaultImpl;

    const unwrap = () => impl;

    const override = (
        provideImpl: (curImpl: FnImpl<TArgs, TRet>) => FnImpl<TArgs, TRet>
    ) => {
        const curImpl = impl
        impl = provideImpl(curImpl);
        const restore = () => {
            impl = curImpl
        }
        return { restore }
    };

    const invoker: WrappedFnImpl<TArgs, TRet> = (...args) => {
        return impl(...args);
    };

    invoker.unwrap = unwrap;
    invoker.override = override;

    return invoker;
};


export const fn = assign(_fn, {
    memo: <TArgs extends any[], TRet>(defaultImpl: FnImpl<TArgs, TRet>): MemoizedWrappedFnImpl<TArgs, TRet> => {
        const memoized = memoize(defaultImpl) 
        return assign(fn(memoized), {
            get cache() {
                return memoized.cache;
            },
            set cache(cache: MapCache) {
                memoized.cache = cache;
            }
        })
    }
})
