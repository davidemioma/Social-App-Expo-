import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { SafeAreaView } from "react-native";
import CheckAuth from "@/components/CheckAuth";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ConvexClientProvider } from "@/providers/convex-client-provider";

import "react-native-reanimated";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ConvexClientProvider>
      <SafeAreaProvider>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: "black",
          }}
        >
          <CheckAuth />
        </SafeAreaView>
      </SafeAreaProvider>
    </ConvexClientProvider>
  );
}
