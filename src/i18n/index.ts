import en from './en.json';

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<typeof en> | string;

/**
 * Helper to retrieve nested dictionary strings with fallback and optional parameter interpolation.
 * Example: t('common.appName') -> "ABC"
 * Example: t('common.welcome', { name: 'Ali' }) -> "Welcome Ali"
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const parts = key.split('.');
  let current: unknown = en;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      current = undefined;
      break;
    }
  }

  if (typeof current !== 'string') {
    return key;
  }

  if (!params) {
    return current;
  }

  let result = current;
  for (const [paramKey, paramVal] of Object.entries(params)) {
    result = result.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramVal));
  }

  return result;
}

export default t;
