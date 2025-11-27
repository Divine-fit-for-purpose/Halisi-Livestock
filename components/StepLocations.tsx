// components/steps/StepLocation.tsx
import DateInput from "./DateInputComponent";
import Dropdown from "./DropDown";
import FormStepWrapper from "./FormStepWrapper";
import InputField from "./InputComponent";

export default function StepLocation({
  dob,
  setDob,
  country,
  setCountry,
  city,
  setCity,
  phone,
  setPhone,
  address,
  setAddress
}) {
  const cities = {
    Kenya: ["Nairobi", "Mombasa", "Kisumu"],
    Congo: ["Kinshasa", "Goma", "Lubumbashi"]
  };

  return (
    <FormStepWrapper title="Step 4: Location & Birth Info">
      <DateInput label="Date of Birth" value={dob} onChange={setDob} />

      <Dropdown
        label="Country"
        selectedValue={country}
        onValueChange={setCountry}
        options={[
          { label: "Kenya", value: "Kenya" },
          { label: "Congo", value: "Congo" },
        ]}
      />

      {country ? (
        <Dropdown
          label="City"
          selectedValue={city}
          onValueChange={setCity}
          options={(cities[country] || []).map((c) => ({ label: c, value: c }))}
        />
      ) : null}

      <InputField label="Phone" value={phone} onChangeText={setPhone} />
      <InputField label="Address" value={address} onChangeText={setAddress} />
    </FormStepWrapper>
  );
}
