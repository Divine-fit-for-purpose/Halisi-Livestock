// components/steps/StepPersonalInfo.tsx
import { View } from "react-native";
import Dropdown from "./DropDown";
import FormStepWrapper from "./FormStepWrapper";
import InputField from "./InputComponent";

export default function StepPersonalInfo({
  firstName,
  lastName,
  email,
  nationalId,
  gender,
  setFirstName,
  setLastName,
  setEmail,
  setNationalId,
  setGender
}) {
  return (
    <FormStepWrapper title="Step 3: Personal Information"> 
      <InputField label="First Name" value={firstName} onChangeText={setFirstName} />
      <InputField label="Last Name" value={lastName} onChangeText={setLastName} />
      <InputField label="Email" value={email} onChangeText={setEmail} />
      <InputField label="National ID" value={nationalId} onChangeText={setNationalId} />
<View style={{ marginTop: 4 }}>

      <Dropdown
        label="Gender"
        selectedValue={gender}
        onValueChange={setGender}
        options={[
          { label: "Male", value: "male" },
          { label: "Female", value: "female" },
        ]}
      />
</View>
    </FormStepWrapper>
  );
}
