# @ttwrpz/react-native-wake-lock

Wake lock for React Native with battery awareness, auto-timeout, and lifecycle management.

[![npm version](https://img.shields.io/npm/v/@ttwrpz/react-native-wake-lock.svg)](https://www.npmjs.com/package/@ttwrpz/react-native-wake-lock)
[![MIT License](https://img.shields.io/npm/l/@ttwrpz/react-native-wake-lock.svg)](https://github.com/ttwrpz/react-native-wake-lock/blob/main/LICENSE)

## Features

-  **Battery-aware** - Prevents activation when battery is low
- ️ **Auto-timeout** - Automatically deactivates after specified time
-  **Charging detection** - Can activate only when charging
-  **App lifecycle aware** - Respects app background/foreground state
-  **Touch reactivation** - Reactivates on user interaction
-  **Lightweight** - Minimal dependencies and small bundle size
-  **High performance** - Debounced calls and state caching
-  **TypeScript** - Full type safety and IntelliSense support

## Installation

```bash
npm install @ttwrpz/react-native-wake-lock
# or
yarn add @ttwrpz/react-native-wake-lock
```

### iOS Setup

```bash
cd ios && pod install
```

### Android Setup

No additional setup required for Android.

## Usage

### Basic Usage with Hook

```typescript jsx
import { useWakeLock } from '@ttwrpz/react-native-wake-lock';

function VideoPlayer() {
  const { activate, deactivate, isActive } = useWakeLock();

  return (
    <View>
      <Text>Wake lock is {isActive ? 'active' : 'inactive'}</Text>
      <Button title="Play" onPress={activate} />
      <Button title="Pause" onPress={deactivate} />
    </View>
  );
}
```

### Advanced Usage with Options

```typescript jsx
import { useWakeLock } from '@ttwrpz/react-native-wake-lock';

function VideoPlayer() {
  const {
    isActive,
    activate,
    deactivate,
    toggle,
    batteryLevel,
    isCharging
  } = useWakeLock({
    // Auto-deactivate after 30 minutes
    timeout: 30 * 60 * 1000,
    
    // Only activate if battery > 20%
    batteryThreshold: 0.2,
    
    // Auto-activate when charging
    activateOnCharging: true,
    
    // Deactivate when app goes to background
    respectAppState: true,
    
    // Reactivate on user touch
    reactivateOnTouch: true,
    
    // Enable debug logging
    debug: __DEV__,
    
    // Callbacks
    onStateChange: (isActive) => {
      console.log('Wake lock state:', isActive);
    },
    onError: (error) => {
      console.error('Wake lock error:', error);
    }
  });

  return (
    <View>
      <Text>Battery: {batteryLevel ? `${(batteryLevel * 100).toFixed(0)}%` : 'Unknown'}</Text>
      <Text>Charging: {isCharging ? 'Yes' : 'No'}</Text>
      <Text>Wake Lock: {isActive ? 'Active' : 'Inactive'}</Text>
      <Button title="Toggle" onPress={toggle} />
    </View>
  );
}
```

### Simple Function API

```typescript
import wakeLock from '@ttwrpz/react-native-wake-lock';

// Activate with options
await wakeLock.activate({
  timeout: 5 * 60 * 1000, // 5 minutes
  batteryThreshold: 0.15
});

// Check status
const isActive = await wakeLock.isActive();

// Deactivate
await wakeLock.deactivate();

// Toggle
await wakeLock.toggle();

// Configure globally
wakeLock.configure({
  debug: true,
  batteryThreshold: 0.25
});
```

## API Reference

### `useWakeLock(options?)`

React hook for managing wake lock.

#### Options

| Option               | Type       | Default | Description                                         |
|----------------------|------------|---------|-----------------------------------------------------|
| `timeout`            | `number`   | `0`     | Auto-deactivate after milliseconds (0 = no timeout) |
| `batteryThreshold`   | `number`   | `0.1`   | Minimum battery level (0-1) to activate             |
| `activateOnCharging` | `boolean`  | `false` | Auto-activate when device is charging               |
| `respectAppState`    | `boolean`  | `true`  | Deactivate when app goes to background              |
| `reactivateOnTouch`  | `boolean`  | `false` | Reactivate on user interaction                      |
| `debug`              | `boolean`  | `false` | Enable debug logging                                |
| `onStateChange`      | `function` | -       | Callback when state changes                         |
| `onError`            | `function` | -       | Error callback                                      |

#### Returns

| Property       | Type             | Description                 |
|----------------|------------------|-----------------------------|
| `isActive`     | `boolean`        | Current wake lock state     |
| `activate`     | `() => void`     | Activate wake lock          |
| `deactivate`   | `() => void`     | Deactivate wake lock        |
| `toggle`       | `() => void`     | Toggle wake lock state      |
| `batteryLevel` | `number \| null` | Current battery level (0-1) |
| `isCharging`   | `boolean`        | Whether device is charging  |

### `wakeLock`

Simple function API for wake lock control.

```
wakeLock.activate(options?): Promise<boolean>
wakeLock.deactivate(): Promise<boolean>
wakeLock.toggle(): Promise<boolean>
wakeLock.isActive(): Promise<boolean>
wakeLock.getState(): WakeLockState
wakeLock.configure(options): void
```

## Use Cases

### Video Player
```typescript jsx
function VideoPlayer() {
  useWakeLock({
    timeout: 0, // No timeout for videos
    batteryThreshold: 0.05, // Allow even with low battery
    respectAppState: true
  });
}
```

### Recipe App
```typescript jsx
function RecipeView() {
  useWakeLock({
    timeout: 10 * 60 * 1000, // 10 minutes per recipe step
    reactivateOnTouch: true,
    batteryThreshold: 0.15
  });
}
```

### Navigation App
```typescript jsx
function Navigation() {
  useWakeLock({
    activateOnCharging: true, // Usually plugged in car
    batteryThreshold: 0.20,
    respectAppState: false // Keep active in background
  });
}
```

### Reading App
```typescript jsx
function Reader() {
    const { isActive, onTouchStart, onTouchEnd } = useWakeLockWithTouch({
        timeout: 30 * 60 * 1000, // 30 minutes
        reactivateOnTouch: true,
        batteryThreshold: 0.25,
        activateOnCharging: true
    });

    return (
        <TouchableWithoutFeedback onPressIn={onTouchStart} onPressOut={onTouchEnd}>
        <View style={{ flex: 1 }}>
        <ScrollView>
            <Text>Your content here...</Text>
        </ScrollView>
        </View>
        </TouchableWithoutFeedback>
    );
}
```

## Performance

- **Debounced activation** - Prevents rapid state changes
- **State caching** - Minimizes native bridge calls
- **Lazy initialization** - Native module loads on first use
- **Singleton pattern** - Single instance manages all wake locks
- **Small bundle size** - ~5KB minified + gzipped

## Compatibility

- React Native 0.60+
- iOS 10+
- Android 5.0+ (API 21+)

## Troubleshooting

### Wake lock not working on iOS
- Make sure you're testing on a real device, not simulator
- Disconnect from Xcode debugger to see the effect

### Battery level always returns 1.0 on simulator
- Battery monitoring doesn't work on simulators
- Test on real devices for accurate battery levels

### Wake lock deactivates immediately
- Check battery threshold settings
- Verify app has proper permissions
- Check debug logs for detailed information

## License

MIT

## Support

- [Report bugs](https://github.com/ttwrpz/react-native-wake-lock/issues)
- [Request features](https://github.com/ttwrpz/react-native-wake-lock/issues)
- [Read docs](https://github.com/ttwrpz/react-native-wake-lock#readme)