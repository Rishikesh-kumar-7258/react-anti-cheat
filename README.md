# react-anti-cheat

A configurable, extensible anti-cheating system for React applications. Provides route-level control over restrictions like copy prevention, tab-switch detection, devtools blocking, and more — with a plugin architecture that makes adding new restrictions trivial.

**[Full Documentation](https://rishikesh-kumar-7258.github.io/react-anti-cheat/)**

## Installation

```bash
npm install @rishikesh7258/react-anti-cheat
```

## Quick Start

```tsx
import { AntiCheatProvider } from '@rishikesh7258/react-anti-cheat';

const config = {
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
    <AntiCheatProvider config={config}>
      <YourApp />
    </AntiCheatProvider>
  );
}
```

## Using Presets

```tsx
import { AntiCheatProvider, presets } from '@rishikesh7258/react-anti-cheat';

function ExamApp() {
  return (
    <AntiCheatProvider config={{ restrictions: presets.exam }}>
      <ExamContent />
    </AntiCheatProvider>
  );
}
```

Available presets: `exam`, `quiz`, `contentProtection`, `minimal`

## Features

- **12 built-in restrictions** — copy, paste, cut, text selection, right-click, tab switch, devtools, fullscreen, keyboard shortcuts, drag-drop, print screen, idle detection
- **Route-level control** — different restrictions per page via config or zone components
- **Plugin API** — register custom restrictions with the same interface as built-ins
- **TypeScript-first** — full type definitions and autocompletion
- **React hooks** — `useAntiCheat` for control, `useViolationLog` for monitoring
- **SSR-safe** — works with Next.js / Remix
- **Auto-lockout** — lock users out after N violations

## Peer Dependencies

- `react` >= 16.8.0
- `react-dom` >= 16.8.0

## Documentation

For the full API reference, restriction options, presets, custom plugins, and advanced usage, visit the **[documentation site](https://rishikesh-kumar-7258.github.io/react-anti-cheat/)**.

## License

MIT
