import { UserProfile } from "@/types/userTypes";

// src/data/users.ts
export const users: UserProfile[] = [
  {
    email_id: "kaludivine545@gmail.com",
    name: "Divine KALU Veterinarian",
    role: "veterinarian",
    national_id: "19191919",
    registration_number: "80080080",
    password: "vet123", // ✅
    avatar: "https://randomuser.me/api/portraits/men/45.jpg"
  },
  {
    email_id: "divinekalu910@gmail.com",
    name: "Divine KALU",
    role: "field_officer",
    linked_institutions: ["Baobab Savings and Loan"],
    national_id: "150150150",
    registration_number: "",
    password: "field123", // ✅
    avatar: "https://randomuser.me/api/portraits/men/46.jpg"
  },
  {
    email_id: "adaobi.james@example.com",
    name: "Adaobi James",
    role: "field_officer",
    linked_institutions: ["Baobab Savings and Loan"],
    national_id: "150150151",
    registration_number: "",
    password: "ada123", // ✅
    avatar: "https://randomuser.me/api/portraits/women/47.jpg"
  },
  {
    email_id: "okafor.admin@example.com",
    name: "Emeka Okafor",
    role: "admin",
    national_id: "77777777",
    registration_number: "ADM900900",
    password: "admin123", // ✅
    avatar: "https://randomuser.me/api/portraits/men/50.jpg"
  },
  {
    email_id: "ngozi.supervisor@example.com",
    name: "Ngozi Okeke",
    role: "supervisor",
    national_id: "88888888",
    registration_number: "SUP808080",
    password: "sup123", // ✅
    avatar: "https://randomuser.me/api/portraits/women/52.jpg"
  }
];
