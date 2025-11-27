// ToggleButton.js
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function ToggleButton({ value, onChange, size = 40, activeColor = "#4caf50", inactiveColor = "#ccc" }) {
  const circleSize = size * 0.6;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onChange(!value)}
      style={[
        styles.container,
        {
          width: size * 1.8,
          height: size * 0.9,
          backgroundColor: value ? activeColor : inactiveColor,
          borderRadius: size,
          padding: size * 0.1,
        },
      ]}
    >
      <View
        style={[
          styles.circle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            transform: [{ translateX: value ? size * 0.8 : 0 }],
          },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  circle: {
    backgroundColor: "#fff",
  },
});
