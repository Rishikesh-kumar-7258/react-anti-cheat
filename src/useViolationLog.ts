import { useContext, useMemo } from 'react';
import { AntiCheatContext } from './context';
import type { Severity, UseViolationLogOptions, UseViolationLogReturn } from './types';

export function useViolationLog(
  options: UseViolationLogOptions = {}
): UseViolationLogReturn {
  const context = useContext(AntiCheatContext);
  if (!context) {
    throw new Error('useViolationLog must be used within an AntiCheatProvider');
  }

  const { filter, maxEntries = 500 } = options;

  return useMemo(() => {
    let filtered = context.violations;

    if (filter && filter.length > 0) {
      const filterSet = new Set(filter);
      filtered = filtered.filter((v) => filterSet.has(v.type));
    }

    if (filtered.length > maxEntries) {
      filtered = filtered.slice(-maxEntries);
    }

    const countByType: Record<string, number> = {};
    const countBySeverity: Record<Severity, number> = {
      info: 0,
      warning: 0,
      critical: 0,
    };

    for (const v of filtered) {
      countByType[v.type] = (countByType[v.type] ?? 0) + 1;
      countBySeverity[v.severity]++;
    }

    return {
      violations: filtered,
      countByType,
      countBySeverity,
      lastViolation: filtered.length > 0 ? filtered[filtered.length - 1] : null,
    };
  }, [context.violations, filter, maxEntries]);
}
