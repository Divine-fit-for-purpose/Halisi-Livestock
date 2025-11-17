
import CommonButton from "@/components/CommonButtonComponent";
import InputComponent from "@/components/InputComponent";
import { users } from "@/data/user";
import { saveSession } from "@/storage/saveSession";
import { loadUsersFromStorage, saveUsersToStorage } from "@/storage/storeUsers";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // const clearAllData = async () => {
  // try {
  //   await AsyncStorage.clear();
  //   console.log("✅ All local data cleared successfully!");
  // } catch (error) {
  //   console.error("❌ Error clearing AsyncStorage:", error);
  // }}

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

    if (!foundUser) {
      Alert.alert("❌ Login Failed", "Invalid email or password");
      return;
    }

    // ✅ If we reach here, login success
    await saveSession(foundUser);
    Alert.alert("✅ Login Successful", `Welcome ${foundUser.name}!`);

    // ✅ Role-based navigation
    
      router.replace("/FarmerForm");
    
  };



  
  return (
    <SafeAreaView style={styles.wrapper}>  
     <StatusBar  backgroundColor="#2e7d32" />

    <View style={styles.container}>
      <Image source={require('../assets/images/halisi-logo.png')} style={styles.logo} resizeMode="contain" />

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

      <View style={styles.buttonContainer}>
        <CommonButton title="Login" onPress={handleLogin} />
      </View>
    </View>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({ 

  wrapper:{
    flex:1,
    backgroundColor: "#eee",
  },
  container: {
    paddingTop:70,
    justifyContent: "center",
    alignItems: "center",
    // paddingHorizontal: 20,
  },
  logo: {
    width: 180,
    height: 100,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 12,
    width: "100%",
    alignItems: "center",
  },
});
