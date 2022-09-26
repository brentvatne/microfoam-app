import { useState } from "react";
import { Button, Text, Image, TextInput, ScrollView, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import DatePicker from "react-native-date-picker";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { BorderlessButton } from "react-native-gesture-handler";

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
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <PhotoPickerForm
          onChange={(data) => {
            setPhotoUri(data.uri);
          }}
          photoUri={photoUri}
        />

        <View className="mt-4" />

        <Text className="text-xl font-bold pt-1 pb-4">Rating</Text>

        <View>
          <SegmentedControl
            values={["1", "2", "3", "4", "5"]}
            selectedIndex={rating - 1}
            onChange={(event) => {
              setRating(event.nativeEvent.selectedSegmentIndex + 1);
            }}
          />
        </View>

        <View className="mb-6" />

        <Text className="text-xl font-bold pb-1">When</Text>
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
            <Text className="text-l">{dateTime.toString()}</Text>
          </View>
        </BorderlessButton>

        <View className="mb-4" />

        <BorderlessButton
          onPress={() => {
            onCreate({ dateTime, rating, photoUri });
          }}
        >
          <View className="w-full mt-4 p-3 bg-blue-100 rounded-md items-center">
            <Text className="text-xl text-blue-500">Save</Text>
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
    <View className="flex-1 border-radius-5 pt-5 m-2 items-center bg-gray-100">
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          className="h-[200] w-[200] bg-gray-200 resize-contain"
        />
      ) : (
        <View className="h-[200] w-[200] bg-gray-200" />
      )}
      <Button title="Select a photo" onPress={() => launchPickerAsync()} />
    </View>
  );
}
