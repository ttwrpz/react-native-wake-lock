import { useEffect, useState, useCallback, useRef } from 'react';
import WakeLockManager from './WakeLockManager';
import type {
  WakeLockOptions,
  WakeLockHookResult,
  WakeLockWithTouchResult,
} from './types';

export function useWakeLock(options: WakeLockOptions = {}): WakeLockHookResult {
  const [isActive, setIsActive] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
    WakeLockManager.setOptions(options);
  }, [options]);

  const updateState = useCallback(() => {
    const state = WakeLockManager.getState();
    setIsActive(state.isActive);
    setBatteryLevel(state.batteryLevel);
    setIsCharging(state.isCharging);
  }, []);

  const activate = useCallback(async () => {
    const success = await WakeLockManager.activate(optionsRef.current);
    updateState();
    return success;
  }, [updateState]);

  const deactivate = useCallback(async () => {
    const success = await WakeLockManager.deactivate();
    updateState();
    return success;
  }, [updateState]);

  const toggle = useCallback(async () => {
    const success = await WakeLockManager.toggle();
    updateState();
    return success;
  }, [updateState]);

  useEffect(() => {
    if (options.onStateChange) {
      options.onStateChange(isActive);
    }
  }, [isActive, options]);

  useEffect(() => {
    WakeLockManager.isActive().then(updateState);

    return () => {
      if (optionsRef.current.respectAppState) {
        deactivate();
      }
    };
  }, [deactivate, updateState]);

  return {
    isActive,
    activate,
    deactivate,
    toggle,
    batteryLevel,
    isCharging,
  };
}

/**
 * Touch-aware wake lock hook
 * Use this if you need touch reactivation functionality
 */
export function useWakeLockWithTouch(
  options: WakeLockOptions = {}
): WakeLockWithTouchResult {
  const wakeLock = useWakeLock(options);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const handleTouchStart = useCallback(() => {
    if (!optionsRef.current.reactivateOnTouch) return;

    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }

    if (!wakeLock.isActive) {
      wakeLock.activate();
    }
  }, [wakeLock]);

  const handleTouchEnd = useCallback(() => {
    if (!optionsRef.current.reactivateOnTouch) return;

    const timeout = optionsRef.current.timeout;
    if (wakeLock.isActive && timeout && timeout > 0) {
      touchTimeoutRef.current = setTimeout(() => {
        wakeLock.deactivate();
      }, timeout);
    }
  }, [wakeLock]);

  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }
    };
  }, []);

  return {
    ...wakeLock,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}
