import { describe, it, expect } from 'vitest';
import type { AssertTypeEquality, AssertTypeAssignable } from '../assert/index';
import type { ObjectIsEmpty, ObjectKeys, ObjectValues } from './index';

/**
 * Every utility type is tested by asserting its result with `AssertTypeEquality`, which resolves to `true` when it holds and to `never` when it
 * doesn't, so `true satisfies <assertion>` compiles only while the assertion holds. The assertions are therefore checked by TSC (the `types`
 * vitest project), while the `expect()` wrapping them only makes each one show up as a regular expectation when the same file is executed by the
 * `unit` vitest project.
 *
 * Results that are expected not to hold are marked with `@ts-expect-error`, which TSC reports as an error of its own when unused - so both a
 * correct result that starts being wrong and a wrong result that starts being reported as correct break the build.
 *
 * The order of the elements of `ObjectKeys` and `ObjectValues` is unspecified, so exact tuples are only ever asserted for object types with a
 * single key. Object types with more keys are asserted through the union of their elements, their length, and the alignment of values with keys.
 */

const symbol = Symbol();

type Mixed = { a: 'A'; b?: 'B'; readonly 0: 'Z'; [symbol]: 'S' };
interface Interface {
  x: 'X';
  y: 'Y';
}
type Large = { [TKey in `key${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}${0 | 1}`]: TKey };

