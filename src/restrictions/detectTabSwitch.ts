import type { RestrictionModule, ViolationHandler } from '../types';
import { isBrowser } from '../utils';

export const detectTabSwitch: RestrictionModule = {
  name: 'detectTabSwitch',

  _handler: null as (() => void) | null,
  _switchCount: 0,
  _hiddenAt: null as number | null,

  enable(options: Record<string, any>, onViolation: ViolationHandler) {
    if (!isBrowser() || this._handler) return;

    const gracePeriodMs: number = options.gracePeriodMs ?? 0;
    const trackDuration: boolean = options.trackDuration ?? true;
    this._switchCount = 0;
    this._hiddenAt = null;

    this._handler = () => {
      if (document.hidden) {
        this._hiddenAt = Date.now();
      } else {
        const hiddenAt = this._hiddenAt;
        this._hiddenAt = null;

        if (hiddenAt === null) return;

        const durationMs = Date.now() - hiddenAt;

        if (gracePeriodMs > 0 && durationMs < gracePeriodMs) return;

        this._switchCount++;
        onViolation({
          durationMs: trackDuration ? durationMs : null,
          switchCount: this._switchCount,
        });
      }
    };

    document.addEventListener('visibilitychange', this._handler);
  },

  disable() {
    if (!isBrowser() || !this._handler) return;
    document.removeEventListener('visibilitychange', this._handler);
    this._handler = null;
    this._switchCount = 0;
    this._hiddenAt = null;
  },
} as RestrictionModule & {
  _handler: (() => void) | null;
  _switchCount: number;
  _hiddenAt: number | null;
};
