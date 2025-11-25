import { Tabs } from "expo-router";
import { Home, FileText, BookOpen, User } from "lucide-react-native";

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#2563eb" }}>
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="report"
                options={{
                    title: "Report",
                    tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="resources"
                options={{
                    title: "Resources",
                    tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color }) => <User size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
