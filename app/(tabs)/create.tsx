import React, { useState } from "react";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { COLORS } from "@/constants/theme";
import { useUser } from "@clerk/clerk-expo";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "@/styles/create.styles";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";

export default function CreateScreen() {
  const router = useRouter();

  const { user } = useUser();

  const [caption, setCaption] = useState("");

  const [isSharing, setIsSharing] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const createPost = useMutation(api.posts.createPost);

  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  };

  const onCreatePost = async () => {
    if (!selectedImage) return;

    try {
      setIsSharing(true);

      // Make sure you install this: bunx expo install expo-file-system.
      const url = await generateUploadUrl();

      const result = await FileSystem.uploadAsync(url, selectedImage, {
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        mimeType: "image/jpeg",
      });

      if (result.status !== 200) {
        throw new Error("Uploading failed");
      }

      const { storageId } = JSON.parse(result.body);

      await createPost({
        caption,
        storageId,
      });

      setCaption("");

      setSelectedImage(null);

      router.push("/(tabs)");
    } catch (err) {
      console.log("onCreatePost err", err);

      alert("Error creating post! Try again.");
    } finally {
      setIsSharing(false);
    }
  };

  if (!selectedImage)
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>New Post</Text>

          <View style={{ width: 28 }} />
        </View>

        <TouchableOpacity
          style={styles.emptyImageContainer}
          onPress={pickImage}
        >
          <Ionicons name="image-outline" size={48} color={COLORS.gray} />

          <Text style={styles.emptyImageText}>Tap to select an image.</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setCaption("");

              setSelectedImage(null);
            }}
            disabled={isSharing}
          >
            <Ionicons
              name="close-outline"
              size={28}
              color={isSharing ? COLORS.gray : COLORS.white}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>New Post</Text>

          <TouchableOpacity
            style={[
              styles.shareButton,
              isSharing && styles.shareButtonDisabled,
            ]}
            onPress={onCreatePost}
            disabled={isSharing || !selectedImage}
          >
            {isSharing ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.shareText}>Share</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          contentOffset={{ x: 0, y: 100 }}
        >
          <View style={[styles.content, isSharing && styles.contentDisabled]}>
            <View style={styles.imageSection}>
              <Image
                style={styles.previewImage}
                source={selectedImage}
                contentFit="cover"
                transition={200}
              />

              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={pickImage}
                disabled={isSharing}
              >
                <Ionicons name="image-outline" size={20} color={COLORS.white} />

                <Text style={styles.changeImageText}>Change</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputSection}>
              <View style={styles.captionContainer}>
                <Image
                  source={user?.imageUrl}
                  style={styles.userAvatar}
                  contentFit="cover"
                  transition={200}
                />

                <TextInput
                  style={styles.captionInput}
                  value={caption}
                  multiline
                  editable={!isSharing}
                  placeholder="Write a caption..."
                  placeholderTextColor={COLORS.gray}
                  onChangeText={setCaption}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
