import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AntiCheatContext } from './context';
import { getRestriction } from './restrictions';
import type {
  AntiCheatProviderProps,
  RestrictionsConfig,
  Severity,
  Violation,
} from './types';
import { deepMerge, generateId, getRouteSpecificity, matchRoute } from './utils';

const DEFAULT_SEVERITIES: Record<string, Severity> = {
  disableCopy: 'warning',
  disablePaste: 'warning',
  disableCut: 'warning',
  disableTextSelection: 'info',
  disableRightClick: 'info',
  detectTabSwitch: 'critical',
  detectDevTools: 'critical',
  enforceFullscreen: 'critical',
  disableKeyboardShortcuts: 'warning',
  disableDragDrop: 'info',
  disablePrintScreen: 'critical',
  detectIdle: 'warning',
};

const DEFAULT_MESSAGES: Record<string, string> = {
  disableCopy: 'Copy attempt blocked',
  disablePaste: 'Paste attempt blocked',
  disableCut: 'Cut attempt blocked',
  disableTextSelection: 'Text selection blocked',
  disableRightClick: 'Right-click blocked',
  detectTabSwitch: 'Tab switch detected',
  detectDevTools: 'DevTools opened',
  enforceFullscreen: 'Fullscreen exited',
  disableKeyboardShortcuts: 'Keyboard shortcut blocked',
  disableDragDrop: 'Drag/drop blocked',
  disablePrintScreen: 'Print screen blocked',
  detectIdle: 'User idle detected',
  'system:lockout': 'Session locked out due to excessive violations',
};

function resolveRestrictions(
  base: RestrictionsConfig,
  routes: Record<string, RestrictionsConfig | false> | undefined,
  currentPath: string | undefined
): RestrictionsConfig {
  if (!routes || !currentPath) return base;

  const matchedRoutes = Object.entries(routes)
    .filter(([pattern]) => matchRoute(pattern, currentPath))
    .sort(([a], [b]) => getRouteSpecificity(b) - getRouteSpecificity(a));

  if (matchedRoutes.length === 0) return base;

  const [, routeConfig] = matchedRoutes[0];

  if (routeConfig === false) return {};

  return deepMerge(base, routeConfig);
}

const DefaultLockoutComponent: React.FC = () =>
  React.createElement(
    'div',
    {
      style: {
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.9)',
        color: '#fff',
        zIndex: 2147483647,
        fontFamily: 'system-ui, sans-serif',
      },
    },
    React.createElement(
      'div',
      { style: { textAlign: 'center', maxWidth: 400 } },
      React.createElement('h1', { style: { fontSize: 24, marginBottom: 12 } }, 'Session Terminated'),
      React.createElement(
        'p',
        { style: { fontSize: 16, opacity: 0.8 } },
        'Too many violations were detected. Your session has been recorded.'
      )
    )
  );

