import { useSafeAreaFrame } from "react-native-safe-area-context";

import { useSearchParams } from "expo-router";
import * as PourStore from "~/storage/PourStore";
import { FontSize, Margin, Padding, TailwindColor } from "~/constants/styles";
import Photo from "~/components/Photo";
import { ScrollView, Text, View } from "~/components/Themed";
import { humanDate } from "~/utils/formatDate";

export default function ShowPour() {
  const params = useSearchParams();
  const id = parseInt(params.id as string, 10);
  const frame = useSafeAreaFrame();
  const pour = PourStore.usePour(id);

  if (!pour) {
    return null;
  }

  const targetImageWidth = frame.width > 400 ? 400 : frame.width;
  const targetImageHeight = Math.min(400, targetImageWidth);

  return (
    <ScrollView style={{ flex: 1 }}>
      <View
        style={{
          width: "100%",
          height: targetImageHeight,
          backgroundColor: TailwindColor["black"],
        }}
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
            darkColor={TailwindColor["gray-300"]}
            lightColor={TailwindColor["gray-600"]}
            style={{
              fontSize: FontSize.lg,
              lineHeight: FontSize.lg * 1.5,
            }}
          >
            {pour.pattern ?? "Formless blob"}
          </Text>
          <Text
            darkColor={TailwindColor["gray-300"]}
            lightColor={TailwindColor["gray-600"]}
            style={{
              fontSize: FontSize.lg,
              lineHeight: FontSize.lg * 1.5,
            }}
          >
            Rating: {pour.rating} / 5
          </Text>
        </View>
        <View>
          <Text
            darkColor={TailwindColor["gray-300"]}
            lightColor={TailwindColor["gray-600"]}
            style={{
              fontSize: FontSize.lg,
              lineHeight: FontSize.lg * 1.5,
            }}
          >
            {humanDate(pour.date_time)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
