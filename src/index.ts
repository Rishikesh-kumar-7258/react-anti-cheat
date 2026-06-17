export { AntiCheatProvider } from './AntiCheatProvider';
export { AntiCheatZone } from './AntiCheatZone';
export { useAntiCheat } from './useAntiCheat';
export { useViolationLog } from './useViolationLog';
export { presets } from './presets';
export { registerRestriction } from './restrictions';

export type {
  AntiCheatConfig,
  AntiCheatProviderProps,
  AntiCheatZoneProps,
  DetectDevToolsOptions,
  DetectIdleOptions,
  DetectTabSwitchOptions,
  DisableCopyOptions,
  DisableCutOptions,
  DisableDragDropOptions,
  DisableKeyboardShortcutsOptions,
  DisablePasteOptions,
  DisablePrintScreenOptions,
  DisableRightClickOptions,
  DisableTextSelectionOptions,
  EnforceFullscreenOptions,
  Preset,
  RestrictionChange,
  RestrictionModule,
  RestrictionOptions,
  RestrictionsConfig,
  Session,
  SessionSummary,
  Severity,
  UseAntiCheatReturn,
  UseViolationLogOptions,
  UseViolationLogReturn,
  Violation,
  ViolationHandler,
} from './types';
