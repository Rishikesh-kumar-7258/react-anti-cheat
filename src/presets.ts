import type { RestrictionsConfig } from './types';

export const presets: Record<string, RestrictionsConfig> = {
  exam: {
    disableCopy: { enabled: true },
    disablePaste: { enabled: true },
    disableCut: { enabled: true },
    disableTextSelection: { enabled: true },
    disableRightClick: { enabled: true },
    detectTabSwitch: { enabled: true, severity: 'critical' },
    detectDevTools: { enabled: true, severity: 'critical', action: 'lockout' },
    enforceFullscreen: { enabled: true, reEnterOnExit: true },
    disableKeyboardShortcuts: { enabled: true },
    disableDragDrop: { enabled: true },
    disablePrintScreen: { enabled: true },
  },

  quiz: {
    disableCopy: { enabled: true },
    disablePaste: { enabled: true },
    detectTabSwitch: { enabled: true, severity: 'warning', gracePeriodMs: 2000 },
    disableRightClick: { enabled: true },
  },

  contentProtection: {
    disableCopy: { enabled: true },
    disableCut: { enabled: true },
    disableTextSelection: { enabled: true },
    disableRightClick: { enabled: true },
    disableDragDrop: { enabled: true },
    disablePrintScreen: { enabled: true },
  },

  minimal: {
    detectTabSwitch: { enabled: true, severity: 'info' },
    detectIdle: { enabled: true, severity: 'info' },
  },
};
