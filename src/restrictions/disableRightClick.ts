import type { RestrictionModule, ViolationHandler } from '../types';
import { isBrowser, matchesSelector } from '../utils';

export const disableRightClick: RestrictionModule = {
  name: 'disableRightClick',

  _handler: null as ((e: MouseEvent) => void) | null,

  enable(options: Record<string, any>, onViolation: ViolationHandler) {
    if (!isBrowser() || this._handler) return;

    const excludeSelectors: string[] = options.excludeSelectors ?? [];

    this._handler = (e: MouseEvent) => {
      if (excludeSelectors.length > 0 && matchesSelector(e.target, excludeSelectors)) {
        return;
      }
      e.preventDefault();
      onViolation({
        x: e.clientX,
        y: e.clientY,
        target: (e.target as HTMLElement)?.tagName || 'unknown',
      });
    };

    document.addEventListener('contextmenu', this._handler as EventListener, true);
  },

  disable() {
    if (!isBrowser() || !this._handler) return;
    document.removeEventListener('contextmenu', this._handler as EventListener, true);
    this._handler = null;
  },
} as RestrictionModule & { _handler: ((e: MouseEvent) => void) | null };
