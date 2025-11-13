import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { printToFileAsync } from "expo-print";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FarmerData {
  photoUri: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  dob: string;
  country: string;
  city: string;
  email: string;
  nationalId: string;
  address: string;
  verify: boolean;
}

export default function PreviewFarmerScreen() {
  const [farmer, setFarmer] = useState<FarmerData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLatestFarmer = async () => {
      try {
        const stored = await AsyncStorage.getItem("farmers");
        if (stored) {
          const farmers = JSON.parse(stored);
          setFarmer(farmers[farmers.length - 1]);
        }
      } catch (error) {
        console.error("Error fetching farmer data:", error);
      }
    };
    fetchLatestFarmer();
  }, []);

  if (!farmer) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>No farmer data available</Text>
      </SafeAreaView>
    );
  }

  // ✅ Generate and download PDF
  const handleDownload = async () => {
    try {
      const html = `
        <html>
          <body style="font-family: Arial; padding: 20px;">
            <h2 style="color: #2e7d32;">Farmer Information</h2>
            <hr />
            <h3>Personal Information</h3>
            <p><strong>Name:</strong> ${farmer.firstName} ${farmer.lastName}</p>
            <p><strong>Email:</strong> ${farmer.email}</p>
            <p><strong>Phone:</strong> ${farmer.phone}</p>
            <p><strong>Gender:</strong> ${farmer.gender}</p>
            <p><strong>National ID:</strong> ${farmer.nationalId}</p>
            <p><strong>Verified:</strong> ${
              farmer.verify ? "Yes ✅" : "No ❌"
            }</p>

            <h3>Location & Birth Info</h3>
            <p><strong>Date of Birth:</strong> ${new Date(
              farmer.dob
            ).toLocaleDateString()}</p>
            <p><strong>Country:</strong> ${farmer.country}</p>
            <p><strong>City:</strong> ${farmer.city}</p>
            <p><strong>Address:</strong> ${farmer.address}</p>
          </body>
        </html>
      `;

      const file = await printToFileAsync({
        html,
        base64: false,
      });

      const pdfUri = `${(FileSystem as any).documentDirectory}Farmer_${farmer.firstName}_${farmer.lastName}.pdf`;
      await FileSystem.moveAsync({
        from: file.uri,
        to: pdfUri,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri);
      } else {
        alert("PDF generated successfully but sharing is not available.");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={22} color="#2e7d32" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Farmer Details</Text>

        <TouchableOpacity onPress={handleDownload} style={styles.iconButton}>
          <Ionicons name="download-outline" size={22} color="#2e7d32" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {farmer.photoUri ? (
            <Image source={{ uri: farmer.photoUri }} style={styles.photo} />
          ) : (
            <Ionicons name="person-circle-outline" size={140} color="#ccc" />
          )}
          <Text style={styles.nameText}>
            {farmer.firstName} {farmer.lastName}
          </Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: farmer.verify ? "#2e7d32" : "#d32f2f" },
            ]}
          >
            <Text style={styles.badgeText}>
              {farmer.verify ? "Verified" : "Not Verified"}
            </Text>
          </View>
        </View>

        {/* Personal Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <InfoRow icon="mail-outline" label="Email" value={farmer.email} />
          <InfoRow icon="call-outline" label="Phone" value={farmer.phone} />
          <InfoRow icon="person-outline" label="Gender" value={farmer.gender} />
          <InfoRow icon="card-outline" label="National ID" value={farmer.nationalId} />
        </View>

        {/* Location Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Location & Birth Info</Text>
          <InfoRow
            icon="calendar-outline"
            label="Date of Birth"
            value={new Date(farmer.dob).toLocaleDateString()}
          />
          <InfoRow icon="earth-outline" label="Country" value={farmer.country} />
          <InfoRow icon="business-outline" label="City" value={farmer.city} />
          <InfoRow icon="home-outline" label="Address" value={farmer.address} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ✅ Small reusable InfoRow component for cleaner UI */
const InfoRow = ({ icon, label, value }: any) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={18} color="#2e7d32" style={{ width: 24 }} />
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
  container: { flex: 1 },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
  },
  iconButton: {
    backgroundColor: "#E8F5E9",
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    color: "#2e7d32",
    fontSize: 18,
    fontWeight: "bold",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  photo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 10,
  },
  nameText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
  },
  badge: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#2e7d32",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
