import { ScrollView, Text } from "react-native";

import * as PourStore from "~/storage/PourStore";
import { TailwindColor } from "~/constants/styles";

export default function ShowPour({ route }) {
  const { id } = route.params;
  const pour = PourStore.usePour(id);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: TailwindColor.white }}>
      <Text>{JSON.stringify(pour)}</Text>
    </ScrollView>
  );
}
