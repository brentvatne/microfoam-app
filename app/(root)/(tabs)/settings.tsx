import { Button, View } from "react-native";
import * as PourStore from "../../../src/storage/PourStore";

export default function Settings() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Button title="Clear data" onPress={() => PourStore.destroyAll()} />
    </View>
  );
}
