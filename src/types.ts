import type { ReactNode } from 'react';

export type Severity = 'info' | 'warning' | 'critical';

export interface RestrictionOptions {
  enabled: boolean;
  severity?: Severity;
}

export interface DisableCopyOptions extends RestrictionOptions {
  allowInputs?: boolean;
  showNotification?: boolean;
  notificationMessage?: string;
}

export interface DisablePasteOptions extends RestrictionOptions {
  allowInputs?: boolean;
  showNotification?: boolean;
  notificationMessage?: string;
}

export interface DisableCutOptions extends RestrictionOptions {
  showNotification?: boolean;
  notificationMessage?: string;
}

export interface DisableTextSelectionOptions extends RestrictionOptions {
  excludeSelectors?: string[];
}

export interface DisableRightClickOptions extends RestrictionOptions {
  showNotification?: boolean;
  excludeSelectors?: string[];
}

export interface DetectTabSwitchOptions extends RestrictionOptions {
  maxViolations?: number;
  gracePeriodMs?: number;
  trackDuration?: boolean;
}

export interface DetectDevToolsOptions extends RestrictionOptions {
  action?: 'warn' | 'redirect' | 'lockout';
  redirectUrl?: string;
  checkIntervalMs?: number;
}

export interface EnforceFullscreenOptions extends RestrictionOptions {
  promptOnMount?: boolean;
  reEnterOnExit?: boolean;
  maxExits?: number;
  promptMessage?: string;
}

export interface DisableKeyboardShortcutsOptions extends RestrictionOptions {
  blocked?: string[];
  allowList?: string[];
  showNotification?: boolean;
}

export interface DisableDragDropOptions extends RestrictionOptions {
  excludeSelectors?: string[];
}

export interface DisablePrintScreenOptions extends RestrictionOptions {
  overlayColor?: string;
  overlayDurationMs?: number;
  blockPrintDialog?: boolean;
}

export interface DetectIdleOptions extends RestrictionOptions {
  idleThresholdMs?: number;
  events?: string[];
}

export interface BuiltInRestrictions {
  disableCopy?: DisableCopyOptions;
  disablePaste?: DisablePasteOptions;
  disableCut?: DisableCutOptions;
  disableTextSelection?: DisableTextSelectionOptions;
  disableRightClick?: DisableRightClickOptions;
  detectTabSwitch?: DetectTabSwitchOptions;
  detectDevTools?: DetectDevToolsOptions;
  enforceFullscreen?: EnforceFullscreenOptions;
  disableKeyboardShortcuts?: DisableKeyboardShortcutsOptions;
  disableDragDrop?: DisableDragDropOptions;
  disablePrintScreen?: DisablePrintScreenOptions;
  detectIdle?: DetectIdleOptions;
}

export type RestrictionsConfig = BuiltInRestrictions & {
  [customRestriction: string]: (RestrictionOptions & Record<string, any>) | undefined;
};

export interface Violation {
  id: string;
  type: string;
  severity: Severity;
  timestamp: number;
  message: string;
  metadata: Record<string, any>;
  sessionId: string;
}

export interface RestrictionChange {
  restriction: string;
  action: 'enabled' | 'disabled';
  timestamp: number;
  source: 'programmatic' | 'zone-change' | 'config-update';
}

export interface Session {
  id: string;
  startedAt: number;
  activeRestrictions: string[];
  config: AntiCheatConfig;
}

export interface SessionSummary {
  sessionId: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  totalViolations: number;
  violationsByType: Record<string, number>;
  violationsBySeverity: Record<Severity, number>;
  wasLockedOut: boolean;
  lockoutTimestamp: number | null;
}

export interface AntiCheatConfig {
  restrictions: RestrictionsConfig;
  routes?: Record<string, RestrictionsConfig | false>;
}

export interface AntiCheatProviderProps {
  config: AntiCheatConfig;
  currentPath?: string;
  onViolation?: (violation: Violation) => void;
  onRestrictionChange?: (change: RestrictionChange) => void;
  onSessionStart?: (session: Session) => void;
  onSessionEnd?: (summary: SessionSummary) => void;
  lockoutAfter?: number;
  lockoutComponent?: ReactNode;
  debug?: boolean;
  children: ReactNode;
}

export interface AntiCheatZoneProps {
  restrictions: RestrictionsConfig;
  mode?: 'merge' | 'override' | 'replace';
  children: ReactNode;
}

export type ViolationHandler = (metadata: Record<string, any>) => void;

export interface RestrictionModule {
  name: string;
  enable(options: Record<string, any>, onViolation: ViolationHandler): void;
  disable(): void;
}

export interface UseAntiCheatReturn {
  isActive: boolean;
  isLockedOut: boolean;
  violations: Violation[];
  violationCount: number;
  activeRestrictions: string[];
  enableRestriction: (name: string, options?: Record<string, any>) => void;
  disableRestriction: (name: string) => void;
  resetViolations: () => void;
  lockout: () => void;
  unlock: () => void;
}

export interface UseViolationLogOptions {
  filter?: string[];
  maxEntries?: number;
}

export interface UseViolationLogReturn {
  violations: Violation[];
  countByType: Record<string, number>;
  countBySeverity: Record<Severity, number>;
  lastViolation: Violation | null;
}

export type Preset = RestrictionsConfig;
