import { useContext } from 'react';
import { AntiCheatContext } from './context';
import type { UseAntiCheatReturn } from './types';

export function useAntiCheat(): UseAntiCheatReturn {
  const context = useContext(AntiCheatContext);
  if (!context) {
    throw new Error('useAntiCheat must be used within an AntiCheatProvider');
  }

  return {
    isActive: context.isActive,
    isLockedOut: context.isLockedOut,
    violations: context.violations,
    violationCount: context.violationCount,
    activeRestrictions: context.activeRestrictions,
    enableRestriction: context.enableRestriction,
    disableRestriction: context.disableRestriction,
    resetViolations: context.resetViolations,
    lockout: context.lockout,
    unlock: context.unlock,
  };
}
