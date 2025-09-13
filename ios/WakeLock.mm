#import <WakeLockSpec/WakeLockSpec.h>
#import <UIKit/UIKit.h>

@interface WakeLock : NSObject <NativeWakeLockSpec>
@property (nonatomic, assign) BOOL isActive;
@property (nonatomic, strong) NSTimer *timeoutTimer;
@property (nonatomic, assign) BOOL debug;
@end

@implementation WakeLock

RCT_EXPORT_MODULE()

- (instancetype)init {
    if (self = [super init]) {
        _isActive = NO;
        _debug = NO;
    }
    return self;
}

- (void)log:(NSString *)message {
    if (self.debug) {
        NSLog(@"[WakeLock] %@", message);
    }
}

- (void)activate:(JS::NativeWakeLock::NativeWakeLockConfig &)config
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {

    double timeout = config.timeout();
    double batteryThreshold = config.batteryThreshold();
    self.debug = config.debug();

    // Check battery level
    UIDevice *device = [UIDevice currentDevice];
    device.batteryMonitoringEnabled = YES;
    float batteryLevel = device.batteryLevel;

    if (batteryLevel >= 0 && batteryLevel < batteryThreshold) {
        [self log:[NSString stringWithFormat:@"Battery too low: %.1f%%", batteryLevel * 100]];
        resolve(@NO);
        return;
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        [[UIApplication sharedApplication] setIdleTimerDisabled:YES];
        self.isActive = YES;
        [self log:@"Wake lock activated"];

        // Setup timeout if specified
        if (timeout > 0) {
            [self setupTimeout:timeout];
        }

        resolve(@YES);
    });
}

- (void)deactivate:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
    [self clearTimeout];

    dispatch_async(dispatch_get_main_queue(), ^{
        [[UIApplication sharedApplication] setIdleTimerDisabled:NO];
        self.isActive = NO;
        [self log:@"Wake lock deactivated"];
        resolve(@YES);
    });
}

- (void)isActive:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
    resolve(@(self.isActive));
}

- (void)getBatteryLevel:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
    UIDevice *device = [UIDevice currentDevice];
    device.batteryMonitoringEnabled = YES;
    float batteryLevel = device.batteryLevel;

    // batteryLevel returns -1 if battery monitoring is not available
    if (batteryLevel < 0) {
        resolve(@1.0); // Assume full battery if unavailable
    } else {
        resolve(@(batteryLevel));
    }
}

- (void)isCharging:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
    UIDevice *device = [UIDevice currentDevice];
    device.batteryMonitoringEnabled = YES;
    UIDeviceBatteryState batteryState = device.batteryState;

    BOOL isCharging = (batteryState == UIDeviceBatteryStateCharging ||
                      batteryState == UIDeviceBatteryStateFull);
    resolve(@(isCharging));
}

- (void)setupTimeout:(double)timeout {
    [self clearTimeout];

    self.timeoutTimer = [NSTimer scheduledTimerWithTimeInterval:timeout/1000.0
                                                          target:self
                                                        selector:@selector(handleTimeout)
                                                        userInfo:nil
                                                         repeats:NO];
}

- (void)handleTimeout {
    [self log:@"Timeout reached, deactivating"];
    [self deactivate:^(id result) {} reject:^(NSString *code, NSString *message, NSError *error) {}];
}

- (void)clearTimeout {
    if (self.timeoutTimer) {
        [self.timeoutTimer invalidate];
        self.timeoutTimer = nil;
    }
}

- (void)invalidate {
    [self clearTimeout];
    self.isActive = NO;
    [super invalidate];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
    return std::make_shared<facebook::react::NativeWakeLockSpecJSI>(params);
}

@end