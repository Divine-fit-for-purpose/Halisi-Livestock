// components/steps/StepNationalId.tsx
import { Text, View } from "react-native";
import Dropdown from "./DropDown";
import FormStepWrapper from "./FormStepWrapper";
import InputField from "./InputComponent";
import ToggleButton from "./ToggleComponent";

export default function StepNationalId({
  isEnabled,
  setIsEnabled,
  nationalId,
  setNationalId,
  country,
  setCountry
}) {
  return (
    <FormStepWrapper title="Step 1: Farmer National Identification Number">

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text style={{ width: 230, textAlign: "center" }}>
          Use Population Registration System Verification
        </Text>
        <ToggleButton value={isEnabled} onChange={setIsEnabled} />
      </View>

      <Dropdown
        label=""
        selectedValue={country}
        onValueChange={setCountry}
        options={[
          { label: "Kenya", value: "Kenya" },
          { label: "Congo", value: "Congo" }
        ]}
      />

      <InputField
        label=""
        value={nationalId}
        onChangeText={setNationalId}
        placeholder="Enter Farmer NIN"
      />
    </FormStepWrapper>
  );
}
