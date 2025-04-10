import React from "react";
import { styles } from "@/styles/home.styles";
import { View, Text, TouchableOpacity, Image } from "react-native";

type Props = {
  story: {
    id: string;
    username: string;
    avatar: string;
    hasStory: boolean;
  };
};

export default function Story({ story }: Props) {
  return (
    <TouchableOpacity style={styles.storyWrapper}>
      <View style={[styles.storyRing, !story.hasStory && styles.noStory]}>
        <Image
          source={{
            uri: story.avatar,
          }}
          style={styles.storyAvatar}
        />
      </View>

      <Text style={styles.storyUsername}>{story.username}</Text>
    </TouchableOpacity>
  );
}
