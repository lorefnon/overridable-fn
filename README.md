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

**Note:** fn returns a wrapped function - it does not modify the function passed to it. So after wrapping you must always invoke the wrapper returned by fn. 

```ts
const getUserByIdImpl = async (id: string) => { /* Get user from database */ }
const getUserById = fn(getUserByIdImpl) // getUserById is a wrapper which invokes getUserByIdImpl
getUserById.override(() => async (id: string) => { /* Return fake user */ })
getUserById() // Returns fake user
getUserByIdImpl() // Returns user from database, because wrapper is not used
```

You can access the wrapped function by using `unwrap`. Calling `unwrap` does not change the wrapper anyhow.

```ts
const getUserByIdImpl = async (id: string) => { /* Get user from database */ }
const getUserById = fn(getUserByIdImpl) // getUserById is a wrapper which invokes getUserByIdImpl
getUserById.unwrap() === getUserByIdImpl // true
getUserById.override(() => async (id: string) => { /* Return fake user */ })
getUserById.unwrap() === getUserByIdImpl // false
```

```ts
$ getUserById(10)
[WARN] Returning fake user
```

The handle returned from override has a restore function that can be used to restore the previous implementation. 

```ts
describe('Your feature', () => {
    let restore;

    before(() => {
        ({ restore } = getUserById.override((prevImpl) => async () => {
            // ... mock implementation
        }))
    })

    after(() => {
        restore?.()
    })

    test("use overriden impl", async () => {
        const fakeUser = await getUserById(10)
    })
})
```

Please note that the handle returned from the override is able to restore only to the implementation before the override.

```ts
const wrapper = fn(() => 1)
wrapper.override(() => () => 2)
const { restore } = wrapper.override(() => () => 3)
restore()
wrapper() // 2
restore() // Repeated calls to restore have no further effect
wrapper() // 2
```
