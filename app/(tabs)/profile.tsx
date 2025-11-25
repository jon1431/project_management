import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LogOut, FileText, Eye, ThumbsUp, Clock, CheckCircle, XCircle, AlertCircle, Trash2 } from "lucide-react-native";
import { useState, useEffect } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import { fetchMyReports, deleteMyReport, signOut } from "../../src/services/firebaseService";
import { Report } from "../../src/types/firebase.types";

export default function ProfileScreen() {
    const router = useRouter();
    const { user, userData, loading: authLoading } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user) {
            loadMyReports();
        }
    }, [user]);

    const loadMyReports = async () => {
        setLoading(true);
        try {
            const result = await fetchMyReports(50);
            if (result.success) {
                setReports(result.data || []);
            } else {
                console.error("Error loading reports:", result.error);
                setReports([]);
            }
        } catch (error) {
            console.error("Error loading reports:", error);
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMyReports();
        setRefreshing(false);
    };

    const handleSignOut = async () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await signOut();
                            router.replace("/(auth)/login");
                        } catch (error) {
                            console.error("Error signing out:", error);
                            Alert.alert("Error", "Failed to sign out. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteReport = async (reportId: string, reportTitle: string) => {
        Alert.alert(
            "Delete Report",
            `Are you sure you want to delete "${reportTitle}"? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const result = await deleteMyReport(reportId);
                            if (result.success) {
                                Alert.alert("Success", "Report deleted successfully");
                                await loadMyReports();
                            } else {
                                Alert.alert("Error", result.error || "Failed to delete report");
                            }
                        } catch (error) {
                            console.error("Error deleting report:", error);
                            Alert.alert("Error", "An unexpected error occurred");
                        }
                    }
                }
            ]
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock size={16} color="#f59e0b" />;
            case 'under_review':
                return <AlertCircle size={16} color="#3b82f6" />;
            case 'verified':
                return <CheckCircle size={16} color="#10b981" />;
            case 'rejected':
                return <XCircle size={16} color="#ef4444" />;
            case 'resolved':
                return <CheckCircle size={16} color="#6b7280" />;
            default:
                return <Clock size={16} color="#9ca3af" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'under_review':
                return 'bg-blue-100 text-blue-800';
            case 'verified':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'resolved':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'corruption':
                return 'bg-red-500';
            case 'abuse':
                return 'bg-orange-500';
            case 'discrimination':
                return 'bg-purple-500';
            case 'violence':
                return 'bg-red-700';
            default:
                return 'bg-gray-500';
        }
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
        <View className="bg-white p-4 rounded-xl mb-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                    <View className={`px-3 py-1 rounded-full mr-2 ${getCategoryColor(item.category)}`}>
                        <Text className="text-xs font-bold text-white uppercase">
                            {item.category}
                        </Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full flex-row items-center ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <Text className="text-xs font-medium ml-1">
                            {item.status.replace('_', ' ')}
                        </Text>
                    </View>
                </View>
                {item.status === 'pending' && (
                    <TouchableOpacity
                        onPress={() => handleDeleteReport(item.id, item.title)}
                        className="ml-2 p-2"
                    >
                        <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                )}
            </View>

            <Text className="text-lg font-bold text-gray-900 mb-2">
                {item.title}
            </Text>

            <Text className="text-gray-600 mb-3" numberOfLines={2}>
                {item.description}
            </Text>

            <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                <Text className="text-gray-400 text-xs">
                    {formatDate(item.createdAt)}
                </Text>
                <View className="flex-row items-center">
                    <View className="flex-row items-center mr-3">
                        <Eye size={14} color="#6b7280" />
                        <Text className="text-gray-500 text-xs ml-1">{item.viewCount}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <ThumbsUp size={14} color="#2563eb" />
                        <Text className="text-blue-600 text-xs ml-1 font-medium">{item.upvotes}</Text>
                    </View>
                </View>
            </View>

            {item.moderatorNotes && (
                <View className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <Text className="text-blue-900 font-medium text-xs mb-1">Moderator Note:</Text>
                    <Text className="text-blue-800 text-xs">{item.moderatorNotes}</Text>
                </View>
            )}
        </View>
    );

    if (authLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
                <ActivityIndicator size="large" color="#2563eb" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="px-5 py-4 bg-white border-b border-gray-200">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-2xl font-bold text-gray-900">Profile</Text>
                        <Text className="text-gray-500 text-sm">
                            {userData?.isAnonymous ? 'Anonymous User' : userData?.email || 'User'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        className="bg-red-50 p-3 rounded-full"
                        onPress={handleSignOut}
                    >
                        <LogOut size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Stats Cards */}
            <View className="flex-row px-5 py-4 space-x-3">
                <View className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <FileText size={24} color="#2563eb" />
                    <Text className="text-2xl font-bold text-blue-900 mt-2">
                        {reports.length}
                    </Text>
                    <Text className="text-blue-700 text-xs">Total Reports</Text>
                </View>
                <View className="flex-1 bg-green-50 p-4 rounded-xl border border-green-100">
                    <CheckCircle size={24} color="#10b981" />
                    <Text className="text-2xl font-bold text-green-900 mt-2">
                        {reports.filter(r => r.status === 'verified').length}
                    </Text>
                    <Text className="text-green-700 text-xs">Verified</Text>
                </View>
                <View className="flex-1 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                    <Clock size={24} color="#f59e0b" />
                    <Text className="text-2xl font-bold text-yellow-900 mt-2">
                        {reports.filter(r => r.status === 'pending').length}
                    </Text>
                    <Text className="text-yellow-700 text-xs">Pending</Text>
                </View>
            </View>

            {/* My Reports Section */}
            <View className="px-5 py-2">
                <Text className="text-lg font-bold text-gray-900">My Reports</Text>
                <Text className="text-gray-500 text-sm">Track your submitted reports</Text>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text className="text-gray-500 mt-3">Loading your reports...</Text>
                </View>
            ) : reports.length === 0 ? (
                <View className="flex-1 items-center justify-center px-6">
                    <FileText size={48} color="#d1d5db" />
                    <Text className="text-gray-500 text-center text-lg mb-2 mt-4">
                        No reports yet
                    </Text>
                    <Text className="text-gray-400 text-center">
                        Submit your first report to help your community.
                    </Text>
                    <TouchableOpacity
                        className="bg-blue-600 px-6 py-3 rounded-lg mt-4"
                        onPress={() => router.push("/(tabs)/report")}
                    >
                        <Text className="text-white font-bold">Create Report</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={reports}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#2563eb"]}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}
