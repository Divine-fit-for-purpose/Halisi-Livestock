// src/storage/sessionStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_KEY = "current_user";

export const saveSession = async (user: any) => {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const loadSession = async () => {
  const jsonValue = await AsyncStorage.getItem(SESSION_KEY);
  return jsonValue != null ? JSON.parse(jsonValue) : null;
};

export const clearSession = async () => {
  await AsyncStorage.removeItem(SESSION_KEY);
};
