import { useState } from "react";
import { Button, Image, TextInput, ScrollView, View } from "react-native";
import { create } from "../storage/PourStore";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";

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
  const [photoUri, setPhotoUri] = useState<string | undefined>();

  // todo: what should i use for forms?
  return (
    <ScrollView style={{ flex: 1 }}>
      <TextInput value={dateTime} />
      <TextInput
        value={rating.toString()}
        onChangeText={(value) => setRating(parseInt(value, 10))}
        keyboardType="number-pad"
      />
      <PhotoPickerForm
        onChange={(data) => {
          setPhotoUri(data.uri);
          console.log(data.exif);
        }}
        photoUri={photoUri}
      />
      <Button
        title="Create"
        onPress={() => {
          // verify it was successful
          create({ date_time: dateTime, rating: rating, photo_url: photoUri });

          // Go back to tabs from the modal
          navigation.navigate("Tabs");
        }}
      />
      <StatusBar style="light" />
    </ScrollView>
  );
}

function PhotoPickerForm({ onChange, photoUri }) {
  const launchPickerAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      selectionLimit: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (result.cancelled === false) {
      onChange({
        uri: result.uri,
        width: result.width,
        height: result.height,
        exif: result.exif,
      });
    }
  };
  return (
    <View
      style={{
        backgroundColor: "#eee",
        flex: 1,
        borderRadius: 5,
        margin: 10,
        padding: 10,
        alignItems: "center",
      }}
    >
      {photoUri && (
        <Image
          source={{ uri: photoUri }}
          style={{
            width: 200,
            height: 200,
            marginVertical: 10,
            resizeMode: "contain",
          }}
        />
      )}
      <Button title="Select a photo" onPress={() => launchPickerAsync()} />
    </View>
  );
}
