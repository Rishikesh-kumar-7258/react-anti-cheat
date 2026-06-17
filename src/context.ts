import { createContext } from 'react';
import type {
  Violation,
  RestrictionsConfig,
  Severity,
} from './types';

export interface AntiCheatContextValue {
  isActive: boolean;
  isLockedOut: boolean;
  violations: Violation[];
  violationCount: number;
  activeRestrictions: string[];
  effectiveRestrictions: RestrictionsConfig;
  sessionId: string;
  enableRestriction: (name: string, options?: Record<string, any>) => void;
  disableRestriction: (name: string) => void;
  resetViolations: () => void;
  lockout: () => void;
  unlock: () => void;
  debug: boolean;
}

export const AntiCheatContext = createContext<AntiCheatContextValue | null>(null);

export interface ViolationLogContextValue {
  violations: Violation[];
  countByType: Record<string, number>;
  countBySeverity: Record<Severity, number>;
  lastViolation: Violation | null;
}
