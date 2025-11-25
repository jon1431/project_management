# Firebase Integration Guide
## Voice Unheard - React Native Implementation

This guide shows how to integrate the Firebase backend services into your existing React Native Expo app.

---

## 📋 Prerequisites

1. Install Firebase dependencies:
```bash
npm install firebase
```

2. Configure Firebase credentials in `src/config/firebase.js`
3. Deploy Firestore security rules
4. Enable Authentication methods in Firebase Console

---

## 🔌 Integration Steps

### Step 1: Initialize Firebase in App Root

Update `app/_layout.tsx` to initialize Firebase:

```typescript
// app/_layout.tsx
import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";

// Import Firebase configuration to initialize
import '../src/config/firebase';

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="index" />
            </Stack>
        </SafeAreaProvider>
    );
}
```

---

### Step 2: Update Login Screen with Anonymous Auth

Update `app/(auth)/login.tsx`:

```typescript
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { signInAnonymously, signInWithEmail } from "../../src/services/firebaseService";

export default function LoginScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleAnonymousLogin = async () => {
        setLoading(true);
        const result = await signInAnonymously();
        setLoading(false);

        if (result.success) {
            // Navigate to home/feed
            router.replace("/(tabs)/home");
        } else {
            Alert.alert("Error", result.error || "Failed to sign in anonymously");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white p-6 justify-center">
            <View className="mb-8">
                <Text className="text-3xl font-bold text-gray-900 mb-2">
                    Voice Unheard
                </Text>
                <Text className="text-gray-600">
                    Report injustice. Protect your identity.
                </Text>
            </View>

            <TouchableOpacity
                className="bg-blue-600 p-4 rounded-xl items-center mb-4"
                onPress={handleAnonymousLogin}
                disabled={loading}
            >
                <Text className="text-white font-bold text-lg">
                    {loading ? "Signing in..." : "Continue Anonymously"}
                </Text>
            </TouchableOpacity>

            <Text className="text-center text-gray-500 text-sm">
                Your identity and reports remain completely private
            </Text>
        </SafeAreaView>
    );
}
```

---

### Step 3: Update Report Submission Screen

Update `app/(tabs)/report.tsx` to integrate Firebase:

```typescript
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert } from "react-native";
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
            Alert.alert("Missing Information", "Please fill in all required fields.");
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
        if (!validCategories.includes(category.toLowerCase())) {
            Alert.alert(
                "Invalid Category",
                "Please choose: corruption, abuse, discrimination, violence, or other"
            );
            return;
        }

        setSubmitting(true);

        // Submit to Firebase
        const result = await submitReport({
            title,
            description,
            category: category.toLowerCase(),
            location,
            isAnonymous,
        });

        setSubmitting(false);

        if (result.success) {
            Alert.alert(
                "Report Submitted",
                "Thank you for your report. It has been sent for review and will appear in the public feed once verified.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            // Clear form
                            setTitle("");
                            setDescription("");
                            setCategory("");
                            setLocation("");
                            router.back();
                        }
                    }
                ]
            );
        } else {
            Alert.alert("Submission Failed", result.error || "Failed to submit report. Please try again.");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-4 py-3 border-b border-gray-200 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
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
                    />
                    <Text className="text-gray-400 text-xs mt-1">
                        {title.length}/200 characters
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
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-gray-700 font-medium mb-2">Location</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 bg-gray-50"
                        placeholder="Where did this happen?"
                        value={location}
                        onChangeText={setLocation}
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-gray-700 font-medium mb-2">Description *</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 bg-gray-50 h-32"
                        placeholder="Provide detailed information..."
                        multiline
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                        maxLength={5000}
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
                    />
                </View>

                <TouchableOpacity
                    className="bg-blue-600 p-4 rounded-xl items-center shadow-sm mb-10"
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    <Text className="text-white font-bold text-lg">
                        {submitting ? "Submitting..." : "Submit Report"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
```

---

### Step 4: Update Home/Feed Screen

Update `app/(tabs)/home.tsx` to display verified reports:

