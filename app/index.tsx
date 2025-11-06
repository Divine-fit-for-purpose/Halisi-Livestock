import React, { useEffect, useState } from "react";

import { Alert, Image, StyleSheet, View } from "react-native";
import logo from "../assets/images/halisi-logo.png";

import CommonButton from "@/components/CommonButtonComponent";
import InputComponent from "@/components/InputComponent";
import { users } from "@/data/user";
import { saveSession } from "@/storage/saveSession"; // create this file if not yet created
import { loadUsersFromStorage, saveUsersToStorage } from "@/storage/storeUsers";
import { useRouter } from "expo-router";

export default function Index({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // 🧠 Load or initialize users
  useEffect(() => {
    (async () => {
      const existingUsers = await loadUsersFromStorage();
      if (!existingUsers) {
        console.log("🚀 No users found — saving to local storage...");
        await saveUsersToStorage(users);
      }

      const savedUsers = await loadUsersFromStorage();
      console.log("🧠 Users currently in AsyncStorage:", savedUsers);
    })();
  }, []);

  // ✅ Handle Login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("⚠️ Missing Fields", "Please enter both email and password");
      return;
    }

    const storedUsers = await loadUsersFromStorage();

    if (!storedUsers) {
      Alert.alert("❌ Error", "No user data found in local storage");
      return;
    }

    // Match user credentials
    const foundUser = storedUsers.find(
      (u: any) =>
        u.email_id.toLowerCase().trim() === email.toLowerCase().trim() &&
        u.password === password
    );

    if (foundUser) {
      await saveSession(foundUser);
      Alert.alert("✅ Login Successful", `Welcome ${foundUser.name}!`);
      // Replace this with your home screen route
      router.replace("/Home");
    } else {
      Alert.alert("❌ Login Failed", "Invalid email or password");
    }
  };

  return (
    <View style={styles.container}>
      {/* App Logo */}
      <Image source={logo} style={styles.logo} resizeMode="contain" />

      {/* Input Fields */}
      <InputComponent
        label="email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <InputComponent
        label="password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Login Button */}
      <View style={styles.buttonContainer}>
        <CommonButton title="Login" onPress={handleLogin} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
    paddingHorizontal: 20,
  },
  logo: {
    width: 180,
    height: 100,
    marginBottom: 40,
  },
  buttonContainer: {
    marginTop: 24,
    width: "100%",
    alignItems: "center",
  },
});
