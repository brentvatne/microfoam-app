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
      <View style={{ flexDirection: "row" }}>
        <Image
          source={{ uri: item.photo_url }}
          style={{ width: 100, height: 100, marginRight: 50 }}
        />
        <Text>
          {item.date_time}: {item.rating}
        </Text>
      </View>
    </Pressable>
  );
}

// Default to a grid maybe?
export default function LogListScreen() {
  const pours = PourStore.usePours();

  // todo: change to flashlist
  return (
    <FlatList data={pours} renderItem={Row} keyExtractor={(item) => item.id} />
  );
}
