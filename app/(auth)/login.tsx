import React from "react";
import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "@/styles/auth.styles";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useSSO } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

export default function login() {
  const router = useRouter();

  const { startSSOFlow } = useSSO();

  const handleGoogleLogin = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (!createdSessionId || !setActive) {
        alert("Unable to login! Try again.");

        return;
      }

      setActive({
        session: createdSessionId,
      });

      router.replace("/(tabs)");
    } catch (err) {
      console.error("oAuth error", err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={32} color={COLORS.primary} />
        </View>

        <Text style={styles.appName}>Social App</Text>

        <Text style={styles.tagline}>Do not miss out on anything!</Text>
      </View>

      <View style={styles.illustrationContainer}>
        <Image
          source={require("../../assets/images/thumbnail.png")}
          style={styles.illustration}
          resizeMode="cover"
        />
      </View>

      <View style={styles.loginSection}>
        <TouchableOpacity
          style={styles.googleButton}
          activeOpacity={0.9}
          onPress={handleGoogleLogin}
        >
          <View style={styles.googleIconContainer}>
            <Ionicons name="logo-google" size={20} color={COLORS.surface} />
          </View>

          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, You agree to our Terms and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}
