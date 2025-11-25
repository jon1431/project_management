import { View, Text, TouchableOpacity, Linking, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertCircle, ExternalLink, CheckCircle } from "lucide-react-native";

export default function SetupRequired() {
    const openFirebaseConsole = () => {
        Linking.openURL('https://console.firebase.google.com/project/project-managem/firestore');
    };

    const openAuthConsole = () => {
        Linking.openURL('https://console.firebase.google.com/project/project-managem/authentication');
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <View className="items-center mb-6">
                    <AlertCircle size={64} color="#ef4444" />
                    <Text className="text-2xl font-bold text-gray-900 mt-4">
                        Firebase Setup Required
                    </Text>
                    <Text className="text-gray-500 text-center mt-2">
                        Your Firebase services need to be enabled before you can use the app
                    </Text>
                </View>

                <View className="bg-white rounded-xl p-6 mb-4 border border-gray-200">
                    <Text className="text-lg font-bold text-gray-900 mb-4">
                        Required Steps:
                    </Text>

                    <View className="mb-4">
                        <View className="flex-row items-center mb-2">
                            <View className="w-8 h-8 rounded-full bg-blue-600 items-center justify-center mr-3">
                                <Text className="text-white font-bold">1</Text>
                            </View>
                            <Text className="text-gray-900 font-semibold flex-1">
                                Enable Firestore Database
                            </Text>
                        </View>
                        <Text className="text-gray-600 text-sm ml-11 mb-2">
                            Create a Firestore database in test mode
                        </Text>
                        <TouchableOpacity
                            className="ml-11 bg-blue-50 px-4 py-2 rounded-lg flex-row items-center"
                            onPress={openFirebaseConsole}
                        >
                            <ExternalLink size={16} color="#2563eb" />
                            <Text className="text-blue-600 font-medium ml-2">
                                Open Firestore Console
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mb-4">
                        <View className="flex-row items-center mb-2">
                            <View className="w-8 h-8 rounded-full bg-blue-600 items-center justify-center mr-3">
                                <Text className="text-white font-bold">2</Text>
                            </View>
                            <Text className="text-gray-900 font-semibold flex-1">
                                Enable Authentication
                            </Text>
                        </View>
                        <Text className="text-gray-600 text-sm ml-11 mb-2">
                            Enable Email/Password and Anonymous sign-in
                        </Text>
                        <TouchableOpacity
                            className="ml-11 bg-blue-50 px-4 py-2 rounded-lg flex-row items-center"
                            onPress={openAuthConsole}
                        >
                            <ExternalLink size={16} color="#2563eb" />
                            <Text className="text-blue-600 font-medium ml-2">
                                Open Authentication Console
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
                    <Text className="text-blue-900 font-semibold mb-2">
                        Quick Setup Instructions:
                    </Text>
                    <View className="space-y-2">
                        <View className="flex-row items-start">
                            <CheckCircle size={16} color="#2563eb" style={{ marginTop: 2, marginRight: 8 }} />
                            <Text className="text-blue-800 text-sm flex-1">
                                Click "Open Firestore Console" above
                            </Text>
                        </View>
                        <View className="flex-row items-start">
                            <CheckCircle size={16} color="#2563eb" style={{ marginTop: 2, marginRight: 8 }} />
                            <Text className="text-blue-800 text-sm flex-1">
                                Click "Create database"
                            </Text>
                        </View>
                        <View className="flex-row items-start">
                            <CheckCircle size={16} color="#2563eb" style={{ marginTop: 2, marginRight: 8 }} />
                            <Text className="text-blue-800 text-sm flex-1">
                                Choose "Start in test mode"
                            </Text>
                        </View>
                        <View className="flex-row items-start">
                            <CheckCircle size={16} color="#2563eb" style={{ marginTop: 2, marginRight: 8 }} />
                            <Text className="text-blue-800 text-sm flex-1">
                                Select your region and click "Enable"
                            </Text>
                        </View>
                        <View className="flex-row items-start">
                            <CheckCircle size={16} color="#2563eb" style={{ marginTop: 2, marginRight: 8 }} />
                            <Text className="text-blue-800 text-sm flex-1">
                                Go to Authentication and enable Email/Password + Anonymous
                            </Text>
                        </View>
                        <View className="flex-row items-start">
                            <CheckCircle size={16} color="#2563eb" style={{ marginTop: 2, marginRight: 8 }} />
                            <Text className="text-blue-800 text-sm flex-1">
                                Reload this page
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    className="bg-blue-600 p-4 rounded-xl items-center"
                    onPress={() => {
                        // Reload the page
                        if (typeof window !== 'undefined') {
                            window.location.reload();
                        }
                    }}
                >
                    <Text className="text-white font-bold text-lg">
                        I've Completed Setup - Reload
                    </Text>
                </TouchableOpacity>

                <Text className="text-gray-400 text-xs text-center mt-4">
                    This screen will disappear once Firebase is properly configured
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}
