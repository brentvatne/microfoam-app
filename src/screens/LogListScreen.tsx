import { FlatList, Text, View } from "react-native";
import { usePours } from "../storage/PourStore";

function Row({ item }) {
  return (
    <View>
      <Text>
        {item.date_time}: {item.rating}
      </Text>
    </View>
  );
}

export default function LogListScreen() {
  const pours = usePours();

  // todo: change to flashlist
  return (
    <FlatList data={pours} renderItem={Row} keyExtractor={(item) => item.id} />
  );
}
