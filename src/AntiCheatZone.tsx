import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { AntiCheatContext } from './context';
import { getRestriction } from './restrictions';
import type { AntiCheatZoneProps, RestrictionsConfig } from './types';
import { deepMerge } from './utils';

function resolveZoneRestrictions(
  parentRestrictions: RestrictionsConfig,
  zoneRestrictions: RestrictionsConfig,
  mode: 'merge' | 'override' | 'replace'
): RestrictionsConfig {
  switch (mode) {
    case 'replace':
      return zoneRestrictions;
    case 'override':
      return { ...parentRestrictions, ...zoneRestrictions };
    case 'merge':
    default:
      return deepMerge(parentRestrictions, zoneRestrictions);
  }
}

export function AntiCheatZone({
  restrictions,
  mode = 'merge',
  children,
}: AntiCheatZoneProps) {
  const parent = useContext(AntiCheatContext);
  if (!parent) {
    throw new Error('AntiCheatZone must be used within an AntiCheatProvider');
  }

  const resolved = useMemo(
    () => resolveZoneRestrictions(parent.effectiveRestrictions, restrictions, mode),
    [parent.effectiveRestrictions, restrictions, mode]
  );

  const zoneModulesRef = useRef<Set<string>>(new Set());
  const parentDisabledRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const desiredRestrictions = new Set<string>();
    for (const [name, opts] of Object.entries(resolved)) {
      if (opts && opts.enabled) {
        desiredRestrictions.add(name);
      }
    }

    for (const name of parent.activeRestrictions) {
      if (!desiredRestrictions.has(name)) {
        parent.disableRestriction(name);
        parentDisabledRef.current.add(name);
      }
    }

    for (const name of desiredRestrictions) {
      if (!parent.activeRestrictions.includes(name)) {
        const opts = resolved[name];
        parent.enableRestriction(name, opts);
        zoneModulesRef.current.add(name);
      }
    }

    return () => {
      for (const name of zoneModulesRef.current) {
        if (!parent.activeRestrictions.includes(name)) continue;
        const parentHad = parent.effectiveRestrictions[name];
        if (!parentHad || !parentHad.enabled) {
          parent.disableRestriction(name);
        }
      }
      zoneModulesRef.current.clear();

      for (const name of parentDisabledRef.current) {
        const parentOpts = parent.effectiveRestrictions[name];
        if (parentOpts && parentOpts.enabled) {
          parent.enableRestriction(name, parentOpts);
        }
      }
      parentDisabledRef.current.clear();
    };
  }, [resolved]);

  const zoneContext = useMemo(
    () => ({
      ...parent,
      effectiveRestrictions: resolved,
    }),
    [parent, resolved]
  );

  return React.createElement(
    AntiCheatContext.Provider,
    { value: zoneContext },
    children
  );
}
