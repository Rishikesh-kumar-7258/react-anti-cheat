import type { RestrictionModule, ViolationHandler } from '../types';
import { isBrowser, matchesSelector } from '../utils';

export const disableTextSelection: RestrictionModule = {
  name: 'disableTextSelection',

  _handler: null as ((e: Event) => void) | null,
  _styleEl: null as HTMLStyleElement | null,

  enable(options: Record<string, any>, onViolation: ViolationHandler) {
    if (!isBrowser() || this._handler) return;

    const excludeSelectors: string[] = options.excludeSelectors ?? [];

    this._styleEl = document.createElement('style');
    this._styleEl.setAttribute('data-anti-cheat', 'text-selection');
    this._styleEl.textContent = `
      body { -webkit-user-select: none; user-select: none; }
    `;
    document.head.appendChild(this._styleEl);

    if (excludeSelectors.length > 0) {
      this._styleEl.textContent += `
        ${excludeSelectors.join(', ')} { -webkit-user-select: text; user-select: text; }
      `;
    }

    this._handler = (e: Event) => {
      if (excludeSelectors.length > 0 && matchesSelector(e.target, excludeSelectors)) {
        return;
      }
      e.preventDefault();
      onViolation({
        target: (e.target as HTMLElement)?.tagName || 'unknown',
      });
    };

    document.addEventListener('selectstart', this._handler, true);
  },

  disable() {
    if (!isBrowser()) return;

    if (this._handler) {
      document.removeEventListener('selectstart', this._handler, true);
      this._handler = null;
    }

    if (this._styleEl && this._styleEl.parentNode) {
      this._styleEl.parentNode.removeChild(this._styleEl);
      this._styleEl = null;
    }
  },
} as RestrictionModule & {
  _handler: ((e: Event) => void) | null;
  _styleEl: HTMLStyleElement | null;
};
