export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function matchRoute(
  pattern: string,
  path: string
): boolean {
  if (pattern === path) return true;

  if (pattern.endsWith('/*')) {
    const base = pattern.slice(0, -2);
    return path === base || path.startsWith(base + '/');
  }

  if (pattern.includes('*')) {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*') + '$'
    );
    return regex.test(path);
  }

  return false;
}

export function getRouteSpecificity(pattern: string): number {
  const segments = pattern.split('/').filter(Boolean);
  let score = segments.length * 10;
  if (!pattern.includes('*')) score += 100;
  return score;
}

export function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    target.isContentEditable
  );
}

export function matchesSelector(
  target: EventTarget | null,
  selectors: string[]
): boolean {
  if (!target || !(target instanceof Element)) return false;
  return selectors.some((s) => target.closest(s) !== null);
}

export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function deepMerge<T extends Record<string, any>>(
  base: T,
  override: Partial<T>
): T {
  const result = { ...base };
  for (const key in override) {
    if (Object.prototype.hasOwnProperty.call(override, key)) {
      const baseVal = base[key];
      const overrideVal = override[key];
      if (
        baseVal &&
        overrideVal &&
        typeof baseVal === 'object' &&
        typeof overrideVal === 'object' &&
        !Array.isArray(baseVal) &&
        !Array.isArray(overrideVal)
      ) {
        (result as any)[key] = deepMerge(
          baseVal as Record<string, any>,
          overrideVal as Record<string, any>
        );
      } else {
        (result as any)[key] = overrideVal;
      }
    }
  }
  return result;
}
