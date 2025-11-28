import Ionicons from "@expo/vector-icons/Ionicons";
import { CameraView } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import * as ImageManipulator from "expo-image-manipulator";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FormStepWrapper from "./FormStepWrapper";


interface StepCameraProps {
  permission: { granted: boolean };
  requestPermission: () => void;
  photoUri: string | null;
  setPhotoUri: (uri: string | null) => void;
  cameraRef: React.RefObject<any>;
  facing: "front" | "back";
  toggleCameraFacing: () => void;
  setPhotoBase64: (base64: string | null) => void;
  
  species: "farmer" | "livestock";
}



export default function StepCamera({
  permission,
  requestPermission,
  photoUri,
  setPhotoUri,
  cameraRef,
  facing,
  toggleCameraFacing,
  setPhotoBase64,
  species,
}: StepCameraProps) {
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [faces, setFaces] = useState<FaceDetector.FaceFeature[]>([]);

  // Face detection is handled via the camera's frame processor
  // For now, we'll just track the container size
const takePictureIfFaceDetected = async () => {
  try {
    if (species === "farmer" && faces.length === 0) {
      Alert.alert("No face detected", "Please align your face inside the oval before taking a photo.");
      return; // Exit early if no face
    }

    if (cameraRef.current) {
      // Capture a photo (uri)
      const photo = await cameraRef.current.takePictureAsync({ base64: false, quality: 0.9 });
      if (!photo?.uri) throw new Error("No photo uri returned from camera");

      // Resize/compress
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


  if (!permission.granted) {
    return (
      <FormStepWrapper title="Step 2: Capture User Photo">
        <Text>We need your permission to use the camera.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionText}>Grant Permission</Text>
        </TouchableOpacity>
      </FormStepWrapper>
    );
  }

  return (
    <FormStepWrapper title="Step 2: Capture User Photo">
      {photoUri ? (
        <>
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          <TouchableOpacity style={styles.retakeBtn} onPress={() => setPhotoUri(null)}>
            <Text style={styles.retakeText}>Retake Photo</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View
            style={styles.cameraContainer}
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              setContainerSize({ w: width, h: height });
            }}
          >
            <CameraView
              ref={cameraRef}
              style={styles.cameraBox}
              facing={facing}
            />

            {containerSize.w > 0 && containerSize.h > 0 && (
              <MaskOverlay species={species} w={containerSize.w} h={containerSize.h} faces={faces} />
            )}
          </View>

          {/* CONTROL BUTTONS */}
          <View style={styles.controlBar}>
            <TouchableOpacity onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse" size={32} color="#2e7d32" />
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>takePictureIfFaceDetected()}>
              <Ionicons name="camera" size={38} color="#2e7d32" />
            </TouchableOpacity>

            <TouchableOpacity>
              <Ionicons name="videocam" size={32} color="#2e7d32" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </FormStepWrapper>
  );
}

/* -----------------------------------------------------------------------
   MASK OVERLAY — OVAL for farmer, TRAPEZOID for livestock
------------------------------------------------------------------------ */
interface MaskOverlayProps {
  species: "farmer" | "livestock";
  w: number;
  h: number;
  faces?: FaceDetector.FaceFeature[];
}

function MaskOverlay({ species, w, h, faces = [] }: MaskOverlayProps) {
  const dimColor = "rgba(0,0,0,0.55)";

  // For farmer: clear oval in the middle
  if (species === "farmer") {
    const maskW = w * 0.55;
    const maskH = h * 0.75;
    const x = (w - maskW) / 2;
    const y = (h - maskH) / 2;

    return (
      <View style={StyleSheet.absoluteFill}>
        {/* DARK OUTSIDE */}
        <View style={{ position: "absolute", top: 0, left: 0, width: w, height: y,  }} />
        <View style={{ position: "absolute", top: y + maskH, left: 0, width: w, height: h - (y + maskH),  }} />
        <View style={{ position: "absolute", top: y, left: 0, width: x, height: maskH, }} />
        <View style={{ position: "absolute", top: y, left: x + maskW, width: w - (x + maskW), height: maskH,  }} />
        {/* BORDER */}
        <View style={{ position: "absolute", top: y, left: x, width: maskW, height: maskH, borderRadius: maskH / 2, borderWidth: 4, borderColor: "limegreen" }} />
      </View>
    );
  }

  // For livestock: trapezoid clear area
  if (species === "livestock") {
    const topWidth = w * 0.65;
    const bottomWidth = w * 0.45;
    const height = h * 0.75;
    const topY = (h - height) / 2;
    const bottomY = topY + height;
    const center = w / 2;
    const topLeft = center - topWidth / 2;
    const topRight = center + topWidth / 2;
    const bottomLeft = center - bottomWidth / 2;

    return (
      <View style={StyleSheet.absoluteFill}>
        {/* DARK OUTSIDE */}
        <View style={{ position: "absolute", top: 0, left: 0, width: w, height: topY,  }} />
        <View style={{ position: "absolute", top: bottomY, left: 0, width: w, height: h - bottomY,  }} />
        <View style={{ position: "absolute", top: topY, left: 0, width: topLeft, height: height,  }} />
        <View style={{ position: "absolute", top: topY, left: topRight, width: w - topRight, height: height,  }} />

        {/* BORDER LINES */}
        <View style={{ position: "absolute", top: topY, left: topLeft, width: topWidth, borderTopWidth: 4, borderColor: "limegreen" }} />
        <View style={{ position: "absolute", top: bottomY, left: bottomLeft, width: bottomWidth, borderTopWidth: 4, borderColor: "limegreen" }} />
        <View style={{ position: "absolute", top: topY, left: topLeft, width: 4, height: height, backgroundColor: "limegreen", transform: [{ skewY: "-14deg" }] }} />
        <View style={{ position: "absolute", top: topY, left: topRight - 4, width: 4, height: height, backgroundColor: "limegreen", transform: [{ skewY: "14deg" }] }} />
      </View>
    );
  }

  return null;
}

/* -----------------------------------------------------------------------
   STYLES
------------------------------------------------------------------------ */
const styles = StyleSheet.create({
  permissionButton: { padding: 10, backgroundColor: "#2e7d32", borderRadius: 8, marginTop: 10 },
  permissionText: { color: "#fff", fontWeight: "600" },
  cameraContainer: { width: "100%", height: 300, borderRadius: 12, overflow: "hidden", position: "relative" },
  cameraBox: { width: "100%", height: "100%" },
  controlBar: { flexDirection: "row", justifyContent: "space-around", padding: 12, marginTop: 12, borderRadius: 14 },
  photoPreview: { width: "100%", height: 300, marginBottom: 12 },
  retakeBtn: { padding: 12, backgroundColor: "#2e7d32", borderRadius: 10, alignItems: "center" },
  retakeText: { color: "#fff", fontWeight: "600" }
});
