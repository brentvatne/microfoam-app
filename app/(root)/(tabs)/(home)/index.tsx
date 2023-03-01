import { useRef } from "react";
import {
  Alert,
  StyleSheet,
  Platform,
  View as UnthemedView,
} from "react-native";
import { Stack, useLink } from "expo-router";
import { RectButton, BorderlessButton } from "react-native-gesture-handler";
import { useScrollToTop } from "@react-navigation/native";
import { MotiView } from "moti";

import { TailwindColor, FontSize, Margin, Padding } from "~/constants/styles";
import * as PourStore from "~/storage/PourStore";
import Photo from "~/components/Photo";
import { AntDesign, FlatList, Text, View } from "~/components/Themed";
import { humanDate } from "~/utils/formatDate";

export default function LogListScreen() {
  const pours = PourStore.usePours();
  const link = useLink();
  const ref = useRef(null);
  useScrollToTop(ref);

  const headerButton = () => (
    <BorderlessButton
      hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
      onPress={() => {
        link.push("/new");
      }}
    >
      <AntDesign
        name={Platform.select({ ios: "plus", default: "pluscircleo" })}
        size={24}
      />
    </BorderlessButton>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Pours",
          ...(Platform.OS === "ios"
            ? { headerLeft: headerButton }
            : { headerRight: headerButton }),
        }}
      />
      <View style={{ flex: 1 }}>
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 500 }}
          style={{ flex: 1 }}
        >
          <FlatList
            data={pours}
            renderItem={renderItem}
            ref={ref}
            ItemSeparatorComponent={() => (
              <View
                darkColor={TailwindColor["zinc-700"]}
                lightColor={TailwindColor["gray-100"]}
                style={{ height: StyleSheet.hairlineWidth, marginLeft: 10 }}
              />
            )}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={EmptyState}
            style={{ flex: 1 }}
          />
        </MotiView>
      </View>
    </>
  );
}

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
      <UnthemedView style={{ flexDirection: "row" }}>
        <Photo
          uri={item.photo_url}
          sharedTransition
          blurhash={item.blurhash}
          containerStyle={{
            height: 100,
            width: 100,
            borderRadius: 5,
            marginRight: Margin[3],
            overflow: "hidden",
            backgroundColor: "transparent",
          }}
        />

        <UnthemedView
          style={{ flexDirection: "column", paddingTop: Padding[1], flex: 1 }}
        >
          <UnthemedView style={{ flex: 1, marginBottom: Margin[2] }}>
            <Text numberOfLines={2} style={{ flex: 1, fontSize: FontSize.lg }}>
              {item.notes ?? (
                <Text
                  darkColor={TailwindColor["gray-100"]}
                  lightColor={TailwindColor["gray-400"]}
                  style={{ fontStyle: "italic" }}
                >
                  No notes
                </Text>
              )}
            </Text>
          </UnthemedView>

          <UnthemedView style={{ flex: 1 }}>
            <Text
              darkColor={TailwindColor["gray-300"]}
              lightColor={TailwindColor["gray-600"]}
              style={{
                fontSize: FontSize.base,
              }}
            >
              {item.pattern ?? "Formless blob"}
            </Text>
            <Text
              darkColor={TailwindColor["gray-300"]}
              lightColor={TailwindColor["gray-600"]}
              style={{ fontSize: FontSize.base }}
            >
              Rating: {item.rating} / 5
            </Text>
            <Text
              darkColor={TailwindColor["gray-300"]}
              lightColor={TailwindColor["gray-600"]}
              style={{ fontSize: FontSize.base }}
            >
              {humanDate(item.date_time)}
            </Text>
          </UnthemedView>
        </UnthemedView>
      </UnthemedView>
    </RectButton>
  );
}

const renderItem = ({ item }) => <PourRow item={item} />;

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
        darkColor={TailwindColor["gray-100"]}
        lightColor={TailwindColor["gray-800"]}
        style={{
          fontSize: FontSize.xl,
          textAlign: "center",
          marginBottom: Margin[5],
          marginTop: Margin[3],
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
