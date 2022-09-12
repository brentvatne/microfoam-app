import { useState } from "react";
import { Button, TextInput, ScrollView, View } from "react-native";
import { create } from "../storage/PourStore";

/**
 * Form with:
 * - Photo/video
 * - Attempted design
 * - Rating
 * - What went well
 * - Things to improve
 */
export default function LogFormScreen({ navigation }) {
  const [dateTime, setDateTime] = useState(new Date().toUTCString());
  const [rating, setRating] = useState(3);

  // todo: what should i use for forms?
  return (
    <ScrollView style={{ flex: 1 }}>
      <TextInput value={dateTime} />
      <TextInput
        value={rating.toString()}
        onChangeText={(value) => setRating(parseInt(value, 10))}
        keyboardType="number-pad"
      />
      <Button
        title="Create"
        onPress={() => {
          // verify it was successful
          create({ date_time: dateTime, rating: rating })

          // Go back to tabs from the modal
          navigation.navigate('Tabs');
        }}
      />
    </ScrollView>
  );
}
