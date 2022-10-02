import { Text } from "react-native";
import { BorderlessButton } from "react-native-gesture-handler";
import { FontSize, Margin, TailwindColor } from "~/constants/styles";

export default function Button({
  onPress,
  title,
  disabled,
}: {
  onPress: () => void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <BorderlessButton
      hitSlop={{ top: 16, left: 16, bottom: 16, right: 16 }}
      enabled={!disabled}
      onPress={onPress}
    >
      <Text
        style={{
          color: disabled
            ? TailwindColor["gray-500"]
            : TailwindColor["blue-500"],
          fontSize: FontSize.xl,
          marginTop: Margin[1],
          marginBottom: Margin[4],
          textAlign: "center",
        }}
      >
        {title}
      </Text>
    </BorderlessButton>
  );
}
