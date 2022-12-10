interface FnImpl<TArgs extends any[], TRet> {
    (...args: TArgs): TRet;
}

interface WrappedFnImpl<TArgs extends any[], TRet> {
    (...args: TArgs): TRet;
    unwrap: () => FnImpl<TArgs, TRet>;
    override: (
        provideImpl: (curImpl: FnImpl<TArgs, TRet>) => FnImpl<TArgs, TRet>
    ) => WrappedFnImpl<TArgs, TRet>;
}

export const fn = <TArgs extends any[], TRet>(
    defaultImpl: FnImpl<TArgs, TRet>
): WrappedFnImpl<TArgs, TRet> => {
    let impl = defaultImpl;

    const unwrap = () => impl;

    const override = (
        provideImpl: (curImpl: FnImpl<TArgs, TRet>) => FnImpl<TArgs, TRet>
    ) => {
        impl = provideImpl(impl);
        return invoker;
    };

    const invoker: WrappedFnImpl<TArgs, TRet> = (...args) => {
        return impl(...args);
    };
    invoker.unwrap = unwrap;
    invoker.override = override;

    return invoker;
};
