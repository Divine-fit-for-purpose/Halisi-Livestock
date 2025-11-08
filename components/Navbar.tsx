
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



interface NavbarProps {
  avatarUri?: string;
  onAvatarPress?: () => void;
  title?: string;
}

export default function Navbar({ avatarUri, onAvatarPress, title }: NavbarProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        {/* ✅ Left: Logo */}
        <View style={styles.leftContainer}>
          <Image source={require('../assets/images/halisi-logo.png')} style={styles.logo} resizeMode="contain" />
        </View>

        {/* 🧭 Center: Optional title */}
        {title && <Text style={styles.title}>{title}</Text>}

        {/* 🧍‍♂️ Right: Avatar */}
        <TouchableOpacity style={styles.rightContainer} onPress={onAvatarPress}>
          <Image
            source={
              avatarUri
                ? { uri: avatarUri }
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
    width: 100,
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
