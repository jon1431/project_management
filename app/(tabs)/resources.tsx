import { View, Text, FlatList, TouchableOpacity, Linking, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ExternalLink, Shield, Scale, HeartHandshake, Book, Phone, FileText, Video } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { fetchResources, incrementResourceViewCount } from "../../src/services/firebaseService";

export default function ResourcesScreen() {
    const router = useRouter();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        loadResources();
    }, [selectedCategory]);

    const loadResources = async () => {
        setLoading(true);
        try {
            const result = await fetchResources(selectedCategory);
            if (result.success) {
                setResources(result.data || []);
            } else {
                console.error("Error loading resources:", result.error);
                setResources([]);
            }
        } catch (error) {
            console.error("Error loading resources:", error);
            setResources([]);
        } finally {
            setLoading(false);
        }
    };

    const handleResourcePress = async (resource) => {
        // Increment view count
        try {
            await incrementResourceViewCount(resource.id);
        } catch (error) {
            console.error("Error incrementing view count:", error);
        }

        // Open external URL if available
        if (resource.url) {
            try {
                if (resource.type === 'hotline') {
                    await Linking.openURL(`tel:${resource.url}`);
                } else {
                    await Linking.openURL(resource.url);
                }
            } catch (error) {
                console.error("Error opening URL:", error);
            }
        }
        // For articles and guides without URLs, you'd navigate to a detail screen
    };

    const categories = [
        { id: null, label: 'All' },
        { id: 'legal_rights', label: 'Legal Rights' },
        { id: 'safety', label: 'Safety' },
        { id: 'reporting_guide', label: 'Reporting Guide' },
        { id: 'support', label: 'Support' }
    ];

    const getResourceIcon = (type) => {
        switch (type) {
            case 'article':
                return FileText;
            case 'video':
                return Video;
            case 'guide':
                return Book;
            case 'external_link':
                return ExternalLink;
            case 'hotline':
                return Phone;
            default:
                return FileText;
        }
    };

    const getCategoryBg = (category) => {
        switch (category) {
            case 'legal_rights':
                return '#2563eb';
            case 'safety':
                return '#16a34a';
            case 'reporting_guide':
                return '#9333ea';
            case 'support':
                return '#ea580c';
            default:
                return '#6b7280';
        }
    };

    const renderItem = ({ item }) => {
        const IconComponent = getResourceIcon(item.type);
        const categoryColor = getCategoryBg(item.category);

        return (
            <TouchableOpacity
                className="bg-white p-4 rounded-xl mb-4 border border-gray-200"
                onPress={() => handleResourcePress(item)}
                activeOpacity={0.7}
            >
                <View className="flex-row items-start mb-2">
                    <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: `${categoryColor}20` }}
                    >
                        <IconComponent size={24} color={categoryColor} />
                    </View>
                    <View className="flex-1">
                        <View
                            className="px-3 py-1 rounded-full self-start mb-2"
                            style={{ backgroundColor: `${categoryColor}` }}
                        >
                            <Text className="text-xs font-bold text-white uppercase">
                                {item.category.replace('_', ' ')}
                            </Text>
                        </View>
                        <Text className="text-lg font-bold text-gray-900">
                            {item.title}
                        </Text>
                    </View>
                </View>

                <Text className="text-gray-600 mb-3" numberOfLines={3}>
                    {item.description}
                </Text>

                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                    <Text className="text-gray-400 text-xs">
                        👁️ {item.viewCount} views
                    </Text>
                    {item.type === 'external_link' && (
                        <Text className="text-blue-600 text-xs font-medium">
                            Open Link →
                        </Text>
                    )}
                    {item.type === 'hotline' && (
                        <Text className="text-green-600 text-xs font-medium">
                            📞 Call
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-5 py-4 bg-white border-b border-gray-200">
                <Text className="text-2xl font-bold text-gray-900">Resources</Text>
                <Text className="text-gray-500 text-sm">Learn about your rights and find support</Text>
            </View>

            <ScrollView
                horizontal
                className="bg-white border-b border-gray-200 px-4 py-3"
                showsHorizontalScrollIndicator={false}
            >
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat.id || 'all'}
                        className={`px-4 py-2 rounded-full mr-2 ${
                            selectedCategory === cat.id
                                ? 'bg-blue-600'
                                : 'bg-gray-200'
                        }`}
                        onPress={() => setSelectedCategory(cat.id)}
                    >
                        <Text
                            className={`font-medium ${
                                selectedCategory === cat.id
                                    ? 'text-white'
                                    : 'text-gray-700'
                            }`}
                        >
                            {cat.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text className="text-gray-500 mt-3">Loading resources...</Text>
                </View>
            ) : resources.length === 0 ? (
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-gray-500 text-center text-lg mb-2">
                        No resources available
                    </Text>
                    <Text className="text-gray-400 text-center">
                        Check back later for educational content and support resources.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={resources}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <View className="p-5 bg-white border-t border-gray-200">
                <TouchableOpacity
                    className="bg-gray-800 p-4 rounded-xl items-center"
                    onPress={() => router.push("/admin/dashboard")}
                    activeOpacity={0.8}
                >
                    <Text className="text-white font-bold">Access Moderator Dashboard</Text>
                    <Text className="text-gray-400 text-xs mt-1">(For moderators only)</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
