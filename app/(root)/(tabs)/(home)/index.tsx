import { Alert, Pressable, FlatList, Image, Text, View } from "react-native";
import { NativeStack, Link, useLink } from "expo-router";
import { BorderlessButton } from "react-native-gesture-handler";

import { TailwindColor, FontSize, Margin, Padding } from "~/constants/styles";
import * as PourStore from "~/storage/PourStore";
import Photo from "~/components/Photo";

function PourRow({ item }) {
  const link = useLink();

  return (
    <Pressable
      onPress={() => {
        link.push(`/details/${item.id}`);
      }}
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
        {/* TODO: cache the image locally if it's a remote image */}
        {/* <View
          style={{
            borderRadius: 10,
            overflow: "hidden",
            marginRight: Margin[3],
          }}
        >
          <Blurhash
            blurhash={item.blurhash}
            style={{ width: 100, height: 100 }}
          />
        </View> */}
        <Photo
          uri={item.photo_url}
          blurhash={item.blurhash}
          containerStyle={{
            height: 100,
            width: 100,
            borderRadius: 10,
            marginRight: Margin[3],
            overflow: "hidden",
            backgroundColor: TailwindColor["gray-200"],
          }}
        />
        <View
          style={{ flexDirection: "column", paddingTop: Padding[2], flex: 1 }}
        >
          <View>
            <Text
              style={{
                fontSize: FontSize.base,
                color: TailwindColor["gray-700"],
              }}
            >
              <Text>Rating:</Text> <Text>{item.rating} / 5</Text>
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: FontSize.base,
                color: TailwindColor["gray-700"],
              }}
            >
              {new Date(parseInt(item.date_time, 10)).toDateString()}
            </Text>

            <View style={{ marginTop: Margin[2], flex: 1 }}>
              <Text numberOfLines={2} style={{ flex: 1 }}>
                {item.notes ?? (
                  <Text style={{ fontStyle: "italic" }}>No notes</Text>
                )}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const renderItem = ({ item }) => <PourRow item={item} />;

export default function LogListScreen() {
  const pours = PourStore.usePours();

  return (
    <>
      <NativeStack.Screen
        options={{
          title: "Pours",
          headerRight: () => (
            <Link href="/new" style={{ marginRight: 16 }}>
              <Text
                style={{
                  fontSize: FontSize.lg,
                  color: TailwindColor["blue-600"],
                }}
              >
                New
              </Text>
            </Link>
          ),
        }}
      />
      <FlatList
        data={pours}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={EmptyState}
        style={{ backgroundColor: TailwindColor.white, flex: 1 }}
        contentContainerStyle={{ padding: Padding[3] }}
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
