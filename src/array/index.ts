/**
 * Array and tuple utility types.
 *
 * Every type in this module accepts both mutable and `readonly` arrays and tuples, and distributes over a union of them - `ArrayHead<[1] | [2, 3]>`
 * is `1 | 2`, and every type resolves to `never` for `never`:
 *
 * ```ts
 * type Head = ArrayHead<readonly ['a', 'b']>; // 'a'
 * type Tail = ArrayTail<readonly ['a', 'b']>; // readonly ['b']
 * type Empty = ArrayIsEmpty<[]>; // true
 * ```
 *
 * Fixed length tuples resolve to exact answers. Plain arrays and tuples with optional or rest elements resolve to what can be known about them
 * statically: `string[]` may or may not be empty, so `ArrayIsEmpty<string[]>` is `boolean` and `ArrayHead<string[]>` is `string | undefined`.
 *
 * A type that has no element to resolve to - the head or the tail of an empty tuple - resolves to `never`.
 */

/**
 * Utility type: Gets a result array type, made `readonly` if the source array type is `readonly`
 *
 * Inferring the rest of a tuple through `readonly [unknown, ...infer TRest]` always infers a mutable `TRest`, even when matching a `readonly` tuple.
 */
type _PreserveReadonly<TArray extends readonly unknown[], TResult extends readonly unknown[]> = TArray extends unknown[] ? TResult : Readonly<TResult>;

/**
 * Utility type: Checks if an array type is empty
 *
 * Resolves to `true` for an empty tuple, to `false` for a tuple with at least one required element, and to `boolean` for an array type which may
 * or may not be empty - a plain array like `string[]`, or a tuple made of only optional elements like `[1?]`. A union of an empty and a
 * non-empty tuple resolves to `boolean` as well.
 */
export type ArrayIsEmpty<TArray extends readonly unknown[]> = TArray extends readonly []
  ? true
  : TArray extends readonly [unknown, ...unknown[]] | readonly [...unknown[], unknown]
    ? false
    : boolean;

/**
 * Utility type: Gets the type of the first element of an array type
 *
 * Resolves to `never` for an empty tuple. For an array type whose first element may not exist - a plain array like `string[]`, or a tuple
 * starting with an optional element like `[1?, 2?]` - resolves to the element type joined with `undefined`, which is what reading index `0` yields
 * at runtime. For a tuple starting with a rest element like `[...string[], 1]` resolves to the union of all its element types.
 *
 * Note that the head of `[never]` is `never` too, and is indistinguishable from the head of `[]`.
 */
export type ArrayHead<TArray extends readonly unknown[]> = TArray extends readonly []
  ? never
  : TArray extends readonly [infer THead, ...unknown[]]
    ? THead
    : TArray extends readonly [...unknown[], unknown]
      ? TArray[number]
      : TArray[0] | undefined;

/**
 * Utility type: Gets an array type of all the elements of an array type except the first one
 *
 * Resolves to `never` for an empty tuple, and preserves the `readonly` modifier and element labels of the source array type. The tail of a plain
 * array is the same plain array, and the tail of a tuple starting with an optional element is the rest of the tuple.
 *
 * The tail of a tuple starting with a rest element like `[...string[], 1]` is widened to a plain array of all its element types,
 * `(string | 1)[]`, because the exact tail is a union of tuples that grows with every trailing element.
 */
export type ArrayTail<TArray extends readonly unknown[]> = TArray extends readonly []
  ? never
  : TArray extends readonly [unknown, ...infer TRest]
    ? _PreserveReadonly<TArray, TRest>
    : TArray extends readonly [...unknown[], unknown]
      ? _PreserveReadonly<TArray, Array<TArray[number]>>
      : TArray extends readonly [unknown?, ...infer TRest]
        ? _PreserveReadonly<TArray, TRest>
        : never;
