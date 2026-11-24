export interface MapCache {
    delete(key: any): boolean;
    get(key: any): any;
    has(key: any): boolean;
    set(key: any, value: any): this;
    clear?(): void;
}

// Equivalent of lodash.memoize: caches by first argument
const memoize = <TArgs extends any[], TRet>(
    f: (...args: TArgs) => TRet
): ((...args: TArgs) => TRet) & { cache: MapCache } => {
    const memoized = function (this: any, ...args: TArgs): TRet {
        const key = args[0];
        const cache = memoized.cache;
        if (cache.has(key)) return cache.get(key);
        const result = f.apply(this, args);
        memoized.cache = cache.set(key, result) || cache;
        return result;
    } as ((...args: TArgs) => TRet) & { cache: MapCache };
    memoized.cache = new Map();
    return memoized;
};

const assign = Object.assign;

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
