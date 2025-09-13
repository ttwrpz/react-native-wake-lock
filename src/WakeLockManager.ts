import { AppState, AppStateStatus } from 'react-native';
import NativeWakeLock from './NativeWakeLock';
import type { WakeLockOptions, WakeLockState } from './types';

class WakeLockManager {
    private static instance: WakeLockManager;
    private state: WakeLockState = {
        isActive: false,
        batteryLevel: null,
        isCharging: false,
        lastActivated: null,
        timeoutId: null,
    };
    private options: WakeLockOptions = {};
    private appStateListener: any = null;
    private debounceTimer: NodeJS.Timeout | null = null;
    private initialized = false;

    private constructor() {}

    static getInstance(): WakeLockManager {
        if (!WakeLockManager.instance) {
            WakeLockManager.instance = new WakeLockManager();
        }
        return WakeLockManager.instance;
    }

    private async initialize() {
        if (this.initialized || !NativeWakeLock) return;

        try {
            const [batteryLevel, isCharging] = await Promise.all([
                NativeWakeLock.getBatteryLevel().catch(() => 1),
                NativeWakeLock.isCharging().catch(() => false),
            ]);

            this.state.batteryLevel = batteryLevel;
            this.state.isCharging = isCharging;
            this.initialized = true;
        } catch (error) {
            this.handleError(error as Error);
        }
    }

    private log(...args: any[]) {
        if (this.options.debug) {
            console.log('[WakeLock]', ...args);
        }
    }

    private handleError(error: Error) {
        this.log('Error:', error);
        this.options.onError?.(error);
    }

    private clearTimeout() {
        if (this.state.timeoutId) {
            clearTimeout(this.state.timeoutId);
            this.state.timeoutId = null;
        }
    }

    private setupTimeout() {
        this.clearTimeout();

        const timeout = this.options.timeout;
        if (timeout && timeout > 0) {
            this.state.timeoutId = setTimeout(() => {
                this.log('Timeout reached, deactivating');
                this.deactivate();
            }, timeout);
        }
    }

    private async checkBatteryThreshold(): Promise<boolean> {
        if (!this.options.batteryThreshold) return true;

        if (!NativeWakeLock) {
            throw new Error('Native module not available');
        }

        try {
            const batteryLevel = await NativeWakeLock.getBatteryLevel();
            this.state.batteryLevel = batteryLevel;

            if (batteryLevel < this.options.batteryThreshold) {
                this.log(`Battery too low: ${(batteryLevel * 100).toFixed(1)}%`);
                return false;
            }
            return true;
        } catch {
            return true; // Allow if we can't check battery
        }
    }

    private handleAppStateChange = (nextAppState: AppStateStatus) => {
        this.log('App state changed:', nextAppState);

        if (this.options.respectAppState) {
            if (nextAppState === 'background') {
                this.deactivate();
            } else if (nextAppState === 'active' && this.state.lastActivated) {
                // Reactivate if was previously active
                const timeSinceDeactivated = Date.now() - this.state.lastActivated;
                if (timeSinceDeactivated < 60000) { // Within 1 minute
                    this.activate();
                }
            }
        }
    };

    async activate(options?: WakeLockOptions): Promise<boolean> {
        if (options) {
            this.options = { ...this.options, ...options };
        }

        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        return new Promise((resolve) => {
            this.debounceTimer = setTimeout(async () => {
                try {
                    await this.initialize();

                    if (!NativeWakeLock) {
                        throw new Error('Native module not available');
                    }

                    if (!(await this.checkBatteryThreshold())) {
                        resolve(false);
                        return;
                    }

                    if (this.options.activateOnCharging && !this.state.isCharging) {
                        const isCharging = await NativeWakeLock.isCharging();
                        this.state.isCharging = isCharging;
                        if (!isCharging) {
                            this.log('Not charging, skipping activation');
                            resolve(false);
                            return;
                        }
                    }

                    const config = {
                        timeout: this.options.timeout || 0,
                        batteryThreshold: this.options.batteryThreshold || 0.1,
                        debug: this.options.debug || false,
                    };

                    const success = await NativeWakeLock.activate(config);

                    if (success) {
                        this.state.isActive = true;
                        this.state.lastActivated = Date.now();
                        this.setupTimeout();

                        if (this.options.respectAppState && !this.appStateListener) {
                            this.appStateListener = AppState.addEventListener(
                                'change',
                                this.handleAppStateChange
                            );
                        }

                        this.log('Activated successfully');
                        this.options.onStateChange?.(true);
                    }

                    resolve(success);
                } catch (error) {
                    this.handleError(error as Error);
                    resolve(false);
                }
            }, 100);
        });
    }

    async deactivate(): Promise<boolean> {
        try {
            if (!NativeWakeLock) {
                throw new Error('Native module not available');
            }

            const success = await NativeWakeLock.deactivate();

            if (success) {
                this.state.isActive = false;
                this.clearTimeout();

                if (this.appStateListener) {
                    this.appStateListener.remove();
                    this.appStateListener = null;
                }

                this.log('Deactivated successfully');
                this.options.onStateChange?.(false);
            }

            return success;
        } catch (error) {
            this.handleError(error as Error);
            return false;
        }
    }

    async toggle(): Promise<boolean> {
        if (this.state.isActive) {
            return this.deactivate();
        } else {
            return this.activate();
        }
    }

    async isActive(): Promise<boolean> {
        try {
            if (!NativeWakeLock) return false;
            const isActive = await NativeWakeLock.isActive();
            this.state.isActive = isActive;
            return isActive;
        } catch {
            return false;
        }
    }

    getState(): WakeLockState {
        return { ...this.state };
    }

    setOptions(options: WakeLockOptions) {
        this.options = { ...this.options, ...options };
    }
}

export default WakeLockManager.getInstance();