import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, MapPin, ThumbsUp, Eye, ShieldCheck } from "lucide-react-native";
import { useState, useEffect } from "react";
import { fetchFeedReports, incrementViewCount } from "../../src/services/firebaseService";

export default function HomeScreen() {
    const router = useRouter();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const DEMO_REPORTS = [
        {
            id: 'demo-1',
            title: 'Broken Streetlights on Main St',
            description: 'Several streetlights have been out for weeks, making the area unsafe at night. Residents are concerned about safety.',
            category: 'infrastructure',
            location: 'Downtown District',
            status: 'verified',
            viewCount: 125,
            upvotes: 42,
            createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
            isAnonymous: false
        },
        {
            id: 'demo-2',
            title: 'Illegal Dumping in Park',
            description: 'Construction waste is being dumped in the community park every night. This is a health hazard for children playing there.',
            category: 'pollution',
            location: 'Riverside Park',
            status: 'verified',
            viewCount: 89,
            upvotes: 35,
            createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
            isAnonymous: true
        },
        {
            id: 'demo-3',
            title: 'Unfair Treatment at Local Office',
            description: 'Staff at the municipal office are demanding bribes for standard document processing. This has been happening for months.',
            category: 'corruption',
            location: 'City Hall',
            status: 'verified',
            viewCount: 256,
            upvotes: 112,
            createdAt: new Date(Date.now() - 86400000 * 1), // 1 day ago
            isAnonymous: true
        }
    ];

    const loadReports = async () => {
        try {
            const result = await fetchFeedReports(20);
            if (result.items && result.items.length > 0) {
                setReports(result.items);
            } else {
                console.log("No verified reports found, using demo data");
                setReports(DEMO_REPORTS);
            }
        } catch (error) {
            console.error("Error loading reports:", error);
            setReports(DEMO_REPORTS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadReports();
        setRefreshing(false);
    };

    const handleReportPress = async (report) => {
        // Increment view count
        try {
            await incrementViewCount(report.id);
        } catch (error) {
            console.error("Error incrementing view count:", error);
        }

        // TODO: Navigate to report detail screen
        // router.push(`/report/${report.id}`);
    };

    const getCategoryColor = (category) => {
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

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        // Handle Firestore Timestamp
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            className="bg-white p-4 rounded-xl mb-4 border border-gray-200"
            onPress={() => handleReportPress(item)}
            activeOpacity={0.7}
        >
            <View className="flex-row items-center mb-2">
                <View
                    className={`px-3 py-1 rounded-full mr-2 ${getCategoryColor(
                        item.category
                    )}`}
                >
                    <Text className="text-xs font-bold text-white uppercase">
                        {item.category}
                    </Text>
                </View>
                {item.isAnonymous && (
                    <View className="px-3 py-1 rounded-full bg-gray-200">
                        <Text className="text-xs font-medium text-gray-700">
                            Anonymous
                        </Text>
                    </View>
                )}
                <View className="ml-auto bg-green-100 px-2 py-1 rounded-full flex-row items-center">
                    <ShieldCheck size={12} color="#16a34a" />
                    <Text className="text-green-700 text-xs ml-1 font-medium">Verified</Text>
                </View>
            </View>

            <Text className="text-lg font-bold text-gray-900 mb-2">
                {item.title}
            </Text>

            <Text className="text-gray-600 mb-3" numberOfLines={3}>
                {item.description}
            </Text>

            {item.location && (
                <View className="flex-row items-center mb-2">
                    <MapPin size={14} color="#6b7280" />
                    <Text className="text-gray-500 text-sm ml-1">{item.location}</Text>
                </View>
            )}

            <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                <Text className="text-gray-400 text-xs">
                    {formatDate(item.createdAt)}
                </Text>
                <View className="flex-row items-center">
                    <View className="flex-row items-center mr-3">
                        <Eye size={14} color="#6b7280" />
                        <Text className="text-gray-500 text-xs ml-1">
                            {item.viewCount}
                        </Text>
                    </View>
                    <View className="flex-row items-center">
                        <ThumbsUp size={14} color="#2563eb" />
                        <Text className="text-blue-600 text-xs ml-1 font-medium">
                            {item.upvotes}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-5 py-4 bg-white border-b border-gray-200">
                <Text className="text-2xl font-bold text-gray-900">Voice Unheard</Text>
                <Text className="text-gray-500 text-sm">Reports from your community</Text>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text className="text-gray-500 mt-3">Loading reports...</Text>
                </View>
            ) : reports.length === 0 ? (
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-gray-500 text-center text-lg mb-2">
                        No verified reports yet
                    </Text>
                    <Text className="text-gray-400 text-center">
                        Be the first to report an injustice in your community.
                    </Text>
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

            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                onPress={() => router.push("/(tabs)/report")}
                activeOpacity={0.8}
            >
                <Plus size={28} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