```typescript
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { fetchFeedReports, incrementReportViews } from "../../src/services/firebaseService";

export default function HomeScreen() {
    const router = useRouter();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadReports = async () => {
        const result = await fetchFeedReports(20);
        if (result.success) {
            setReports(result.reports);
        }
        setLoading(false);
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
        await incrementReportViews(report.id);

        // Navigate to report detail (you'll need to create this screen)
        // router.push(`/report/${report.id}`);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 py-3 bg-white border-b border-gray-200">
                <Text className="text-2xl font-bold text-gray-900">Voice Unheard</Text>
                <Text className="text-gray-600 text-sm">Reports from your community</Text>
            </View>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {loading ? (
                    <View className="p-6">
                        <Text className="text-gray-500 text-center">Loading reports...</Text>
                    </View>
                ) : reports.length === 0 ? (
                    <View className="p-6">
                        <Text className="text-gray-500 text-center">
                            No verified reports yet. Be the first to report!
                        </Text>
                    </View>
                ) : (
                    reports.map((report) => (
                        <TouchableOpacity
                            key={report.id}
                            className="bg-white p-4 mb-3 mx-4 mt-3 rounded-xl border border-gray-200"
                            onPress={() => handleReportPress(report)}
                        >
                            <View className="flex-row items-center mb-2">
                                <View
                                    className={`px-3 py-1 rounded-full mr-2 ${getCategoryColor(
                                        report.category
                                    )}`}
                                >
                                    <Text className="text-xs font-bold text-white uppercase">
                                        {report.category}
                                    </Text>
                                </View>
                                {report.isAnonymous && (
                                    <View className="px-3 py-1 rounded-full bg-gray-200">
                                        <Text className="text-xs font-medium text-gray-700">
                                            Anonymous
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <Text className="text-lg font-bold text-gray-900 mb-2">
                                {report.title}
                            </Text>

                            <Text className="text-gray-600 mb-3" numberOfLines={3}>
                                {report.description}
                            </Text>

                            {report.location && (
                                <Text className="text-gray-500 text-sm mb-2">
                                    📍 {report.location}
                                </Text>
                            )}

                            <View className="flex-row items-center justify-between">
                                <Text className="text-gray-400 text-xs">
                                    {formatDate(report.createdAt)}
                                </Text>
                                <View className="flex-row items-center">
                                    <Text className="text-gray-500 text-xs mr-3">
                                        👁️ {report.viewCount}
                                    </Text>
                                    <Text className="text-blue-600 text-xs font-medium">
                                        ⬆️ {report.upvotes}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-blue-600 w-16 h-16 rounded-full items-center justify-center shadow-lg"
                onPress={() => router.push("/(tabs)/report")}
            >
                <Text className="text-white text-3xl">+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

function getCategoryColor(category) {
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
}

function formatDate(date) {
    if (!date) return '';
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}
```

---

### Step 5: Update Resources Screen

Update `app/(tabs)/resources.tsx`:

