import { Link } from "expo-router";
import { Image } from "expo-image";
import { useQuery } from "convex/react";
import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/notifications.styles";
import LoadingScreen from "@/components/LoadingScreen";
import { View, Text, FlatList, TouchableOpacity } from "react-native";

type Props = {
  notification: {
    _id: Id<"notifications">;
    _creationTime: number;
    postId?: Id<"posts"> | undefined;
    commentId?: Id<"comments"> | undefined;
    type: "like" | "comment" | "follow";
    senderId: string;
    recieverId: string;
    sender: {
      _id: Id<"users"> | undefined;
      fullname: string | undefined;
      username: string | undefined;
      image: string | undefined;
    };
    post: {
      _id: Id<"posts">;
      _creationTime: number;
      caption?: string | undefined;
      comments: number;
      userId: Id<"users">;
      imageUrl: string;
      storageId: Id<"_storage">;
      likes: number;
    } | null;
    comment: string | undefined;
  };
};

const NotificationItem = ({ notification }: Props) => {
  return (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        {/* Fix href */}
        <Link href="/(tabs)/notifications" asChild>
          <TouchableOpacity style={styles.avatarContainer}>
            <Image
              source={notification.sender.image}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />

            <View style={styles.iconBadge}>
              {notification.type === "like" ? (
                <Ionicons name="heart" size={14} color={COLORS.primary} />
              ) : notification.type === "follow" ? (
                <Ionicons name="person-add" size={14} color="#8b5cf6" />
              ) : (
                <Ionicons name="chatbubble" size={14} color="#38b2f6" />
              )}
            </View>
          </TouchableOpacity>
        </Link>

        <View style={styles.notificationInfo}>
          {/* Fix href */}
          <Link href="/(tabs)/notifications" asChild>
            <TouchableOpacity>
              <Text style={styles.username}>
                {notification.sender.username || notification.sender.fullname}
              </Text>
            </TouchableOpacity>
          </Link>

          <Text style={styles.action}>
            {notification.type === "follow"
              ? "Started following you."
              : notification.type === "like"
                ? "Liked your post."
                : `Commnented: "${notification.comment}"`}
          </Text>

          <Text style={styles.timeAgo}>
            {formatDistanceToNow(notification._creationTime, {
              addSuffix: true,
            })}
          </Text>
        </View>
      </View>

      {notification.post && (
        <Image
          source={notification.post.imageUrl}
          style={styles.postImage}
          contentFit="cover"
          transition={200}
        />
      )}
    </View>
  );
};

export default function NotificationsScreen() {
  const notifications = useQuery(api.notifications.getNotifications);

  if (notifications === undefined) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <NotificationItem notification={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={[styles.container, styles.centered]}>
          <Ionicons
            name="notifications-outline"
            size={48}
            color={COLORS.primary}
          />

          <Text style={{ fontSize: 20, color: COLORS.white, marginTop: 10 }}>
            No notifications yet!
          </Text>
        </View>
      )}
    </View>
  );
}
