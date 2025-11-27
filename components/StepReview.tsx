// components/steps/StepReviewSubmit.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Text, TouchableOpacity, View } from "react-native";
import FormStepWrapper from "./FormStepWrapper";

export default function StepReviewSubmit({
  photoUri,
  firstName,
  lastName,
  email,
  gender,
  phone,
  dob,
  country,
  city,
  address,
  nationalId,
  onDownload,
  onSubmit
}) {
  return (
    <FormStepWrapper title="Step 5: Review & Submit">
      <View style={{ flexDirection: "row" }}>
        <Image source={{ uri: photoUri }} style={{ width: 100, height: 100 }} />

        <View style={{ marginLeft: 20 }}>
          <Text>Name: {firstName} {lastName}</Text>
          <Text>Email: {email}</Text>
          <Text>Gender: {gender}</Text>
          <Text>Phone: {phone}</Text>
          <Text>Date of Birth: {dob?.toLocaleDateString()}</Text>
          <Text>Country: {country}</Text>
          <Text>City: {city}</Text>
          <Text>Address: {address}</Text>
          <Text>National ID: {nationalId}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", marginTop: 20, gap: 10 }}>
        <TouchableOpacity style={{ flexDirection: "row", padding: 10, backgroundColor: "#1976d2", borderRadius: 8 }} onPress={onDownload}>
          <Ionicons name="download" size={18} color="#fff" />
          <Text style={{ color: "#fff", marginLeft: 8 }}>Download</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ flexDirection: "row", padding: 10, backgroundColor: "#2e7d32", borderRadius: 8 }} onPress={onSubmit}>
          <Ionicons name="checkmark" size={18} color="#fff" />
          <Text style={{ color: "#fff", marginLeft: 8 }}>Submit</Text>
        </TouchableOpacity>
      </View>
    </FormStepWrapper>
  );
}
