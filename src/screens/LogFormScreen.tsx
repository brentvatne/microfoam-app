import { useLayoutEffect } from "react";
import { Button } from "react-native";
import * as PourStore from "../storage/PourStore";
import { StatusBar } from "expo-status-bar";
import NewLogForm from "../forms/NewLogForm";

export default function LogFormScreen({ navigation }) {
  return (
    <>
      <NewLogForm
        onCreate={(data) => {
          // TODO: verify it was successful
          PourStore.create({
            date_time: data.dateTime,
            rating: data.rating,
            photo_url: data.photoUri,
          });

          // Go back to tabs from the modal
          navigation.navigate("Tabs");
        }}
      />

      <StatusBar style="light" />
    </>
  );
}
