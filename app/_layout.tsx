import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";

// Import Firebase configuration to initialize
import '../src/config/firebase';
import { AuthProvider } from '../src/contexts/AuthContext';

export default function RootLayout() {
    useEffect(() => {
        console.log('🚀 Voice Unheard App initialized');
    }, []);

    return (
        <SafeAreaProvider>
            <AuthProvider>
                <StatusBar style="auto" />
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="index" />
                </Stack>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
