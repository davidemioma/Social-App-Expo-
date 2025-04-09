import { styles } from "@/styles/home.styles";
import { useAuth } from "@clerk/clerk-expo";
import { View, Text, TouchableOpacity, Pressable, Image } from "react-native";

export default function HomeScreen() {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HomeScreen</Text>

      <TouchableOpacity onPress={() => signOut()}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
