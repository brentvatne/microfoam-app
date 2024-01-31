import { View } from "react-native";
import * as Application from "expo-application";
import { useUpdates } from "expo-updates";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { Text } from "~/components/Themed";
import { FontSize, Margin, TailwindColor } from "~/constants/styles";

export default function ApplicationInfo({
  onTripleTap,
}: {
  onTripleTap: () => void;
}) {
  const { currentlyRunning: currentlyRunningUpdate } = useUpdates();

  const gesture = Gesture.Tap()
    .numberOfTaps(3)
    .runOnJS(true)
    .onStart(() => {
      onTripleTap();
    });

  return (
    <GestureDetector gesture={gesture}>
      <View style={{ paddingHorizontal: 10 }}>
        <DebugText>
          Version: {Application.nativeApplicationVersion} (
          {Application.nativeBuildVersion})
        </DebugText>

        <DebugText>Runtime: {currentlyRunningUpdate.runtimeVersion}</DebugText>

        <DebugText>Channel: {currentlyRunningUpdate.channel}</DebugText>

        <DebugText>
          ID: {currentlyRunningUpdate.updateId ?? "(embedded)"}
        </DebugText>

        {currentlyRunningUpdate.createdAt ? (
          <DebugText>
            Released: {currentlyRunningUpdate.createdAt.toString()}
          </DebugText>
        ) : null}
      </View>
    </GestureDetector>
  );
}

const DebugText = ({ children }) => {
  return (
    <Text
      darkColor={TailwindColor["gray-100"]}
      lightColor={TailwindColor["gray-700"]}
      style={{
        fontSize: FontSize.base,
        textAlign: "center",
        marginTop: Margin[1],
      }}
    >
      {children}
    </Text>
  );
};
