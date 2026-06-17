# react-anti-cheat

A configurable, extensible anti-cheating system for React applications. Provides route-level control over restrictions like copy prevention, tab-switch detection, devtools blocking, and more — with a plugin architecture that makes adding new restrictions trivial.

Built with proven, battle-tested libraries under the hood:

| Capability | Powered By |
|---|---|
| Tab-switch detection | [visibilityjs](https://github.com/ai/visibilityjs) (~127k weekly downloads) |
| Fullscreen enforcement | [screenfull](https://github.com/sindresorhus/screenfull) (~3.6M weekly downloads) |
| DevTools detection | [devtools-detector](https://github.com/AepKill/devtools-detector) (~5.8k weekly downloads) |
| Copy/paste/right-click/selection | Native DOM events (zero dependencies) |

---

## Table of Contents

- [react-anti-cheat](#react-anti-cheat)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
  - [Features](#features)
    - [Core](#core)
    - [Extensibility](#extensibility)
    - [Developer Experience](#developer-experience)
    - [Control](#control)
  - [Architecture](#architecture)
  - [API Reference](#api-reference)
    - [`AntiCheatProvider`](#anticheatprovider)
    - [`AntiCheatZone`](#anticheatzone)
    - [`useAntiCheat` Hook](#useanticheat-hook)
    - [`useViolationLog` Hook](#useviolationlog-hook)
  - [Built-in Restrictions](#built-in-restrictions)
    - [`disableCopy`](#disablecopy)
    - [`disablePaste`](#disablepaste)
    - [`disableCut`](#disablecut)
    - [`disableTextSelection`](#disabletextselection)
    - [`disableRightClick`](#disablerightclick)
    - [`detectTabSwitch`](#detecttabswitch)
    - [`detectDevTools`](#detectdevtools)
    - [`enforceFullscreen`](#enforcefullscreen)
    - [`disableKeyboardShortcuts`](#disablekeyboardshortcuts)
    - [`disableDragDrop`](#disabledragdrop)
    - [`disablePrintScreen`](#disableprintscreen)
    - [`detectIdle`](#detectidle)
  - [Callbacks \& Events](#callbacks--events)
    - [`onViolation`](#onviolation)
    - [`onRestrictionChange`](#onrestrictionchange)
    - [`onSessionStart`](#onsessionstart)
    - [`onSessionEnd`](#onsessionend)
  - [Violation Object](#violation-object)
  - [Custom Restrictions (Plugin API)](#custom-restrictions-plugin-api)
    - [`registerRestriction`](#registerrestriction)
    - [Using custom restrictions in config](#using-custom-restrictions-in-config)
    - [Restriction interface](#restriction-interface)
  - [Route-Level Configuration](#route-level-configuration)
    - [Option A: Config-based route mapping](#option-a-config-based-route-mapping)
    - [Option B: Zone-based (component-level)](#option-b-zone-based-component-level)
  - [Presets](#presets)
    - [`presets.exam`](#presetsexam)
    - [`presets.quiz`](#presetsquiz)
    - [`presets.contentProtection`](#presetscontentprotection)
    - [`presets.minimal`](#presetsminimal)
    - [Extending presets](#extending-presets)
  - [Violation Severity Levels](#violation-severity-levels)
  - [Auto-Lockout](#auto-lockout)
  - [TypeScript Types](#typescript-types)
    - [`AntiCheatConfig`](#anticheatconfig)
    - [`RestrictionsConfig`](#restrictionsconfig)
  - [Browser Support](#browser-support)
  - [Peer Dependencies](#peer-dependencies)
  - [License](#license)

---

## Installation

```bash
npm install @gamingage/react-anti-cheat
```

```bash
yarn add @gamingage/react-anti-cheat
```

```bash
pnpm add @gamingage/react-anti-cheat
```

---

## Quick Start

```tsx
import { AntiCheatProvider } from '@gamingage/react-anti-cheat';

const antiCheatConfig = {
  restrictions: {
    disableCopy: { enabled: true },
    disableRightClick: { enabled: true },
    detectTabSwitch: { enabled: true, maxViolations: 3 },
    detectDevTools: { enabled: true },
  },
  onViolation: (violation) => {
    console.warn(`Violation: ${violation.type}`, violation);
  },
};

function App() {
  return (
    <AntiCheatProvider config={antiCheatConfig}>
      <YourApp />
    </AntiCheatProvider>
  );
}
```

---

## Features

### Core
- **12 built-in restrictions** covering copy/paste, right-click, tab-switch, devtools, fullscreen, keyboard shortcuts, drag-drop, print screen, and idle detection
- **Per-restriction configuration** — enable/disable each restriction independently with granular options
- **Route-level control** — different pages get different restriction sets via config or zone components
- **Violation tracking** — every restricted action is captured as a structured violation event with timestamp, type, severity, and metadata

### Extensibility
- **Plugin API** — register custom restrictions that follow the same interface as built-ins
- **Presets** — predefined restriction bundles (`exam`, `quiz`, `content-protection`, `minimal`) for common use cases
- **Custom severity levels** — `info`, `warning`, `critical` per restriction type

### Developer Experience
- **TypeScript-first** — full type definitions, autocompletion for config and events
- **React hooks** — `useAntiCheat` for control, `useViolationLog` for monitoring
- **Zero config required** — works with sensible defaults, customize only what you need
- **Tree-shakable** — only the restrictions you enable get bundled
- **SSR-safe** — all DOM access is guarded, works with Next.js / Remix

### Control
- **Auto-lockout** — optional automatic lockout after N violations
- **Session lifecycle** — callbacks for session start/end to integrate with your backend
- **Programmatic control** — enable/disable/reset restrictions at runtime via hook
- **Scoped zones** — `<AntiCheatZone>` component to apply restrictions to specific sections of the UI

---

## Architecture

```
AntiCheatProvider (top-level context)
│
├── Restriction Registry
│   ├── Built-in restrictions (12 modules)
│   └── Custom restrictions (via registerRestriction)
│
├── Violation Manager
│   ├── Captures violation events
│   ├── Tracks count per type
│   └── Triggers callbacks & auto-lockout
│
├── AntiCheatZone (scoped overrides)
│   └── Merges parent config with zone-level overrides
│
└── Hooks
    ├── useAntiCheat() — control API
    └── useViolationLog() — violation history
```

Each restriction is a standalone module implementing the `Restriction` interface:

```ts
interface Restriction {
  name: string;
  enable(options: Record<string, any>, onViolation: ViolationHandler): void;
  disable(): void;
}
```

---

## API Reference

### `AntiCheatProvider`

Top-level provider that wraps your application and manages all restrictions.

```tsx
<AntiCheatProvider
  config={config}
  onViolation={handleViolation}
  onRestrictionChange={handleChange}
  onSessionStart={handleSessionStart}
  onSessionEnd={handleSessionEnd}
  lockoutAfter={10}
  lockoutComponent={<CustomLockoutScreen />}
  debug={false}
>
  {children}
</AntiCheatProvider>
```

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `config` | `AntiCheatConfig` | Yes | — | Restriction configuration object |
| `onViolation` | `(violation: Violation) => void` | No | — | Called on every violation event |
| `onRestrictionChange` | `(changes: RestrictionChange) => void` | No | — | Called when restrictions are enabled/disabled at runtime |
| `onSessionStart` | `(session: Session) => void` | No | — | Called when the provider mounts and restrictions activate |
| `onSessionEnd` | `(summary: SessionSummary) => void` | No | — | Called on unmount with a summary of all violations |
| `lockoutAfter` | `number` | No | `undefined` | Total violation count that triggers auto-lockout |
| `lockoutComponent` | `ReactNode` | No | Built-in screen | Custom UI shown when lockout triggers |
| `debug` | `boolean` | No | `false` | Logs restriction lifecycle and violations to console |

---

### `AntiCheatZone`

Scoped wrapper that overrides the parent config for a specific section of the UI.

```tsx
{/* Disable copy only inside this zone */}
<AntiCheatZone
  restrictions={{ disableCopy: { enabled: true } }}
  mode="override"
>
  <ExamContent />
</AntiCheatZone>

{/* Disable all restrictions inside this zone */}
<AntiCheatZone restrictions={{}} mode="replace">
  <HelpSection />
</AntiCheatZone>
```

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `restrictions` | `RestrictionsConfig` | Yes | — | Restriction overrides for this zone |
| `mode` | `'merge' \| 'override' \| 'replace'` | No | `'merge'` | How zone config combines with parent config |

**Modes:**
- `merge` — zone config is deep-merged with parent (zone values win on conflict)
- `override` — only the restrictions specified in the zone are active; unmentioned ones use parent defaults
- `replace` — completely replaces parent config; only zone restrictions are active

---

### `useAntiCheat` Hook

Provides runtime control over the anti-cheat system.

```tsx
const {
  isActive,
  isLockedOut,
  violations,
  violationCount,
  activeRestrictions,
  enableRestriction,
  disableRestriction,
  resetViolations,
  lockout,
  unlock,
} = useAntiCheat();
```

| Property | Type | Description |
|---|---|---|
| `isActive` | `boolean` | Whether the anti-cheat system is currently active |
| `isLockedOut` | `boolean` | Whether the user has been locked out |
| `violations` | `Violation[]` | Array of all violation events in the current session |
| `violationCount` | `number` | Total number of violations |
| `activeRestrictions` | `string[]` | Names of currently active restrictions |
| `enableRestriction` | `(name: string, options?: object) => void` | Enable a restriction at runtime |
| `disableRestriction` | `(name: string) => void` | Disable a restriction at runtime |
| `resetViolations` | `() => void` | Clear all recorded violations and reset counts |
| `lockout` | `() => void` | Manually trigger lockout |
| `unlock` | `() => void` | Release lockout state |

---

### `useViolationLog` Hook

Subscribe to violation events reactively. Useful for building custom violation UIs or sending violations to a backend.

```tsx
const { violations, countByType, countBySeverity, lastViolation } = useViolationLog({
  filter: ['detectTabSwitch', 'detectDevTools'],
  maxEntries: 100,
});
```

| Option | Type | Default | Description |
|---|---|---|---|
| `filter` | `string[]` | All types | Only track violations of these types |
| `maxEntries` | `number` | `500` | Max violations to keep in memory |

| Return | Type | Description |
|---|---|---|
| `violations` | `Violation[]` | Filtered violation list |
| `countByType` | `Record<string, number>` | Violation count grouped by restriction type |
| `countBySeverity` | `Record<Severity, number>` | Violation count grouped by severity level |
| `lastViolation` | `Violation \| null` | Most recent violation event |

---

## Built-in Restrictions

### `disableCopy`

Prevents the user from copying content.

```ts
disableCopy: {
  enabled: true,
  severity: 'warning',         // default: 'warning'
  showNotification: true,      // show a toast/message on attempt (default: true)
  notificationMessage: string, // custom message (default: 'Copying is disabled')
  allowInputs: true,           // allow copy inside <input> and <textarea> (default: false)
}
```

**Violation metadata:** `{ attempted: 'copy', target: string }`

---

### `disablePaste`

Prevents the user from pasting content.

```ts
disablePaste: {
  enabled: true,
  severity: 'warning',
  showNotification: true,
  notificationMessage: string,
  allowInputs: true,           // allow paste inside <input> and <textarea> (default: false)
}
```

**Violation metadata:** `{ attempted: 'paste', target: string }`

---

### `disableCut`

Prevents the user from cutting content.

```ts
disableCut: {
  enabled: true,
  severity: 'warning',
  showNotification: true,
  notificationMessage: string,
}
```

**Violation metadata:** `{ attempted: 'cut', target: string }`

---

### `disableTextSelection`

Prevents the user from selecting text on the page.

```ts
disableTextSelection: {
  enabled: true,
  severity: 'info',
  excludeSelectors: string[],  // CSS selectors where selection IS allowed (default: [])
}
```

**Implementation:** Applies `user-select: none` via CSS and intercepts `selectstart` events.

**Violation metadata:** `{ target: string }`

---

### `disableRightClick`

Disables the browser context menu.

```ts
disableRightClick: {
  enabled: true,
  severity: 'info',
  showNotification: false,
  excludeSelectors: string[],  // CSS selectors where right-click IS allowed (default: [])
}
```

**Violation metadata:** `{ x: number, y: number, target: string }`

---

### `detectTabSwitch`

Detects when the user switches to a different tab or window.

```ts
detectTabSwitch: {
  enabled: true,
  severity: 'critical',
  maxViolations: number,       // auto-lockout after N tab switches (default: undefined — uses global lockout)
  gracePeriodMs: number,       // ignore switches shorter than this (default: 0)
  trackDuration: true,         // track how long the user was away (default: true)
}
```

**Violation metadata:** `{ durationMs: number | null, switchCount: number }`

**Powered by:** `visibilityjs`

---

### `detectDevTools`

Detects when browser DevTools is opened.

```ts
detectDevTools: {
  enabled: true,
  severity: 'critical',
  action: 'warn',              // 'warn' | 'redirect' | 'lockout' (default: 'warn')
  redirectUrl: string,         // URL to redirect to if action is 'redirect'
  checkIntervalMs: number,     // detection polling interval (default: 1000)
}
```

**Violation metadata:** `{ devToolsOpen: boolean }`

**Powered by:** `devtools-detector`

---

### `enforceFullscreen`

Forces the browser into fullscreen mode and detects exits.

```ts
enforceFullscreen: {
  enabled: true,
  severity: 'critical',
  promptOnMount: true,         // request fullscreen when restriction activates (default: true)
  reEnterOnExit: true,         // prompt user to re-enter fullscreen on exit (default: true)
  maxExits: number,            // lockout after N fullscreen exits (default: undefined)
  promptMessage: string,       // custom message shown in re-enter prompt
}
```

**Violation metadata:** `{ exitCount: number }`

**Powered by:** `screenfull`

**Note:** Browsers require a user gesture to enter fullscreen. When `promptOnMount` is true, a modal is shown asking the user to click to enter fullscreen.

---

### `disableKeyboardShortcuts`

Blocks specific keyboard shortcuts.

```ts
disableKeyboardShortcuts: {
  enabled: true,
  severity: 'warning',
  blocked: string[],           // shortcuts to block (default: list below)
  allowList: string[],         // shortcuts to explicitly allow (overrides blocked)
  showNotification: true,
}
```

**Default blocked shortcuts:**
```
Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+S,
Ctrl+U (view source), Ctrl+Shift+I (devtools),
Ctrl+Shift+J (console), Ctrl+Shift+C (inspector),
F12, Ctrl+P (print), Ctrl+F (find — optional)
```

**Shortcut format:** Modifier keys joined with `+`. Examples: `'Ctrl+C'`, `'Ctrl+Shift+I'`, `'F12'`, `'Alt+Tab'`

**Violation metadata:** `{ shortcut: string, key: string, modifiers: string[] }`

---

### `disableDragDrop`

Prevents drag and drop operations on the page.

```ts
disableDragDrop: {
  enabled: true,
  severity: 'info',
  excludeSelectors: string[],  // CSS selectors where drag-drop IS allowed
}
```

**Violation metadata:** `{ attempted: 'drag' | 'drop', target: string }`

---

### `disablePrintScreen`

Detects print screen key and overlays the page content to prevent screenshots.

```ts
disablePrintScreen: {
  enabled: true,
  severity: 'critical',
  overlayColor: string,        // overlay color when PrintScreen detected (default: '#000000')
  overlayDurationMs: number,   // how long overlay stays (default: 1000)
  blockPrintDialog: true,      // intercept Ctrl+P as well (default: true)
}
```

**Violation metadata:** `{ method: 'printscreen' | 'print-dialog' }`

**Note:** This is a deterrent, not a guarantee. OS-level screenshots cannot be fully prevented by a web application.

---

### `detectIdle`

Detects when the user has been idle (no mouse/keyboard activity) for a configurable duration.

```ts
detectIdle: {
  enabled: true,
  severity: 'warning',
  idleThresholdMs: number,     // time before user is considered idle (default: 60000 — 1 minute)
  events: string[],            // DOM events that reset the idle timer (default: ['mousemove', 'keydown', 'scroll', 'touchstart'])
}
```

**Violation metadata:** `{ idleDurationMs: number }`

---

## Callbacks & Events

### `onViolation`

Called every time any restriction is violated.

```ts
onViolation: (violation: Violation) => void
```

```ts
const config = {
  onViolation: (violation) => {
    // Send to your backend
    fetch('/api/violations', {
      method: 'POST',
      body: JSON.stringify(violation),
    });

    // Or show a warning
    if (violation.severity === 'critical') {
      showWarningModal('This action has been recorded.');
    }
  },
};
```

---

### `onRestrictionChange`

Called when a restriction is enabled or disabled at runtime (via the `useAntiCheat` hook).

```ts
onRestrictionChange: (change: RestrictionChange) => void
```

```ts
interface RestrictionChange {
  restriction: string;        // restriction name
  action: 'enabled' | 'disabled';
  timestamp: number;
  source: 'programmatic' | 'zone-change' | 'config-update';
}
```

---

### `onSessionStart`

Called when `AntiCheatProvider` mounts and restrictions become active.

```ts
onSessionStart: (session: Session) => void
```

```ts
interface Session {
  id: string;                  // unique session ID (UUID)
  startedAt: number;           // timestamp
  activeRestrictions: string[];
  config: AntiCheatConfig;
}
```

---

### `onSessionEnd`

Called when `AntiCheatProvider` unmounts. Provides a summary of the entire session.

```ts
onSessionEnd: (summary: SessionSummary) => void
```

```ts
interface SessionSummary {
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
```

---

## Violation Object

Every violation event follows this structure:

```ts
interface Violation {
  id: string;                  // unique violation ID (UUID)
  type: string;                // restriction name (e.g., 'disableCopy', 'detectTabSwitch')
  severity: 'info' | 'warning' | 'critical';
  timestamp: number;           // Unix timestamp (ms)
  message: string;             // human-readable description
  metadata: Record<string, any>; // restriction-specific data (documented per restriction above)
  sessionId: string;           // links to the active session
}
```

---

## Custom Restrictions (Plugin API)

Register your own restrictions that integrate seamlessly with the system.

### `registerRestriction`

```ts
import { registerRestriction } from '@gamingage/react-anti-cheat';

registerRestriction({
  name: 'detectScreenRecording',

  enable(options, onViolation) {
    // Set up your detection logic
    // Call onViolation(metadata) when a violation is detected
    this._handler = () => {
      onViolation({
        method: 'screen-capture-api',
      });
    };
    navigator.mediaDevices.addEventListener('devicechange', this._handler);
  },

  disable() {
    // Clean up listeners and state
    navigator.mediaDevices.removeEventListener('devicechange', this._handler);
  },
});
```

### Using custom restrictions in config

Once registered, use it like any built-in:

```ts
const config = {
  restrictions: {
    disableCopy: { enabled: true },
    detectScreenRecording: { enabled: true, severity: 'critical' },
  },
};
```

### Restriction interface

```ts
interface RestrictionModule {
  name: string;
  enable(options: Record<string, any>, onViolation: (metadata: Record<string, any>) => void): void;
  disable(): void;
}
```

**Rules for custom restrictions:**
1. `enable()` must be idempotent — calling it twice should not double-register listeners
2. `disable()` must fully clean up — no lingering listeners, timers, or DOM mutations
3. `name` must be unique across all registered restrictions

---

## Route-Level Configuration

The library is **router-agnostic**. You control which restrictions are active per route using either config mapping or zone components.

### Option A: Config-based route mapping

Pass a `routes` object to the provider. Keys are path patterns (supports `*` wildcards).

```tsx
const config = {
  restrictions: {
    disableCopy: { enabled: true },
    disableRightClick: { enabled: true },
  },
  routes: {
    '/arena/*': {
      detectTabSwitch: { enabled: true, severity: 'critical' },
      enforceFullscreen: { enabled: true },
      detectDevTools: { enabled: true },
    },
    '/quiz/*': {
      detectTabSwitch: { enabled: true, maxViolations: 3 },
      disableKeyboardShortcuts: { enabled: true },
    },
    '/community/*': false,       // disable ALL restrictions on community pages
    '/help': false,
  },
};

// You must pass the current path for route matching
<AntiCheatProvider config={config} currentPath={location.pathname}>
  <App />
</AntiCheatProvider>
```

**Route matching rules:**
- Exact match takes priority over wildcard
- More specific patterns take priority over less specific
- Route config is merged with the base `restrictions` (route values win)
- `false` disables all restrictions for that route

### Option B: Zone-based (component-level)

```tsx
<AntiCheatZone restrictions={{ detectTabSwitch: { enabled: true } }}>
  <QuizPage />
</AntiCheatZone>

<AntiCheatZone restrictions={{}} mode="replace">
  <FreeZone />  {/* No restrictions here */}
</AntiCheatZone>
```

---

## Presets

Pre-configured restriction bundles for common use cases.

```tsx
import { presets } from '@gamingage/react-anti-cheat';
```

### `presets.exam`

Maximum restrictions — for timed exams and high-stakes assessments.

```ts
{
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
}
```

### `presets.quiz`

Moderate restrictions — for quizzes and practice tests.

```ts
{
  disableCopy: { enabled: true },
  disablePaste: { enabled: true },
  detectTabSwitch: { enabled: true, severity: 'warning', gracePeriodMs: 2000 },
  disableRightClick: { enabled: true },
}
```

### `presets.contentProtection`

Prevents content theft — for protected articles, premium content.

```ts
{
  disableCopy: { enabled: true },
  disableCut: { enabled: true },
  disableTextSelection: { enabled: true },
  disableRightClick: { enabled: true },
  disableDragDrop: { enabled: true },
  disablePrintScreen: { enabled: true },
}
```

### `presets.minimal`

Lightweight monitoring — just tracks without blocking.

```ts
{
  detectTabSwitch: { enabled: true, severity: 'info' },
  detectIdle: { enabled: true, severity: 'info' },
}
```

### Extending presets

```tsx
import { presets } from '@gamingage/react-anti-cheat';

const config = {
  restrictions: {
    ...presets.quiz,
    detectDevTools: { enabled: true },  // add devtools detection on top of quiz preset
  },
};
```

---

## Violation Severity Levels

| Severity | Meaning | Default Use |
|---|---|---|
| `info` | Action logged, no user-facing consequence | Text selection, idle detection |
| `warning` | Action logged, optional user notification | Copy/paste/cut, keyboard shortcuts |
| `critical` | Action logged, may trigger lockout | Tab switch, devtools, fullscreen exit |

Each restriction has a default severity (documented above) that can be overridden in config.

---

## Auto-Lockout

When `lockoutAfter` is set on the provider, the system automatically locks the user out after the total violation count reaches the threshold.

```tsx
<AntiCheatProvider
  config={config}
  lockoutAfter={10}
  lockoutComponent={
    <div>
      <h1>Session Terminated</h1>
      <p>Too many violations were detected. Your session has been recorded.</p>
    </div>
  }
>
  <App />
</AntiCheatProvider>
```

**Lockout behavior:**
- All children are replaced with the `lockoutComponent`
- `onViolation` fires one final time with `type: 'system:lockout'`
- `onSessionEnd` fires with `wasLockedOut: true`
- Lockout persists until `unlock()` is called via the hook or the provider unmounts

**Per-restriction lockout:** Some restrictions (like `detectTabSwitch` and `enforceFullscreen`) support their own `maxViolations` option that triggers lockout independently of the global count.

---

## TypeScript Types

All types are exported from the package root.

```ts
import type {
  AntiCheatConfig,
  RestrictionsConfig,
  Restriction,
  RestrictionModule,
  Violation,
  Severity,
  Session,
  SessionSummary,
  RestrictionChange,
  AntiCheatProviderProps,
  AntiCheatZoneProps,
  UseAntiCheatReturn,
  UseViolationLogOptions,
  UseViolationLogReturn,
  Preset,
} from '@gamingage/react-anti-cheat';
```

### `AntiCheatConfig`

```ts
interface AntiCheatConfig {
  restrictions: RestrictionsConfig;
  routes?: Record<string, RestrictionsConfig | false>;
  onViolation?: (violation: Violation) => void;
  onRestrictionChange?: (change: RestrictionChange) => void;
  onSessionStart?: (session: Session) => void;
  onSessionEnd?: (summary: SessionSummary) => void;
  lockoutAfter?: number;
  lockoutComponent?: React.ReactNode;
  debug?: boolean;
}
```

### `RestrictionsConfig`

```ts
interface RestrictionsConfig {
  disableCopy?: RestrictionOptions & { allowInputs?: boolean; showNotification?: boolean; notificationMessage?: string };
  disablePaste?: RestrictionOptions & { allowInputs?: boolean; showNotification?: boolean; notificationMessage?: string };
  disableCut?: RestrictionOptions & { showNotification?: boolean; notificationMessage?: string };
  disableTextSelection?: RestrictionOptions & { excludeSelectors?: string[] };
  disableRightClick?: RestrictionOptions & { showNotification?: boolean; excludeSelectors?: string[] };
  detectTabSwitch?: RestrictionOptions & { maxViolations?: number; gracePeriodMs?: number; trackDuration?: boolean };
  detectDevTools?: RestrictionOptions & { action?: 'warn' | 'redirect' | 'lockout'; redirectUrl?: string; checkIntervalMs?: number };
  enforceFullscreen?: RestrictionOptions & { promptOnMount?: boolean; reEnterOnExit?: boolean; maxExits?: number; promptMessage?: string };
  disableKeyboardShortcuts?: RestrictionOptions & { blocked?: string[]; allowList?: string[]; showNotification?: boolean };
  disableDragDrop?: RestrictionOptions & { excludeSelectors?: string[] };
  disablePrintScreen?: RestrictionOptions & { overlayColor?: string; overlayDurationMs?: number; blockPrintDialog?: boolean };
  detectIdle?: RestrictionOptions & { idleThresholdMs?: number; events?: string[] };
  [customRestriction: string]: RestrictionOptions | undefined;
}

interface RestrictionOptions {
  enabled: boolean;
  severity?: Severity;
}

type Severity = 'info' | 'warning' | 'critical';
```

---

## Browser Support

| Browser | Version |
|---|---|
| Chrome | 80+ |
| Firefox | 80+ |
| Safari | 13+ |
| Edge | 80+ |

**Notes:**
- Fullscreen API is not available in some mobile browsers and iframes without `allowfullscreen`
- DevTools detection relies on heuristics and may not work in all browser versions
- Print screen detection is best-effort on all platforms

---

## Peer Dependencies

```json
{
  "react": ">=16.8.0",
  "react-dom": ">=16.8.0"
}
```

The following are bundled (not peer deps — consumers don't need to install them):
- `visibilityjs` — tab visibility detection
- `screenfull` — fullscreen API wrapper
- `devtools-detector` — devtools detection

---

## License

MIT
