import type { RestrictionModule, ViolationHandler } from '../types';
import { isBrowser } from '../utils';

const DEFAULT_BLOCKED = [
  'Ctrl+C', 'Ctrl+V', 'Ctrl+X', 'Ctrl+A', 'Ctrl+S',
  'Ctrl+U', 'Ctrl+Shift+I', 'Ctrl+Shift+J', 'Ctrl+Shift+C',
  'Ctrl+P', 'F12',
];

function normalizeShortcut(shortcut: string): string {
  return shortcut
    .split('+')
    .map((p) => p.trim().toLowerCase())
    .sort()
    .join('+');
}

function eventToShortcut(e: KeyboardEvent): { raw: string; normalized: string; modifiers: string[] } {
  const modifiers: string[] = [];
  if (e.ctrlKey || e.metaKey) modifiers.push('ctrl');
  if (e.shiftKey) modifiers.push('shift');
  if (e.altKey) modifiers.push('alt');

  const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
  const parts = [...modifiers.map((m) => m.charAt(0).toUpperCase() + m.slice(1)), key];
  const raw = parts.join('+');
  const normalized = normalizeShortcut(raw);

  return { raw, normalized, modifiers };
}

export const disableKeyboardShortcuts: RestrictionModule = {
  name: 'disableKeyboardShortcuts',

  _handler: null as ((e: KeyboardEvent) => void) | null,

  enable(options: Record<string, any>, onViolation: ViolationHandler) {
    if (!isBrowser() || this._handler) return;

    const blocked: string[] = options.blocked ?? DEFAULT_BLOCKED;
    const allowList: string[] = options.allowList ?? [];

    const blockedSet = new Set(blocked.map(normalizeShortcut));
    const allowSet = new Set(allowList.map(normalizeShortcut));

    this._handler = (e: KeyboardEvent) => {
      const { raw, normalized, modifiers } = eventToShortcut(e);

      if (allowSet.has(normalized)) return;

      if (blockedSet.has(normalized)) {
        e.preventDefault();
        e.stopPropagation();
        onViolation({
          shortcut: raw,
          key: e.key,
          modifiers,
        });
      }
    };

    document.addEventListener('keydown', this._handler as EventListener, true);
  },

  disable() {
    if (!isBrowser() || !this._handler) return;
    document.removeEventListener('keydown', this._handler as EventListener, true);
    this._handler = null;
  },
} as RestrictionModule & { _handler: ((e: KeyboardEvent) => void) | null };
