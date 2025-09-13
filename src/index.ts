import WakeLockManager from './WakeLockManager';
import type { WakeLockOptions } from './types';

export type {
  WakeLockOptions,
  WakeLockHookResult,
  WakeLockWithTouchResult,
  WakeLockState,
} from './types';

export { useWakeLock } from './hooks';

export const wakeLock = {
  /**
   * Activate wake lock with optional configuration
   */
  activate: (options?: WakeLockOptions) => WakeLockManager.activate(options),

  /**
   * Deactivate wake lock
   */
  deactivate: () => WakeLockManager.deactivate(),

  /**
   * Toggle wake lock state
   */
  toggle: () => WakeLockManager.toggle(),

  /**
   * Check if wake lock is currently active
   */
  isActive: () => WakeLockManager.isActive(),

  /**
   * Get current state
   */
  getState: () => WakeLockManager.getState(),

  /**
   * Update configuration
   */
  configure: (options: WakeLockOptions) => WakeLockManager.setOptions(options),
};

export default wakeLock;
