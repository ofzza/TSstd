import { describe, it, expect } from 'vitest';
import type { AssertTypeEquality, AssertTypeInequality, AssertTypeAssignable, AssertTypeUnassignable } from './index';

/**
 * Every assertion type resolves to `true` when it holds and to `never` when it doesn't, so `true satisfies <assertion>` compiles only while the
 * assertion holds. The assertions are therefore checked by TSC (the `types` vitest project), while the `expect()` wrapping them only makes each
 * one show up as a regular expectation when the same file is executed by the `unit` vitest project.
 *
 * Assertions that are expected not to hold are marked with `@ts-expect-error`, which TSC reports as an error of its own when unused - so both a
 * passing assertion that starts failing and a failing assertion that starts passing break the build.
 *
 * Note that an assertion can only ever be consumed by assigning `true` to it, never through a generic constraint: `never extends true` is `true`,
 * so a constraint is satisfied by a failed assertion just as much as by a passing one.
 */

type AliasedString = string;
type ObjA = { a: string };
type ObjADuplicate = { a: string };
interface ObjAInterface {
  a: string;
}
type ObjAB = { a: string; b: number };
type ObjAReadonly = { readonly a: string };
type ObjAOptional = { a?: string };
type ObjAUndefinable = { a: string | undefined };

describe('assert', () => {
  describe('AssertTypeEquality<A, B>', () => {
    it('Holds for identical primitive types', () => {
      expect(true satisfies AssertTypeEquality<string, string>).toBe(true);
      expect(true satisfies AssertTypeEquality<number, number>).toBe(true);
      expect(true satisfies AssertTypeEquality<boolean, boolean>).toBe(true);
      expect(true satisfies AssertTypeEquality<bigint, bigint>).toBe(true);
      expect(true satisfies AssertTypeEquality<symbol, symbol>).toBe(true);
      expect(true satisfies AssertTypeEquality<object, object>).toBe(true);
      expect(true satisfies AssertTypeEquality<null, null>).toBe(true);
      expect(true satisfies AssertTypeEquality<undefined, undefined>).toBe(true);
      expect(true satisfies AssertTypeEquality<void, void>).toBe(true);
    });

    it('Holds for identical literal types', () => {
      expect(true satisfies AssertTypeEquality<'a', 'a'>).toBe(true);
      expect(true satisfies AssertTypeEquality<1, 1>).toBe(true);
      expect(true satisfies AssertTypeEquality<1n, 1n>).toBe(true);
      expect(true satisfies AssertTypeEquality<true, true>).toBe(true);
    });

    it('Holds for `any`, `unknown` and `never` compared to themselves', () => {
      expect(true satisfies AssertTypeEquality<any, any>).toBe(true);
      expect(true satisfies AssertTypeEquality<unknown, unknown>).toBe(true);
      // Mutual assignability cannot express this one - a distributive conditional over `never` resolves to `never` before it ever compares anything
      expect(true satisfies AssertTypeEquality<never, never>).toBe(true);
    });

    it('Holds through aliases, interfaces and mapped types, which are all transparent to type identity', () => {
      expect(true satisfies AssertTypeEquality<AliasedString, string>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjA, ObjADuplicate>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjA, ObjAInterface>).toBe(true);
      expect(true satisfies AssertTypeEquality<string[], Array<string>>).toBe(true);
      expect(true satisfies AssertTypeEquality<Readonly<ObjA>, ObjAReadonly>).toBe(true);
      expect(true satisfies AssertTypeEquality<Partial<ObjA>, ObjAOptional>).toBe(true);
    });

    it('Holds for unions regardless of member order or duplication', () => {
      expect(true satisfies AssertTypeEquality<'a' | 'b', 'b' | 'a'>).toBe(true);
      expect(true satisfies AssertTypeEquality<string | number, number | string>).toBe(true);
      expect(true satisfies AssertTypeEquality<'a' | 'a', 'a'>).toBe(true);
    });

    it('Holds for identical composite types', () => {
      expect(true satisfies AssertTypeEquality<[string, number], [string, number]>).toBe(true);
      expect(true satisfies AssertTypeEquality<(a: string) => void, (a: string) => void>).toBe(true);
      expect(true satisfies AssertTypeEquality<ObjA & { b: number }, ObjA & { b: number }>).toBe(true);
    });

    it('Does not hold for different primitive types', () => {
      // @ts-expect-error `string` and `number` are not equal
      expect(true satisfies AssertTypeEquality<string, number>).toBe(true);
      // @ts-expect-error `null` and `undefined` are not equal
      expect(true satisfies AssertTypeEquality<null, undefined>).toBe(true);
      // @ts-expect-error `void` and `undefined` are not equal, even though `undefined` is assignable to `void`
      expect(true satisfies AssertTypeEquality<void, undefined>).toBe(true);
    });

    it('Does not hold for a literal type and the type it widens to', () => {
      // @ts-expect-error `'a'` and `string` are not equal
      expect(true satisfies AssertTypeEquality<'a', string>).toBe(true);
      // @ts-expect-error `1` and `number` are not equal
      expect(true satisfies AssertTypeEquality<1, number>).toBe(true);
      // @ts-expect-error `true` and `boolean` are not equal
      expect(true satisfies AssertTypeEquality<true, boolean>).toBe(true);
    });

    it('Does not hold between `any`, `unknown`, `never` and any other type', () => {
      // @ts-expect-error `any` and `unknown` are not equal, even though they are mutually assignable
      expect(true satisfies AssertTypeEquality<any, unknown>).toBe(true);
      // @ts-expect-error `any` is not equal to a concrete type, even though it is assignable in both directions
      expect(true satisfies AssertTypeEquality<any, string>).toBe(true);
      // @ts-expect-error `any` and `never` are not equal
      expect(true satisfies AssertTypeEquality<any, never>).toBe(true);
      // @ts-expect-error `unknown` and a concrete type are not equal
      expect(true satisfies AssertTypeEquality<unknown, string>).toBe(true);
      // @ts-expect-error `never` and a concrete type are not equal
      expect(true satisfies AssertTypeEquality<never, string>).toBe(true);
    });

    it('Does not hold for a union and one of its own members', () => {
      // @ts-expect-error a union is not equal to one of its members - a distributive conditional would wrongly report that it is
      expect(true satisfies AssertTypeEquality<'a' | 'b', 'a'>).toBe(true);
      // @ts-expect-error `boolean` is the union `true | false`, so it is not equal to `true`
      expect(true satisfies AssertTypeEquality<boolean, true>).toBe(true);
      // @ts-expect-error overlapping unions that are not the same union
      expect(true satisfies AssertTypeEquality<'a' | 'b', 'b' | 'c'>).toBe(true);
    });

    it('Does not hold for types differing only by a property modifier, which assignability cannot see', () => {
      // @ts-expect-error a `readonly` property makes the two types distinct
      expect(true satisfies AssertTypeEquality<ObjA, ObjAReadonly>).toBe(true);
      // @ts-expect-error an optional property is not the same as a required property accepting `undefined`
      expect(true satisfies AssertTypeEquality<ObjAOptional, ObjAUndefinable>).toBe(true);
    });

    it('Does not hold for structurally different composite types', () => {
      // @ts-expect-error a wider object type is not equal to a narrower one
      expect(true satisfies AssertTypeEquality<ObjA, ObjAB>).toBe(true);
      // @ts-expect-error a tuple is not equal to an array of the same element type
      expect(true satisfies AssertTypeEquality<[string], string[]>).toBe(true);
      // @ts-expect-error an unreduced intersection is not identical to the equivalent single object type
      expect(true satisfies AssertTypeEquality<ObjA & { b: number }, ObjAB>).toBe(true);
    });
  });

  describe('AssertTypeInequality<A, B>', () => {
    it('Holds for different primitive and literal types', () => {
      expect(true satisfies AssertTypeInequality<string, number>).toBe(true);
      expect(true satisfies AssertTypeInequality<null, undefined>).toBe(true);
      expect(true satisfies AssertTypeInequality<void, undefined>).toBe(true);
      expect(true satisfies AssertTypeInequality<'a', string>).toBe(true);
      expect(true satisfies AssertTypeInequality<1, number>).toBe(true);
    });

    it('Holds between `any`, `unknown`, `never` and any other type', () => {
      expect(true satisfies AssertTypeInequality<any, unknown>).toBe(true);
      expect(true satisfies AssertTypeInequality<any, string>).toBe(true);
      expect(true satisfies AssertTypeInequality<unknown, string>).toBe(true);
      // Mutual assignability cannot express this one either - both directions collapse to `never` before comparing
      expect(true satisfies AssertTypeInequality<never, string>).toBe(true);
    });

    it('Holds for a union and one of its own members', () => {
      expect(true satisfies AssertTypeInequality<'a' | 'b', 'a'>).toBe(true);
      expect(true satisfies AssertTypeInequality<boolean, true>).toBe(true);
    });

    it('Holds for types differing only by a property modifier', () => {
      expect(true satisfies AssertTypeInequality<ObjA, ObjAReadonly>).toBe(true);
      expect(true satisfies AssertTypeInequality<ObjAOptional, ObjAUndefinable>).toBe(true);
    });

    it('Holds for structurally different composite types', () => {
      expect(true satisfies AssertTypeInequality<ObjA, ObjAB>).toBe(true);
      expect(true satisfies AssertTypeInequality<[string], string[]>).toBe(true);
      expect(true satisfies AssertTypeInequality<ObjA & { b: number }, ObjAB>).toBe(true);
    });

    it('Does not hold for identical types', () => {
      // @ts-expect-error `string` is equal to itself
      expect(true satisfies AssertTypeInequality<string, string>).toBe(true);
      // @ts-expect-error `never` is equal to itself
      expect(true satisfies AssertTypeInequality<never, never>).toBe(true);
      // @ts-expect-error `any` is equal to itself
      expect(true satisfies AssertTypeInequality<any, any>).toBe(true);
      // @ts-expect-error `unknown` is equal to itself
      expect(true satisfies AssertTypeInequality<unknown, unknown>).toBe(true);
      // @ts-expect-error member order does not make two unions different
      expect(true satisfies AssertTypeInequality<'a' | 'b', 'b' | 'a'>).toBe(true);
      // @ts-expect-error separately declared but structurally identical object types are equal
      expect(true satisfies AssertTypeInequality<ObjA, ObjADuplicate>).toBe(true);
      // @ts-expect-error an alias is transparent
      expect(true satisfies AssertTypeInequality<AliasedString, string>).toBe(true);
    });
  });

  describe('AssertTypeAssignable<A, B>', () => {
    it('Holds for a type assigned to itself', () => {
      expect(true satisfies AssertTypeAssignable<string, string>).toBe(true);
      expect(true satisfies AssertTypeAssignable<ObjA, ObjADuplicate>).toBe(true);
      expect(true satisfies AssertTypeAssignable<never, never>).toBe(true);
    });

    it('Holds for a narrower type assigned to a wider one', () => {
      expect(true satisfies AssertTypeAssignable<'a', string>).toBe(true);
      expect(true satisfies AssertTypeAssignable<1, number>).toBe(true);
      expect(true satisfies AssertTypeAssignable<true, boolean>).toBe(true);
      expect(true satisfies AssertTypeAssignable<'a', 'a' | 'b'>).toBe(true);
      expect(true satisfies AssertTypeAssignable<'a' | 'b', string>).toBe(true);
      expect(true satisfies AssertTypeAssignable<ObjAB, ObjA>).toBe(true);
    });

    it('Holds for the top and bottom types', () => {
      expect(true satisfies AssertTypeAssignable<string, unknown>).toBe(true);
      expect(true satisfies AssertTypeAssignable<string, any>).toBe(true);
      expect(true satisfies AssertTypeAssignable<any, string>).toBe(true);
      // `never` is assignable to every type - a distributive conditional would wrongly report that it is not
      expect(true satisfies AssertTypeAssignable<never, string>).toBe(true);
      expect(true satisfies AssertTypeAssignable<never, ObjA>).toBe(true);
    });

    it('Holds for composite types following the variance rules', () => {
      expect(true satisfies AssertTypeAssignable<[string, number], (string | number)[]>).toBe(true);
      expect(true satisfies AssertTypeAssignable<string[], readonly string[]>).toBe(true);
      // Parameters are contravariant, so a handler accepting the wider parameter is assignable to one accepting the narrower parameter
      expect(true satisfies AssertTypeAssignable<(a: string) => void, (a: 'x') => void>).toBe(true);
      // Return types are covariant
      expect(true satisfies AssertTypeAssignable<() => string, () => unknown>).toBe(true);
      // Property modifiers are invisible to assignability, unlike to equality
      expect(true satisfies AssertTypeAssignable<ObjAReadonly, ObjA>).toBe(true);
      expect(true satisfies AssertTypeAssignable<ObjA, ObjAReadonly>).toBe(true);
    });

    it('Does not hold for unrelated types', () => {
      // @ts-expect-error `string` is not assignable to `number`
      expect(true satisfies AssertTypeAssignable<string, number>).toBe(true);
      // @ts-expect-error `null` is not assignable to `undefined`
      expect(true satisfies AssertTypeAssignable<null, undefined>).toBe(true);
    });

    it('Does not hold for a wider type assigned to a narrower one', () => {
      // @ts-expect-error `string` is not assignable to one of its literals
      expect(true satisfies AssertTypeAssignable<string, 'a'>).toBe(true);
      // @ts-expect-error `unknown` is not assignable to anything but `unknown` and `any`
      expect(true satisfies AssertTypeAssignable<unknown, string>).toBe(true);
      // @ts-expect-error a union is not assignable to one of its members - a distributive conditional would wrongly report that it is
      expect(true satisfies AssertTypeAssignable<'a' | 'b', 'a'>).toBe(true);
      // @ts-expect-error a narrower object type is missing a property
      expect(true satisfies AssertTypeAssignable<ObjA, ObjAB>).toBe(true);
    });

    it('Does not hold for composite types violating the variance rules', () => {
      // @ts-expect-error an array of unknown length is not assignable to a fixed length tuple
      expect(true satisfies AssertTypeAssignable<string[], [string]>).toBe(true);
      // @ts-expect-error a readonly array is not assignable to a mutable one
      expect(true satisfies AssertTypeAssignable<readonly string[], string[]>).toBe(true);
      // @ts-expect-error parameters are contravariant, so the narrower parameter cannot accept the wider one
      expect(true satisfies AssertTypeAssignable<(a: 'x') => void, (a: string) => void>).toBe(true);
      // @ts-expect-error return types are covariant, so a wider return type cannot satisfy a narrower one
      expect(true satisfies AssertTypeAssignable<() => unknown, () => string>).toBe(true);
    });
  });

  describe('AssertTypeUnassignable<A, B>', () => {
    it('Holds for unrelated types', () => {
      expect(true satisfies AssertTypeUnassignable<string, number>).toBe(true);
      expect(true satisfies AssertTypeUnassignable<null, undefined>).toBe(true);
    });

    it('Holds for a wider type assigned to a narrower one', () => {
      expect(true satisfies AssertTypeUnassignable<string, 'a'>).toBe(true);
      expect(true satisfies AssertTypeUnassignable<unknown, string>).toBe(true);
      expect(true satisfies AssertTypeUnassignable<'a' | 'b', 'a'>).toBe(true);
      expect(true satisfies AssertTypeUnassignable<ObjA, ObjAB>).toBe(true);
    });

    it('Holds for composite types violating the variance rules', () => {
      expect(true satisfies AssertTypeUnassignable<string[], [string]>).toBe(true);
      expect(true satisfies AssertTypeUnassignable<readonly string[], string[]>).toBe(true);
      expect(true satisfies AssertTypeUnassignable<(a: 'x') => void, (a: string) => void>).toBe(true);
      expect(true satisfies AssertTypeUnassignable<() => unknown, () => string>).toBe(true);
    });

    it('Does not hold for a narrower type assigned to a wider one', () => {
      // @ts-expect-error `'a'` is assignable to `string`
      expect(true satisfies AssertTypeUnassignable<'a', string>).toBe(true);
      // @ts-expect-error a wider object type is assignable to a narrower one
      expect(true satisfies AssertTypeUnassignable<ObjAB, ObjA>).toBe(true);
      // @ts-expect-error property modifiers are invisible to assignability
      expect(true satisfies AssertTypeUnassignable<ObjAReadonly, ObjA>).toBe(true);
    });

    it('Does not hold for the top and bottom types', () => {
      // @ts-expect-error everything is assignable to `unknown`
      expect(true satisfies AssertTypeUnassignable<string, unknown>).toBe(true);
      // @ts-expect-error everything is assignable to `any`
      expect(true satisfies AssertTypeUnassignable<string, any>).toBe(true);
      // @ts-expect-error `any` is assignable to everything - a distributive conditional would wrongly report that it is not
      expect(true satisfies AssertTypeUnassignable<any, string>).toBe(true);
      // @ts-expect-error `never` is assignable to everything
      expect(true satisfies AssertTypeUnassignable<never, string>).toBe(true);
    });
  });

  describe('Relationships between the assertions', () => {
    it('Resolves exactly one of AssertTypeEquality and AssertTypeInequality for any pair of types', () => {
      expect(true satisfies AssertTypeEquality<never, never>).toBe(true);
      // @ts-expect-error ... so the inequality cannot also hold
      expect(true satisfies AssertTypeInequality<never, never>).toBe(true);

      expect(true satisfies AssertTypeInequality<any, unknown>).toBe(true);
      // @ts-expect-error ... so the equality cannot also hold
      expect(true satisfies AssertTypeEquality<any, unknown>).toBe(true);

      expect(true satisfies AssertTypeInequality<'a' | 'b', 'a'>).toBe(true);
      // @ts-expect-error ... so the equality cannot also hold, which is what the original distributive implementation got wrong
      expect(true satisfies AssertTypeEquality<'a' | 'b', 'a'>).toBe(true);
    });

    it('Resolves exactly one of AssertTypeAssignable and AssertTypeUnassignable for any pair of types', () => {
      expect(true satisfies AssertTypeAssignable<any, string>).toBe(true);
      // @ts-expect-error ... so `any` cannot also be unassignable
      expect(true satisfies AssertTypeUnassignable<any, string>).toBe(true);

      expect(true satisfies AssertTypeAssignable<never, string>).toBe(true);
      // @ts-expect-error ... so `never` cannot also be unassignable
      expect(true satisfies AssertTypeUnassignable<never, string>).toBe(true);

      expect(true satisfies AssertTypeUnassignable<'a' | 'b', 'a'>).toBe(true);
      // @ts-expect-error ... so a union cannot also be assignable to one of its members
      expect(true satisfies AssertTypeAssignable<'a' | 'b', 'a'>).toBe(true);
    });

    it('Implies mutual assignability from equality, but not equality from mutual assignability', () => {
      // Equal types are assignable in both directions ...
      expect(true satisfies AssertTypeEquality<ObjA, ObjADuplicate>).toBe(true);
      expect(true satisfies AssertTypeAssignable<ObjA, ObjADuplicate>).toBe(true);
      expect(true satisfies AssertTypeAssignable<ObjADuplicate, ObjA>).toBe(true);

      // ... but types assignable in both directions are not necessarily equal
      expect(true satisfies AssertTypeAssignable<ObjA, ObjAReadonly>).toBe(true);
      expect(true satisfies AssertTypeAssignable<ObjAReadonly, ObjA>).toBe(true);
      expect(true satisfies AssertTypeInequality<ObjA, ObjAReadonly>).toBe(true);
    });
  });
});
