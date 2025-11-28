// components/steps/StepPersonalInfo.tsx
import { View } from "react-native";
import Dropdown from "./DropDown";
import FormStepWrapper from "./FormStepWrapper";
import InputField from "./InputComponent";

const cities = {
    Kenya: ["Nairobi", "Mombasa", "Kisumu"],
    Congo: ["Kinshasa", "Goma", "Lubumbashi"]
  };

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
  setGender,
  country,
  setCountry,
  city,
  setCity,
  phone,
  setPhone,monthlyIncome,
  setMonthlyIncome,
  isMemberCooperative,
  setIsMemberCooperative,
  nameOfCooperative,
  setNameOfCooperative,
  experience,
  setExperience,
  ageCategory,
  setAgeCategory,
  schooling,
  setSchooling,
  accommodation,
  setAccommodation,
  residentialStatus,
  setResidentialStatus,
  tenureWithFinancialInstitution,
  setTenureWithFinancialInstitution,
  annualIncome,
  setAnnualIncome,
  setFarmerKRApin,
  farmerKRAPin
}) {
  return (
    <FormStepWrapper title="Step 3: Personal Information"> 
      <InputField label="First Name" value={firstName} onChangeText={setFirstName} />
      <InputField label="Surname" value={lastName} onChangeText={setLastName} />
      <InputField label="National ID" value={nationalId} onChangeText={setNationalId} />
      <InputField label="Email" value={email} onChangeText={setEmail} />

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
  <InputField label="Phone" value={phone} onChangeText={setPhone} />
  <InputField label="monthly income" value={monthlyIncome} onChangeText={setMonthlyIncome} />
  <View style={{ marginTop: 4 }}>

  <Dropdown
        label="Cooperative membership"
        selectedValue={isMemberCooperative}
        onValueChange={setIsMemberCooperative}
        options={[
          { label: "Yes", value: "Yes" },
          { label: "No", value: "No" },
        ]}
      />
     {
      isMemberCooperative === "Yes" && <InputField label="name of cooperative" value={nameOfCooperative} onChangeText={setNameOfCooperative} />
     } 
  </View>
<InputField label="experience (years)" value={experience} onChangeText={setExperience} />

<View style={{ marginTop: 4 }}>

<Dropdown 
        label="Age Category"
        selectedValue={ageCategory}
        onValueChange={setAgeCategory}
        options={[
          { label: "18-30 years old", value: "18-30 years old" },
          { label: "30-50 years old", value: "30-50 years old" },
          { label: "> 50 years old", value: "50 years old above" },
        ]}
      />
</View>
<View style={{ marginTop: 4 }}>
<Dropdown 
        label="Schooling"
        selectedValue={schooling}
        onValueChange={setSchooling}
        options={[
          { label: "literate", value: "Primary" },
          { label: "Secondary", value: "High School" },
          { label: "Sup", value: "Sup" },
        ]}
      />
</View>
<View style={{ marginTop: 4 }}>
  <Dropdown 
        label="Select place of living"
        selectedValue={accommodation}
        onValueChange={setAccommodation}
        options={[
          { label: "Village", value: "village" },
          { label: "Ward", value:"Ward" },
          { label: "County", value: "County" },
        ]}
      />
</View>
<View style={{ marginTop: 4 }}>
  <Dropdown 
        label="Residential Status"
        selectedValue={residentialStatus}
        onValueChange={setResidentialStatus}
        options={[
          { label: "Rent", value: "Rent" },
          { label: "Own", value:"Own" },
          { label: "Live with Family", value: "Live with Family" },
        ]}
      />
      
</View>
<View style={{ marginTop: 4 }}>
  <Dropdown 
        label="Customer tenure with financial institution"
        selectedValue={tenureWithFinancialInstitution}
        onValueChange={setTenureWithFinancialInstitution}
        options={[
          { label: "Old (5+ years)", value: "Old(5+ years)" },
          { label: "New (0-5 years)", value:"New(0-5years)" },

        ]}
      />
      
</View>
<InputField label="Select Annual Income(Ksh)" value={annualIncome} onChangeText={setAnnualIncome} />
<InputField label="Farmer Kra PIN" value={farmerKRAPin} onChangeText={setFarmerKRApin} />
    </FormStepWrapper>
  );
}
