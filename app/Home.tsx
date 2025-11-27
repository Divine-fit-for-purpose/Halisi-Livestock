// app/Home.tsx
// adjust path if needed
clearSession
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Button, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { clearSession, loadSession } from "../storage/saveSession";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.log("[Home] - loading session...");
        const sessionUser = await loadSession();
        console.log("[Home] - sessionUser:", sessionUser);
        if (!mounted) return;
        if (sessionUser) {
          setUser(sessionUser);
        } else {
          // no session -> go back to login
          console.warn("[Home] - no session found, redirecting to login");
          router.replace("/");
        }
      } catch (err) {
        console.error("[Home] - error loading session:", err);
        Alert.alert("Error", "Failed to load session. See console.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await clearSession();
      console.log("[Home] - session cleared");
      router.replace("/"); // go back to login
    } catch (err) {
      console.error("[Home] - error clearing session:", err);
      Alert.alert("Error", "Failed to logout. See console.");
    }
  };

  const onAvatarPress = () => {
    if (!user) return;
    Alert.alert(user.name, `Role: ${user.role}\nEmail: ${user.email_id}`, [
      { text: "Profile", onPress: () => console.log("Profile tapped") },
      { text: "Logout", onPress: handleLogout, style: "destructive" },
      { text: "Close", style: "cancel" },
    ]);
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  // If no user (should be redirected already), show fallback
  if (!user) {
    return (
      <View style={styles.center}>
        <Text>No user found. Redirecting...</Text>
      </View>
    );
  }

  // Fallback avatar image (local or remote)
  const avatarUri =
    user.avatar && typeof user.avatar === "string" && user.avatar.length > 0
      ? user.avatar
      : "https://www.gravatar.com/avatar/?d=mp"; // generic fallback

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.title}>Dashboard</Text>

        <TouchableOpacity onPress={onAvatarPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} onError={() => console.warn("[Home] avatar failed to load")} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome, {user.name} 👋</Text>
        <Text style={styles.role}>Role: {user.role}</Text>
        <Text style={styles.email}>Email: {user.email_id}</Text>

        <View style={{ marginTop: 20, width: "60%" }}>
          <Button title="Logout" onPress={handleLogout} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  navbar: {
    height: 64,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "700" },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: "#ddd" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  welcome: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  role: { fontSize: 16, color: "#555" },
  email: { fontSize: 14, color: "#777", marginBottom: 12 },
});
