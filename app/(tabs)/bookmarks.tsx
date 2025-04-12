import React from "react";
import { Image } from "expo-image";
import { useQuery } from "convex/react";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/home.styles";
import { api } from "@/convex/_generated/api";
import { View, Text, ScrollView } from "react-native";
import LoadingScreen from "@/components/LoadingScreen";

export default function BookmarksScreen() {
  const posts = useQuery(api.bookmarks.getBookmarkedPosts);

  if (posts === undefined) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmarks</Text>
      </View>

      {posts.length > 0 ? (
        <ScrollView
          contentContainerStyle={{
            flexDirection: "row",
            flexWrap: "wrap",
            padding: 10,
          }}
        >
          {posts.map((post) => (
            <View key={post?._id} style={{ width: "33.33%", padding: 1 }}>
              <Image
                source={post?.imageUrl}
                style={{ width: "100%", aspectRatio: 1 }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <View
          style={{
            flex: 1,
            display: "flex",
            backgroundColor: COLORS.background,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              color: COLORS.primary,
            }}
          >
            No post found!
          </Text>
        </View>
      )}
    </View>
  );
}
