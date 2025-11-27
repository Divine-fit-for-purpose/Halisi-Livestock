import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { users } from "../data/user";
import { saveSession } from "../storage/saveSession";
import { loadUsersFromStorage, saveUsersToStorage } from "../storage/storeUsers";


import { GoogleSignin, GoogleSigninButton, isErrorWithCode, isSuccessResponse, statusCodes } from "@react-native-google-signin/google-signin";
import CommonButton from "../components/CommonButtonComponent";
import InputComponent from "../components/InputComponent";




GoogleSignin.configure({
  webClientId:"316918224988-1nq9g2r87tcj81eh65bra7pr426vqr55.apps.googleusercontent.com", // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
  scopes: [
    /* what APIs you want to access on behalf of the user, default is email and profile
    this is just an example, most likely you don't need this option at all! */
    'https://www.googleapis.com/auth/drive.readonly',
  ],
  offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  // hostedDomain: '', // specifies a hosted domain restriction
  forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
  // accountName: '', // [Android] specifies an account name on the device that should be used
  iosClientId:"316918224988-d1565quphs7un213n3c2sqlbg96jq4cn.apps.googleusercontent.com", // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
  // googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. "GoogleService-Info-Staging"
  // openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
  // profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
});

export default function index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [user,setUser] = useState<any>(null)


  const handleSignIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (isSuccessResponse(response) && response.data) {
      setUser({ userInfo: response.data });
      // Alert.alert("✅ Google Sign-In Successful", `Welcome ${response.data.user.name}!`);
      console.log("Google Sign-In Response:", response.data);
      const name = response.data.user?.name ?? "User";
      Alert.alert("✅ Google Sign-In Successful", `Welcome ${name}!`);
      router.replace("/FillForm");

    } else {
      console.log("Google Sign-In cancelled or failed");
      // sign in was cancelled by user
    }
  } catch (error) {
    if (isErrorWithCode(error)) {
       console.log("There was an error during Google Sign-In:", error); 
      switch (error.code) {
        case statusCodes.IN_PROGRESS:
          // operation (eg. sign in) already in progress
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          // Android only, play services not available or outdated
          break;
        default:
        // some other error happened
      }
    } else {
      // an error that's not related to google sign in occurred
    }
  }
};

  // const clearAllData = async () => {
  // try {
  //   await AsyncStorage.clear();
  //   console.log("All local data cleared successfully!");
  // } catch (error) {
  //   console.error(" Error clearing AsyncStorage:", error);
  // }}

  //  Load or initialize users
  useEffect(() => {
    (async () => {
      const existingUsers = await loadUsersFromStorage();
      if (!existingUsers) {
        console.log("🚀 No users found — saving to local storage...");
        await saveUsersToStorage(users);
      }
      const savedUsers = await loadUsersFromStorage();
      // console.log(" Users currently in AsyncStorage:", savedUsers);
    })();
  }, []);

  //  Handle Login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("⚠️ Missing Fields", "Please enter both email and password");
      return;
    }

    const storedUsers = await loadUsersFromStorage();

    if (!storedUsers) {
      Alert.alert(" Error", "No user data found in local storage");
      return;
    }

    // Match user credentials
    const foundUser = storedUsers.find(
      (u: any) =>
        u.email_id.toLowerCase().trim() === email.toLowerCase().trim() &&
        u.password === password
    );

    if (!foundUser) {
      Alert.alert("Login Failed", "Invalid email or password");
      return;
    }

    // ✅ If we reach here, login success
    await saveSession(foundUser);
    Alert.alert("Login Successful", `Welcome ${foundUser.name}!`);

    // ✅ Role-based navigation
    
      router.replace("/FarmerForm" as any);
    
  };



  
  return (
    <SafeAreaView style={styles.wrapper}>  
     <StatusBar  backgroundColor="#2e7d32" />

    <View style={styles.container}>
      <Image source={require('../assets/images/halisi-logo.png')} style={styles.logo} resizeMode="contain" />

      <InputComponent
        label="email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <InputComponent
        label="password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.buttonContainer}>
        <CommonButton title="Login" onPress={handleLogin} />
      </View>
      <View>

        <GoogleSigninButton size={GoogleSigninButton.Size.Wide}  color={GoogleSigninButton.Color.Light} style={{width:212,height:48}} onPress={handleSignIn}/>
      </View>
    </View>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({ 

  wrapper:{
    flex:1,
    backgroundColor: "#eee",
  },
  container: {
    paddingTop:70,
    justifyContent: "center",
    alignItems: "center",
    // paddingHorizontal: 20,
  },
  logo: {
    width: 180,
    height: 100,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 12,
    width: "100%",
    alignItems: "center",
  },
});
