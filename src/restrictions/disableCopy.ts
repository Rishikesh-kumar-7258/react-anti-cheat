import type { RestrictionModule, ViolationHandler } from '../types';
import { isBrowser, isInputElement } from '../utils';

export const disableCopy: RestrictionModule = {
  name: 'disableCopy',

  _handler: null as ((e: Event) => void) | null,

  enable(options: Record<string, any>, onViolation: ViolationHandler) {
    if (!isBrowser() || this._handler) return;

    const allowInputs = options.allowInputs ?? false;

    this._handler = (e: Event) => {
      if (allowInputs && isInputElement(e.target)) return;
      e.preventDefault();
      onViolation({
        attempted: 'copy',
        target: (e.target as HTMLElement)?.tagName || 'unknown',
      });
    };

    document.addEventListener('copy', this._handler, true);
  },

  disable() {
    if (!isBrowser() || !this._handler) return;
    document.removeEventListener('copy', this._handler, true);
    this._handler = null;
  },
} as RestrictionModule & { _handler: ((e: Event) => void) | null };
