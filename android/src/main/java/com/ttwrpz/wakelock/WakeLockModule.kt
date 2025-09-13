package com.ttwrpz.wakelock

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.view.WindowManager
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import java.util.concurrent.atomic.AtomicBoolean

@ReactModule(name = WakeLockModule.NAME)
class WakeLockModule(reactContext: ReactApplicationContext) :
    NativeWakeLockSpec(reactContext) {

    private val context = reactContext
    private val isActive = AtomicBoolean(false)
    private var timeoutHandler: Handler? = null
    private var timeoutRunnable: Runnable? = null
    private var debug = false

    override fun getName(): String = NAME

    private fun log(message: String) {
        if (debug) {
            android.util.Log.d(NAME, message)
        }
    }

    override fun activate(config: ReadableMap, promise: Promise) {
        try {
            val timeout = if (config.hasKey("timeout")) config.getDouble("timeout").toLong() else 0L
            val batteryThreshold = if (config.hasKey("batteryThreshold")) config.getDouble("batteryThreshold") else 0.1
            debug = if (config.hasKey("debug")) config.getBoolean("debug") else false

            val batteryLevel = getBatteryLevelSync()
            if (batteryLevel < batteryThreshold) {
                log("Battery too low: ${(batteryLevel * 100).toInt()}%")
                promise.resolve(false)
                return
            }

            context.currentActivity?.runOnUiThread {
                try {
                    context.currentActivity?.window?.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                    isActive.set(true)
                    log("Wake lock activated")

                    if (timeout > 0) {
                        setupTimeout(timeout)
                    }

                    promise.resolve(true)
                } catch (e: Exception) {
                    log("Failed to activate: ${e.message}")
                    promise.reject("ACTIVATION_ERROR", e.message, e)
                }
            } ?: run {
                promise.reject("NO_ACTIVITY", "No current activity")
            }
        } catch (e: Exception) {
            promise.reject("ACTIVATION_ERROR", e.message, e)
        }
    }

    override fun deactivate(promise: Promise) {
        try {
            clearTimeout()

            context.currentActivity?.runOnUiThread {
                try {
                    context.currentActivity?.window?.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                    isActive.set(false)
                    log("Wake lock deactivated")
                    promise.resolve(true)
                } catch (e: Exception) {
                    log("Failed to deactivate: ${e.message}")
                    promise.reject("DEACTIVATION_ERROR", e.message, e)
                }
            } ?: run {
                isActive.set(false)
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("DEACTIVATION_ERROR", e.message, e)
        }
    }

    override fun isActive(promise: Promise) {
        promise.resolve(isActive.get())
    }

    override fun getBatteryLevel(promise: Promise) {
        try {
            val batteryLevel = getBatteryLevelSync()
            promise.resolve(batteryLevel)
        } catch (e: Exception) {
            promise.reject("BATTERY_ERROR", e.message, e)
        }
    }

    override fun isCharging(promise: Promise) {
        try {
            val batteryStatus = context.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
            val status = batteryStatus?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
            val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
                    status == BatteryManager.BATTERY_STATUS_FULL
            promise.resolve(isCharging)
        } catch (e: Exception) {
            promise.reject("BATTERY_ERROR", e.message, e)
        }
    }

    private fun getBatteryLevelSync(): Double {
        val batteryManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        } else {
            null
        }

        return if (batteryManager != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) / 100.0
        } else {
            // Fallback for older devices
            val batteryStatus = context.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
            val level = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
            val scale = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
            if (level >= 0 && scale > 0) {
                level / scale.toDouble()
            } else {
                1.0 // Assume full battery if can't determine
            }
        }
    }

    private fun setupTimeout(timeout: Long) {
        clearTimeout()

        timeoutHandler = Handler(Looper.getMainLooper())
        timeoutRunnable = Runnable {
            log("Timeout reached, deactivating")
            val promise = PromiseImpl(null, null)
            deactivate(promise)
        }
        timeoutHandler?.postDelayed(timeoutRunnable!!, timeout)
    }

    private fun clearTimeout() {
        timeoutRunnable?.let { runnable ->
            timeoutHandler?.removeCallbacks(runnable)
        }
        timeoutHandler = null
        timeoutRunnable = null
    }

    override fun invalidate() {
        clearTimeout()
        isActive.set(false)
        super.invalidate()
    }

    companion object {
        const val NAME = "WakeLock"
    }
}