// src/form/types.ts
// TypeScript rule types (markers for the compiler; parsed via regex)
// These are base type aliases so they accept literal values while keeping rule names visible to the compiler.

// string rules
export type Required         = string
export type Email            = string
export type URL              = string
export type Phone            = string
export type Numeric          = string

// parameterized string rules (type param is only for compile-time parsing)
export type MinLength<N extends number> = string
export type MaxLength<N extends number> = string
export type Pattern<R extends string>   = string

// number rules
export type Min<N extends number>       = number
export type Max<N extends number>       = number
export type Positive                    = number
