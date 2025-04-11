import { useState } from "react";
import { Image } from "expo-image";
import { COLORS } from "@/constants/theme";
import { useAuth } from "@clerk/clerk-expo";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "@/styles/profile.styles";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import LoadingScreen from "@/components/LoadingScreen";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

export default function ProfileScreen() {
  const { userId, signOut } = useAuth();

  const [showModal, setShowModal] = useState(false);

  const [isPending, setIsPending] = useState(false);

  const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null);

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip"
  );

  const posts = useQuery(api.posts.getPostsByUserId, {});

  const [editProfileData, setEditProfileData] = useState({
    fullname: currentUser?.fullname || "",
    bio: currentUser?.bio || "",
  });

  const updateProfile = useMutation(api.users.updateProfile);

  const handleEditProfile = async () => {
    try {
      setIsPending(true);

      await updateProfile(editProfileData);

      setShowModal(false);
    } catch (err) {
      console.log("handleEditProfile err", err);

      alert("Error updating profile! Try again.");
    } finally {
      setIsPending(false);
    }
  };

  if (!currentUser || posts === undefined) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.username}>
            {currentUser?.username || currentUser?.fullname}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => signOut()}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarAndStats}>
            <View style={styles.avatarContainer}>
              <Image
                source={currentUser?.image}
                style={styles.avatar}
                contentFit="cover"
                transition={200}
              />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser?.posts}</Text>

                <Text style={styles.statLabel}>Posts</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser?.followers}</Text>

                <Text style={styles.statLabel}>Followers</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser?.following}</Text>

                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          <Text style={styles.name}>
            {currentUser?.fullname || currentUser?.username}
          </Text>

          {currentUser?.bio && (
            <Text style={styles.bio}>{currentUser?.bio}</Text>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowModal(true)}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {posts?.length > 0 ? (
          <FlatList
            data={posts}
            numColumns={3}
            scrollEnabled={false}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.gridItem}
                onPress={() => setSelectedPost(item)}
              >
                <Image
                  source={item?.imageUrl}
                  style={styles.gridImage}
                  contentFit="cover"
                  transition={200}
                />
              </TouchableOpacity>
            )}
          />
        ) : (
          <View
            style={{
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: COLORS.background,
            }}
          >
            <Ionicons name="images-outline" size={48} color={COLORS.primary} />

            <Text style={{ fontSize: 20, color: COLORS.white, marginTop: 10 }}>
              No post yet!
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
        transparent={true}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.modalContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>

                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>

                <TextInput
                  style={styles.input}
                  value={editProfileData.fullname}
                  editable={!isPending}
                  placeholder="Full name..."
                  placeholderTextColor={COLORS.gray}
                  onChangeText={(text) =>
                    setEditProfileData((prev) => ({ ...prev, fullname: text }))
                  }
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Bio</Text>

                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={editProfileData.bio}
                  editable={!isPending}
                  multiline
                  numberOfLines={4}
                  placeholder="Write something..."
                  placeholderTextColor={COLORS.gray}
                  onChangeText={(text) =>
                    setEditProfileData((prev) => ({ ...prev, bio: text }))
                  }
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleEditProfile}
                disabled={isPending}
              >
                <Text style={styles.saveButtonText}>
                  {isPending ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={!!selectedPost}
        animationType="fade"
        onRequestClose={() => setSelectedPost(null)}
        transparent={true}
      >
        <View style={styles.modalBackdrop}>
          {selectedPost && (
            <View style={styles.postDetailContainer}>
              <View style={styles.postDetailHeader}>
                <TouchableOpacity onPress={() => setSelectedPost(null)}>
                  <Ionicons name="close" size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              <Image
                source={selectedPost.imageUrl}
                style={styles.postDetailImage}
                cachePolicy="memory-disk"
              />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
