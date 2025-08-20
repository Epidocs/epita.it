import type { DefaultLocaleConst } from './keys.ts'

export type DefaultLocaleKeys = DefaultLocaleConst[number]

export type DefaultLocaleType = { [key in DefaultLocaleKeys]: key }
