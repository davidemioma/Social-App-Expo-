import React from "react";
import Post from "@/components/Post";
import Story from "@/components/Story";
import { useQuery } from "convex/react";
import { COLORS } from "@/constants/theme";
import { useAuth } from "@clerk/clerk-expo";
import { styles } from "@/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/convex/_generated/api";
import { STORIES } from "@/constants/mock-data";
import LoadingScreen from "@/components/LoadingScreen";
import { View, Text, TouchableOpacity, FlatList } from "react-native";

export default function HomeScreen() {
  const { signOut } = useAuth();

  const posts = useQuery(api.posts.getPosts);

  if (posts === undefined) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Social App</Text>

        <TouchableOpacity onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.storiesContainer}
        data={STORIES}
        renderItem={({ item }) => <Story story={item} />}
        keyExtractor={({ id }) => id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />

      {posts.length > 0 ? (
        <FlatList
          data={posts}
          renderItem={({ item }) => <Post post={item} />}
          keyExtractor={({ _id }) => _id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 60,
          }}
        />
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
