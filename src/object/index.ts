/**
 * Object utility types.
 *
 * Every type in this module accepts any object type - object literal types, interfaces, mapped types and records - and distributes over a union
 * of them - `ObjectKeys<{ a: 1 } | { b: 2 }>` is `['a'] | ['b']`, and every type resolves to `never` for `never`:
 *
 * ```ts
 * type Keys = ObjectKeys<{ a: 1 }>; // ['a']
 * type Values = ObjectValues<{ a: 1 }>; // [1]
 * type Empty = ObjectIsEmpty<{}>; // true
 * ```
 *
 * Keys and values are resolved to tuples. The order of their elements is unspecified - TSC orders the members of a union by the order in which
 * it happened to create them, not by declaration order - but `ObjectValues` is always index aligned with `ObjectKeys`: the value at any index is
 * the type of the property whose key is at the same index.
 */

/**
 * Utility type: Gets the intersection of all the members of a union type
 *
 * Each member is placed into a contravariant (parameter) position, and inferring a single type from all of those positions infers their
 * intersection.
 */
type _UnionToIntersection<TUnion> = (TUnion extends unknown ? (arg: TUnion) => void : never) extends (arg: infer TIntersection) => void ? TIntersection : never;

/**
 * Utility type: Gets one of the members of a union type
 *
 * Inferring a return type from an intersection of function types infers it from the last overload only, which picks out a single member of the
 * union. Which member is picked is decided by TSC's internal ordering of the union, not by the order the members were written in.
 */
type _UnionLast<TUnion> = _UnionToIntersection<TUnion extends unknown ? () => TUnion : never> extends () => infer TLast ? TLast : never;

/**
 * Utility type: Gets a tuple type of all the members of a union type, in an unspecified order
 *
 * Written tail recursively, with the tuple accumulated in `TResult`, so that TSC allows it to recurse through unions of up to about a thousand
 * members instead of failing with "Type instantiation is excessively deep" after a few dozen.
 */
type _UnionToTuple<TUnion, TResult extends unknown[] = []> = [TUnion] extends [never]
  ? TResult
  : _UnionToTuple<Exclude<TUnion, _UnionLast<TUnion>>, [_UnionLast<TUnion>, ...TResult]>;

/**
 * Utility type: Gets a tuple type of the types of the properties of an object type, whose keys are listed in a tuple type
 */
type _ObjectValuesOf<TObject extends object, TKeys extends readonly unknown[]> = { [TIndex in keyof TKeys]: TObject[TKeys[TIndex] & keyof TObject] };

/**
 * Utility type: Checks if an object type is empty
 *
 * Resolves to `true` for an object type with no known keys like `{}`, to `false` for an object type with at least one required property, and to
 * `boolean` for an object type which may or may not be empty - one made of only optional properties like `{ a?: 1 }`, or one with an index
 * signature like `Record<string, number>`. A union of an empty and a non-empty object type resolves to `boolean` as well.
 *
 * Note that `object` has no known keys either, and resolves to `true` just like `{}`.
 */
export type ObjectIsEmpty<TObject extends object> = TObject extends unknown
  ? [keyof TObject] extends [never]
    ? true
    : {} extends TObject
      ? boolean
      : false
  : never;

/**
 * Utility type: Gets a tuple type of all the keys of an object type
 *
 * Includes string, number and symbol keys, and optional and `readonly` properties alike. Resolves to an empty tuple for an object type with no
 * known keys. The order of the keys is unspecified.
 *
 * An index signature contributes its key type rather than a literal key. Note that TSC reports the keys of a written out `string` index
 * signature as `string | number`, so `ObjectKeys<{ [key: string]: 1 }>` holds both a `string` and a `number` element, while the keys of the
 * mapped `Record<string, 1>` are just `string`, and `ObjectKeys<Record<string, 1>>` is `[string]`.
 */
export type ObjectKeys<TObject extends object> = TObject extends unknown ? _UnionToTuple<keyof TObject> : never;

/**
 * Utility type: Gets a tuple type of the types of all the properties of an object type
 *
 * The values are index aligned with `ObjectKeys` - the value at any index is the type of the property whose key is at the same index of
 * `ObjectKeys<TObject>`. The type of an optional property is joined with `undefined`. Resolves to an empty tuple for an object type with no
 * known keys.
 */
export type ObjectValues<TObject extends object> = TObject extends unknown ? _ObjectValuesOf<TObject, ObjectKeys<TObject>> : never;
