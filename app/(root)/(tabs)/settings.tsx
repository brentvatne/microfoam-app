import { Button, View } from "react-native";
import * as PourStore from "../../../storage/PourStore";

export default function Settings() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
      }}
    >
      <Button title="Clear data" onPress={() => PourStore.destroyAll()} />
    </View>
  );
}
