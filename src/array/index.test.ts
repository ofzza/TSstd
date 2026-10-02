import { describe, it, expect } from 'vitest';
import type { AssertTypeEquality, AssertTypeAssignable } from '../assert/index';
import type { ArrayIsEmpty, ArrayHead, ArrayTail } from './index';

/**
 * Every utility type is tested by asserting its result with `AssertTypeEquality`, which resolves to `true` when it holds and to `never` when it
 * doesn't, so `true satisfies <assertion>` compiles only while the assertion holds. The assertions are therefore checked by TSC (the `types`
 * vitest project), while the `expect()` wrapping them only makes each one show up as a regular expectation when the same file is executed by the
 * `unit` vitest project.
 *
 * Results that are expected not to hold are marked with `@ts-expect-error`, which TSC reports as an error of its own when unused - so both a
 * correct result that starts being wrong and a wrong result that starts being reported as correct break the build.
 */

type Tuple = [1, 2, 3];
type ReadonlyTuple = readonly [1, 2, 3];

describe('array', () => {
  describe('ArrayIsEmpty<TArray>', () => {
    it('Resolves to `true` for an empty tuple', () => {
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<[]>, true>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<readonly []>, true>).toBe(true);
    });

    it('Resolves to `false` for a tuple with at least one required element', () => {
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<[1]>, false>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<Tuple>, false>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<ReadonlyTuple>, false>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<[a: 1, b: 2]>, false>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<[undefined]>, false>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<[never]>, false>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<[1, 2?]>, false>).toBe(true);
    });

    it('Resolves to `false` for a tuple with a rest element and at least one required element', () => {
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<[1, ...string[]]>, false>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<[...string[], 1]>, false>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<[1, ...string[], 2]>, false>).toBe(true);
    });

    it('Resolves to `boolean` for an array type which may or may not be empty', () => {
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<string[]>, boolean>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<readonly string[]>, boolean>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<never[]>, boolean>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<[1?]>, boolean>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<[1?, ...string[]]>, boolean>).toBe(true);
      // @ts-expect-error a plain array is not known to be non-empty
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<string[]>, false>).toBe(true);
      // @ts-expect-error a tuple of only optional elements is not known to be non-empty
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<[1?]>, false>).toBe(true);
    });

    it('Distributes over a union of array types', () => {
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<[] | readonly []>, true>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<[1] | [2, 3]>, false>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<[] | [1]>, boolean>).toBe(true);
      // @ts-expect-error a union of an empty and a non-empty tuple is not known to be non-empty
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<[] | [1]>, false>).toBe(true);
    });

    it('Resolves to `never` for `never`, and to `boolean` for `any`', () => {
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<never>, never>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<any>, boolean>).toBe(true);
      // @ts-expect-error `never` is not an empty array type
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<never>, true>).toBe(true);
    });
  });

  describe('ArrayHead<TArray>', () => {
    it('Gets the first element type of a tuple', () => {
      expect(true satisfies AssertTypeEquality<ArrayHead<[1]>, 1>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayHead<Tuple>, 1>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayHead<[a: 1, b: 2]>, 1>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayHead<[undefined]>, undefined>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayHead<[1, 2?]>, 1>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayHead<[1, ...string[]]>, 1>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayHead<[1, ...string[], 2]>, 1>).toBe(true);
    });

    it('Gets the first element type of a readonly tuple', () => {
      expect(true satisfies AssertTypeEquality<ArrayHead<ReadonlyTuple>, 1>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayHead<readonly ['a', 'b']>, 'a'>).toBe(true);
    });

    it('Resolves to `never` for an empty tuple', () => {
      expect(true satisfies AssertTypeEquality<ArrayHead<[]>, never>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayHead<readonly []>, never>).toBe(true);
      // `[never]` has a head, but it is `never` too and indistinguishable from the head of `[]`
      expect(true satisfies AssertTypeEquality<ArrayHead<[never]>, never>).toBe(true);
    });

    it('Joins the element type with `undefined` when the first element may not exist', () => {
      expect(true satisfies AssertTypeEquality<ArrayHead<string[]>, string | undefined>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayHead<readonly string[]>, string | undefined>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayHead<[1?, 2?]>, 1 | undefined>).toBe(true);
      // @ts-expect-error a tuple starting with an optional element has a head
      expect(true satisfies AssertTypeEquality<ArrayHead<[1?, 2?]>, never>).toBe(true);
      // @ts-expect-error a plain array may be empty, so its head may be `undefined`
      expect(true satisfies AssertTypeEquality<ArrayHead<string[]>, string>).toBe(true);
    });

    it('Gets the union of all element types for a tuple starting with a rest element', () => {
      expect(true satisfies AssertTypeEquality<ArrayHead<[...string[], 1]>, string | 1>).toBe(true);
      // @ts-expect-error a tuple starting with a rest element and ending with a required one is never empty
      expect(true satisfies AssertTypeEquality<ArrayHead<[...string[], 1]>, string | 1 | undefined>).toBe(true);
    });

    it('Distributes over a union of array types', () => {
      expect(true satisfies AssertTypeEquality<ArrayHead<[1] | [2, 3]>, 1 | 2>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayHead<[] | [1]>, 1>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayHead<[1] | readonly [2]>, 1 | 2>).toBe(true);
    });

    it('Resolves to `never` for `never`, and to `any` for `any`', () => {
      expect(true satisfies AssertTypeEquality<ArrayHead<never>, never>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayHead<any>, any>).toBe(true);
    });
  });

  describe('ArrayTail<TArray>', () => {
    it('Gets all but the first element of a tuple', () => {
      expect(true satisfies AssertTypeEquality<ArrayTail<[1]>, []>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayTail<Tuple>, [2, 3]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayTail<[undefined, undefined]>, [undefined]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayTail<[1, 2?]>, [2?]>).toBe(true);
    });

    it('Preserves element labels', () => {
      expect(true satisfies AssertTypeEquality<ArrayTail<[a: 1, b: 2]>, [b: 2]>).toBe(true);
    });

    it('Preserves the `readonly` modifier', () => {
      expect(true satisfies AssertTypeEquality<ArrayTail<ReadonlyTuple>, readonly [2, 3]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayTail<readonly [1]>, readonly []>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayTail<readonly string[]>, readonly string[]>).toBe(true);
      // @ts-expect-error the tail of a readonly tuple is not mutable
      expect(true satisfies AssertTypeEquality<ArrayTail<ReadonlyTuple>, [2, 3]>).toBe(true);
      // @ts-expect-error ... and the tail of a mutable tuple is not readonly
      expect(true satisfies AssertTypeEquality<ArrayTail<Tuple>, readonly [2, 3]>).toBe(true);
    });

    it('Resolves to `never` for an empty tuple', () => {
      expect(true satisfies AssertTypeEquality<ArrayTail<[]>, never>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayTail<readonly []>, never>).toBe(true);
      // @ts-expect-error an empty tuple has no tail, not an empty one
      expect(true satisfies AssertTypeEquality<ArrayTail<[]>, []>).toBe(true);
    });

    it('Gets the rest of a tuple starting with an optional element', () => {
      expect(true satisfies AssertTypeEquality<ArrayTail<[1?, 2?]>, [2?]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayTail<[1?]>, []>).toBe(true);
      // @ts-expect-error a tuple starting with an optional element has a tail
      expect(true satisfies AssertTypeEquality<ArrayTail<[1?, 2?]>, never>).toBe(true);
    });

    it('Gets the same plain array for a plain array', () => {
      expect(true satisfies AssertTypeEquality<ArrayTail<string[]>, string[]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayTail<never[]>, never[]>).toBe(true);
    });

    it('Gets the rest of a tuple with a rest element', () => {
      expect(true satisfies AssertTypeEquality<ArrayTail<[1, ...string[]]>, string[]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayTail<[1, ...string[], 2]>, [...string[], 2]>).toBe(true);
      // A tuple starting with a rest element is widened to a plain array of all its element types
      expect(true satisfies AssertTypeEquality<ArrayTail<[...string[], 1]>, (string | 1)[]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayTail<readonly [...string[], 1]>, readonly (string | 1)[]>).toBe(true);
    });

    it('Distributes over a union of array types', () => {
      expect(true satisfies AssertTypeEquality<ArrayTail<[1] | [2, 3]>, [] | [3]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayTail<[] | [1, 2]>, [2]>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayTail<[1, 2] | readonly [3, 4]>, [2] | readonly [4]>).toBe(true);
    });

    it('Resolves to `never` for `never`, and to an array type for `any`', () => {
      expect(true satisfies AssertTypeEquality<ArrayTail<never>, never>).toBe(true);
      expect(true satisfies AssertTypeAssignable<ArrayTail<any>, readonly unknown[]>).toBe(true);
    });
  });

  describe('Relationships between the utility types', () => {
    it('Resolves the head to `never` exactly when the array type is empty', () => {
      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<[]>, true>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayHead<[]>, never>).toBe(true);
      expect(true satisfies AssertTypeEquality<ArrayTail<[]>, never>).toBe(true);

      expect(true satisfies AssertTypeEquality<ArrayIsEmpty<[1?]>, boolean>).toBe(true);
      // @ts-expect-error ... so an array type which may be empty still has a head
      expect(true satisfies AssertTypeEquality<ArrayHead<[1?]>, never>).toBe(true);
    });

    it('Reconstructs a tuple from its head and tail', () => {
      expect(true satisfies AssertTypeEquality<[ArrayHead<[1]>, ...ArrayTail<[1]>], [1]>).toBe(true);
      expect(true satisfies AssertTypeEquality<[ArrayHead<Tuple>, ...ArrayTail<Tuple>], Tuple>).toBe(true);
      expect(true satisfies AssertTypeEquality<[ArrayHead<[1, ...string[]]>, ...ArrayTail<[1, ...string[]]>], [1, ...string[]]>).toBe(true);
    });
  });
});
