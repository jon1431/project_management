import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { createAccount } from "../../src/services/firebaseService";
import { ArrowLeft } from "lucide-react-native";

export default function SignUpScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        // Validation
        if (!email || !password || !confirmPassword) {
            Alert.alert("Missing Information", "Please fill in all required fields.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Password Mismatch", "Passwords do not match. Please try again.");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Weak Password", "Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);
        try {
            const result = await createAccount(email, password, displayName || undefined);

            if (result.success) {
                // Wait a moment for Firebase auth state to update
                setTimeout(() => {
                    router.replace("/(tabs)/home");
                }, 500);
            } else {
                Alert.alert("Sign Up Failed", result.error || "Failed to create account. Please try again.");
                setLoading(false);
            }
        } catch (error) {
            console.error("Error creating account:", error);
            Alert.alert("Error", "An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white px-6">
            <TouchableOpacity
                className="mt-4 mb-6"
                onPress={() => router.back()}
                disabled={loading}
            >
                <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>

            <View className="items-center mb-10">
                <Text className="text-3xl font-bold text-blue-600">Create Account</Text>
                <Text className="text-gray-500 mt-2">Join Voice Unheard community</Text>
            </View>

            <View className="space-y-4">
                <View>
                    <Text className="text-gray-700 mb-1 font-medium">Display Name (Optional)</Text>
                    <TextInput
                        className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50"
                        placeholder="Your name"
                        value={displayName}
                        onChangeText={setDisplayName}
                        editable={!loading}
                    />
                </View>

                <View>
                    <Text className="text-gray-700 mb-1 font-medium">Email *</Text>
                    <TextInput
                        className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        editable={!loading}
                    />
                </View>

                <View>
                    <Text className="text-gray-700 mb-1 font-medium">Password *</Text>
                    <TextInput
                        className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50"
                        placeholder="At least 6 characters"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!loading}
                    />
                </View>

                <View>
                    <Text className="text-gray-700 mb-1 font-medium">Confirm Password *</Text>
                    <TextInput
                        className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        editable={!loading}
                    />
                </View>

                <TouchableOpacity
                    className={`bg-blue-600 p-4 rounded-lg items-center mt-6 ${
                        loading ? 'opacity-50' : ''
                    }`}
                    onPress={handleSignUp}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Create Account</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View className="mt-8 flex-row justify-center">
                <Text className="text-gray-600">Already have an account? </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    disabled={loading}
                >
                    <Text className="text-blue-600 font-bold">Login</Text>
                </TouchableOpacity>
            </View>

            <View className="mt-6 p-4 bg-blue-50 rounded-lg">
                <Text className="text-blue-900 text-xs text-center">
                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                    Your data will be handled securely.
                </Text>
            </View>
        </SafeAreaView>
    );
}
