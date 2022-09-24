import { Alert, Pressable, FlatList, Image, Text, View } from "react-native";
import * as PourStore from "../storage/PourStore";

function Row({ item }) {
  return (
    <Pressable
      onLongPress={() => {
        // TODO: bottom sheet
        Alert.alert(
          "Delete pour?",
          "Are you sure you want to delete this pour?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            { text: "OK", onPress: () => PourStore.remove(item) },
          ],
          { cancelable: false }
        );
      }}
    >
      <View className="flex-row mb-10">
        <Image
          source={{ uri: item.photo_url }}
          className="h-[100] w-[100] mr-4 bg-gray-200 rounded-lg"
        />
        <View className="flex-col">
          <View>
            <Text className="text-lg">
              <Text>Rating:</Text>{" "}
              <Text className="font-bold">{item.rating} / 5</Text>
            </Text>
          </View>
          <View>
            <Text className="color-gray-500 text-lg">
              {new Date(parseInt(item.date_time, 10)).toDateString()}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// Default to a grid maybe?
export default function LogListScreen() {
  const pours = PourStore.usePours();

  // todo: change to flashlist
  return (
    <FlatList
      data={pours}
      renderItem={Row}
      keyExtractor={(item) => item.id}
      className="bg-white"
      contentContainerStyle={{ padding: 10 }}
    />
  );
}
