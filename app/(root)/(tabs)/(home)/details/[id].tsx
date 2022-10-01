import { ScrollView, Text, View } from "react-native";

import * as PourStore from "~/storage/PourStore";
import { FontSize, Margin, Padding, TailwindColor } from "~/constants/styles";
import Photo from "~/components/Photo";

export default function ShowPour({ route }) {
  const { id } = route.params;
  const pour = PourStore.usePour(id);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: TailwindColor.white }}>
      <Photo
        uri={pour.photo_url}
        containerStyle={{
          width: "100%",
          height: 350,
          backgroundColor: TailwindColor["black"],
        }}
        resizeMode="contain"
      />

      <View
        style={{
          flexDirection: "column",
          paddingTop: Padding[4],
          paddingHorizontal: Padding[4],
          flex: 1,
        }}
      >
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

          <View style={{ marginTop: Margin[2], flex: 1 }}>
            <Text
              style={{
                flex: 1,
                fontSize: FontSize.lg,
                lineHeight: FontSize.lg * 1.5,
              }}
            >
              {pour.notes ?? (
                <Text style={{ fontStyle: "italic", color: TailwindColor['gray-400'] }}>No notes</Text>
              )}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
