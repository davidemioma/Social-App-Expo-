import LoadingScreen from "@/components/LoadingScreen";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient, Authenticated, AuthLoading } from "convex/react";

const convex = new ConvexReactClient(
  process.env.EXPO_PUBLIC_CONVEX_URL as string,
  {
    unsavedChangesWarning: false,
  }
);

export const ConvexClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <Authenticated>{children}</Authenticated>

        <AuthLoading>
          <LoadingScreen />
        </AuthLoading>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
};
