import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { checkFirebaseSetup } from "../src/utils/firebaseCheck";

export default function Index() {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [setupComplete, setSetupComplete] = useState(false);

    useEffect(() => {
        checkSetup();
    }, []);

    const checkSetup = async () => {
        const result = await checkFirebaseSetup();

        if (result.success) {
            setSetupComplete(true);
        } else {
            console.error('Firebase setup incomplete:', result.message);
            router.replace('/setup-required');
        }

        setChecking(false);
    };

    if (checking) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={{ marginTop: 16, color: '#6b7280' }}>Checking Firebase setup...</Text>
            </View>
        );
    }

    if (setupComplete) {
        return <Redirect href="/(auth)/login" />;
    }

    return null;
}
