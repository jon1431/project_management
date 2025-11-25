import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Check, X, ArrowLeft } from "lucide-react-native";
import { useState } from "react";

// Mock Pending Reports
const INITIAL_PENDING_REPORTS = [
    {
        id: "101",
        title: "Bribery at Checkpoint",
        category: "Corruption",
        location: "North Highway",
        date: "2023-10-26",
        description: "Police officers asking for money to let trucks pass...",
    },
    {
        id: "102",
        title: "Domestic Violence Incident",
        category: "Abuse",
        location: "Residential Area B",
        date: "2023-10-26",
        description: "Heard loud screaming and fighting from neighbors house...",
    },
];

export default function AdminDashboard() {
    const router = useRouter();
    const [reports, setReports] = useState(INITIAL_PENDING_REPORTS);

    const handleApprove = (id) => {
        Alert.alert("Report Approved", "The report has been verified and published to the feed.");
        setReports(reports.filter((r) => r.id !== id));
    };

    const handleReject = (id) => {
        Alert.alert("Report Rejected", "The report has been removed.");
        setReports(reports.filter((r) => r.id !== id));
    };

    const renderItem = ({ item }) => (
        <View className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-gray-200">
            <View className="mb-2">
                <Text className="text-lg font-bold text-gray-800">{item.title}</Text>
                <Text className="text-blue-600 text-sm font-medium">{item.category}</Text>
            </View>

            <Text className="text-gray-600 text-sm mb-3">{item.description}</Text>

            <View className="flex-row items-center justify-between mt-2">
                <Text className="text-gray-400 text-xs">{item.date} • {item.location}</Text>

                <View className="flex-row space-x-3">
                    <TouchableOpacity
                        className="bg-red-100 p-2 rounded-full mr-2"
                        onPress={() => handleReject(item.id)}
                    >
                        <X size={20} color="#ef4444" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="bg-green-100 p-2 rounded-full"
                        onPress={() => handleApprove(item.id)}
                    >
                        <Check size={20} color="#16a34a" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-5 py-4 bg-white border-b border-gray-200 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ArrowLeft size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">Moderation Queue</Text>
                </View>
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-800 font-bold">{reports.length} Pending</Text>
                </View>
            </View>

            <FlatList
                data={reports}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 20 }}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20">
                        <Text className="text-gray-500 text-lg">No pending reports</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
