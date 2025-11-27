import Ionicons from "@expo/vector-icons/Ionicons";
import { CameraView } from "expo-camera";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FormStepWrapper from "./FormStepWrapper";

export default function StepCamera({
  permission,
  requestPermission,
  photoUri,
  setPhotoUri,
  cameraRef,
  facing,
  toggleCameraFacing,
  takePicture,
  species, // 'farmer' | 'livestock'
}) {
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

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
            <CameraView ref={cameraRef} style={styles.cameraBox} facing={facing} />

            {containerSize.w > 0 && containerSize.h > 0 && (
              <MaskOverlay species={species} w={containerSize.w} h={containerSize.h} />
            )}
          </View>

          {/* CONTROL BUTTONS */}
          <View style={styles.controlBar}>
            <TouchableOpacity onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse" size={32} color="#2e7d32" />
            </TouchableOpacity>

            <TouchableOpacity onPress={takePicture}>
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
   MASK OVERLAY — NO LIBRARIES, NO SVG, CLEAR CENTER AREA
------------------------------------------------------------------------ */
function MaskOverlay({ species, w, h }: { species: string; w: number; h: number }) {
  const dimColor = "rgba(0,0,0,0.55)";

  /* =========================================================================
     FARMER → OVAL HOLE
  ========================================================================= */
  if (species === "farmer") {
    const maskW = w * 0.55;
    const maskH = h * 0.75;

    const x = (w - maskW) / 2;
    const y = (h - maskH) / 2;

    return (
      <View style={StyleSheet.absoluteFill}>
        {/* TOP SHADE */}
        <View style={{ position: "absolute", top: 0, left: 0, width: w, height: y, backgroundColor: dimColor }} />

        {/* BOTTOM SHADE */}
        <View style={{ position: "absolute", top: y + maskH, left: 0, width: w, height: h - (y + maskH), backgroundColor: dimColor }} />

        {/* LEFT SHADE */}
        <View style={{ position: "absolute", top: y, left: 0, width: x, height: maskH, backgroundColor: dimColor }} />

        {/* RIGHT SHADE */}
        <View style={{ position: "absolute", top: y, left: x + maskW, width: w - (x + maskW), height: maskH, backgroundColor: dimColor }} />

        {/* GREEN OVAL BORDER */}
        <View
          style={{
            position: "absolute",
            top: y,
            left: x,
            width: maskW,
            height: maskH,
            borderRadius: maskH / 2,
            borderWidth: 4,
            borderColor: "limegreen",
          }}
        />
      </View>
    );
  }

  /* =========================================================================
     LIVESTOCK → TRAPEZOID HOLE
  ========================================================================= */
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
    const bottomRight = center + bottomWidth / 2;

    return (
      <View style={StyleSheet.absoluteFill}>
        {/* TOP SHADE */}
        <View style={{ position: "absolute", top: 0, left: 0, width: w, height: topY, backgroundColor: dimColor }} />

        {/* BOTTOM SHADE */}
        <View style={{ position: "absolute", top: bottomY, left: 0, width: w, height: h - bottomY, backgroundColor: dimColor }} />

        {/* LEFT SHADE */}
        <View
          style={{
            position: "absolute",
            top: topY,
            left: 0,
            width: topLeft,
            height: height,
            backgroundColor: dimColor,
          }}
        />

        {/* RIGHT SHADE */}
        <View
          style={{
            position: "absolute",
            top: topY,
            left: topRight,
            width: w - topRight,
            height: height,
            backgroundColor: dimColor,
          }}
        />

        {/* BORDER: TOP LINE */}
        <View
          style={{
            position: "absolute",
            top: topY,
            left: topLeft,
            width: topWidth,
            borderTopWidth: 4,
            borderColor: "limegreen",
          }}
        />

        {/* BORDER: BOTTOM LINE */}
        <View
          style={{
            position: "absolute",
            top: bottomY,
            left: bottomLeft,
            width: bottomWidth,
            borderTopWidth: 4,
            borderColor: "limegreen",
          }}
        />

        {/* BORDER: LEFT DIAGONAL */}
        <View
          style={{
            position: "absolute",
            top: topY,
            left: topLeft,
            width: 4,
            height: height,
            backgroundColor: "limegreen",
            transform: [{ skewY: "14deg" }],
          }}
        />

        {/* BORDER: RIGHT DIAGONAL */}
        <View
          style={{
            position: "absolute",
            top: topY,
            left: topRight - 4,
            width: 4,
            height: height,
            backgroundColor: "limegreen",
            transform: [{ skewY: "-14deg" }],
          }}
        />
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
  photoPreview: { width: "100%", height: 300, borderRadius: 12, marginBottom: 12 },
  retakeBtn: { padding: 12, backgroundColor: "#2e7d32", borderRadius: 10, alignItems: "center" },
  retakeText: { color: "#fff", fontWeight: "600" },
});
