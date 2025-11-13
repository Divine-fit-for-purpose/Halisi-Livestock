import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SuccessScreen() {
  const router = useRouter();
  const [rating, setRating] = useState<number>(0); // ⭐ current rating

  // Helper to render 5 stars
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={40}
            color={i <= rating ? "#FFD700" : "#aaa"}
            style={styles.star}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Ionicons name="checkmark-circle" size={100} color="#2e7d32" />
        </View>

        <Text style={styles.title}>Submission Received 🎉</Text>

        <Text style={styles.message}>
          Thank you for registering. We’ve successfully received your
          information. Our team will review it and contact you if needed.
        </Text>

        {/* ⭐ Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>Rate your experience</Text>
          <View style={styles.starsContainer}>{renderStars()}</View>
          {rating > 0 && (
            <Text style={styles.selectedText}>
              You rated {rating} {rating === 1 ? "star" : "stars"} ⭐
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/PreviewScreen")}
        >
          <Text style={styles.buttonText}>Go Back Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4EA",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: "100%",
    maxWidth: 400,
  },
  iconWrapper: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2e7d32",
    textAlign: "center",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  ratingSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  ratingLabel: {
    fontSize: 16,
    color: "#2e7d32",
    marginBottom: 10,
    fontWeight: "600",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
  },
  star: {
    marginHorizontal: 5,
  },
  selectedText: {
    color: "#444",
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#2e7d32",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
