import * as React from "react";
import { Text, View } from "react-native";
import { BorderlessButton } from "react-native-gesture-handler";

import { FontSize, TailwindColor, Padding } from "~/constants/styles";

export default function BlockButton({
  onPress,
  destructive,
  label,
  containerStyle,
}: {
  onPress: () => void;
  destructive?: boolean;
  label: string;
  containerStyle?: any;
}) {
  return (
    <BorderlessButton borderless={false} onPress={onPress}>
      <View
        style={[
          {
            width: "100%",
            padding: Padding[4],
            backgroundColor: destructive
              ? TailwindColor["red-100"]
              : TailwindColor["blue-100"],
            borderRadius: 10,
            alignItems: "center",
          },
          containerStyle,
        ]}
      >
        <Text
          style={{
            color: destructive
              ? TailwindColor["red-500"]
              : TailwindColor["blue-500"],
            fontSize: FontSize.xl,
          }}
        >
          {label}
        </Text>
      </View>
    </BorderlessButton>
  );
}
