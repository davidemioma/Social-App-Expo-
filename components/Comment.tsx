import React from "react";
import { styles } from "@/styles/home.styles";
import { formatDistanceToNow } from "date-fns";
import { View, Text, Image } from "react-native";
import { Id } from "@/convex/_generated/dataModel";

type Props = {
  comment: {
    _id: Id<"comments">;
    _creationTime: number;
    userId: Id<"users">;
    postId: Id<"posts">;
    content: string;
    author: {
      _id: Id<"users"> | undefined;
      username: string | undefined;
      fullname: string | undefined;
      image: string | undefined;
    };
  };
};

export default function Comment({ comment }: Props) {
  return (
    <View style={styles.commentContainer}>
      <Image
        style={styles.commentAvatar}
        source={{ uri: comment.author.image }}
      />

      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>
          {comment.author.username || comment.author.fullname}
        </Text>

        <Text style={styles.commentText}>{comment.content}</Text>

        <Text style={styles.commentTime}>
          {formatDistanceToNow(comment._creationTime, { addSuffix: true })}
        </Text>
      </View>
    </View>
  );
}
