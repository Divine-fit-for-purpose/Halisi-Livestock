import React from "react";
import { Image, StyleSheet, Switch, Text, View } from "react-native";

interface FarmerCardProps {
  name: string;
  nationalId: string;
  imageUri: string; // URI to photo (from Camera or remote URL)
  verify: boolean;
  onVerify?: () => void; // callback to handle toggle
}

const UserCard: React.FC<FarmerCardProps> = ({ name, nationalId, imageUri, verify, onVerify }) => {
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

        {/* Verification */}
        <View style={styles.verifyContainer}>
          <Text style={[styles.verifyText, { color: verify ? "#2e7d32" : "#d32f2f" }]}>
            {verify ? "Verified" : "Not Verified"}
          </Text>

          {/* Toggle */}
          {!verify && onVerify && (
            <Switch
              value={verify}
              onValueChange={onVerify}
              trackColor={{ false: "#d32f2f", true: "#2e7d32" }}
              thumbColor={"#fff"}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default UserCard;

const styles = StyleSheet.create({
  card: {
    width: "90%",
    backgroundColor: "#f5f5f5",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    padding: 20,
    alignSelf: "center",
    overflow: "hidden",
    marginVertical: 10,
    flexDirection: "row",
    borderRadius: 12,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  infoContainer: {
    paddingLeft: 12,
    justifyContent: "center",
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
  },
  verifyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "space-between",
    width: "60%",
  },
  verifyText: {
    fontSize: 14,
    fontWeight: "700",
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
