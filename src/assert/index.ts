/**
 * Compile-time type assertions.
 *
 * Every assertion type in this module resolves to `true` when the assertion holds and to `never` when it doesn't. `never` is used as the failure
 * value because nothing is assignable to `never`, which turns a failed assertion into a compilation error at the point where it is consumed:
 *
 * ```ts
 * const _stringIsString: AssertTypeEquality<string, string> = true; // Compiles
 * const _stringIsNumber: AssertTypeEquality<string, number> = true; // Error: Type 'boolean' is not assignable to type 'never'
 * ```
 *
 * ... or, inline: `true satisfies AssertTypeEquality<string, string>`.
 *
 * An assertion must always be consumed by assigning `true` to it, never via a generic constraint: `never` satisfies every constraint
 * (`never extends true` is `true`), so a constraint such as `<T extends true>` cannot tell a passing assertion from a failing one.
 */

/**
 * Utility type: Checks if two types are identical, which is stricter than the two being mutually assignable
 *
 * TSC compares two deferred conditional types by the internal identity of their check types. That comparison distinguishes `any` from `unknown`,
 * leaves `never` usable on either side, and sees `readonly` and optional property modifiers - none of which plain assignability does.
 */
type _IsIdentical<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

/**
 * Utility type: Checks if a type is assignable to another type
 *
 * Both sides are wrapped into single element tuples to stop the conditional from distributing over a union in `A`. Unwrapped,
 * `'a' | 'b' extends 'a'` is evaluated once per union member and the failing `never` branches silently vanish from the resulting union,
 * reporting a union as assignable to its own member. Wrapping also keeps `never` and `any` on the left from short-circuiting.
 */
type _IsAssignable<A, B> = [A] extends [B] ? true : false;

/**
 * Assert that two types are equal
 *
 * Equality here means type identity, not mutual assignability: `{ a: string }` and `{ readonly a: string }` are assignable to each other but are
 * not equal, and neither are `any` and `unknown`.
 */
export type AssertTypeEquality<A, B> = _IsIdentical<A, B> extends true ? true : never;
/**
 * Assert that two types are not equal
 *
 * The exact dual of `AssertTypeEquality` - for any pair of types exactly one of the two resolves to `true`.
 */
export type AssertTypeInequality<A, B> = _IsIdentical<A, B> extends true ? never : true;

/**
 * Assert that a type is assignable to another type
 *
 * Assignability is directional and weaker than equality: every `A` equal to `B` is assignable to `B`, but not the other way around. `never` is
 * assignable to every type, and every type is assignable to `any` and to `unknown`.
 */
export type AssertTypeAssignable<A, B> = _IsAssignable<A, B> extends true ? true : never;
/**
 * Assert that a type is not assignable to another type
 *
 * The exact dual of `AssertTypeAssignable` - for any pair of types exactly one of the two resolves to `true`.
 */
export type AssertTypeUnassignable<A, B> = _IsAssignable<A, B> extends true ? never : true;
