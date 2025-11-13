import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import UserCard from "../../components/UserCard";

interface Farmer {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  photoUri: string | null;
  verify: boolean;
}

export default function FarmersList() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchFarmers = async () => {
        try {
          const stored = await AsyncStorage.getItem("farmers");
          if (stored) setFarmers(JSON.parse(stored));
          else setFarmers([]);
        } catch (error) {
          console.error("Error fetching farmers:", error);
        }
      };

      fetchFarmers();
    }, [])
  );

  // ✅ Verify a specific farmer
  const verifyFarmer = async (farmerId: string) => {
    try {
      const updatedFarmers = farmers.map((f) =>
        f.id === farmerId ? { ...f, verify: true } : f
      );
      setFarmers(updatedFarmers);
      await AsyncStorage.setItem("farmers", JSON.stringify(updatedFarmers));
    } catch (error) {
      console.error("Error verifying farmer:", error);
    }
  };

  const renderFarmer = ({ item }: { item: Farmer }) => (
    <View style={styles.cardWrapper}>
      <UserCard
        name={`${item.firstName} ${item.lastName}`}
        nationalId={item.nationalId}
        imageUri={item.photoUri || "https://via.placeholder.com/150"}
        verify={item.verify}
      />

      {/* ✅ Only show verify button if not verified */}
      {!item.verify && (
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={() => verifyFarmer(item.id)}
        >
          <Text style={styles.verifyButtonText}>Verify</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {farmers.length === 0 ? (
        <Text style={styles.empty}>No farmers found</Text>
      ) : (
        <FlatList
          data={farmers}
          keyExtractor={(item) => item.id}
          renderItem={renderFarmer}
          showsVerticalScrollIndicator={false}
          // ✅ Remove top spacing and add only bottom padding
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 0, marginTop: 0 }}
          style={{ flex: 1, marginTop: 0, paddingTop: 0 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 0,
    paddingTop: 0,
  },
  empty: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 50,
  },
  cardWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  verifyButton: {
    marginTop: 8,
    backgroundColor: "#2e7d32",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  verifyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
