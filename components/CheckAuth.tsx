import React, { useEffect } from "react";
import LoadingScreen from "./LoadingScreen";
import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";

export default function CheckAuth() {
  const router = useRouter();

  const { isSignedIn, isLoaded } = useAuth();

  const segments = useSegments(); // used to get the current screen

  useEffect(() => {
    if (!isLoaded) return;

    const isAuthScreen = segments[0] === "(auth)";

    if (!isSignedIn && !isAuthScreen) {
      router.replace("/(auth)/login");
    }

    if (isSignedIn && isAuthScreen) {
      router.replace("/(tabs)");
    }
  }, [isLoaded, isSignedIn, segments]);

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
