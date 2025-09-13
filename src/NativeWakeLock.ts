import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

interface NativeWakeLockConfig {
  timeout: number;
  batteryThreshold: number;
  debug: boolean;
}

export interface Spec extends TurboModule {
  activate(config: NativeWakeLockConfig): Promise<boolean>;
  deactivate(): Promise<boolean>;
  isActive(): Promise<boolean>;
  getBatteryLevel(): Promise<number>;
  isCharging(): Promise<boolean>;
}

export default TurboModuleRegistry.get<Spec>('WakeLock');
