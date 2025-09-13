import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWakeLock } from '@ttwrpz/react-native-wake-lock';

export default function App() {
    const {
        isActive,
        activate,
        deactivate,
        toggle,
        batteryLevel,
        isCharging,
    } = useWakeLock({
        timeout: 60000, // 1 minute timeout for demo
        batteryThreshold: 0.1,
        respectAppState: true,
        debug: true,
        onStateChange: (active) => {
            console.log('Wake lock state changed:', active);
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentInsetAdjustmentBehavior="automatic">
                <View style={styles.header}>
                    <Text style={styles.title}>Wake Lock Demo</Text>
                    <View style={styles.status}>
                        <StatusItem
                            label="Wake Lock"
                            value={isActive ? 'Active' : 'Inactive'}
                            active={isActive}
                        />
                        <StatusItem
                            label="Battery"
                            value={
                                batteryLevel !== null
                                    ? `${Math.round(batteryLevel * 100)}%`
                                    : 'Unknown'
                            }
                        />
                        <StatusItem
                            label="Charging"
                            value={isCharging ? 'Yes' : 'No'}
                            active={isCharging}
                        />
                    </View>
                </View>

                <View style={styles.buttons}>
                    <Button
                        title="Activate"
                        onPress={activate}
                        disabled={isActive}
                        style={styles.activateButton}
                    />
                    <Button
                        title="Deactivate"
                        onPress={deactivate}
                        disabled={!isActive}
                        style={styles.deactivateButton}
                    />
                    <Button
                        title="Toggle"
                        onPress={toggle}
                        style={styles.toggleButton}
                    />
                </View>

                <View style={styles.info}>
                    <Text style={styles.infoTitle}>How it works:</Text>
                    <Text style={styles.infoText}>
                        • Wake lock keeps your screen on{'\n'}
                        • Auto-deactivates after 1 minute{'\n'}
                        • Won't activate if battery {'<'} 10%{'\n'}
                        • Deactivates when app backgrounds{'\n'}
                        • Check console for debug logs
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function StatusItem({
                        label,
                        value,
                        active,
                    }: {
    label: string;
    value: string;
    active?: boolean;
}) {
    return (
        <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>{label}</Text>
            <Text style={[styles.statusValue, active && styles.statusActive]}>
                {value}
            </Text>
        </View>
    );
}

function Button({
                    title,
                    onPress,
                    disabled,
                    style,
                }: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    style?: any;
}) {
    return (
        <TouchableOpacity
            style={[styles.button, style, disabled && styles.buttonDisabled]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    status: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statusItem: {
        flex: 1,
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    statusValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    statusActive: {
        color: '#4CAF50',
    },
    buttons: {
        padding: 20,
        gap: 12,
    },
    button: {
        backgroundColor: '#2196F3',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonTextDisabled: {
        color: '#999',
    },
    activateButton: {
        backgroundColor: '#4CAF50',
    },
    deactivateButton: {
        backgroundColor: '#f44336',
    },
    toggleButton: {
        backgroundColor: '#FF9800',
    },
    info: {
        backgroundColor: '#fff',
        margin: 20,
        padding: 16,
        borderRadius: 8,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    touchArea: {
        backgroundColor: '#E3F2FD',
        margin: 20,
        padding: 20,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#2196F3',
        borderStyle: 'dashed',
    },
    touchTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1976D2',
        marginBottom: 8,
    },
    touchText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 12,
    },
    touchStatus: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2196F3',
    },
});