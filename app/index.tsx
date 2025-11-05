import CommonButton from "@/components/CommonButtonComponent";
import InputComponent from "@/components/InputComponent";
import { Link } from "expo-router";
import React from "react";
import { Image, StyleSheet, View } from "react-native";

// Import logo correctly
import logo from "../assets/images/halisi-logo.png";

export default function Index() {
  return (
    <View style={styles.container}>
      {/* App Logo */}
      <Image source={logo} style={styles.logo} resizeMode="contain" />

      {/* Input Fields */}
      <InputComponent label="email" />
      <InputComponent label="password" secureTextEntry />

      {/* Login Button */}
      <View style={styles.buttonContainer}>
        <CommonButton title="Login" onPress={() => {}} />
      </View>

      <Link href={'/Camera.tsx'}>Camera</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",   // vertically centers all content
    alignItems: "center",       // horizontally centers all content
    backgroundColor: "#eee",
    paddingHorizontal: 20,
  },
  logo: {
    width: 180,                 // adjust as needed for your logo
    height: 100,
    marginBottom: 40,           // space between logo and input fields
  },
  buttonContainer: {
    marginTop: 24,
    width: "100%",
    alignItems: "center",
  },
});
