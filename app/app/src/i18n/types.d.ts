import { i18nLocales, i18nDefaultLocale } from '~/config'
import type { LocaleKeys, I18nConfig } from '~/config.ts'

export type ExtractLocales<T> = T extends { path: infer U } ? U : T

export type Locales = ExtractLocales<typeof i18nLocales[number]>

export type I18nKeys = { [i18nDefaultLocale]: string } & { -readonly [key in Locales]?: string }

export type Tail<T extends any[]> = ((...args: T) => any) extends (arg: any, ...tail: infer U) => any ? U : never

export type Diff<T, U> = T extends U ? never : T

export type DefaultLocale = Array<I18nKeys[keyof I18nKeys]>

export type { LocaleKeys, I18nConfig }
