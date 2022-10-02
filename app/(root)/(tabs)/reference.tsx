import { Text, View } from "react-native";
import { TailwindColor, FontSize } from "~/constants/styles";

export default function Reference() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: TailwindColor.white,
      }}
    >
      <Text style={{ fontSize: FontSize.xl }}>Monks head</Text>
      <Text style={{ fontSize: FontSize.xl }}>Heart</Text>
      <Text style={{ fontSize: FontSize.xl }}>Tulip</Text>
      <Text style={{ fontSize: FontSize.xl }}>Rosetta</Text>
      <Text style={{ fontSize: FontSize.xl }}>Swan</Text>
    </View>
  );
}
