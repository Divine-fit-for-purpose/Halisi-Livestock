import DateInput from "@/components/DateInputComponent";
import Dropdown from "@/components/DropDown";
import InputField from "@/components/InputComponent";
import Ionicons from '@expo/vector-icons/Ionicons';


import {
  CameraType,
  CameraView,
  useCameraPermissions
} from "expo-camera";
import React, { useRef, useState } from "react";
import {
  Button,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
InputField  

export default function RegisterFarmers() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [date, setDate] = useState<Date | null>(null);
  const cameraRef = useRef<any>(null);
  const [gender, setGender] = useState<string>("");

  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [step, setStep] = useState<number>(1);
  const totalSteps = 6;

  // 🔁 Step Navigation
  const nextStep = () => step < totalSteps && setStep(step + 1);
  const prevStep = () => step > 1 && setStep(step - 1);

  // 🎥 Flip camera
  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  // 📸 Capture photo
  const takePicture = async () => {
  if (cameraRef.current) {
    const photo = await cameraRef.current.takePictureAsync();
    setPhotoUri(photo?.uri ?? null);
  }
};

  // 🧱 Step Content
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
              <Button onPress={requestPermission} title="Grant Permission" />
            </View>
          );
        }

        return (
          <View style={styles.cameraContainer}>
            {photoUri ? (
              <>
                <Image source={{ uri: photoUri }} style={styles.preview} />
                <Button title="Retake Photo" onPress={() => setPhotoUri(null)} />
              </>
            ) : (
              <>
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing={facing}
                />
                <View style={styles.cameraControls}>
                  <TouchableOpacity
                    style={styles.flipButton}
                    onPress={toggleCameraFacing}
                  >
                   <Ionicons name="sync" size={24}  color={"#fff"}/>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.captureButton}
                    onPress={takePicture}
                  >
                    <Ionicons name="camera" size={24}  color={"#fff"}/>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        );
      case 2:
        return (
          <View style={{ flex: 1 }}>
      <InputField label="First Name" placeholder="Enter your first name" value="" onChangeText={() => {}} />
      <InputField label="Last Name" placeholder="Enter your last name" value="" onChangeText={() => {}} />
      <InputField label="Email" placeholder="Enter your email" value="" onChangeText={() => {}} />
      <InputField label="Phone Number" placeholder="Enter your phone number" value="" onChangeText={() => {}} />
     <View style={{ marginTop: 10 }}>
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
    </View>
          )
        case 3:
        return (
          <View style={{ flex: 1, padding: 20, backgroundColor: "#f8f8f8" }}>
      <DateInput label="Date of Birth" value={date} onChange={setDate} />
    </View>
        );

      default:
        return (
          <Text style={styles.content}>Step {step} Content Goes Here</Text>
        );
    }
  };

  // 🧩 UI
  return (
    <SafeAreaView style={styles.wrapper}>
    <StatusBar backgroundColor="#000" />

    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1}}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.header}>Registration</Text>
          <Text style={styles.stepIndicator}>
            Step {step} of {totalSteps}
          </Text>

          <View style={styles.formContainer}>{renderStepContent()}</View>

          <View style={styles.buttonContainer}>
            {step > 1 && (
              <TouchableOpacity style={styles.backButton} onPress={prevStep}>
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.nextButton,
                step === totalSteps && { backgroundColor: "#999" },
              ]}
              onPress={nextStep}
              disabled={step === totalSteps}
            >
              <Text style={styles.buttonText}>
                {step === totalSteps ? "Done" : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper:{
    flex:1,
    padding:12,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  stepIndicator: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  formContainer: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionText: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 10,
  },
  cameraContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
  width: 300,            // must be equal
  height: 300,           // same as width
  borderRadius: 150,     // half of width/height
  overflow: "hidden",    // clips content to circle
  alignSelf: "center",   // optional: center it
}
,
  preview: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
  },
  cameraControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    gap: 20,
  },
  flipButton: {
    backgroundColor: "#2e7d32",
    padding: 10,
    borderRadius: 8,
  },
  flipText: {
    color: "#fff",
    fontWeight: "bold",
  },
  captureButton: {
    backgroundColor: "#2e7d32",
    padding: 10,
    borderRadius: 8,
  },
  captureText: {
    color: "#fff",
    fontSize: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    backgroundColor: "#aaa",
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
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
    fontSize: 16,
  },
  content: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 40,
  },
});
