import type { RestrictionModule, ViolationHandler } from '../types';
import { isBrowser } from '../utils';

const DEFAULT_EVENTS = ['mousemove', 'keydown', 'scroll', 'touchstart'];

export const detectIdle: RestrictionModule = {
  name: 'detectIdle',

  _handlers: [] as Array<{ event: string; handler: () => void }>,
  _timer: null as ReturnType<typeof setTimeout> | null,
  _idleStart: null as number | null,
  _active: false,

  enable(options: Record<string, any>, onViolation: ViolationHandler) {
    if (!isBrowser() || this._active) return;

    const idleThresholdMs: number = options.idleThresholdMs ?? 60000;
    const events: string[] = options.events ?? DEFAULT_EVENTS;
    this._active = true;
    this._idleStart = Date.now();

    const resetTimer = () => {
      if (this._timer) clearTimeout(this._timer);
      this._idleStart = Date.now();

      this._timer = setTimeout(() => {
        if (!this._active) return;
        const idleDurationMs = Date.now() - (this._idleStart ?? Date.now());
        onViolation({ idleDurationMs });
        this._idleStart = Date.now();
        resetTimer();
      }, idleThresholdMs);
    };

    this._handlers = events.map((event) => {
      const handler = () => resetTimer();
      document.addEventListener(event, handler, { passive: true });
      return { event, handler };
    });

    resetTimer();
  },

  disable() {
    if (!isBrowser() || !this._active) return;
    this._active = false;

    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }

    for (const { event, handler } of this._handlers) {
      document.removeEventListener(event, handler);
    }
    this._handlers = [];
    this._idleStart = null;
  },
} as RestrictionModule & {
  _handlers: Array<{ event: string; handler: () => void }>;
  _timer: ReturnType<typeof setTimeout> | null;
  _idleStart: number | null;
  _active: boolean;
};
