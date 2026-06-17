import type { RestrictionModule } from '../types';
import { disableCopy } from './disableCopy';
import { disablePaste } from './disablePaste';
import { disableCut } from './disableCut';
import { disableTextSelection } from './disableTextSelection';
import { disableRightClick } from './disableRightClick';
import { detectTabSwitch } from './detectTabSwitch';
import { detectDevTools } from './detectDevTools';
import { enforceFullscreen } from './enforceFullscreen';
import { disableKeyboardShortcuts } from './disableKeyboardShortcuts';
import { disableDragDrop } from './disableDragDrop';
import { disablePrintScreen } from './disablePrintScreen';
import { detectIdle } from './detectIdle';

const registry = new Map<string, RestrictionModule>();

const builtIns: RestrictionModule[] = [
  disableCopy,
  disablePaste,
  disableCut,
  disableTextSelection,
  disableRightClick,
  detectTabSwitch,
  detectDevTools,
  enforceFullscreen,
  disableKeyboardShortcuts,
  disableDragDrop,
  disablePrintScreen,
  detectIdle,
];

for (const restriction of builtIns) {
  registry.set(restriction.name, restriction);
}

export function registerRestriction(module: RestrictionModule): void {
  if (registry.has(module.name)) {
    console.warn(
      `[react-anti-cheat] Restriction "${module.name}" is already registered. It will be overwritten.`
    );
  }
  registry.set(module.name, module);
}

export function getRestriction(name: string): RestrictionModule | undefined {
  return registry.get(name);
}

export function getAllRestrictionNames(): string[] {
  return Array.from(registry.keys());
}

export { registry };
