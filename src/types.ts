export interface WakeLockOptions {
  /**
   * Auto-deactivate after specified milliseconds (0 = no timeout)
   * @default 0
   */
  timeout?: number;

  /**
   * Only keep awake if battery level is above this threshold (0-1)
   * @default 0.1 (10%)
   */
  batteryThreshold?: number;

  /**
   * Automatically activate when device is charging
   * @default false
   */
  activateOnCharging?: boolean;

  /**
   * Deactivate when app goes to background
   * @default true
   */
  respectAppState?: boolean;

  /**
   * Reactivate on user touch/interaction
   * @default false
   */
  reactivateOnTouch?: boolean;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Callback when wake lock state changes
   */
  onStateChange?: (isActive: boolean) => void;

  /**
   * Callback for errors
   */
  onError?: (error: Error) => void;
}

export interface WakeLockState {
  isActive: boolean;
  batteryLevel: number | null;
  isCharging: boolean;
  lastActivated: number | null;
  timeoutId: NodeJS.Timeout | null;
}

export interface WakeLockHookResult {
  /**
   * Current wake lock state
   */
  isActive: boolean;

  /**
   * Activate wake lock
   */
  activate: () => void;

  /**
   * Deactivate wake lock
   */
  deactivate: () => void;

  /**
   * Toggle wake lock state
   */
  toggle: () => void;

  /**
   * Current battery level (0-1)
   */
  batteryLevel: number | null;

  /**
   * Whether device is charging
   */
  isCharging: boolean;
}

export interface WakeLockWithTouchResult extends WakeLockHookResult {
  /**
   * Handler for touch start events
   */
  onTouchStart: () => void;

  /**
   * Handler for touch end events
   */
  onTouchEnd: () => void;
}

export interface NativeWakeLockConfig {
  timeout: number;
  batteryThreshold: number;
  debug: boolean;
}
