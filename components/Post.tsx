import React, { useState } from "react";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { COLORS } from "@/constants/theme";
import { useUser } from "@clerk/clerk-expo";
import CommentsModal from "./CommentsModal";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "@/styles/home.styles";
import { formatDistanceToNow } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { View, Text, TouchableOpacity } from "react-native";

type Props = {
  post: {
    _id: Id<"posts">;
    _creationTime: number;
    caption?: string | undefined;
    userId: Id<"users">;
    imageUrl: string;
    storageId: Id<"_storage">;
    likes: number;
    comments: number;
    author: {
      _id: Id<"users"> | undefined;
      username: string | undefined;
      fullname: string | undefined;
      image: string | undefined;
    };
    hasLiked: boolean;
    hasBookmarked: boolean;
  };
};

export default function Post({ post }: Props) {
  const { user } = useUser();

  const dbCurrentUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user?.id } : "skip"
  );

  const [showComment, setShowComment] = useState(false);

  const [likeCount, setLikeCount] = useState(post.likes);

  const [hasLiked, setHasLiked] = useState(post.hasLiked);

  const [commentCount, setCommentCount] = useState(post.comments);

  const [hasBookmarked, setHasBookmarked] = useState(post.hasBookmarked);

  const toggleLike = useMutation(api.posts.toggleLike);

  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);

  const deletePost = useMutation(api.posts.deletePost);

  const handleLike = async () => {
    try {
      const res = await toggleLike({ postId: post._id });

      setHasLiked(res);

      setLikeCount((prev) => (res === true ? prev + 1 : prev - 1));
    } catch (err) {
      console.log("handleLike err", err);

      alert("Unable to toggle like");
    }
  };

  const handleBookmark = async () => {
    try {
      const res = await toggleBookmark({ postId: post._id });

      setHasBookmarked(res);
    } catch (err) {
      console.log("handleBookmark err", err);

      alert("Unable to toggle bookmark");
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost({ postId: post._id });
    } catch (err) {
      console.log("handleDelete err", err);

      alert("Unable to delete post");
    }
  };

  return (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <Link href={"/(tabs)/notifications"}>
          <TouchableOpacity style={styles.postHeaderLeft}>
            <Image
              style={styles.postAvatar}
              source={post.author.image}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />

            <Text style={styles.postUsername}>
              {post.author.username || post.author.fullname}
            </Text>
          </TouchableOpacity>
        </Link>

        {post.userId === dbCurrentUser?._id ? (
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={COLORS.white}
            />
          </TouchableOpacity>
        )}
      </View>

      <Image
        style={styles.postImage}
        source={post.imageUrl}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />

      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity onPress={handleLike}>
            <Ionicons
              name={hasLiked ? "heart" : "heart-outline"}
              size={24}
              color={hasLiked ? COLORS.primary : COLORS.white}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowComment(true)}>
            <Ionicons
              name="chatbubble-outline"
              size={22}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleBookmark}>
          <Ionicons
            name={hasBookmarked ? "bookmark" : "bookmark-outline"}
            size={22}
            color={hasBookmarked ? COLORS.primary : COLORS.white}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.postInfo}>
        <Text style={styles.likesText}>
          {likeCount > 0
            ? `${likeCount.toLocaleString()} like${likeCount > 1 ? "s" : ""}`
            : "Be the first to like"}
        </Text>

        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>
              {post.author.username || post.author.fullname}
            </Text>

            <Text style={styles.captionText}>{post.caption}</Text>
          </View>
        )}

        {commentCount > 0 && (
          <TouchableOpacity onPress={() => setShowComment(true)}>
            <Text style={styles.commentsText}>
              View all {commentCount} comment{commentCount > 1 ? "s" : ""}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.timeAgo}>
          {formatDistanceToNow(post._creationTime, { addSuffix: true })}
        </Text>
      </View>

      <CommentsModal
        postId={post._id}
        visible={showComment}
        onClose={() => setShowComment(false)}
        onCommentAdded={() => setCommentCount((prev) => prev + 1)}
      />
    </View>
  );
}
