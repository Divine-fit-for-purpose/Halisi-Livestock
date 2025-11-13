import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
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
import { Image as RNImage } from "react-native";

// bundled logo asset
const logoAsset = require("../../assets/images/halisi-logo.png");


export default function RegisterFarmers() {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 4;

  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

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
    try {
      if (cameraRef.current) {
        // Capture a photo (uri) and then resize/compress to produce a smaller base64 for embedding
        const photo = await cameraRef.current.takePictureAsync({ base64: false, quality: 0.9 });
        if (!photo?.uri) {
          throw new Error("No photo uri returned from camera");
        }

        // Resize/compress to a maximum width (keeps aspect ratio) and get base64
        const resized = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 1200 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );

        setPhotoUri(resized.uri ?? photo.uri);
        setPhotoBase64(resized.base64 ?? null);
      }
    } catch (err) {
      console.error("Camera error:", err);
      Alert.alert("Camera error", "Could not take or process picture.");
    }
  };

  // Validation before moving to next step
  const validateStep = () => {
    if (step === 1 && !photoUri) {
      Alert.alert("Missing Photo", "Please take a profile photo before continuing.");
      return false;
    }
    if (step === 2 && (!firstName || !lastName || !gender || !email || !nationalId)) {
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
        id: Date.now().toString(),
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

      const storedFarmers = await AsyncStorage.getItem("farmers");
      const farmers = storedFarmers ? JSON.parse(storedFarmers) : [];
      farmers.push(farmerData);
      await AsyncStorage.setItem("farmers", JSON.stringify(farmers));

      Alert.alert("✅ Success", "Farmer information saved locally!");
      router.push("/SuccessScreen");
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("❌ Error", "Failed to save data");
    }
  };

  // --- PDF Certificate download (cross-platform) ---
  const handleDownload = async () => {
    try {
      const cert = {
        firstName,
        lastName,
        email,
        gender,
        phone,
        dob: dob?.toLocaleDateString() ?? "",
        country,
        city,
        address,
        nationalId,
      };

      // Attempt to embed the captured photo as a base64 data URL so the WebView used by printToFileAsync
      // can render it reliably across platforms. If reading fails, fall back to using the original uri.
      let photoSrc: string | null = null;
      if (photoBase64) {
        // we captured base64 directly from the camera
        photoSrc = `data:image/jpeg;base64,${photoBase64}`;
      } else if (photoUri) {
        try {
          const ext = photoUri.split(".").pop()?.split("?")[0]?.toLowerCase();
          const mime = ext === "png" ? "image/png" : "image/jpeg";
          const base64 = await (FileSystem as any).readAsStringAsync(photoUri, { encoding: (FileSystem as any).EncodingType.Base64 });
          photoSrc = `data:${mime};base64,${base64}`;
        } catch (e) {
          console.warn("Could not read photo as base64, falling back to raw uri:", e);
          photoSrc = photoUri; // fallback: may still fail in WebView, but try
        }
      }

      // Prepare logo source (try to embed as base64, fallback to uri)
      let logoSrc: string | null = null;
      try {
        const resolved = RNImage.resolveAssetSource(logoAsset);
        const logoUri = resolved?.uri;
        if (logoUri) {
          try {
            const ext = logoUri.split(".").pop()?.split("?")[0]?.toLowerCase();
            const mime = ext === "png" ? "image/png" : "image/jpeg";
            const base64 = await (FileSystem as any).readAsStringAsync(logoUri, { encoding: (FileSystem as any).EncodingType.Base64 });
            logoSrc = `data:${mime};base64,${base64}`;
          } catch (e) {
            console.warn("Could not read bundled logo as base64, using uri instead:", e);
            logoSrc = logoUri;
          }
        }
      } catch (e) {
        console.warn("Error resolving logo asset:", e);
      }

      // Quick debug: tell whether we will embed base64 or use a uri (remove after debugging)
      console.log("handleDownload: photoBase64 present:", !!photoBase64, "photoUri:", photoUri);
      if (!photoSrc) {
        console.log("handleDownload: no photoSrc will be embedded in PDF");
      } else if (photoSrc.startsWith("data:")) {
        console.log("handleDownload: embedding photo as data URL, length:", photoSrc.length);
      } else {
        console.log("handleDownload: using photo uri:", photoSrc);
      }

      const html = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; margin:0; padding:30px; background:#f7f7f7; }
              .card { max-width: 800px; margin: 0 auto; background: #fff; padding: 28px; border-radius: 8px; box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
              .header { text-align: center; color: #2e7d32; }
              .title { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
              .subtitle { color: #666; margin-bottom: 18px; }
              .row { display: flex; gap: 20px; align-items: flex-start; }
              .left { width: 170px; }
              .photo { width: 150px; height: 150px; border-radius: 8px; object-fit: cover; border: 1px solid #e6e6e6; }
              .right { flex: 1; }
              .info { margin-bottom: 8px; color: #222; }
              .label { color: #666; font-weight: 600; width: 160px; display:inline-block; }
              .value { color: #000; display:inline-block; }
              .footer { margin-top: 20px; text-align: center; color: #888; font-size: 12px; }
              @media (max-width: 600px) {
                .row { flex-direction: column; }
                .left { width: auto; display:flex; justify-content:center; }
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                ${logoSrc ? `<div style="text-align:center;margin-bottom:8px;"><img src="${logoSrc}" style="height:48px;object-fit:contain;" /></div>` : ""}
                <div class="title">Registration Certificate</div>
                <div class="subtitle">A record of registration from Halisi</div>
              </div>

              <div class="row" style="margin-top:20px;">
                <div class="left">
                  ${photoSrc ? `<img src="${photoSrc}" class="photo" />` : `<div style="width:150px;height:150px;border-radius:8px;background:#eee;display:flex;align-items:center;justify-content:center;color:#999">No Photo</div>`}
                </div>

                <div class="right">
                  <div class="info"><span class="label">Full name:</span> <span class="value">${escapeHtml(cert.firstName)} ${escapeHtml(cert.lastName)}</span></div>
                  <div class="info"><span class="label">Email:</span> <span class="value">${escapeHtml(cert.email)}</span></div>
                  <div class="info"><span class="label">Phone:</span> <span class="value">${escapeHtml(cert.phone)}</span></div>
                  <div class="info"><span class="label">Gender:</span> <span class="value">${escapeHtml(cert.gender)}</span></div>
                  <div class="info"><span class="label">Date of birth:</span> <span class="value">${escapeHtml(cert.dob)}</span></div>
                  <div class="info"><span class="label">Country:</span> <span class="value">${escapeHtml(cert.country)}</span></div>
                  <div class="info"><span class="label">City:</span> <span class="value">${escapeHtml(cert.city)}</span></div>
                  <div class="info"><span class="label">Address:</span> <span class="value">${escapeHtml(cert.address)}</span></div>
                  <div class="info"><span class="label">National ID:</span> <span class="value">${escapeHtml(cert.nationalId)}</span></div>
                </div>
              </div>

              <div class="footer">
                Generated by Halisi • ${new Date().toLocaleDateString()}
              </div>
            </div>
          </body>
        </html>
      `;

      const filename = `Farmer_Certificate_${sanitizeFileName(firstName)}_${sanitizeFileName(lastName)}.pdf`;

      // Web: use base64 and trigger browser download
      if (Platform.OS === "web") {
        const webFile = await Print.printToFileAsync({ html, base64: true });
        if (webFile.base64) {
          const link = document.createElement("a");
          link.href = `data:application/pdf;base64,${webFile.base64}`;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          link.remove();
          return;
        }
        Alert.alert("PDF generated", "PDF created but cannot be saved on this platform.");
        return;
      }

      // Native: generate temp file uri
      let file: any = null;
      try {
        file = await Print.printToFileAsync({ html, base64: false });
      } catch (printErr) {
        console.warn("printToFileAsync failed on first attempt:", printErr);
        // Retry without images (some renderers fail when images are too large/corrupt)
        const strippedHtml = html
          .replace(/<img[^>]*>/g, "")
          .replace(/<div[^>]*class=\"logo-img\"[^>]*>[\s\S]*?<\/div>/g, "");
        try {
          file = await Print.printToFileAsync({ html: strippedHtml, base64: false });
        } catch (secondErr) {
          console.error("printToFileAsync failed again after stripping images:", secondErr);
          throw printErr; // rethrow original to be handled by outer catch
        }
      }

      // Try to share the generated PDF (works on native devices). If sharing unavailable, show temp uri.
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri);
      } else {
        Alert.alert("PDF generated", `PDF created. Temp uri: ${file.uri}`);
      }
    } catch (error) {
      console.error("Error generating certificate PDF:", error);
      Alert.alert("Error", "Failed to generate certificate PDF. See console for details.");
    }
  };

  // small helpers for safety
  function escapeHtml(input: string | undefined | null) {
    if (!input) return "";
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function sanitizeFileName(input: string | undefined | null) {
    if (!input) return "unknown";
    return input.replace(/[^a-z0-9_\-]/gi, "_");
  }

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
              <TouchableOpacity style={styles.nextButton} onPress={requestPermission}>
                <Text style={styles.buttonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          );
        }
        return (
          <View style={styles.stepCard}>
            <Text style={styles.sectionTitle}>Step 1: Capture User Photo</Text>
            {photoUri ? (
              <>
                <Image source={{ uri: photoUri }} style={styles.preview} />
                <TouchableOpacity style={styles.retakeButton} onPress={() => setPhotoUri(null)}>
                  <Text style={styles.retakeText}>Retake Photo</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
                <View style={styles.cameraControls}>
                  <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                    <Ionicons name="camera-reverse" size={28} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
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
            <Text style={styles.sectionTitle}>Step 2: Personal Information</Text>
            <InputField label="First Name" value={firstName} onChangeText={setFirstName} />
            <InputField label="Last Name" value={lastName} onChangeText={setLastName} />
            <InputField label="Email" value={email} onChangeText={setEmail} />
            <InputField label="National ID" value={nationalId} onChangeText={setNationalId} />
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
            <Text style={styles.sectionTitle}>Step 3: Location & Birth Info</Text>
            <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
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
            <InputField label="Phone Number" value={phone} onChangeText={setPhone} />
            <InputField label="Address" value={address} onChangeText={setAddress} />
          </View>
        );

      case 4:
        return (
          <View style={styles.stepCard}>
            <Text style={styles.sectionTitle}>Step 4: Review & Submit</Text>
            <View style={styles.reviewContainer}>
              <View style={styles.leftColumn}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.reviewImage} />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Text>No Image</Text>
                  </View>
                )}
              </View>

              <View style={styles.rightColumn}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{firstName} {lastName}</Text>

                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{email}</Text>

                <Text style={styles.label}>Gender:</Text>
                <Text style={styles.value}>{gender}</Text>

                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{phone}</Text>

                <Text style={styles.label}>Date of Birth:</Text>
                <Text style={styles.value}>{dob?.toLocaleDateString()}</Text>

                <Text style={styles.label}>Country:</Text>
                <Text style={styles.value}>{country}</Text>

                <Text style={styles.label}>City:</Text>
                <Text style={styles.value}>{city}</Text>

                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{address}</Text>

                <Text style={styles.label}>National ID:</Text>
                <Text style={styles.value}>{nationalId}</Text>
              </View>
            </View>

            <View style={styles.reviewButtons}>
              <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
                <Ionicons name="download" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Download</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitButton} onPress={saveDataToLocalStorage}>
                <Ionicons name="checkmark" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
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
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.header}>Registration</Text>

          <View style={styles.stepIndicatorContainer}>
            {[1, 2, 3, 4].map((num) => (
              <View key={num} style={styles.stepItem}>
                <TouchableOpacity onPress={() => setStep(num)}>
                  <View
                    style={[
                      styles.stepCircle,
                      step === num && styles.activeStepCircle,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepText,
                        step === num && styles.activeStepText,
                      ]}
                    >
                      {num}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {renderStepContent()}

          {step < totalSteps && (
            <View style={styles.buttonContainer}>
              {step > 1 && (
                <TouchableOpacity style={styles.backButton} onPress={prevStep}>
                  <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, padding: 16, backgroundColor: "#f2f6f2" },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#133d23",
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 14,
    gap: 18,
  },
  stepItem: { marginHorizontal: 6 },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#2e7d32",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  activeStepCircle: { backgroundColor: "#2e7d32" },
  stepText: { color: "#2e7d32", fontWeight: "700" },
  activeStepText: { color: "#fff" },

  stepCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    // borderRadius: 10,
    shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.06,
    // shadowRadius: 6,
    // elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12, color: "#2e7d32" },

  camera: { width: 280, height: 280, alignSelf: "center" },
  preview: { width: 280, height: 280, alignSelf: "center", marginBottom: 10, borderRadius: 8 },
  cameraControls: { flexDirection: "row", justifyContent: "center", gap: 20, marginTop: 12 },
  flipButton: { backgroundColor: "#2e7d32", padding: 10, borderRadius: 30 },
  captureButton: { backgroundColor: "#2e7d32", padding: 10, borderRadius: 30 },
  retakeButton: { backgroundColor: "#2e7d32", padding: 10, borderRadius: 8, alignSelf: "center" },
  retakeText: { color: "#fff", fontWeight: "600" },

  permissionContainer: { alignItems: "center", justifyContent: "center" },
  permissionText: { textAlign: "center", fontSize: 16, marginBottom: 10 },

  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  backButton: { flex: 1, backgroundColor: "#999", padding: 12, borderRadius: 8, alignItems: "center", marginRight: 10 },
  nextButton: { flex: 1, backgroundColor: "#2e7d32", padding: 12, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },

  reviewContainer: { flexDirection: "row", gap: 30, alignItems: "flex-start", justifyContent: "space-between" },
  leftColumn: { flex: 1, alignItems: "center" },
  rightColumn: { flex: 2 },
  reviewImage: { width: 100, height: 100, borderRadius: 8 },
  placeholderImage: { width: 100, height: 100, borderRadius: 8, backgroundColor: "#eee", justifyContent: "center", alignItems: "center" },

  label: { fontWeight: "700", marginTop: 8, color: "#444", fontSize: 13 },
  value: { color: "#000", fontSize: 14 },

  reviewButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 18 },
  downloadButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e88e5", padding: 12, borderRadius: 8, paddingHorizontal: 16 },
  submitButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#2e7d32", padding: 12, borderRadius: 8, paddingHorizontal: 16 },
});
