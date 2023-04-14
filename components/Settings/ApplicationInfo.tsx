import * as Application from "expo-application";
import * as Updates from "expo-updates";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { Text, View } from "~/components/Themed";
import { FontSize, Margin, TailwindColor } from "~/constants/styles";

export default function ApplicationInfo({
  onTripleTap,
}: {
  onTripleTap: () => void;
}) {
  const gesture = Gesture.Tap()
    .numberOfTaps(3)
    .runOnJS(true)
    .onStart(() => {
      onTripleTap();
    });

  return (
    <GestureDetector gesture={gesture}>
      <View>
        <Text
          darkColor={TailwindColor["gray-100"]}
          lightColor={TailwindColor["gray-700"]}
          style={{
            marginTop: Margin[1],
            fontSize: FontSize.base,
            textAlign: "center",
          }}
        >
          Version: {Application.nativeApplicationVersion} (
          {Application.nativeBuildVersion})
        </Text>
        <Text
          darkColor={TailwindColor["gray-100"]}
          lightColor={TailwindColor["gray-700"]}
          style={{
            marginTop: Margin[1],
            fontSize: FontSize.base,
            textAlign: "center",
          }}
        >
          ID: {Updates.updateId ?? "(no update id)"}
        </Text>
        <Text
          darkColor={TailwindColor["gray-100"]}
          lightColor={TailwindColor["gray-700"]}
          style={{
            fontSize: FontSize.base,
            textAlign: "center",
            marginTop: Margin[1],
          }}
        >
          Released: {Updates.manifest.createdAt ?? "(no release date)"}
        </Text>
      </View>
    </GestureDetector>
  );
}
