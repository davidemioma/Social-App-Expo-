import React, { useState } from "react";
import Comment from "./Comment";
import { COLORS } from "@/constants/theme";
import LoadingScreen from "./LoadingScreen";
import { styles } from "@/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";

type Props = {
  postId: Id<"posts">;
  visible: boolean;
  onClose: () => void;
  onCommentAdded: () => void;
};

export default function CommentsModal({
  postId,
  visible,
  onClose,
  onCommentAdded,
}: Props) {
  const [content, setContent] = useState("");

  const [isPending, setIsPending] = useState(false);

  const addComment = useMutation(api.comments.createComment);

  const comments = useQuery(api.comments.getComments, { postId });

  const btnDiabled = !content.trim() || isPending;

  if (comments === undefined) {
    return <LoadingScreen />;
  }

  const addCommentHandler = async () => {
    if (!content.trim()) return;

    try {
      setIsPending(true);

      await addComment({
        postId,
        content,
      });

      setContent("");

      onCommentAdded();
    } catch (err) {
      console.log("addCommentHandler err", err);

      alert("Error adding comment! Try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Comments</Text>

          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={comments}
          renderItem={({ item }) => <Comment comment={item} />}
          keyExtractor={({ _id }) => _id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.commentsList}
        />

        <View style={styles.commentInput}>
          <TextInput
            style={styles.input}
            value={content}
            multiline
            editable={!isPending}
            placeholder="Add a comment..."
            placeholderTextColor={COLORS.gray}
            onChangeText={setContent}
          />

          <TouchableOpacity onPress={addCommentHandler} disabled={btnDiabled}>
            {isPending ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text
                style={[
                  styles.postButton,
                  btnDiabled && styles.postButtonDisabled,
                ]}
              >
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
