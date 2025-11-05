import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

interface InputFieldProps extends TextInputProps {
  label: string;
}

export default function InputField({ label, style, ...props }: InputFieldProps) {
  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Input */}
      <TextInput
        {...props}
        style={[styles.input, style]}
        placeholderTextColor="#888"
        
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 24,
    marginVertical: 8,
    justifyContent: "center",
     
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
    textTransform: "capitalize",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
    
    width: "100%", // full width of container
    backgroundColor: "#fff",
  },
});
