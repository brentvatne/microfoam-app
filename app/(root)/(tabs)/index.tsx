import {
  Alert,
  Button,
  Pressable,
  FlatList,
  Image,
  Text,
  View,
} from "react-native";
import { Tabs } from "expo-router";
import {
  TailwindColor,
  FontSize,
  Margin,
  Padding,
} from "../../../constants/styles";
import * as PourStore from "../../../storage/PourStore";

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
            { text: "OK", onPress: () => PourStore.destroy(item) },
          ],
          { cancelable: false }
        );
      }}
    >
      <View style={{ flexDirection: "row", marginBottom: Margin[4] }}>
        { /* TODO: cache the image locally if it's a remote image */ }
        <Image
          source={{ uri: item.photo_url }}
          style={{
            height: 100,
            width: 100,
            marginRight: Margin[3],
            backgroundColor: TailwindColor["gray-200"],
            borderRadius: 10,
          }}
        />
        <View style={{ flexDirection: "column", paddingTop: Padding[2] }}>
          <View>
            <Text style={{ fontSize: FontSize.lg }}>
              <Text>Rating:</Text>{" "}
              <Text style={{ fontWeight: "bold" }}>{item.rating} / 5</Text>
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: FontSize.lg,
                color: TailwindColor["gray-500"],
              }}
            >
              {new Date(parseInt(item.date_time, 10)).toDateString()}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// Default to a grid maybe?
export default function LogListScreen({ navigation }) {
  const pours = PourStore.usePours();

  // TODO: change to flashlist
  return (
    <>
      <Tabs.Screen
        options={{
          headerRight: () => (
            <Button title="New" onPress={() => navigation.navigate("new")} />
          ),
        }}
      />
      <FlatList
        data={pours}
        renderItem={Row}
        keyExtractor={(item) => item.id}
        style={{ backgroundColor: TailwindColor.white }}
        contentContainerStyle={{ padding: Padding[3] }}
      />
    </>
  );
}
