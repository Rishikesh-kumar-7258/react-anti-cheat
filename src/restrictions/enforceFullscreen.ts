import type { RestrictionModule, ViolationHandler } from '../types';
import { isBrowser } from '../utils';
import screenfull from 'screenfull';

export const enforceFullscreen: RestrictionModule = {
  name: 'enforceFullscreen',

  _handler: null as (() => void) | null,
  _exitCount: 0,
  _active: false,

  enable(options: Record<string, any>, onViolation: ViolationHandler) {
    if (!isBrowser() || this._active) return;
    if (!screenfull.isEnabled) return;

    const promptOnMount: boolean = options.promptOnMount ?? true;
    const reEnterOnExit: boolean = options.reEnterOnExit ?? true;
    this._exitCount = 0;
    this._active = true;

    this._handler = () => {
      if (!screenfull.isFullscreen && this._active) {
        this._exitCount++;
        onViolation({ exitCount: this._exitCount });

        if (reEnterOnExit) {
          screenfull.request(document.documentElement).catch(() => {});
        }
      }
    };

    screenfull.on('change', this._handler);

    if (promptOnMount) {
      screenfull.request(document.documentElement).catch(() => {});
    }
  },

  disable() {
    if (!this._active) return;
    this._active = false;

    if (screenfull.isEnabled) {
      if (this._handler) {
        screenfull.off('change', this._handler);
        this._handler = null;
      }
      if (screenfull.isFullscreen) {
        screenfull.exit().catch(() => {});
      }
    }

    this._exitCount = 0;
  },
} as RestrictionModule & {
  _handler: (() => void) | null;
  _exitCount: number;
  _active: boolean;
};
