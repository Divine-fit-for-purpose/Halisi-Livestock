import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CameraType,
  useCameraPermissions
} from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as Print from "expo-print";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image as RNImage,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import StepCamera from "../../components/StepCamera";
import StepLocation from "../../components/StepLocations";
import StepNationalId from "../../components/StepNationalID";
import StepPersonalInfo from "../../components/StepPersonalInfo";
import StepReviewSubmit from "../../components/StepReview";
import { loadSession } from "../../storage/saveSession";


// bundled logo asset
const logoAsset = require("../../assets/images/halisi-logo.png");


export default function RegisterFarmers() {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;
const [isEnabled, setIsEnabled] = useState(false);
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
    if (step === 2 && !photoUri) {
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
      // Load the logged-in agent's session data
      const agentSession = await loadSession();
      if (!agentSession) {
        throw new Error("No agent session found. Please log in again.");
      }

      const agentId = agentSession.registration_number || agentSession.national_id || "N/A";
      const agentName = agentSession.name || "Unknown Agent";
      const certificateNumber = `CERT-${Date.now()}`;

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
        certificateNumber,
        agentId,
        agentName,
      };

      console.log("handleDownload: starting PDF generation");
      console.log("handleDownload: Agent ID:", agentId, "Agent Name:", agentName);
      console.log("handleDownload: Certificate Number:", certificateNumber);

      // Embed photo from camera base64 if available (most reliable)
      let photoSrc: string | null = null;
      if (photoBase64) {
        photoSrc = `data:image/jpeg;base64,${photoBase64}`;
        console.log("handleDownload: embedding photo from camera base64, size:", photoSrc.length);
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
              * { margin: 0; padding: 0; box-sizing: border-box; }
              @page { size: A4; margin: 0; }
              @media print { body { margin: 0; padding: 0; } }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
                background: #fff;
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 0;
              }
              .card { 
                width: 100%;
                height: 100%;
                background: #fff; 
                padding: 20mm;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
              }
              .header { text-align: center; color: #2e7d32; margin-bottom: 15mm; }
              .logo { margin-bottom: 8mm; }
              .logo img { height: 25mm; object-fit: contain; }
              .title { font-size: 24px; font-weight: 700; margin-bottom: 3mm; }
              .subtitle { color: #666; font-size: 13px; margin-bottom: 10mm; }
              .row { display: flex; gap: 15mm; }
              .left { flex-shrink: 1; }
              .photo { width: 50mm; height: 40mm;  object-fit: cover; border: 1px solid #ddd; }
              .right { flex: 1; }
              .info { 
                margin-bottom: 5mm; 
                color: #222; 
                font-size: 12px;
                display: flex;
                gap: 3mm; /* increased by 25% */
                align-items: center;
              }
              .label { color: #333; font-weight: 700; width: 20mm; flex-shrink: 0; } /* labels reduced by 75% */
              .value { color: #000; flex: 1; }
              .footer { 
                margin-top: auto; 
                padding-top: 10mm;
                text-align: center; 
                color: #999; 
                font-size: 10px;
                border-top: 1px solid #eee;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                ${logoSrc ? `<div class="logo"><img src="${logoSrc}" /></div>` : ""}
                
                <div class="subtitle"><h1 style="font-size: 32px; font-weight: 900; margin: 4mm 0 4mm 0; color: #1b5e20; letter-spacing: 1px;">OWNERSHIP CERTIFICATE</h1></div>
                <div style="margin-top: 8mm; font-size: 10px; color: #666;">Halici Ownership Certificate Number: ${escapeHtml(cert.certificateNumber)}</div>
              </div>

              <div class="row">
                <div class="left">
                  ${photoSrc ? `<img src="${photoSrc}" class="photo" />` : `<div style="width:60mm;height:70mm; background:#eee;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px;">No Photo</div>`}
                </div>

                <div class="right">
                  <div class="info"><span class="label font-bold">Full name:</span> <span class="value">${escapeHtml(cert.firstName)} ${escapeHtml(cert.lastName)}</span></div>
                  <div class="info"><span class="label ">Email:</span> <span class="value">${escapeHtml(cert.email)}</span></div>
                  <div class="info"><span class="label">Phone:</span> <span class="value">${escapeHtml(cert.phone)}</span></div>
                  <div class="info"><span class="label">Gender:</span> <span class="value">${escapeHtml(cert.gender)}</span></div>
                  <div class="info"><span class="label">DOB:</span> <span class="value">${escapeHtml(cert.dob)}</span></div>
                  <div class="info"><span class="label">Country:</span> <span class="value">${escapeHtml(cert.country)}</span></div>
                  <div class="info"><span class="label">City:</span> <span class="value">${escapeHtml(cert.city)}</span></div>
                  <div class="info"><span class="label">Address:</span> <span class="value">${escapeHtml(cert.address)}</span></div>
                  <div class="info"><span class="label">National ID:</span> <span class="value">${escapeHtml(cert.nationalId)}</span></div>
                  <div class="info" style="margin-top: 8mm; padding-top: 8mm; border-top: 1px solid #ddd;"><span class="label">Agent ID:</span> <span class="value">${escapeHtml(cert.agentId)}</span></div>
                  <div class="info"><span class="label">Agent:</span> <span class="value">${escapeHtml(cert.agentName)}</span></div>
                </div>
                
              </div>
              <div style="margin-top: 15mm; padding: 10mm; font-size: 9px; color: #555; line-height: 1.5; border-top: 1px solid #ddd; margin-left: 20mm; margin-right: 20mm;">
                <p style="margin: 0 0 8mm 0;">
                  On ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}, ${escapeHtml(cert.firstName)} ${escapeHtml(cert.lastName)} expressly consented, via the Halisi platform, to the collection, transfer, and processing of both personal data and registered livestock information, specially for the purposes of credit and insurance applications. Data was collected by agent ${escapeHtml(cert.agentName)}.
                </p>
                <p style="margin: 0 0 8mm 0;">
                  Document generated by Halisi on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })} at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}, by agent ${escapeHtml(cert.agentName)}.
                </p>
                <p style="margin: 0;">
                  For more information, please contact info@halisi.ai or visit www.halisi.ai
                </p>
              </div>
              </div>


          </body>
        </html>
      `;

      const filename = `Farmer_Certificate_${sanitizeFileName(firstName)}_${sanitizeFileName(lastName)}.pdf`;

      // Web: use base64 and trigger browser download
      if (Platform.OS === "web") {
        console.log("handleDownload: web platform detected");
        const webFile = await Print.printToFileAsync({ html, base64: true });
        console.log("handleDownload: printToFileAsync returned on web", webFile?.base64 ? "with base64" : "without base64");
        if (webFile.base64) {
          console.log("handleDownload: creating download link");
          const link = document.createElement("a");
          link.href = `data:application/pdf;base64,${webFile.base64}`;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          link.remove();
          Alert.alert("Success", "Certificate downloaded!");
          return;
        }
        Alert.alert("PDF generated", "PDF created but cannot be saved on this platform.");
        return;
      }

      // Native: generate temp file uri
      console.log("handleDownload: native platform detected, calling printToFileAsync");
      let file: any = null;
      try {
        file = await Print.printToFileAsync({ html, base64: false });
        console.log("handleDownload: printToFileAsync succeeded, file uri:", file?.uri);
      } catch (printErr) {
        console.warn("printToFileAsync failed on first attempt:", printErr);
        // Retry without images (some renderers fail when images are too large/corrupt)
        console.log("handleDownload: retrying printToFileAsync without images");
        const strippedHtml = html
          .replace(/<img[^>]*>/g, "")
          .replace(/<div[^>]*class=\"logo-img\"[^>]*>[\s\S]*?<\/div>/g, "");
        try {
          file = await Print.printToFileAsync({ html: strippedHtml, base64: false });
          console.log("handleDownload: retry succeeded, file uri:", file?.uri);
        } catch (secondErr) {
          console.error("printToFileAsync failed again after stripping images:", secondErr);
          throw printErr; // rethrow original to be handled by outer catch
        }
      }

      // Validate we got a file URI
      if (!file?.uri) {
        console.error("handleDownload: ERROR - file object exists but uri is missing or falsy");
        throw new Error("PDF generated but no file URI returned");
      }

      // Try to share the generated PDF (works on native devices). If sharing unavailable, show temp uri.
      console.log("handleDownload: checking if Sharing is available");
      if (await Sharing.isAvailableAsync()) {
        console.log("handleDownload: Sharing available, calling shareAsync with uri:", file.uri);
        await Sharing.shareAsync(file.uri);
        console.log("handleDownload: shareAsync completed successfully");
      } else {
        console.log("handleDownload: Sharing not available, showing alert");
        Alert.alert("PDF generated", `PDF created. Temp uri: ${file.uri}`);
      }
    } catch (error) {
      console.error("handleDownload: OUTER CATCH - Error generating certificate PDF:", error);
      if (error instanceof Error) {
        console.error("  Error message:", error.message);
        console.error("  Stack:", error.stack);
      }
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
        return (


<StepNationalId
isEnabled={isEnabled}
        setIsEnabled={setIsEnabled}
        nationalId={nationalId}
        setNationalId={setNationalId}
        country={country}
        setCountry={setCountry}
/>
)
      case 2:
        return (

<StepCamera
        permission={permission}
        requestPermission={requestPermission}
        photoUri={photoUri}
        setPhotoUri={setPhotoUri}
        cameraRef={cameraRef}
        facing={facing}
        toggleCameraFacing={toggleCameraFacing}
        takePicture={takePicture}
        species={"farmer"}
      />
        );

      case 3:
        return (

          <StepPersonalInfo
        firstName={firstName}
        lastName={lastName}
        email={email}
        gender={gender}
        nationalId={nationalId}
        setFirstName={setFirstName}
        setLastName={setLastName}
        setEmail={setEmail}
        setGender={setGender}
        setNationalId={setNationalId}
      />
        );

      case 4:
        const kenyaCities = ["Nairobi", "Mombasa", "Kisumu", "Eldoret", "Nakuru"];
        const congoCities = ["Kinshasa", "Lubumbashi", "Goma", "Kisangani", "Mbandaka"];
        const cityOptions =
          country === "Kenya"
            ? kenyaCities.map((c) => ({ label: c, value: c }))
            : country === "Congo"
            ? congoCities.map((c) => ({ label: c, value: c }))
            : [];

        return (
          // <View style={styles.stepCard}>
          //   <Text style={styles.sectionTitle}>Step 4: Location & Birth Info</Text>
          //   <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
          //     <DateInput label="Date of Birth" value={dob} onChange={setDob} />
          //   </View>
          //   <Dropdown
          //     label="Country"
          //     selectedValue={country}
          //     onValueChange={setCountry}
          //     options={[
          //       { label: "Kenya", value: "Kenya" },
          //       { label: "Congo (DRC)", value: "Congo" },
          //     ]}
          //   />
          //   {country ? (
          //     <Dropdown
          //       label="City"
          //       selectedValue={city}
          //       onValueChange={setCity}
          //       options={cityOptions}
          //     />
          //   ) : null}
          //   <InputField label="Phone Number" value={phone} onChangeText={setPhone} />
          //   <InputField label="Address" value={address} onChangeText={setAddress} />
          // </View>
          <StepLocation
        dob={dob}
        setDob={setDob}
        country={country}
        setCountry={setCountry}
        city={city}
        setCity={setCity}
        phone={phone}
        setPhone={setPhone}
        address={address}
        setAddress={setAddress}
      />
        );

      case 5:
        return (
          <StepReviewSubmit
        photoUri={photoUri}
        firstName={firstName}
        lastName={lastName}
        email={email}
        gender={gender}
        phone={phone}
        dob={dob}
        country={country}
        city={city}
        address={address}
        nationalId={nationalId}
        onDownload={handleDownload}
        onSubmit={saveDataToLocalStorage}
      />
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
