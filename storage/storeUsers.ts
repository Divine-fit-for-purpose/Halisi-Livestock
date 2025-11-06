import AsyncStorage from '@react-native-async-storage/async-storage';
// src/storage/userStorage.ts
import { UserProfile } from '@/types/userTypes';

const USERS_KEY = 'users_list';

export const saveUsersToStorage = async (users: UserProfile[]) => {
  try {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    console.log(' Users saved to local storage');
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

export const loadUsersFromStorage = async (): Promise<UserProfile[] | null> => {
  try {
    const json = await AsyncStorage.getItem(USERS_KEY);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error('❌ Error loading users:', error);
    return null;
  }
};

export const clearUsersFromStorage = async () => {
  try {
    await AsyncStorage.removeItem(USERS_KEY);
    console.log('🧹 Users cleared from local storage');
  } catch (error) {
    console.error('❌ Error clearing users:', error);
  }
};
