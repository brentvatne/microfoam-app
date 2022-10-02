import { Alert, FlatList, Text, View } from "react-native";
import { NativeStack, useLink } from "expo-router";
import { RectButton, BorderlessButton } from "react-native-gesture-handler";
import AntDesign from "@expo/vector-icons/AntDesign";

import { TailwindColor, FontSize, Margin, Padding } from "~/constants/styles";
import * as PourStore from "~/storage/PourStore";
import Photo from "~/components/Photo";

function PourRow({ item }) {
  const link = useLink();

  return (
    <RectButton
      style={{
        paddingVertical: Padding[3],
        paddingHorizontal: Padding[3],
      }}
      onPress={() => {
        link.push(`/details/${item.id}`);
      }}
      onLongPress={() => {
        // TODO: bottom sheet with view / share / edit / delete options
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
          { cancelable: true }
        );
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <Photo
          uri={item.photo_url}
          blurhash={item.blurhash}
          containerStyle={{
            height: 100,
            width: 100,
            borderRadius: 5,
            marginRight: Margin[3],
            overflow: "hidden",
            backgroundColor: TailwindColor["gray-200"],
          }}
        />

        <View
          style={{ flexDirection: "column", paddingTop: Padding[2], flex: 1 }}
        >
          <View style={{ flex: 1, marginBottom: Margin[2] }}>
            <Text numberOfLines={2} style={{ flex: 1, fontSize: FontSize.lg }}>
              {item.notes ?? (
                <Text
                  style={{
                    fontStyle: "italic",
                    color: TailwindColor["gray-400"],
                  }}
                >
                  No notes
                </Text>
              )}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: FontSize.lg,
                color: TailwindColor["gray-600"],
              }}
            >
              <Text>Rating:</Text> <Text>{item.rating} / 5</Text>
            </Text>
            <Text
              style={{
                fontSize: FontSize.lg,
                color: TailwindColor["gray-600"],
              }}
            >
              {new Date(parseInt(item.date_time, 10)).toDateString()}
            </Text>
          </View>
        </View>
      </View>
    </RectButton>
  );
}

const renderItem = ({ item }) => <PourRow item={item} />;

export default function LogListScreen() {
  const pours = PourStore.usePours();
  const link = useLink();

  return (
    <>
      <NativeStack.Screen
        options={{
          title: "Pours",
          headerRight: () => (
            <BorderlessButton
              hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
              onPress={() => {
                link.push("/new");
              }}
            >
              <AntDesign
                name="pluscircleo"
                size={24}
                color={TailwindColor["blue-500"]}
              />
            </BorderlessButton>
          ),
        }}
      />
      <FlatList
        data={pours}
        renderItem={renderItem}
        ItemSeparatorComponent={() => (
          <View
            style={{ height: 1, backgroundColor: TailwindColor["gray-100"] }}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={EmptyState}
        style={{ backgroundColor: TailwindColor.white, flex: 1 }}
      />
    </>
  );
}

function EmptyState() {
  const link = useLink();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 40,
      }}
    >
      <Text
        style={{
          fontSize: FontSize.xl,
          textAlign: "center",
          marginBottom: Margin[5],
          marginTop: Margin[3],
          color: TailwindColor["gray-800"],
        }}
      >
        You haven't logged any pours yet.
      </Text>

      <BorderlessButton
        borderless={false}
        onPress={() => {
          link.push("/new");
        }}
      >
        <View
          style={{
            width: "100%",
            padding: Padding[4],
            backgroundColor: TailwindColor["blue-100"],
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: TailwindColor["blue-500"],
              fontSize: FontSize.xl,
            }}
          >
            Enter your first pour
          </Text>
        </View>
      </BorderlessButton>
    </View>
  );
}
