import type { RestrictionModule, ViolationHandler } from '../types';
import { isBrowser } from '../utils';

export const disablePrintScreen: RestrictionModule = {
  name: 'disablePrintScreen',

  _keyHandler: null as ((e: KeyboardEvent) => void) | null,
  _printHandler: null as ((e: Event) => void) | null,
  _overlay: null as HTMLDivElement | null,
  _overlayTimer: null as ReturnType<typeof setTimeout> | null,

  enable(options: Record<string, any>, onViolation: ViolationHandler) {
    if (!isBrowser() || this._keyHandler) return;

    const overlayColor: string = options.overlayColor ?? '#000000';
    const overlayDurationMs: number = options.overlayDurationMs ?? 1000;
    const blockPrintDialog: boolean = options.blockPrintDialog ?? true;

    const showOverlay = () => {
      if (this._overlay) return;

      this._overlay = document.createElement('div');
      this._overlay.setAttribute('data-anti-cheat', 'print-overlay');
      Object.assign(this._overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: overlayColor,
        zIndex: '2147483647',
        pointerEvents: 'none',
      });
      document.body.appendChild(this._overlay);

      this._overlayTimer = setTimeout(() => {
        if (this._overlay && this._overlay.parentNode) {
          this._overlay.parentNode.removeChild(this._overlay);
          this._overlay = null;
        }
        this._overlayTimer = null;
      }, overlayDurationMs);
    };

    this._keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        showOverlay();
        onViolation({ method: 'printscreen' });
      }

      if (blockPrintDialog && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        onViolation({ method: 'print-dialog' });
      }
    };

    this._printHandler = (e: Event) => {
      if (blockPrintDialog) {
        showOverlay();
      }
    };

    document.addEventListener('keyup', this._keyHandler as EventListener, true);
    window.addEventListener('beforeprint', this._printHandler!);
  },

  disable() {
    if (!isBrowser()) return;

    if (this._keyHandler) {
      document.removeEventListener('keyup', this._keyHandler as EventListener, true);
      this._keyHandler = null;
    }

    if (this._printHandler) {
      window.removeEventListener('beforeprint', this._printHandler);
      this._printHandler = null;
    }

    if (this._overlayTimer) {
      clearTimeout(this._overlayTimer);
      this._overlayTimer = null;
    }

    if (this._overlay && this._overlay.parentNode) {
      this._overlay.parentNode.removeChild(this._overlay);
      this._overlay = null;
    }
  },
} as RestrictionModule & {
  _keyHandler: ((e: KeyboardEvent) => void) | null;
  _printHandler: ((e: Event) => void) | null;
  _overlay: HTMLDivElement | null;
  _overlayTimer: ReturnType<typeof setTimeout> | null;
};
