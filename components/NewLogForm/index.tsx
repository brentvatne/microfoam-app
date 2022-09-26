import { useState } from "react";
import { Button, Text, Image, ScrollView, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import DatePicker from "react-native-date-picker";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { BorderlessButton } from "react-native-gesture-handler";
import {
  TailwindColor,
  FontSize,
  Padding,
  Margin,
} from "../../constants/styles";

/**
 * Form with:
 * - Photo/video
 * - Attempted design
 * - Rating
 * - What went well
 * - Things to improve
 */

type Data = {
  photoUri: string;
  dateTime: Date;
  rating: number;
};

export default function LogFormScreen({
  onCreate,
}: {
  onCreate: (data: Data) => void;
}) {
  const [dateTime, setDateTime] = useState(new Date());
  const [dateTimePickerVisible, setDateTimePickerVisible] = useState(false);
  const [rating, setRating] = useState(3);
  const [photoUri, setPhotoUri] = useState<string | undefined>();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: TailwindColor.white }}>
      <View style={{ padding: Padding[4] }}>
        <PhotoPickerForm
          onChange={(data) => {
            setPhotoUri(data.uri);
          }}
          photoUri={photoUri}
        />

        <View style={{ marginTop: Margin[4] }} />

        <Text
          style={{
            fontSize: FontSize.xl,
            fontWeight: "bold",
            paddingTop: Padding[1],
            paddingBottom: Padding[2],
          }}
        >
          Rating
        </Text>

        <View>
          <SegmentedControl
            values={["1", "2", "3", "4", "5"]}
            selectedIndex={rating - 1}
            onChange={(event) => {
              setRating(event.nativeEvent.selectedSegmentIndex + 1);
            }}
          />
        </View>

        <View style={{ marginBottom: Margin[6] }} />

        <Text
          style={{
            fontSize: FontSize.xl,
            fontWeight: "bold",
            paddingBottom: Padding[1],
          }}
        >
          When
        </Text>
        <DatePicker
          modal
          mode="datetime"
          open={dateTimePickerVisible}
          date={dateTime}
          onConfirm={(date) => {
            setDateTimePickerVisible(false);
            setDateTime(date);
          }}
          onCancel={() => {
            setDateTimePickerVisible(false);
          }}
        />
        <BorderlessButton onPress={() => setDateTimePickerVisible(true)}>
          <View>
            <Text style={{ fontSize: FontSize.lg }}>{dateTime.toString()}</Text>
          </View>
        </BorderlessButton>

        <View style={{ marginBottom: Margin[4] }} />

        <BorderlessButton
          onPress={() => {
            onCreate({ dateTime, rating, photoUri });
          }}
        >
          <View
            style={{
              width: "100%",
              padding: Padding[4],
              backgroundColor: TailwindColor["blue-200"],
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: TailwindColor["blue-500"],
                fontSize: FontSize.xl,
              }}
            >
              Save
            </Text>
          </View>
        </BorderlessButton>
      </View>
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
        flex: 1,
        borderRadius: 10,
        paddingTop: Padding[5],
        margin: Margin[2],
        alignItems: "center",
        backgroundColor: TailwindColor["gray-100"],
      }}
    >
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={{
            width: 200,
            height: 200,
            borderRadius: 10,
            resizeMode: "contain",
          }}
        />
      ) : (
        <View
          style={{
            width: 200,
            height: 200,
            backgroundColor: TailwindColor["gray-200"],
          }}
        />
      )}
      <Button title="Select a photo" onPress={() => launchPickerAsync()} />
    </View>
  );
}
