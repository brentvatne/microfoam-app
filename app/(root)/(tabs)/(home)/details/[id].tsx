import { View, Text } from "react-native";

import * as PourStore from "~/storage/PourStore";

export default function ShowPour({ route }) {
  const { id } = route.params;
  const pour = PourStore.usePour(id);

  return (
    <>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>{JSON.stringify(pour)}</Text>
      </View>
    </>
  );
}
