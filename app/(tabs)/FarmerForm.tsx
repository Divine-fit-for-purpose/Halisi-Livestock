import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import React, { useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DateInput from "@/components/DateInputComponent";
import Dropdown from "@/components/DropDown";
import InputField from "@/components/InputComponent";
import { router } from "expo-router";

export default function RegisterFarmers() {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 3;

  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Form data states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [address, setAddress] = useState("");
  const [verify, setVerified] = useState(false);

  // Camera toggle
  const toggleCameraFacing = () =>
    setFacing((current) => (current === "back" ? "front" : "back"));

  // Capture photo
  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo?.uri ?? null);
    }
  };

  // Validation before moving to next step
  const validateStep = () => {
    if (step === 1 && !photoUri) {
      Alert.alert("Missing Photo", "Please take a profile photo before continuing.");
      return false;
    }
    if (step === 2 && (!firstName || !lastName  || !gender || !email || !nationalId)) {
      Alert.alert("Missing Information", "Please fill all required personal info fields.");
      return false;
    }
    if (step === 3 && (!dob || !country || !city || !address || !phone)) {
      Alert.alert("Missing Information", "Please complete all details before finishing.");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
  };
  const prevStep = () => setStep(step - 1);

  // Save data to AsyncStorage
 const saveDataToLocalStorage = async () => {
  try {
    const farmerData = {
      id: Date.now().toString(), // Unique ID for FlatList
      photoUri,
      firstName,
      lastName,
      phone,
      gender,
      dob: dob?.toISOString() || "",
      country,
      city,
      email,
      nationalId,
      address,
      verify,
    };

    // Get existing farmers
    const storedFarmers = await AsyncStorage.getItem("farmers");
    const farmers = storedFarmers ? JSON.parse(storedFarmers) : [];

    // Add new farmer
    farmers.push(farmerData);
    console.log(farmerData);
    

    // Save back to AsyncStorage
    await AsyncStorage.setItem("farmers", JSON.stringify(farmers));

    Alert.alert("✅ Success", "Farmer information saved locally!");

    // Reset form fields
    setAddress("");
    setCity("");
    setCountry("");
    setDob(null);
    setGender("");
    setPhone("");
    setLastName("");
    setFirstName("");
    setPhotoUri(null);
    setStep(1);
    setVerified(false);

    // Navigate to Success Screen

    router.push("/SuccessScreen");
  } catch (error) {
    Alert.alert("❌ Error", "Failed to save data");
  }
};
  // Step content rendering
  const renderStepContent = () => {
    if (!permission) return <View />;
    switch (step) {
      case 1:
        if (!permission.granted) {
          return (
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionText}>
                We need your permission to use the camera.
              </Text>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={requestPermission}
              >
                <Text style={styles.buttonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          );
        }

        return (
          <View style={styles.stepCard}>
            <Text style={styles.sectionTitle}> Step 1: Capture User Photo</Text>
            {photoUri ? (
              <>
                <Image source={{ uri: photoUri }} style={styles.preview} />
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={() => setPhotoUri(null)}
                >
                  <Text style={styles.retakeText}>Retake Photo</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
                <View style={styles.cameraControls}>
                  <TouchableOpacity
                    style={styles.flipButton}
                    onPress={toggleCameraFacing}
                  >
                    <Ionicons name="camera-reverse" size={28} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.captureButton}
                    onPress={takePicture}
                  >
                    <Ionicons name="camera" size={28} color="#fff" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        );

      case 2:
        return (
          <View style={styles.stepCard}>
            <Text style={styles.sectionTitle}> Step 2: Personal Information</Text>
            <InputField label="First Name" value={firstName} onChangeText={setFirstName} />
            <InputField label="Last Name" value={lastName} onChangeText={setLastName} />
            <InputField label="Email" value={email} onChangeText={setEmail} />
            <InputField label="National Identification Number" value={nationalId} onChangeText={setNationalId} />
            <Dropdown
              label="Gender"
              selectedValue={gender}
              onValueChange={setGender}
              options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
                { label: "Other", value: "other" },
              ]}
            />
          </View>
        );

      case 3:
        const kenyaCities = ["Nairobi", "Mombasa", "Kisumu", "Eldoret", "Nakuru"];
        const congoCities = ["Kinshasa", "Lubumbashi", "Goma", "Kisangani", "Mbandaka"];
        const cityOptions =
          country === "Kenya"
            ? kenyaCities.map((c) => ({ label: c, value: c }))
            : country === "Congo"
            ? congoCities.map((c) => ({ label: c, value: c }))
            : [];

        return (
          <View style={styles.stepCard}>
            <Text style={styles.sectionTitle}> Step 3: Location & Birth Info</Text>
            <View style={{ paddingHorizontal: 20 }}>

            <DateInput label="Date of Birth" value={dob} onChange={setDob} />
            </View>
            <Dropdown
              label="Country"
              selectedValue={country}
              onValueChange={setCountry}
              options={[
                { label: "Kenya", value: "Kenya" },
                { label: "Congo (DRC)", value: "Congo" },
              ]}
            />
            {country ? (
              <Dropdown
                label="City"
                selectedValue={city}
                onValueChange={setCity}
                options={cityOptions}
              />
            ) : null}
            <InputField
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
            />
            <InputField
              label="Address"
              value={address}
              onChangeText={setAddress}
            />
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <StatusBar backgroundColor="#2e7d32" barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Text style={styles.header}>Farmer Registration</Text>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBar, { width: `${(step / totalSteps) * 100}%` }]}
            />
          </View>
          <Text style={styles.stepIndicator}>
            Step {step} of {totalSteps}
          </Text>

          {renderStepContent()}

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {step > 1 && (
              <TouchableOpacity style={styles.backButton} onPress={prevStep}>
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
            )}

            {step < totalSteps ? (
              <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={saveDataToLocalStorage}
              >
                <Text style={styles.buttonText}>Finish</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    // backgroundColor: "#E6F4EA",
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#d4edda",
    borderRadius: 3,
    marginVertical: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#2e7d32",
    borderRadius: 3,
  },
  stepIndicator: {
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  stepCard: {
    // backgroundColor: "#fff",
    // borderRadius: 16,
    padding: 0,
    
    // elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
    color: "#2e7d32",
  },
  camera: {
    width: 300,
    height: 300,
    borderRadius: 150,
    overflow: "hidden",
    alignSelf: "center",
  },
  preview: {
    width: 300,
    height: 300,
    borderRadius: 150,
    alignSelf: "center",
    marginBottom: 10,
  },
  cameraControls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    marginTop: 10,
  },
  flipButton: {
    backgroundColor: "#2e7d32",
    padding: 12,
    borderRadius: 50,
  },
  captureButton: {
    backgroundColor: "#2e7d32",
    padding: 12,
    borderRadius: 50,
  },
  retakeButton: {
    backgroundColor: "#2e7d32",
    padding: 10,
    borderRadius: 8,
    alignSelf: "center",
  },
  retakeText: {
    color: "#fff",
    fontWeight: "600",
  },
  permissionContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  permissionText: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  backButton: {
    flex: 1,
    backgroundColor: "#999",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  nextButton: {
    flex: 1,
    backgroundColor: "#2e7d32",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
