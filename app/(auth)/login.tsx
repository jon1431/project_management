import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { signInAnonymously, signInWithEmail } from "../../src/services/firebaseService";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [anonymousLoading, setAnonymousLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Missing Information", "Please enter both email and password.");
            return;
        }

        setLoading(true);
        const result = await signInWithEmail(email, password);
        setLoading(false);

        if (result.success) {
            router.replace("/(tabs)/home");
        } else {
            Alert.alert("Login Failed", result.error || "Failed to sign in. Please try again.");
        }
    };

    const handleAnonymousLogin = async () => {
        setAnonymousLoading(true);
        const result = await signInAnonymously();
        setAnonymousLoading(false);

        if (result.success) {
            router.replace("/(tabs)/home");
        } else {
            Alert.alert("Error", result.error || "Failed to sign in anonymously. Please try again.");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white justify-center px-6">
            <View className="items-center mb-10">
                <Text className="text-3xl font-bold text-blue-600">Voice Unheard</Text>
                <Text className="text-gray-500 mt-2">Speak up safely and anonymously.</Text>
            </View>

            <View className="space-y-4">
                <View>
                    <Text className="text-gray-700 mb-1 font-medium">Email</Text>
                    <TextInput
                        className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        editable={!loading && !anonymousLoading}
                    />
                </View>

                <View>
                    <Text className="text-gray-700 mb-1 font-medium">Password</Text>
                    <TextInput
                        className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!loading && !anonymousLoading}
                    />
                </View>

                <TouchableOpacity
                    className={`bg-blue-600 p-4 rounded-lg items-center mt-4 ${
                        loading ? 'opacity-50' : ''
                    }`}
                    onPress={handleLogin}
                    disabled={loading || anonymousLoading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Login</Text>
                    )}
                </TouchableOpacity>

                <View className="flex-row items-center my-4">
                    <View className="flex-1 h-px bg-gray-300" />
                    <Text className="mx-4 text-gray-500">OR</Text>
                    <View className="flex-1 h-px bg-gray-300" />
                </View>

                <TouchableOpacity
                    className={`bg-gray-800 p-4 rounded-lg items-center ${
                        anonymousLoading ? 'opacity-50' : ''
                    }`}
                    onPress={handleAnonymousLogin}
                    disabled={loading || anonymousLoading}
                >
                    {anonymousLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text className="text-white font-bold text-lg">Continue Anonymously</Text>
                            <Text className="text-gray-400 text-xs mt-1">No personal data will be collected</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <View className="mt-8 flex-row justify-center">
                <Text className="text-gray-600">Don't have an account? </Text>
                <TouchableOpacity
                    onPress={() => router.push("/(auth)/signup")}
                    disabled={loading || anonymousLoading}
                >
                    <Text className="text-blue-600 font-bold">Sign Up</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
