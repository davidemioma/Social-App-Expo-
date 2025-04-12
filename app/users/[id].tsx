import React from "react";
import { Image } from "expo-image";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "@/styles/profile.styles";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import LoadingScreen from "@/components/LoadingScreen";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  FlatList,
} from "react-native";

export default function UserProfileScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams();

  const toggleFollow = useMutation(api.posts.toggleFollow);

  const profile = useQuery(api.users.getUserProfile, {
    userId: id as Id<"users">,
  });

  const posts = useQuery(api.posts.getPostsByUserId, { userId: profile?._id });

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  if (profile === undefined || posts === undefined) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {profile?.username || profile?.fullname}
        </Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarAndStats}>
            <View style={styles.avatarContainer}>
              <Image
                source={profile?.image}
                style={styles.avatar}
                contentFit="cover"
                transition={200}
              />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile?.posts}</Text>

                <Text style={styles.statLabel}>Posts</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile?.followers}</Text>

                <Text style={styles.statLabel}>Followers</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile?.following}</Text>

                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          <Text style={styles.name}>
            {profile?.fullname || profile?.username}
          </Text>

          {profile?.bio && <Text style={styles.bio}>{profile?.bio}</Text>}

          <Pressable
            style={[
              styles.followButton,
              profile.isFollowing && styles.followingButton,
            ]}
            onPress={() => toggleFollow({ userId: profile._id })}
          >
            <Text
              style={[
                styles.followButtonText,
                profile.isFollowing && styles.followingButtonText,
              ]}
            >
              {profile.isFollowing ? "Following" : "Follow"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.postsGrid}>
          {posts?.length > 0 ? (
            <FlatList
              data={posts}
              numColumns={3}
              scrollEnabled={false}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.gridItem}>
                  <Image
                    source={item?.imageUrl}
                    style={styles.gridImage}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                  />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.noPostsContainer}>
              <Ionicons
                name="images-outline"
                size={48}
                color={COLORS.primary}
              />

              <Text style={styles.noPostsText}>No post yet!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