```typescript
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { fetchResources, incrementResourceViews } from "../../src/services/firebaseService";

export default function ResourcesScreen() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        loadResources();
    }, [selectedCategory]);

    const loadResources = async () => {
        setLoading(true);
        const result = await fetchResources(selectedCategory, 50);
        if (result.success) {
            setResources(result.resources);
        }
        setLoading(false);
    };

    const handleResourcePress = async (resource) => {
        // Increment view count
        await incrementResourceViews(resource.id);

        // Open external URL if available
        if (resource.url && resource.type === 'external_link') {
            Linking.openURL(resource.url);
        } else if (resource.type === 'hotline' && resource.url) {
            Linking.openURL(`tel:${resource.url}`);
        }
        // For articles and guides, you'd navigate to a detail screen
    };

    const categories = [
        { id: null, label: 'All' },
        { id: 'legal_rights', label: 'Legal Rights' },
        { id: 'safety', label: 'Safety' },
        { id: 'reporting_guide', label: 'Reporting Guide' },
        { id: 'support', label: 'Support' }
    ];

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 py-3 bg-white border-b border-gray-200">
                <Text className="text-2xl font-bold text-gray-900">Resources</Text>
                <Text className="text-gray-600 text-sm">Learn about your rights</Text>
            </View>

            <ScrollView horizontal className="bg-white border-b border-gray-200 px-4 py-3">
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
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

            <ScrollView className="flex-1">
                {loading ? (
                    <View className="p-6">
                        <Text className="text-gray-500 text-center">Loading resources...</Text>
                    </View>
                ) : resources.length === 0 ? (
                    <View className="p-6">
                        <Text className="text-gray-500 text-center">
                            No resources available in this category.
                        </Text>
                    </View>
                ) : (
                    resources.map((resource) => (
                        <TouchableOpacity
                            key={resource.id}
                            className="bg-white p-4 mb-3 mx-4 mt-3 rounded-xl border border-gray-200"
                            onPress={() => handleResourcePress(resource)}
                        >
                            <View className="flex-row items-center mb-2">
                                <Text className="text-2xl mr-2">{getResourceIcon(resource.type)}</Text>
                                <View
                                    className={`px-3 py-1 rounded-full ${getCategoryBg(
                                        resource.category
                                    )}`}
                                >
                                    <Text className="text-xs font-bold text-white uppercase">
                                        {resource.category.replace('_', ' ')}
                                    </Text>
                                </View>
                            </View>

                            <Text className="text-lg font-bold text-gray-900 mb-2">
                                {resource.title}
                            </Text>

                            <Text className="text-gray-600 mb-3" numberOfLines={3}>
                                {resource.description}
                            </Text>

                            <View className="flex-row items-center justify-between">
                                <Text className="text-gray-400 text-xs">
                                    👁️ {resource.viewCount} views
                                </Text>
                                {resource.type === 'external_link' && (
                                    <Text className="text-blue-600 text-xs font-medium">
                                        Open Link →
                                    </Text>
                                )}
                                {resource.type === 'hotline' && (
                                    <Text className="text-green-600 text-xs font-medium">
                                        📞 Call
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

function getResourceIcon(type) {
    switch (type) {
        case 'article':
            return '📄';
        case 'video':
            return '🎥';
        case 'guide':
            return '📖';
        case 'external_link':
            return '🔗';
        case 'hotline':
            return '📞';
        default:
            return '📋';
    }
}

function getCategoryBg(category) {
    switch (category) {
        case 'legal_rights':
            return 'bg-blue-500';
        case 'safety':
            return 'bg-green-500';
        case 'reporting_guide':
            return 'bg-purple-500';
        case 'support':
            return 'bg-orange-500';
        default:
            return 'bg-gray-500';
    }
}
```

---

## 🔐 Authentication State Management

Create a context for managing auth state across the app:

```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, getCurrentUser } from '../services/firebaseService';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChange((firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
```

Then wrap your app in the provider:

```typescript
// app/_layout.tsx
import { AuthProvider } from '../src/contexts/AuthContext';

export default function RootLayout() {
    return (
        <AuthProvider>
            <SafeAreaProvider>
                {/* ... rest of your layout */}
            </SafeAreaProvider>
        </AuthProvider>
    );
}
```

---

## 🎯 Next Steps

1. **Test the integration**:
   - Run `npm start` and test on device/emulator
   - Submit a test report
   - Verify it appears as "pending" in your reports
   - Check Firebase Console to see the data

2. **Add error handling**:
   - Implement offline support
   - Add retry logic for failed operations
   - Show user-friendly error messages

3. **Implement moderation dashboard**:
   - Create `app/admin/dashboard.tsx`
   - Use `fetchPendingReports()` and `updateReportStatus()`
   - Set up custom claims for moderators

4. **Add features**:
   - Image upload for reports (Firebase Storage)
   - Push notifications for report status changes
   - User profile management
   - Report detail view with comments

---

## 🚨 Common Issues

### Issue: "Firebase not initialized"
**Solution**: Make sure you've imported `../src/config/firebase` in `app/_layout.tsx`

### Issue: "Permission denied"
**Solution**: Check that security rules are deployed and user is authenticated

### Issue: "Cannot read property 'uid' of null"
**Solution**: Verify user is signed in before calling Firebase functions

---

## 📚 Documentation References

- [Firebase Service Documentation](./firebase/README.md)
- [Security Rules](./firebase/firestore.rules)
- [Data Schema](./firebase/schema.json)
- [Testing Strategy](./firebase/TESTING_STRATEGY.md)

---

**You're now ready to build a privacy-first, SDG 16-compliant social injustice reporting app!**
