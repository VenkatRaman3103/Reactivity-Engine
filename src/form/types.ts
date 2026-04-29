// src/form/types.ts
// TypeScript rule types
// used as type annotations in .form.ts files
// compiler reads these and generates field() calls

// string rules
export type Required         = string & { __required:  never }
export type Email            = string & { __email:     never }
export type URL              = string & { __url:       never }
export type Phone            = string & { __phone:     never }
export type Numeric          = string & { __numeric:   never }

// parameterized string rules
export type MinLength<N extends number> = string & { __minLength: N }
export type MaxLength<N extends number> = string & { __maxLength: N }
export type Pattern<R extends string>   = string & { __pattern:   R }

// number rules
export type Min<N extends number>       = number & { __min: N }
export type Max<N extends number>       = number & { __max: N }
export type Positive                    = number & { __positive: never }
