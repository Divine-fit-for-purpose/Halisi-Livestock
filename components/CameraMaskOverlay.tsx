// FarmerMaskOverlay.tsx
import React, { useMemo } from "react";
import { View } from "react-native";

interface Props {
  containerWidth: number;
  containerHeight: number;
  bounds?: { t: number; r: number; b: number; l: number };
}

export default function FarmerMaskOverlay({
  containerWidth,
  containerHeight,
  bounds = { t: 25, r: 25, b: 25, l: 25 },
}: Props) {
  // === MATCH YOUR CANVAS MATH 1:1 ===
  const { maskX, maskY, maskW, maskH } = useMemo(() => {
    const bboxX = containerWidth * 0.25;
    const bboxY = containerHeight * 0.1;
    const bboxW = containerWidth * 0.52;
    const bboxH = containerHeight * 0.8;

    const maskX = bboxX + bounds.l;
    const maskY = bboxY + bounds.t;
    const maskW = bboxW - (bounds.l + bounds.r);
    const maskH = bboxH - (bounds.t + bounds.b);

    return { maskX, maskY, maskW, maskH };
  }, [containerWidth, containerHeight, bounds]);

  const radius = maskW / 2;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        width: containerWidth,
        height: containerHeight,
        top: 0,
        left: 0,
      }}
    >

      {/* === TOP DIM REGION === */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: containerWidth,
          height: maskY,
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      />

      {/* === BOTTOM DIM REGION === */}
      <View
        style={{
          position: "absolute",
          top: maskY + maskH,
          left: 0,
          width: containerWidth,
          height: containerHeight - (maskY + maskH),
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      />

      {/* === LEFT DIM REGION === */}
      <View
        style={{
          position: "absolute",
          top: maskY,
          left: 0,
          width: maskX,
          height: maskH,
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      />

      {/* === RIGHT DIM REGION === */}
      <View
        style={{
          position: "absolute",
          top: maskY,
          left: maskX + maskW,
          width: containerWidth - (maskX + maskW),
          height: maskH,
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      />

      {/* === OVAL CUTOUT (transparent) === */}
      <View
        style={{
          position: "absolute",
          top: maskY,
          left: maskX,
          width: maskW,
          height: maskH,
          borderRadius: radius,
          backgroundColor: "transparent",
          overflow: "hidden",
        }}
      />

      {/* === GREEN OUTLINE === */}
      <View
        style={{
          position: "absolute",
          top: maskY,
          left: maskX,
          width: maskW,
          height: maskH,
          borderRadius: radius,
          borderColor: "limegreen",
          borderWidth: 3,
        }}
      />

    </View>
  );
}
