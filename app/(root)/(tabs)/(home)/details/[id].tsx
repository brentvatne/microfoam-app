import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Blurhash } from "react-native-blurhash";
import { useSafeAreaFrame } from "react-native-safe-area-context";

import * as PourStore from "~/storage/PourStore";
import { FontSize, Margin, Padding, TailwindColor } from "~/constants/styles";
import Photo from "~/components/Photo";

export default function ShowPour({ route }) {
  const { id } = route.params;
  const frame = useSafeAreaFrame();
  const pour = PourStore.usePour(id);

  const targetImageWidth = frame.width > 400 ? 400 : frame.width;
  const targetImageHeight = Math.min(400, targetImageWidth);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: TailwindColor.white }}>
      <View
        style={{
          width: "100%",
          height: targetImageHeight,
          backgroundColor: TailwindColor["black"],
        }}
      >
        {pour.blurhash ? (
          <Blurhash
            blurhash={pour.blurhash}
            style={{ flex: 1, opacity: 0.5 }}
          />
        ) : null}
        <View
          style={[
            StyleSheet.absoluteFill,
            { alignItems: "center", justifyContent: "center" },
          ]}
        >
          <Photo
            uri={pour.photo_url}
            containerStyle={{
              width: targetImageWidth,
              height: targetImageHeight,
            }}
            resizeMode="contain"
          />
        </View>
      </View>

      <View
        style={{
          flexDirection: "column",
          paddingTop: Padding[4],
          paddingHorizontal: Padding[4],
          flex: 1,
        }}
      >
        <View style={{ marginBottom: Margin[2], flex: 1 }}>
          <Text
            style={{
              flex: 1,
              fontSize: FontSize.lg,
              lineHeight: FontSize.lg * 1.5,
            }}
          >
            {pour.notes ?? (
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

        <View>
          <Text
            style={{
              fontSize: FontSize.lg,
              lineHeight: FontSize.lg * 1.5,
              color: TailwindColor["gray-700"],
            }}
          >
            <Text>Rating:</Text> <Text>{pour.rating} / 5</Text>
          </Text>
        </View>
        <View>
          <Text
            style={{
              fontSize: FontSize.lg,
              lineHeight: FontSize.lg * 1.5,
              color: TailwindColor["gray-700"],
            }}
          >
            {new Date(parseInt(pour.date_time, 10)).toDateString()}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
