import React, {
  forwardRef,
  useState,
  useImperativeHandle,
  useMemo,
} from "react";
import { Keyboard, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import DatePicker from "react-native-date-picker";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { BorderlessButton, RectButton } from "react-native-gesture-handler";
import format from "date-fns/format";
// import { DragDropContentView, OnDropEvent } from "expo-drag-drop-content-view";
import {
  BottomSheetModalProvider,
  BottomSheetBackdrop,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";

import { TailwindColor, FontSize, Padding, Margin } from "~/constants/styles";
import { PourRecord } from "~/storage/PourStore";
import Photo from "~/components/Photo";
import BlockButton from "~/components/BlockButton";
import {
  AntDesign,
  ScrollView,
  Text,
  TextInput,
  View,
  useThemeColor,
  useTheme,
} from "~/components/Themed";
import { ThemeColors } from "~/constants/colors";

type Data = {
  photoUri: string;
  dateTime: Date;
  rating: number;
  notes?: string;
  pattern?: string;
};

export type LogFormHandle = {
  getData: () => Data;
};

type Props = {
  onSave: (data: Data) => void;
  onDelete?: () => void;
  onPickPhoto?: (uri?: string) => void;
  initialData?: PourRecord;
};

function LogForm({ onSave, onDelete, onPickPhoto, initialData }, ref) {
  const [dateTimePickerVisible, setDateTimePickerVisible] = useState(false);
  const [dateTime, setDateTime] = useState(
    maybeDate(initialData?.dateTime) ?? new Date(),
  );
  const [rating, setRating] = useState(initialData?.rating ?? 3);
  const [photoUri, setPhotoUri] = useState<string | undefined>(
    initialData?.photoUrl,
  );
  const [notes, setNotes] = useState<string | undefined>(initialData?.notes);
  const [pattern, setPattern] = useState<string | undefined>(
    initialData?.pattern ?? "Formless blob",
  );

  const formData = useMemo(
    () => ({ dateTime, rating, photoUri, notes, pattern }),
    [dateTime, rating, photoUri, notes, pattern],
  );

  useImperativeHandle(
    ref,
    () => ({
      getData: () => formData,
    }),
    [formData],
  );

  // // https://mateusz1913.github.io/react-native-avoid-softinput/docs/guides/usage-module
  // // 🤷‍♂️
  // useEffect(() => {
  //   AvoidSoftInput.setEnabled(true);

  //   return () => {
  //     AvoidSoftInput.setEnabled(false);
  //   };
  // }, []);

  return (
    <BottomSheetModalProvider>
      <ScrollView
        style={{ flex: 1 }}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="always"
      >
        <View style={{ padding: Padding[4] }}>
          <PhotoPickerForm
            onChange={(data) => {
              setPhotoUri(data.uri);
              if (data.creationTime) {
                setDateTime(data.creationTime);
              }
              onPickPhoto?.(data.uri);
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

          <RatingPicker
            rating={rating}
            onChange={(value) => setRating(value)}
          />

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
            borderless={false}
          >
            <View style={{ paddingVertical: Padding[2] }}>
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
              onSave(formData);
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

export default forwardRef<LogFormHandle, Props>(LogForm);

function maybeDate(date: number | undefined) {
  if (date) {
    return new Date(date);
  }
}

function PhotoPickerForm({ onChange, photoUri }) {
  const [response, requestPermissionAsync] = MediaLibrary.usePermissions();
  const colorScheme = useTheme();

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

    if (result.canceled === true) {
      return;
    }

    let creationTime = null;
    const asset = result.assets[0];
    if (asset.assetId) {
      try {
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.assetId);
        if (assetInfo?.creationTime) {
          creationTime = new Date(assetInfo.creationTime);
        }
      } catch (e) {
        console.warn(
          `Unable to get asset info for ID "${asset.assetId}": ${e.message}`,
        );
      }
    }

    onChange({
      uri: asset.uri,
      creationTime,
      width: asset.width,
      height: asset.height,
      exif: asset.exif,
    });
  };

  // Add back when we fix the drop event
  // const handleDropImageAsync = async (asset: OnDropEvent) => {
  //   if (!asset.type?.startsWith("image")) {
  //     alert("Oops, that's not an image");
  //   }

  //   const image = await ImageManipulator.manipulateAsync(
  //     asset.uri,
  //     [{ crop: cropCover(asset.width, asset.height) }],
  //     { compress: 0.6, format: ImageManipulator.SaveFormat.PNG },
  //   );

  //   onChange({
  //     ...image,
  //     // We don't have the following data in a drop event
  //     exif: {},
  //   });
  // };

  return (
    // TODO: investigate this
    // <DragDropContentView
    //   onDropEvent={(event: { assets: OnDropEvent[] }) => {
    //     if (event.assets[0]) {
    //       handleDropImageAsync(event.assets[0]);
    //     }

    //     if (event.assets.length > 1) {
    //       console.warn(
    //         "Multiple assets were dropped, but only the first will be used."
    //       );
    //     }
    //   }}
    //   highlightColor="#2f95dc"
    //   highlightBorderRadius={20}
    //   style={{ flex: 1 }}
    // >
    <View
      darkColor={TailwindColor["zinc-800"]}
      lightColor={TailwindColor["gray-100"]}
      style={{
        flex: 1,
        borderRadius: 10,
        padding: Padding[5],
        margin: Margin[2],
        alignItems: "center",
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
            backgroundColor:
              colorScheme === "light"
                ? TailwindColor["gray-200"]
                : TailwindColor["zinc-700"],
            borderRadius: 5,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => launchPickerAsync()}
        >
          <Text
            darkColor={TailwindColor["gray-200"]}
            lightColor={TailwindColor["gray-700"]}
            style={{ fontSize: FontSize.lg }}
          >
            {photoUri ? "Select a different photo " : "Select a photo"}
          </Text>
        </RectButton>
      )}
    </View>
    // </DragDropContentView>
  );
}

// Thanks ChatGPT
// function cropCover(originalWidth: number, originalHeight: number) {
//   let newDimension: number, startX: number, startY: number;

//   if (originalWidth < originalHeight) {
//     // Width is smaller than height
//     newDimension = originalWidth;
//     startX = 0;
//     startY = (originalHeight - originalWidth) / 2;
//   } else {
//     // Height is smaller than width or they are equal
//     newDimension = originalHeight;
//     startX = (originalWidth - originalHeight) / 2;
//     startY = 0;
//   }

//   return {
//     width: newDimension,
//     height: newDimension,
//     originX: startX,
//     originY: startY,
//   };
// }

function PatternPicker({
  pattern,
  onChange,
}: {
  pattern?: string;
  onChange: (value: string) => void;
}) {
  const bottomSheetBackgroundColor = useThemeColor({
    light: ThemeColors.light.view,
    dark: "rgb(45,45,45)",
  });
  const textColor = useThemeColor({ light: "#000", dark: "#fff" });
  const borderBottomColor = useThemeColor({
    light: TailwindColor["gray-200"],
    dark: TailwindColor["zinc-700"],
  });

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => [1, 450], []);

  const handlePresentModalPress = React.useCallback(() => {
    Keyboard.dismiss();
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
    [],
  );

  const selectOption = (option: string) => {
    onChange(option);
    bottomSheetModalRef.current?.close();
  };

  return (
    <>
      <BorderlessButton onPress={handlePresentModalPress} borderless={false}>
        <View style={{ paddingVertical: Padding[2] }}>
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
        handleIndicatorStyle={{ backgroundColor: textColor, opacity: 0.5 }}
        backgroundStyle={{ backgroundColor: bottomSheetBackgroundColor }}
        style={{ flex: 1 }}
      >
        <>
          <View
            darkColor={ThemeColors.dark.viewAccent}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: Padding[5],
              paddingVertical: Padding[1],
              paddingBottom: Padding[3],
              marginBottom: Margin[3],
              borderBottomWidth: 1,
              borderBottomColor,
            }}
          >
            <Text style={styles.heading}>Pattern</Text>
            <BorderlessButton
              onPress={() => bottomSheetModalRef.current?.close()}
            >
              <AntDesign name="close" size={24} />
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
    <RectButton onPress={() => onPress(label)}>
      <View
        darkColor={ThemeColors.dark.viewAccent}
        style={{
          paddingVertical: Padding[3],
          paddingHorizontal: Padding[5],
        }}
      >
        <Text
          style={[
            styles.option,
            selection === label ? { fontWeight: "900" } : null,
          ]}
        >
          {label}
        </Text>
      </View>
    </RectButton>
  );
}

function RatingPicker({ onChange, rating }) {
  const colorScheme = useTheme();

  return (
    // @ts-ignore: this library is not maintained ...
    <SegmentedControl
      appearance={colorScheme}
      values={["1", "2", "3", "4", "5"]}
      selectedIndex={rating - 1}
      onChange={(event) => {
        onChange(event.nativeEvent.selectedSegmentIndex + 1);
      }}
    />
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
