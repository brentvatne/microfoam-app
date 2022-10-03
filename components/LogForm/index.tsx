import React, { useEffect, useState } from "react";
import { Text, TextInput, ScrollView, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import DatePicker from "react-native-date-picker";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { BorderlessButton, RectButton } from "react-native-gesture-handler";
import format from "date-fns/format";
import { AvoidSoftInput } from "react-native-avoid-softinput";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  BottomSheetModalProvider,
  BottomSheetBackdrop,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";

import { TailwindColor, FontSize, Padding, Margin } from "~/constants/styles";
import { PourRecord } from "~/storage/PourStore";
import Photo from "~/components/Photo";
import BlockButton from "~/components/BlockButton";

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
  pattern?: string;
};

export default function LogForm({
  onSave,
  onDelete,
  initialData,
}: {
  onSave: (data: Data) => void;
  onDelete?: () => void;
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
  const [pattern, setPattern] = useState<string | undefined>(
    initialData?.pattern ?? "Formless blob"
  );

  // https://mateusz1913.github.io/react-native-avoid-softinput/docs/guides/usage-module
  // 🤷‍♂️
  useEffect(() => {
    AvoidSoftInput.setEnabled(true);

    return () => {
      AvoidSoftInput.setEnabled(false);
    };
  }, []);

  return (
    <BottomSheetModalProvider>
      <ScrollView
        style={{ flex: 1, backgroundColor: TailwindColor.white }}
        keyboardShouldPersistTaps="always"
      >
        <View style={{ padding: Padding[4] }}>
          <PhotoPickerForm
            onChange={(data) => {
              setPhotoUri(data.uri);
              if (data.creationTime) {
                setDateTime(data.creationTime);
              }
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
            Pattern
          </Text>

          <PatternPicker
            pattern={pattern}
            onChange={(value) => setPattern(value)}
          />

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

          <BlockButton
            label="Save"
            onPress={() => {
              if (!photoUri) {
                alert("A photo is required. That is the whole point.");
                return;
              }
              onSave({ dateTime, rating, photoUri, notes, pattern });
            }}
          />

          {onDelete && (
            <BlockButton
              label="Delete"
              destructive
              onPress={onDelete}
              containerStyle={{ marginTop: Margin[3], marginBottom: Margin[4] }}
            />
          )}

          <View style={{ marginBottom: Margin[4] }} />
        </View>
      </ScrollView>
    </BottomSheetModalProvider>
  );
}

function maybeDate(date: number | undefined) {
  if (date) {
    return new Date(date);
  }
}

function PhotoPickerForm({ onChange, photoUri }) {
  const [response, requestPermissionAsync] = MediaLibrary.usePermissions();

  const launchPickerAsync = async () => {
    // Only required in order to get back the assetId from the ImagePicker response
    if (response?.status === MediaLibrary.PermissionStatus.UNDETERMINED) {
      await requestPermissionAsync();
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      selectionLimit: 1,
      quality: 0.6,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (result.cancelled === true) {
      return;
    }

    let creationTime = null;
    if (result.assetId) {
      try {
        const assetInfo = await MediaLibrary.getAssetInfoAsync(result.assetId);
        if (assetInfo?.creationTime) {
          creationTime = new Date(assetInfo.creationTime);
        }
      } catch (e) {
        console.warn(
          `Unable to get asset info for ID "${result.assetId}": ${e.message}`
        );
      }
    }

    onChange({
      uri: result.uri,
      creationTime,
      width: result.width,
      height: result.height,
      exif: result.exif,
    });
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

function PatternPicker({
  pattern,
  onChange,
}: {
  pattern?: string;
  onChange: (value: string) => void;
}) {
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => [1, 450], []);

  const handlePresentModalPress = React.useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleSheetChanges = React.useCallback((index: number) => {
    // Hack to work around needing multiple snap points for background
    if (index === 0) {
      bottomSheetModalRef.current?.close();
    }
  }, []);

  const renderBackdrop = React.useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} opacity={0.2} pressBehavior="close" />
    ),
    []
  );

  const selectOption = (option: string) => {
    onChange(option);
    bottomSheetModalRef.current?.close();
  };

  return (
    <>
      <BorderlessButton
        onPress={handlePresentModalPress}
        style={{ paddingVertical: Padding[2] }}
        borderless={false}
      >
        <View>
          <Text style={{ fontSize: FontSize.lg }}>{pattern}</Text>
        </View>
      </BorderlessButton>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        enablePanDownToClose
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        style={{ flex: 1 }}
      >
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: Padding[5],
              paddingVertical: Padding[1],
              paddingBottom: Padding[3],
              marginBottom: Margin[3],
              borderBottomWidth: 1,
              borderBottomColor: TailwindColor["gray-200"],
            }}
          >
            <Text style={styles.heading}>Pattern</Text>
            <BorderlessButton
              onPress={() => bottomSheetModalRef.current?.close()}
            >
              <AntDesign name="close" size={24} color="black" />
            </BorderlessButton>
          </View>

          <Option
            label="Formless blob"
            onPress={selectOption}
            selection={pattern}
          />
          <Option
            label="Monk's head"
            onPress={selectOption}
            selection={pattern}
          />
          <Option label="Heart" onPress={selectOption} selection={pattern} />
          <Option label="Tulip" onPress={selectOption} selection={pattern} />
          <Option label="Rosetta" onPress={selectOption} selection={pattern} />
          <Option label="Swan" onPress={selectOption} selection={pattern} />
          <Option label="Other" onPress={selectOption} selection={pattern} />
        </>
      </BottomSheetModal>
    </>
  );
}

function Option({ label, onPress, selection }) {
  return (
    <RectButton
      style={{
        paddingVertical: Padding[3],
        paddingHorizontal: Padding[5],
      }}
      onPress={() => onPress(label)}
    >
      <Text
        style={[
          styles.option,
          selection === label ? { fontWeight: "bold" } : null,
        ]}
      >
        {label}
      </Text>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    paddingTop: Padding[1],
    paddingBottom: Padding[2],
  },
  option: {
    fontSize: FontSize.xl,
  },
});
