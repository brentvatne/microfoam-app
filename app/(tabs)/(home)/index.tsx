import { useRef, useState, useCallback, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  Platform,
  View as UnthemedView,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { RectButton, BorderlessButton } from "react-native-gesture-handler";
import { useScrollToTop } from "@react-navigation/native";
import { MotiView } from "moti";
import { FlashList } from "@shopify/flash-list";

import { TailwindColor, FontSize, Margin, Padding } from "~/constants/styles";
import * as PourStore from "~/storage/PourStore";
import Photo from "~/components/Photo";
import { AntDesign, Text, View } from "~/components/Themed";

export default function LogListScreen() {
  const pours = PourStore.usePoursGroupedByDate();

  // TODO: Move this into PourStore..
  const listData = pours.map((entry) => [entry.title, ...entry.data]).flat();
  const { stickyHeaderIndices } = useUpdateStickyHeaders(listData);

  const router = useRouter();
  const ref = useRef(null);
  useScrollToTop(ref);

  const headerButton = () => (
    <BorderlessButton
      hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
      onPress={() => {
        router.push("/new");
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
          <FlashList
            data={listData}
            renderItem={renderItem}
            stickyHeaderIndices={stickyHeaderIndices}
            ref={ref}
            keyExtractor={(item) => (typeof item === "string" ? item : item.id)}
            estimatedItemSize={85}
            ItemSeparatorComponent={ItemSeparatorComponent}
            ListEmptyComponent={EmptyState}
          />
        </MotiView>
      </View>
    </>
  );
}

function ItemSeparatorComponent() {
  return (
    <View
      darkColor={TailwindColor["zinc-700"]}
      lightColor={TailwindColor["gray-100"]}
      style={{ height: StyleSheet.hairlineWidth, marginLeft: 10 }}
    />
  );
}

function PourRow({ item }) {
  const router = useRouter();

  return (
    <RectButton
      style={{
        paddingVertical: Padding[3],
        paddingHorizontal: Padding[3],
      }}
      onPress={() => {
        router.push(`/details/${item.id}`);
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
          uri={item.photoUrl}
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
          style={{ flexDirection: "column", paddingTop: Padding[2], flex: 1 }}
        >
          <UnthemedView style={{ flex: 1 }}>
            <Text numberOfLines={2} style={{ flex: 1, fontSize: FontSize.lg }}>
              {item.notes ?? (
                <Text
                  darkColor={TailwindColor["gray-100"]}
                  lightColor={TailwindColor["gray-400"]}
                >
                  No notes
                </Text>
              )}
            </Text>
          </UnthemedView>

          <UnthemedView style={{ paddingBottom: Padding[2] }}>
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
          </UnthemedView>
        </UnthemedView>
      </UnthemedView>
    </RectButton>
  );
}

const renderItem = ({ item }) => {
  if (typeof item === "string") {
    return <SectionHeader title={item} />;
  }

  return <PourRow item={item} />;
};

const SectionHeader = ({ title }) => (
  <View
    style={{
      paddingLeft: Padding[3],
      padding: 9,
      paddingBottom: 7,
      opacity: 0.95,
    }}
    lightColor={TailwindColor["zinc-100"]}
    darkColor={TailwindColor["zinc-800"]}
  >
    <Text
      lightColor={TailwindColor["zinc-600"]}
      darkColor={TailwindColor["zinc-300"]}
    >
      {title}
    </Text>
  </View>
);

function EmptyState() {
  const router = useRouter();

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
          router.push("/new");
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

// Workaround for flash-list bug
// https://github.com/Shopify/flash-list/issues/615#issuecomment-1413734042
const useUpdateStickyHeaders = (data: any[]) => {
  const [stickyHeadersUpdate, triggerStickyHeadersUpdate] =
    useState<boolean>(false);
  const [, triggerRerender] = useState<boolean>(false);

  const stickyHeaderIndices = useRef<number[] | undefined>(undefined);
  const actualStickyHeaderIndices = useRef<number[] | undefined>(undefined);

  actualStickyHeaderIndices.current = data
    .map((item, index) => {
      if (typeof item === "string") {
        return index;
      } else {
        return null;
      }
    })
    .filter((item) => item !== null) as number[];

  useEffect(() => {
    stickyHeaderIndices.current = actualStickyHeaderIndices.current;
    triggerRerender((value) => !value);
  }, [stickyHeadersUpdate, triggerRerender]);

  const updateStickyHeaders = useCallback(() => {
    stickyHeaderIndices.current = undefined;
    triggerStickyHeadersUpdate((value) => !value);
  }, [triggerStickyHeadersUpdate]);

  const hasSetStickyHeadersInitially = useRef<boolean>(false);
  useEffect(() => {
    if ((actualStickyHeaderIndices.current?.length ?? 0) > 0 && !hasSetStickyHeadersInitially.current) {
      hasSetStickyHeadersInitially.current = true;
      stickyHeaderIndices.current = actualStickyHeaderIndices.current;
      triggerRerender(value => !value);
    }
  }, [data, triggerRerender]);

  return {
    updateStickyHeaders,
    stickyHeaderIndices: stickyHeaderIndices.current,
  };
};
