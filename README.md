# overridable-fn

Create functions whose behavior can be swapped out dynamically.

Intended to be a lightweight less-intrusive alternative to IoC containers.

Let's say you have this function: 

```ts
const getUserById = async (id: string) => {
    // ... fetch users from database
}
```

Now if you just wrap this function with fn: 

```ts
import { fn } from "overridable-fn"

const getUserById = fn(async (id: string) => {
    // ... fetch users from database
})
```

The behavior of `getUserById` remains unchanged

```ts
getUserById(10) //-> fetches users from database
```

However, you can now override the implementation (eg. in tests)

```ts
getUserById.override((prevImpl) => async (id: string) => {
    console.log('[WARN] Returning fake user')
    return new User({ id })
})
```

So if you call `getUserById()` now, your overriden implementation be invoked instead.

```ts
$ getUserById(10)
[WARN] Returning fake user
```