export function AntiCheatProvider({
  config,
  currentPath,
  onViolation,
  onRestrictionChange,
  onSessionStart,
  onSessionEnd,
  lockoutAfter,
  lockoutComponent,
  debug = false,
  children,
}: AntiCheatProviderProps) {
  const sessionIdRef = useRef(generateId());
  const startedAtRef = useRef(Date.now());
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const lockoutTimestampRef = useRef<number | null>(null);
  const [activeRestrictionsSet, setActiveRestrictionsSet] = useState<Set<string>>(new Set());
  const enabledModulesRef = useRef<Set<string>>(new Set());
  const violationsRef = useRef<Violation[]>([]);

  const effectiveRestrictions = useMemo(
    () => resolveRestrictions(config.restrictions, config.routes, currentPath),
    [config.restrictions, config.routes, currentPath]
  );

  const handleViolation = useCallback(
    (restrictionName: string, metadata: Record<string, any>) => {
      const severity =
        (effectiveRestrictions[restrictionName] as any)?.severity ??
        DEFAULT_SEVERITIES[restrictionName] ??
        'info';

      const violation: Violation = {
        id: generateId(),
        type: restrictionName,
        severity,
        timestamp: Date.now(),
        message: DEFAULT_MESSAGES[restrictionName] ?? `Violation: ${restrictionName}`,
        metadata,
        sessionId: sessionIdRef.current,
      };

      if (debug) {
        console.log(`[react-anti-cheat] Violation:`, violation);
      }

      violationsRef.current = [...violationsRef.current, violation];
      setViolations(violationsRef.current);

      onViolation?.(violation);

      const restrictionOpts = effectiveRestrictions[restrictionName] as any;
      if (restrictionOpts?.maxViolations) {
        const typeCount = violationsRef.current.filter(
          (v) => v.type === restrictionName
        ).length;
        if (typeCount >= restrictionOpts.maxViolations) {
          triggerLockout();
          return;
        }
      }

      if (restrictionOpts?.action === 'lockout') {
        triggerLockout();
        return;
      }

      if (lockoutAfter && violationsRef.current.length >= lockoutAfter) {
        triggerLockout();
      }
    },
    [effectiveRestrictions, onViolation, lockoutAfter, debug]
  );

  const triggerLockout = useCallback(() => {
    if (isLockedOut) return;
    lockoutTimestampRef.current = Date.now();
    setIsLockedOut(true);

    const lockoutViolation: Violation = {
      id: generateId(),
      type: 'system:lockout',
      severity: 'critical',
      timestamp: Date.now(),
      message: DEFAULT_MESSAGES['system:lockout'],
      metadata: { totalViolations: violationsRef.current.length },
      sessionId: sessionIdRef.current,
    };

    violationsRef.current = [...violationsRef.current, lockoutViolation];
    setViolations(violationsRef.current);
    onViolation?.(lockoutViolation);
  }, [isLockedOut, onViolation]);

  const enableRestriction = useCallback(
    (name: string, options?: Record<string, any>) => {
      const module = getRestriction(name);
      if (!module) {
        console.warn(`[react-anti-cheat] Unknown restriction: "${name}"`);
        return;
      }

      if (enabledModulesRef.current.has(name)) return;

      const opts = options ?? effectiveRestrictions[name] ?? {};
      module.enable(opts, (metadata) => handleViolation(name, metadata));
      enabledModulesRef.current.add(name);
      setActiveRestrictionsSet((prev) => new Set([...prev, name]));

      if (debug) {
        console.log(`[react-anti-cheat] Enabled: ${name}`);
      }

      onRestrictionChange?.({
        restriction: name,
        action: 'enabled',
        timestamp: Date.now(),
        source: 'programmatic',
      });
    },
    [effectiveRestrictions, handleViolation, onRestrictionChange, debug]
  );

  const disableRestriction = useCallback(
    (name: string) => {
      const module = getRestriction(name);
      if (!module) return;

      if (!enabledModulesRef.current.has(name)) return;

      module.disable();
      enabledModulesRef.current.delete(name);
      setActiveRestrictionsSet((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });

      if (debug) {
        console.log(`[react-anti-cheat] Disabled: ${name}`);
      }

      onRestrictionChange?.({
        restriction: name,
        action: 'disabled',
        timestamp: Date.now(),
        source: 'programmatic',
      });
    },
    [onRestrictionChange, debug]
  );

  const resetViolations = useCallback(() => {
    violationsRef.current = [];
    setViolations([]);
  }, []);

  const unlock = useCallback(() => {
    setIsLockedOut(false);
    lockoutTimestampRef.current = null;
  }, []);

  useEffect(() => {
    const desiredRestrictions = new Set<string>();

    for (const [name, opts] of Object.entries(effectiveRestrictions)) {
      if (opts && opts.enabled) {
        desiredRestrictions.add(name);
      }
    }

    for (const name of enabledModulesRef.current) {
      if (!desiredRestrictions.has(name)) {
        const module = getRestriction(name);
        module?.disable();
        enabledModulesRef.current.delete(name);

        if (debug) {
          console.log(`[react-anti-cheat] Disabled (config change): ${name}`);
        }

        onRestrictionChange?.({
          restriction: name,
          action: 'disabled',
          timestamp: Date.now(),
          source: 'config-update',
        });
      }
    }

    for (const name of desiredRestrictions) {
      if (!enabledModulesRef.current.has(name)) {
        const module = getRestriction(name);
        if (!module) {
          if (debug) {
            console.warn(`[react-anti-cheat] Unknown restriction in config: "${name}"`);
          }
          continue;
        }

        const opts = effectiveRestrictions[name] ?? {};
        module.enable(opts, (metadata) => handleViolation(name, metadata));
        enabledModulesRef.current.add(name);

        if (debug) {
          console.log(`[react-anti-cheat] Enabled (config): ${name}`);
        }

        onRestrictionChange?.({
          restriction: name,
          action: 'enabled',
          timestamp: Date.now(),
          source: 'config-update',
        });
      }
    }

    setActiveRestrictionsSet(new Set(enabledModulesRef.current));
  }, [effectiveRestrictions, handleViolation, onRestrictionChange, debug]);

  useEffect(() => {
    const activeRestrictions = Array.from(enabledModulesRef.current);

    onSessionStart?.({
      id: sessionIdRef.current,
      startedAt: startedAtRef.current,
      activeRestrictions,
      config,
    });

    return () => {
      for (const name of enabledModulesRef.current) {
        const module = getRestriction(name);
        module?.disable();
      }
      enabledModulesRef.current.clear();

      const violationsByType: Record<string, number> = {};
      const violationsBySeverity: Record<Severity, number> = {
        info: 0,
        warning: 0,
        critical: 0,
      };

      for (const v of violationsRef.current) {
        violationsByType[v.type] = (violationsByType[v.type] ?? 0) + 1;
        violationsBySeverity[v.severity]++;
      }

      onSessionEnd?.({
        sessionId: sessionIdRef.current,
        startedAt: startedAtRef.current,
        endedAt: Date.now(),
        durationMs: Date.now() - startedAtRef.current,
        totalViolations: violationsRef.current.length,
        violationsByType,
        violationsBySeverity,
        wasLockedOut: isLockedOut,
        lockoutTimestamp: lockoutTimestampRef.current,
      });
    };
  }, []);

  const activeRestrictions = useMemo(
    () => Array.from(activeRestrictionsSet),
    [activeRestrictionsSet]
  );

  const contextValue = useMemo(
    () => ({
      isActive: activeRestrictionsSet.size > 0,
      isLockedOut,
      violations,
      violationCount: violations.length,
      activeRestrictions,
      effectiveRestrictions,
      sessionId: sessionIdRef.current,
      enableRestriction,
      disableRestriction,
      resetViolations,
      lockout: triggerLockout,
      unlock,
      debug,
    }),
    [
      activeRestrictionsSet,
      isLockedOut,
      violations,
      activeRestrictions,
      effectiveRestrictions,
      enableRestriction,
      disableRestriction,
      resetViolations,
      triggerLockout,
      unlock,
      debug,
    ]
  );

  return React.createElement(
    AntiCheatContext.Provider,
    { value: contextValue },
    isLockedOut
      ? lockoutComponent ?? React.createElement(DefaultLockoutComponent, null)
      : children
  );
}
