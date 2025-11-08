import CommonButton from '@/components/CommonButtonComponent';
import { clearSession } from '@/storage/saveSession';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Text, View } from 'react-native';



export default function VerifyFarmers() {
  const router = useRouter();
  const handleLogout = async () => {
      try {
        await clearSession();
        console.log("[Home] - session cleared");
        router.replace("/"); // go back to login
      } catch (err) {
        console.error("[Home] - error clearing session:", err);
        Alert.alert("Error", "Failed to logout. See console.");
      }
    };
  return (
    <View>
      <Text>VerifyFarmer</Text>

      <CommonButton title="Logout" onPress={handleLogout} />
    </View>
  )
}