describe('object', () => {
  describe('ObjectIsEmpty<TObject>', () => {
    it('Resolves to `true` for an object type with no known keys', () => {
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<{}>, true>).toBe(true);
      // `object` has no known keys either
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<object>, true>).toBe(true);
    });

    it('Resolves to `false` for an object type with at least one required property', () => {
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<{ a: 1 }>, false>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<{ readonly a: 1 }>, false>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<{ a?: 1; b: 2 }>, false>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<{ a: undefined }>, false>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<{ a: never }>, false>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<Mixed>, false>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<Interface>, false>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<Record<'a', 1>>, false>).toBe(true);
    });

    it('Resolves to `false` for an object type with an index signature and at least one required property', () => {
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<{ [key: string]: 1; a: 1 }>, false>).toBe(true);
    });

    it('Resolves to `boolean` for an object type which may or may not be empty', () => {
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<{ a?: 1 }>, boolean>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<Partial<Interface>>, boolean>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<Record<string, 1>>, boolean>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<{ [key: string]: 1 }>, boolean>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<Record<string, never>>, boolean>).toBe(true);
      // @ts-expect-error an object type of only optional properties is not known to be non-empty
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<{ a?: 1 }>, false>).toBe(true);
      // @ts-expect-error ... nor is it known to be empty
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<{ a?: 1 }>, true>).toBe(true);
      // @ts-expect-error an object type with an index signature is not known to be non-empty
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<Record<string, 1>>, false>).toBe(true);
    });

    it('Distributes over a union of object types', () => {
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<{ a: 1 } | { b: 2 }>, false>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<{} | { a: 1 }>, boolean>).toBe(true);
      // @ts-expect-error a union of an empty and a non-empty object type is not known to be non-empty
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<{} | { a: 1 }>, false>).toBe(true);
    });

    it('Resolves to `never` for `never`, and to `boolean` for `any`', () => {
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<never>, never>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<any>, boolean>).toBe(true);
      // @ts-expect-error `never` is not an empty object type
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<never>, true>).toBe(true);
    });
  });

  describe('ObjectKeys<TObject>', () => {
    it('Gets a tuple of the key of an object type with a single key', () => {
      expect(true satisfies AssertTypeEquality<ObjectKeys<{ a: 1 }>, ['a']>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectKeys<{ 0: 1 }>, [0]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectKeys<{ [symbol]: 1 }>, [typeof symbol]>).toBe(true);
      // @ts-expect-error the keys are a tuple, not a union
      expect(true satisfies AssertTypeEquality<ObjectKeys<{ a: 1 }>, 'a'>).toBe(true);
    });

    it('Gets a tuple of all the keys of an object type', () => {
      expect(true satisfies AssertTypeEquality<ObjectKeys<Mixed>[number], 'a' | 'b' | 0 | typeof symbol>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectKeys<Mixed>['length'], 4>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectKeys<Interface>[number], 'x' | 'y'>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectKeys<Interface>['length'], 2>).toBe(true);
    });

    it('Includes the keys of optional and `readonly` properties', () => {
      expect(true satisfies AssertTypeEquality<ObjectKeys<{ a?: 1 }>, ['a']>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectKeys<{ readonly a: 1 }>, ['a']>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectKeys<Partial<Interface>>[number], 'x' | 'y'>).toBe(true);
    });

    it('Resolves to an empty tuple for an object type with no known keys', () => {
      expect(true satisfies AssertTypeEquality<ObjectKeys<{}>, []>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectKeys<object>, []>).toBe(true);
      // @ts-expect-error an object type with no known keys has an empty tuple of keys, not none
      expect(true satisfies AssertTypeEquality<ObjectKeys<{}>, never>).toBe(true);
    });

    it('Gets the key type of an index signature', () => {
      expect(true satisfies AssertTypeEquality<ObjectKeys<Record<string, 1>>, [string]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectKeys<Record<number, 1>>, [number]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectKeys<{ [key: `id-${string}`]: 1 }>, [`id-${string}`]>).toBe(true);
      // TSC reports the keys of a written out `string` index signature as `string | number`
      expect(true satisfies AssertTypeEquality<ObjectKeys<{ [key: string]: 1 }>[number], string | number>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectKeys<{ [key: string]: 1 }>['length'], 2>).toBe(true);
    });

    it('Gets all the keys of an object type with many keys', () => {
      expect(true satisfies AssertTypeEquality<ObjectKeys<Large>['length'], 200>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectKeys<Large>[number], keyof Large>).toBe(true);
    });

    it('Distributes over a union of object types', () => {
      expect(true satisfies AssertTypeEquality<ObjectKeys<{ a: 1 } | { b: 2 }>, ['a'] | ['b']>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectKeys<{} | { a: 1 }>, [] | ['a']>).toBe(true);
      // @ts-expect-error the keys of a union are not the keys common to all of its members
      expect(true satisfies AssertTypeEquality<ObjectKeys<{ a: 1 } | { b: 2 }>, []>).toBe(true);
    });

    it('Resolves to `never` for `never`, and to a tuple of property keys for `any`', () => {
      expect(true satisfies AssertTypeEquality<ObjectKeys<never>, never>).toBe(true);
      expect(true satisfies AssertTypeAssignable<ObjectKeys<any>, PropertyKey[]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectKeys<any>[number], string | number | symbol>).toBe(true);
    });
  });

  describe('ObjectValues<TObject>', () => {
    it('Gets a tuple of the value of an object type with a single key', () => {
      expect(true satisfies AssertTypeEquality<ObjectValues<{ a: 1 }>, [1]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectValues<{ readonly a: 1 }>, [1]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectValues<{ [symbol]: 1 }>, [1]>).toBe(true);
      // @ts-expect-error the values are a tuple, not a union
      expect(true satisfies AssertTypeEquality<ObjectValues<{ a: 1 }>, 1>).toBe(true);
    });

    it('Gets a tuple of all the values of an object type', () => {
      expect(true satisfies AssertTypeEquality<ObjectValues<Mixed>[number], 'A' | 'B' | undefined | 'Z' | 'S'>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectValues<Mixed>['length'], 4>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectValues<Interface>[number], 'X' | 'Y'>).toBe(true);
    });

    it('Joins the type of an optional property with `undefined`', () => {
      expect(true satisfies AssertTypeEquality<ObjectValues<{ a?: 1 }>, [1 | undefined]>).toBe(true);
      // @ts-expect-error an optional property may hold `undefined`
      expect(true satisfies AssertTypeEquality<ObjectValues<{ a?: 1 }>, [1]>).toBe(true);
    });

    it('Resolves to an empty tuple for an object type with no known keys', () => {
      expect(true satisfies AssertTypeEquality<ObjectValues<{}>, []>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectValues<object>, []>).toBe(true);
    });

    it('Gets the value type of an index signature', () => {
      expect(true satisfies AssertTypeEquality<ObjectValues<Record<string, 1>>, [1]>).toBe(true);
      // One value for each of the `string` and `number` keys TSC reports for a written out `string` index signature
      expect(true satisfies AssertTypeEquality<ObjectValues<{ [key: string]: 1 }>, [1, 1]>).toBe(true);
    });

    it('Gets all the values of an object type with many keys', () => {
      expect(true satisfies AssertTypeEquality<ObjectValues<Large>['length'], 200>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectValues<Large>[number], keyof Large>).toBe(true);
    });

    it('Distributes over a union of object types', () => {
      expect(true satisfies AssertTypeEquality<ObjectValues<{ a: 1 } | { b: 2 }>, [1] | [2]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectValues<{} | { a: 1 }>, [] | [1]>).toBe(true);
    });

    it('Resolves to `never` for `never`, and to an array type for `any`', () => {
      expect(true satisfies AssertTypeEquality<ObjectValues<never>, never>).toBe(true);
      expect(true satisfies AssertTypeAssignable<ObjectValues<any>, unknown[]>).toBe(true);
    });
  });

  describe('Relationships between the utility types', () => {
    it('Resolves to empty keys and values exactly when the object type is empty', () => {
      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<{}>, true>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectKeys<{}>, []>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectValues<{}>, []>).toBe(true);

      expect(true satisfies AssertTypeEquality<ObjectIsEmpty<{ a?: 1 }>, boolean>).toBe(true);
      // @ts-expect-error ... so an object type which may be empty still has keys
      expect(true satisfies AssertTypeEquality<ObjectKeys<{ a?: 1 }>, []>).toBe(true);
    });

    it('Gets as many values as there are keys', () => {
      expect(true satisfies AssertTypeEquality<ObjectValues<Mixed>['length'], ObjectKeys<Mixed>['length']>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectValues<Large>['length'], ObjectKeys<Large>['length']>).toBe(true);
    });

    it('Aligns every value with the key at the same index', () => {
      expect(true satisfies AssertTypeEquality<ObjectValues<Mixed>[0], Mixed[ObjectKeys<Mixed>[0]]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectValues<Mixed>[1], Mixed[ObjectKeys<Mixed>[1]]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectValues<Mixed>[2], Mixed[ObjectKeys<Mixed>[2]]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectValues<Mixed>[3], Mixed[ObjectKeys<Mixed>[3]]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectValues<Interface>[0], Interface[ObjectKeys<Interface>[0]]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectValues<Interface>[1], Interface[ObjectKeys<Interface>[1]]>).toBe(true);
      // The values of `Large` are its own keys, so every value is equal to the key at the same index
      expect(true satisfies AssertTypeEquality<ObjectValues<Large>[0], ObjectKeys<Large>[0]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjectValues<Large>[199], ObjectKeys<Large>[199]>).toBe(true);
      // @ts-expect-error a value is not aligned with the key at a different index
      expect(true satisfies AssertTypeEquality<ObjectValues<Interface>[0], Interface[ObjectKeys<Interface>[1]]>).toBe(true);
    });
  });
});
