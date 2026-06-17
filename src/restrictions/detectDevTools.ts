import type { RestrictionModule, ViolationHandler } from '../types';
import { isBrowser } from '../utils';
import { addListener, removeListener, launch, stop, setDetectDelay } from 'devtools-detector';

export const detectDevTools: RestrictionModule = {
  name: 'detectDevTools',

  _listener: null as ((isOpen: boolean) => void) | null,
  _active: false,

  enable(options: Record<string, any>, onViolation: ViolationHandler) {
    if (!isBrowser() || this._active) return;

    const action: string = options.action ?? 'warn';
    const redirectUrl: string | undefined = options.redirectUrl;
    const checkIntervalMs: number = options.checkIntervalMs ?? 1000;

    this._active = true;

    setDetectDelay(checkIntervalMs);

    this._listener = (isOpen: boolean) => {
      if (!isOpen) return;

      onViolation({ devToolsOpen: true });

      if (action === 'redirect' && redirectUrl) {
        window.location.href = redirectUrl;
      }
    };

    addListener(this._listener);
    launch();
  },

  disable() {
    if (!this._active) return;
    this._active = false;

    if (this._listener) {
      removeListener(this._listener);
      this._listener = null;
    }
    stop();
  },
} as RestrictionModule & {
  _listener: ((isOpen: boolean) => void) | null;
  _active: boolean;
};
