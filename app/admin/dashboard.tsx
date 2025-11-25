import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Check, X, ArrowLeft } from "lucide-react-native";
import { useState, useEffect } from "react";
import { fetchPendingReports, updateReportStatus } from "../../src/services/firebaseService";
import { Report } from "../../src/types/firebase.types";

export default function AdminDashboard() {
    const router = useRouter();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadPendingReports();
    }, []);

    const loadPendingReports = async () => {
        setLoading(true);
        try {
            const result = await fetchPendingReports(50);
            if (result.success) {
                setReports(result.data || []);
            } else {
                console.error("Error loading pending reports:", result.error);
                Alert.alert("Error", result.error || "Failed to load pending reports");
                setReports([]);
            }
        } catch (error) {
            console.error("Error loading pending reports:", error);
            Alert.alert("Error", "An unexpected error occurred");
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPendingReports();
        setRefreshing(false);
    };

    const handleApprove = async (id: string, title: string) => {
        Alert.alert(
            "Approve Report",
            `Are you sure you want to verify "${title}"? It will be published to the public feed.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Approve",
                    onPress: async () => {
                        try {
                            const result = await updateReportStatus(id, "verified");
                            if (result.success) {
                                Alert.alert("Success", "The report has been verified and published to the feed.");
                                await loadPendingReports();
                            } else {
                                Alert.alert("Error", result.error || "Failed to approve report");
                            }
                        } catch (error) {
                            console.error("Error approving report:", error);
                            Alert.alert("Error", "An unexpected error occurred");
                        }
                    }
                }
            ]
        );
    };

    const handleReject = async (id: string, title: string) => {
        Alert.alert(
            "Reject Report",
            `Are you sure you want to reject "${title}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reject",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const result = await updateReportStatus(id, "rejected", "Does not meet verification criteria");
                            if (result.success) {
                                Alert.alert("Success", "The report has been rejected.");
                                await loadPendingReports();
                            } else {
                                Alert.alert("Error", result.error || "Failed to reject report");
                            }
                        } catch (error) {
                            console.error("Error rejecting report:", error);
                            Alert.alert("Error", "An unexpected error occurred");
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderItem = ({ item }: { item: Report }) => (
        <View className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-gray-200">
            <View className="mb-2">
                <Text className="text-lg font-bold text-gray-800">{item.title}</Text>
                <Text className="text-blue-600 text-sm font-medium">{item.category}</Text>
                {item.isAnonymous && (
                    <Text className="text-gray-500 text-xs mt-1">Anonymous Report</Text>
                )}
            </View>

            <Text className="text-gray-600 text-sm mb-3" numberOfLines={3}>{item.description}</Text>

            <View className="flex-row items-center justify-between mt-2">
                <Text className="text-gray-400 text-xs">
                    {formatDate(item.createdAt)} {item.location ? `• ${item.location}` : ''}
                </Text>

                <View className="flex-row space-x-3">
                    <TouchableOpacity
                        className="bg-red-100 p-2 rounded-full mr-2"
                        onPress={() => handleReject(item.id, item.title)}
                    >
                        <X size={20} color="#ef4444" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="bg-green-100 p-2 rounded-full"
                        onPress={() => handleApprove(item.id, item.title)}
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

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text className="text-gray-500 mt-3">Loading pending reports...</Text>
                </View>
            ) : (
                <FlatList
                    data={reports}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 20 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#2563eb"]}
                        />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Text className="text-gray-500 text-lg">No pending reports</Text>
                            <Text className="text-gray-400 text-sm mt-2">All reports have been reviewed</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
