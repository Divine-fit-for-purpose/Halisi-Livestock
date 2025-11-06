// src/data/users.ts
export interface UserProfile {
  email_id: string;
  name: string;
  role: 'veterinarian' | 'field_officer' | 'admin' | 'supervisor';
  national_id: string;
  registration_number: string;
  password: string; // ✅ Added password field
  linked_institutions?: string[];
  avatar: string;
}
