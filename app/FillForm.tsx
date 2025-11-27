import Checkbox from "expo-checkbox";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FillForm() {
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

  const handleContinue = () => {
    if (!agreed) {
      Alert.alert("Agreement Required", "Please agree to the terms first.");
      return;
    }

    // 🚀 Navigate to the next form screen (you can create this later)
    router.push("/FarmerForm");
  };

  return (
    
    <View style={styles.container}>
      <Text style={styles.title}>Register Farmers</Text>

      <Text style={styles.text}>
       To proceed using the application, please review and agree to our Terms and Conditions.
      </Text>

      <View style={styles.checkboxContainer}>
        <Checkbox
          value={agreed}
          onValueChange={setAgreed}
          color={agreed ? "#2e7d32" : undefined}
        />
        <Text style={styles.checkboxLabel}>
          I agree to the{" "}
          <Text style={styles.link} onPress={()=>Linking.openURL("https://halisi.ai/halisi-livestock-privacy-en")}>Terms and Conditions</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, !agreed && styles.buttonDisabled]}
        disabled={!agreed}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1e1e1e",
  },
  text: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 15,
    color: "#333",
  },
  link: {
    color: "#1976d2",
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: "#2e7d32",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
