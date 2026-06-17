import type { RestrictionModule, ViolationHandler } from '../types';
import { isBrowser } from '../utils';

export const disableCut: RestrictionModule = {
  name: 'disableCut',

  _handler: null as ((e: Event) => void) | null,

  enable(_options: Record<string, any>, onViolation: ViolationHandler) {
    if (!isBrowser() || this._handler) return;

    this._handler = (e: Event) => {
      e.preventDefault();
      onViolation({
        attempted: 'cut',
        target: (e.target as HTMLElement)?.tagName || 'unknown',
      });
    };

    document.addEventListener('cut', this._handler, true);
  },

  disable() {
    if (!isBrowser() || !this._handler) return;
    document.removeEventListener('cut', this._handler, true);
    this._handler = null;
  },
} as RestrictionModule & { _handler: ((e: Event) => void) | null };
