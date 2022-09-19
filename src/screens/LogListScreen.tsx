import { FlatList, Image, Text, View } from "react-native";
import { usePours } from "../storage/PourStore";

function Row({ item }) {
  return (
    <View style={{ flexDirection: "row" }}>
      <Image
        source={{ uri: item.photo_url }}
        style={{ width: 100, height: 100, marginRight: 50 }}
      />
      <Text>
        {item.date_time}: {item.rating}
      </Text>
    </View>
  );
}

// Default to a grid maybe?
export default function LogListScreen() {
  const pours = usePours();

  // todo: change to flashlist
  return (
    <FlatList data={pours} renderItem={Row} keyExtractor={(item) => item.id} />
  );
}
