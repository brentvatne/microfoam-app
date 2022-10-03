import { useEffect, useState } from "react";
import { Text, TextInput, ScrollView, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import DatePicker from "react-native-date-picker";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { BorderlessButton, RectButton } from "react-native-gesture-handler";
import format from "date-fns/format";
import { AvoidSoftInput } from "react-native-avoid-softinput";

import { TailwindColor, FontSize, Padding, Margin } from "~/constants/styles";
import { PourRecord } from "~/storage/PourStore";
import Photo from "~/components/Photo";

/**
 * Form with:
 * - ✅ Photo
 * - ✅ Rating
 * - Attempted design
 * - ✅ What went well / things to improve
 */

type Data = {
  photoUri: string;
  dateTime: Date;
  rating: number;
  notes?: string;
};

export default function LogForm({
  onSave,
  initialData,
}: {
  onSave: (data: Data) => void;
  initialData?: PourRecord;
}) {
  const [dateTimePickerVisible, setDateTimePickerVisible] = useState(false);
  const [dateTime, setDateTime] = useState(
    maybeDate(initialData?.date_time) ?? new Date()
  );
  const [rating, setRating] = useState(initialData?.rating ?? 3);
  const [photoUri, setPhotoUri] = useState<string | undefined>(
    initialData?.photo_url
  );
  const [notes, setNotes] = useState<string | undefined>(initialData?.notes);

  // https://mateusz1913.github.io/react-native-avoid-softinput/docs/guides/usage-module
  // 🤷‍♂️
  useEffect(() => {
    AvoidSoftInput.setEnabled(true);

    return () => {
      AvoidSoftInput.setEnabled(false);
    };
  }, []);

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

        <View style={{ marginBottom: Margin[5] }} />

        <Text
          style={{
            fontSize: FontSize.xl,
            fontWeight: "bold",
            paddingBottom: Padding[2],
          }}
        >
          When
        </Text>
        <DatePicker
          modal
          mode="date"
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
        <BorderlessButton
          onPress={() => setDateTimePickerVisible(true)}
          style={{ paddingVertical: Padding[2] }}
          borderless={false}
        >
          <View>
            <Text style={{ fontSize: FontSize.lg }}>
              {format(dateTime, "PPPP")}
            </Text>
          </View>
        </BorderlessButton>

        <View style={{ marginBottom: Margin[5] }} />

        <Text
          style={{
            fontSize: FontSize.xl,
            fontWeight: "bold",
            paddingBottom: Padding[2],
          }}
        >
          Notes
        </Text>

        <TextInput
          multiline
          maxLength={500}
          onChangeText={(text) => setNotes(text)}
          value={notes}
          placeholder="What went well? What could be improved?"
          style={{
            height: 100,
            backgroundColor: TailwindColor["gray-100"],
            paddingHorizontal: 10,
            paddingTop: 10,
            fontSize: FontSize.lg,
            textAlignVertical: "top",
            borderRadius: 5,
          }}
        />

        <View style={{ marginBottom: Margin[4] }} />

        <BorderlessButton
          borderless={false}
          onPress={() => {
            if (!photoUri) {
              alert("A photo is required. That is the whole point.");
              return;
            }
            onSave({ dateTime, rating, photoUri, notes });
          }}
        >
          <View
            style={{
              width: "100%",
              padding: Padding[4],
              backgroundColor: TailwindColor["blue-100"],
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

        <View style={{ marginBottom: Margin[4] }} />
      </View>
    </ScrollView>
  );
}

function maybeDate(date: number | undefined) {
  if (date) {
    return new Date(date);
  }
}

function PhotoPickerForm({ onChange, photoUri }) {
  const launchPickerAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      selectionLimit: 1,
      quality: 0.6,
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
        padding: Padding[5],
        margin: Margin[2],
        alignItems: "center",
        backgroundColor: TailwindColor["gray-100"],
      }}
    >
      {photoUri ? (
        <BorderlessButton
          onPress={() => launchPickerAsync()}
          borderless={false}
        >
          <Photo
            uri={photoUri}
            resizeMode="cover"
            containerStyle={{
              width: 200,
              height: 200,
              borderRadius: 5,
              overflow: "hidden",
            }}
          />
        </BorderlessButton>
      ) : (
        <RectButton
          style={{
            width: 200,
            height: 200,
            backgroundColor: TailwindColor["gray-200"],
            borderRadius: 5,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => launchPickerAsync()}
        >
          <Text
            style={{ fontSize: FontSize.lg, color: TailwindColor["gray-700"] }}
          >
            {photoUri ? "Select a different photo " : "Select a photo"}
          </Text>
        </RectButton>
      )}
    </View>
  );
}
