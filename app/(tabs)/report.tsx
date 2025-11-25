import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { submitReport } from "../../src/services/firebaseService";

export default function ReportScreen() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        // Validation
        if (!title || !description || !category) {
            Alert.alert("Missing Information", "Please fill in all required fields (Title, Category, Description).");
            return;
        }

        if (title.length < 5 || title.length > 200) {
            Alert.alert("Invalid Title", "Title must be between 5 and 200 characters.");
            return;
        }

        if (description.length < 20 || description.length > 5000) {
            Alert.alert("Invalid Description", "Description must be between 20 and 5000 characters.");
            return;
        }

        // Validate category
        const validCategories = ['corruption', 'abuse', 'discrimination', 'violence', 'other'];
        const categoryLower = category.toLowerCase().trim();
        if (!validCategories.includes(categoryLower)) {
            Alert.alert(
                "Invalid Category",
                "Please choose one of: corruption, abuse, discrimination, violence, or other"
            );
            return;
        }

        setSubmitting(true);

        // Submit to Firebase
        const result = await submitReport({
            title: title.trim(),
            description: description.trim(),
            category: categoryLower as any,
            location: location.trim() || undefined,
            isAnonymous,
        });

        setSubmitting(false);

        if (result.success) {
            Alert.alert(
                "Report Submitted Successfully",
                "Thank you for your report. It has been sent for review and will appear in the public feed once verified by our moderation team.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            // Clear form
                            setTitle("");
                            setDescription("");
                            setCategory("");
                            setLocation("");
                            setIsAnonymous(true);
                            router.back();
                        }
                    }
                ]
            );
        } else {
            Alert.alert(
                "Submission Failed",
                result.error || "Failed to submit report. Please check your connection and try again."
            );
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-4 py-3 border-b border-gray-200 flex-row items-center">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-3"
                    disabled={submitting}
                >
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">New Report</Text>
            </View>

            <ScrollView className="flex-1 p-5">
                <View className="mb-6">
                    <Text className="text-gray-700 font-medium mb-2">Incident Title *</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 bg-gray-50"
                        placeholder="Briefly describe the incident"
                        value={title}
                        onChangeText={setTitle}
                        maxLength={200}
                        editable={!submitting}
                    />
                    <Text className="text-gray-400 text-xs mt-1">
                        {title.length}/200 characters (minimum 5)
                    </Text>
                </View>

                <View className="mb-6">
                    <Text className="text-gray-700 font-medium mb-2">Category *</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 bg-gray-50"
                        placeholder="corruption, abuse, discrimination, violence, other"
                        value={category}
                        onChangeText={setCategory}
                        autoCapitalize="none"
                        editable={!submitting}
                    />
                    <Text className="text-gray-400 text-xs mt-1">
                        Choose: corruption, abuse, discrimination, violence, or other
                    </Text>
                </View>

                <View className="mb-6">
                    <Text className="text-gray-700 font-medium mb-2">Location (Optional)</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 bg-gray-50"
                        placeholder="Where did this happen? (General area only)"
                        value={location}
                        onChangeText={setLocation}
                        editable={!submitting}
                    />
                    <Text className="text-gray-400 text-xs mt-1">
                        For your safety, provide general location only
                    </Text>
                </View>

                <View className="mb-6">
                    <Text className="text-gray-700 font-medium mb-2">Description *</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 bg-gray-50 h-32"
                        placeholder="Provide detailed information about the incident..."
                        multiline
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                        maxLength={5000}
                        editable={!submitting}
                    />
                    <Text className="text-gray-400 text-xs mt-1">
                        {description.length}/5000 characters (minimum 20)
                    </Text>
                </View>

                <View className="flex-row items-center justify-between bg-blue-50 p-4 rounded-xl mb-8 border border-blue-100">
                    <View className="flex-1 mr-4">
                        <Text className="text-blue-900 font-bold text-base">Submit Anonymously</Text>
                        <Text className="text-blue-700 text-xs mt-1">
                            Your identity will be hidden from the public and authorities.
                        </Text>
                    </View>
                    <Switch
                        value={isAnonymous}
                        onValueChange={setIsAnonymous}
                        trackColor={{ false: "#767577", true: "#2563eb" }}
                        thumbColor={isAnonymous ? "#ffffff" : "#f4f3f4"}
                        disabled={submitting}
                    />
                </View>

                <TouchableOpacity
                    className={`bg-blue-600 p-4 rounded-xl items-center shadow-sm mb-10 ${
                        submitting ? 'opacity-50' : ''
                    }`}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Submit Report</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
