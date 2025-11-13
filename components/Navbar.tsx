import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import logo from "../assets/images/halisi-logo.png";

export default function Navbar({ title }: { title?: string }) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const sessionData = await AsyncStorage.getItem("current_user");
        if (sessionData) {
          const parsed = JSON.parse(sessionData);
          setUser(parsed);
        }
      } catch (error) {
        console.error("Error loading user session:", error);
      }
    };
    fetchUser();
  }, []);

  const handleAvatarPress = () => {
    router.replace("/"); // Logout back to login
  };
  console.log("Navbar user:", user);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        {/* ✅ Left: Logo */}
        <View style={styles.leftContainer}>
          <Image
            source={require("../assets/images/halisi-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* 🧭 Center: Title */}
        {title && <Text style={styles.title}>{title}</Text>}

        {/* 🧍‍♂️ Right: Avatar */}
        <TouchableOpacity style={styles.rightContainer} onPress={handleAvatarPress}>
          <Image
            source={
              user?.avatar 
                ? { uri: user.avatar }
                : logo // fallback avatar
            }
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  rightContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
});
