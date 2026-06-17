import type { RestrictionModule, ViolationHandler } from '../types';
import { isBrowser, matchesSelector } from '../utils';

export const disableDragDrop: RestrictionModule = {
  name: 'disableDragDrop',

  _dragHandler: null as ((e: DragEvent) => void) | null,
  _dropHandler: null as ((e: DragEvent) => void) | null,
  _dragoverHandler: null as ((e: DragEvent) => void) | null,

  enable(options: Record<string, any>, onViolation: ViolationHandler) {
    if (!isBrowser() || this._dragHandler) return;

    const excludeSelectors: string[] = options.excludeSelectors ?? [];

    this._dragHandler = (e: DragEvent) => {
      if (excludeSelectors.length > 0 && matchesSelector(e.target, excludeSelectors)) return;
      e.preventDefault();
      onViolation({
        attempted: 'drag',
        target: (e.target as HTMLElement)?.tagName || 'unknown',
      });
    };

    this._dropHandler = (e: DragEvent) => {
      if (excludeSelectors.length > 0 && matchesSelector(e.target, excludeSelectors)) return;
      e.preventDefault();
      onViolation({
        attempted: 'drop',
        target: (e.target as HTMLElement)?.tagName || 'unknown',
      });
    };

    this._dragoverHandler = (e: DragEvent) => {
      if (excludeSelectors.length > 0 && matchesSelector(e.target, excludeSelectors)) return;
      e.preventDefault();
    };

    document.addEventListener('dragstart', this._dragHandler as EventListener, true);
    document.addEventListener('drop', this._dropHandler as EventListener, true);
    document.addEventListener('dragover', this._dragoverHandler as EventListener, true);
  },

  disable() {
    if (!isBrowser()) return;

    if (this._dragHandler) {
      document.removeEventListener('dragstart', this._dragHandler as EventListener, true);
      this._dragHandler = null;
    }
    if (this._dropHandler) {
      document.removeEventListener('drop', this._dropHandler as EventListener, true);
      this._dropHandler = null;
    }
    if (this._dragoverHandler) {
      document.removeEventListener('dragover', this._dragoverHandler as EventListener, true);
      this._dragoverHandler = null;
    }
  },
} as RestrictionModule & {
  _dragHandler: ((e: DragEvent) => void) | null;
  _dropHandler: ((e: DragEvent) => void) | null;
  _dragoverHandler: ((e: DragEvent) => void) | null;
};
