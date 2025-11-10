import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import UserCard from "../../components/UserCard";

interface Farmer {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  photoUri: string | null;
  verify:boolean;
}

export default function FarmersList() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchFarmers = async () => {
        try {
          const stored = await AsyncStorage.getItem("farmers");
          console.log(stored);
          if (stored) setFarmers(JSON.parse(stored));
          
          else setFarmers([]);
        } catch (error) {
          console.error("Error fetching farmers:", error);
        }
      };

      fetchFarmers();
    }, [])
  );

  const renderFarmer = ({ item }: { item: Farmer }) => (
    <UserCard
      name={`${item.firstName} ${item.lastName}`}
      nationalId={item.nationalId}
      imageUri={item.photoUri || "https://via.placeholder.com/150"}
      verify={item.verify}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Registered Farmers</Text>

      {farmers.length === 0 ? (
        <Text style={styles.empty}>No farmers found</Text>
      ) : (
        <FlatList
          data={farmers}
          keyExtractor={(item) => item.id}
          renderItem={renderFarmer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 50 },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#2e7d32",
  },
  empty: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 50,
  },
});
