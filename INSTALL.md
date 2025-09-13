# Installation & Setup Guide

## Quick Start

### 1. Install the package

```bash
npm install @ttwrpz/react-native-wake-lock
# or
yarn add @ttwrpz/react-native-wake-lock
```

### 2. iOS Setup

```bash
cd ios && pod install
```

### 3. Android Setup

No additional setup required! The library uses `FLAG_KEEP_SCREEN_ON` which doesn't require any special permissions.

## Usage Examples

### Simplest Usage

```typescript jsx
import { useWakeLock } from '@ttwrpz/react-native-wake-lock';

function MyScreen() {
  const { activate, deactivate } = useWakeLock();
  
  // Activate on mount, deactivate on unmount
  useEffect(() => {
    activate();
    return () => deactivate();
  }, []);
  
  return <View>...</View>;
}
```

### With Battery Awareness

```typescript jsx
function Screen() {
  const { isActive, batteryLevel } = useWakeLock({
    batteryThreshold: 0.2,  // Only activate if battery > 20%
    timeout: 5 * 60 * 1000, // Auto-deactivate after 5 minutes
  });
  
  return (
    <View>
      <Text>Battery: {(batteryLevel * 100).toFixed(0)}%</Text>
      <Text>Wake Lock: {isActive ? 'ON' : 'OFF'}</Text>
    </View>
  );
}
```

### Direct API Usage

```typescript
import wakeLock from '@ttwrpz/react-native-wake-lock';

// Anywhere in your app
async function keepScreenOn() {
  await wakeLock.activate({ timeout: 60000 });
}

async function letScreenSleep() {
  await wakeLock.deactivate();
}
```

## Troubleshooting

### iOS Issues

1. **Wake lock not working**: Test on real device, not simulator
2. **Effect not visible**: Disconnect from Xcode debugger
3. **Battery level always 1.0**: Normal on simulator, test on device

### Android Issues

1. **Screen still dims**: Check device's display settings
2. **Not working in background**: This is by design with `respectAppState: true`

### General Issues

1. **Module not found**: Run `cd ios && pod install` after installation
2. **TypeScript errors**: Make sure you have `@types/react-native` installed

## API Options

| Option             | Default | Description                        |
|--------------------|---------|------------------------------------|
| `timeout`          | `0`     | Auto-deactivate after milliseconds |
| `batteryThreshold` | `0.1`   | Minimum battery level (0-1)        |
| `respectAppState`  | `true`  | Deactivate when app backgrounds    |
| `debug`            | `false` | Enable console logging             |

## Common Patterns

### Video Player
```typescript
useWakeLock({ 
  timeout: 0,             // No timeout for videos
  batteryThreshold: 0.05  // Allow even with low battery
});
```

### Reading App
```typescript
useWakeLock({
  timeout: 30 * 60 * 1000,   // 30 minutes
  reactivateOnTouch: true,   // Reset on user interaction
  batteryThreshold: 0.25     // Preserve battery
});
```

### Navigation
```typescript
useWakeLock({
  activateOnCharging: true,  // Usually plugged in car
  respectAppState: false     // Keep active in background
});
```

## Pro Tips

1. **Always test on real devices** - Simulators don't accurately represent wake lock behavior
2. **Use debug mode during development** - `debug: __DEV__`
3. **Consider battery impact** - Set appropriate thresholds for your use case
4. **Handle errors gracefully** - Use the `onError` callback
5. **Respect user's battery** - Always provide a way to disable wake lock

## Need Help

- [Full Documentation](https://github.com/ttwrpz/react-native-wake-lock#readme)
- [Report Issues](https://github.com/ttwrpz/react-native-wake-lock/issues)
- [Discussions](https://github.com/ttwrpz/react-native-wake-lock/discussions)