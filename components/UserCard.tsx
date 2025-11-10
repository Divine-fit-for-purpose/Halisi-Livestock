import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface FarmerCardProps {
  name: string;
  nationalId: string;
  imageUri: string; // URI to photo (from Camera or remote URL)
  verify: boolean;
}

const UserCard: React.FC<FarmerCardProps> = ({ name, nationalId, imageUri,verify }) => {
  return (
    <View style={styles.card}>
      {/* Photo */}
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Details */}
      <View style={styles.infoContainer}>
        <Text style={styles.idLabel}>National ID</Text>
        <Text style={styles.idNumber}>{nationalId}</Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.verify}>Verification status</Text>
        <Text style={styles.name}>{!verify? "Not verified":"Verified"}</Text>
      </View>
    </View>
  );
};

export default UserCard;

const styles = StyleSheet.create({
  card: {
    width: "90%",
    backgroundColor: "#f5f5f5",
    gap:12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
   padding:20,
    alignSelf: "center",
    overflow: "hidden",
    marginVertical: 10,
    flexDirection: "row",
  },
  image: {
    width: 120,
    height: 120,
  },
  infoContainer: {
    padding: 0,
    alignItems: "flex-start",
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
  },
  verify: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
  },
  idLabel: {
    fontSize: 14,
    color: "#000",
    fontWeight: "700",
  },
  idNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 4,
  },
});
