import { useMemo } from "react";
import { SectionListData } from "react-native";
import { Blurhash } from "react-native-blurhash";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { createStore, createCustomPersister } from "tinybase";
import { useRow, useTable, useValue } from "tinybase/lib/ui-react";
import { v4 as uuid } from "uuid";
import groupBy from "lodash/groupBy";
import { humanDate } from "~/utils/formatDate";

import { maybeCopyPhotoToDocumentsAsync } from "./fs";

export type PourRecord = {
  id: string;
  dateTime: number;
  /* Web URL or local filename (not full path) from documents directory */
  photoUrl?: string;
  rating: number;
  notes?: string;
  blurhash?: string;
  pattern?: string;
};

const store = createStore();

export function toJSON() {
  console.log(store.getJson());
  return store.getJson();
}

export async function loadExternalJSONAsync(json: string) {
  await destroyAllAsync();

  store.setJson(json);
  persister.save();
}

export async function regenerateBlurhashAsync(pour: PourRecord) {
  const blurhash = await generateBlurhashAsync(pour.photoUrl);

  const nextPour = {
    ...pour,
    blurhash,
  };

  store.setRow("pours", pour.id, nextPour);

  // Don't wait for it to return..
  persister.save();
  return nextPour;
}

export async function updateAsync(id: string, pour: PourRecord) {
  const { photoUrl, blurhash } = await processImageAsync({
    uri: pour.photoUrl,
    blurhash: pour.blurhash,
  });

  const nextPour = {
    ...pour,
    photoUrl,
    blurhash,
  };

  store.setRow("pours", id, nextPour);

  // Don't wait for it to return..
  persister.save();
  return nextPour;
}

async function generateBlurhashAsync(
  imageUri: string,
  componentsX = 4,
  componentsY = 3
) {
  try {
    let localUri = imageUri;

    if (!imageUri.startsWith(FileSystem.cacheDirectory)) {
      const { uri } = await FileSystem.downloadAsync(
        imageUri,
        `${FileSystem.cacheDirectory}/${uuid()})`
      );
      localUri = uri;
    }

    const thumbnail = await shrinkImageAsync(localUri, {
      width: 50,
      height: 50,
    });
    const blurhash = await Blurhash.encode(thumbnail, componentsX, componentsY);
    return blurhash;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

async function processImageAsync(pour: { uri: string; blurhash?: string }) {
  try {
    const { uri } = pour;

    // Bail out if file is remote
    if (!uri.startsWith(FileSystem.cacheDirectory)) {
      return { photoUrl: uri, blurhash: pour.blurhash };
    }

    const resizedUri = await maybeShrinkImageAsync(uri, { width: 1000 });
    const blurhash = await generateBlurhashAsync(resizedUri);
    const photoUrl = await maybeCopyPhotoToDocumentsAsync(resizedUri);
    const filename = photoUrl.split("/").pop();

    return { photoUrl: filename, blurhash };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

type Dimensions =
  | { width: number; height: number }
  | { width: number }
  | { height: number };

async function shrinkImageAsync(uri: string, dimensions: Dimensions) {
  console.log(`resizing ${uri} to ${JSON.stringify(dimensions)}`);
  const result = await manipulateAsync(uri, [{ resize: dimensions }], {
    compress: 1,
    format: SaveFormat.JPEG,
  });

  return result.uri;
}

async function maybeShrinkImageAsync(uri: string, dimensions: Dimensions) {
  if (uri.startsWith(FileSystem.cacheDirectory)) {
    return shrinkImageAsync(uri, dimensions);
  }

  return uri;
}

export async function createAsync(data: Omit<PourRecord, "id">) {
  const { photoUrl, blurhash } = await processImageAsync({
    uri: data.photoUrl,
    blurhash: data.blurhash,
  });

  const pour = {
    ...data,
    photoUrl: photoUrl,
    blurhash,
  };

  const result = store.addRow("pours", pour);

  // Don't wait for it to return..
  persister.save();

  // Return the ID
  return Object.keys(result)[0];
}

export async function destroyAllAsync() {
  store.delTable("pours");
  return await deletePersistedDataAsync();
}

export function destroy(data: Pick<PourRecord, "id">) {
  store.delRow("pours", data.id);
  persister.save();
}

const DB_FILE_NAME = `${FileSystem.documentDirectory}microfoam.json`;

async function deletePersistedDataAsync() {
  const info = await FileSystem.getInfoAsync(DB_FILE_NAME);
  if (info.exists) {
    await FileSystem.deleteAsync(DB_FILE_NAME);
  }
}

async function loadPersistedDataAsync() {
  if (!(await FileSystem.getInfoAsync(DB_FILE_NAME)).exists) {
    return null;
  }
  return FileSystem.readAsStringAsync(DB_FILE_NAME);
}

async function persistJsonAsync(json: string) {
  try {
    await FileSystem.writeAsStringAsync(DB_FILE_NAME, json);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

const persister = createCustomPersister(
  store,
  async () => loadPersistedDataAsync(),
  async (json) => await persistJsonAsync(json),
  (didChange) => {},
  () => {}
);

export function usePours() {
  const result = useTable("pours", store);
  return useMemo(() => {
    return Object.keys(result)
      .map((id) => ({ id, ...result[id] }))
      .sort((a: PourRecord, b: PourRecord) => b.dateTime - a.dateTime);
  }, [result]) as PourRecord[];
}

export function usePoursGroupedByDate(): SectionListData<PourRecord>[] {
  const pours = usePours();
  return useMemo(() => {
    const groupedByDate = groupBy(pours, (pour) => {
      return humanDate(pour.dateTime);
    });
    const formattedForSectionList = Object.keys(groupedByDate).map((date) => ({
      title: date,
      data: groupedByDate[date],
    }));

    return formattedForSectionList;
  }, [pours]);
}

export function usePoursInFlashList(): PourRecord[] {
  const pours = usePoursGroupedByDate();
  return useMemo(() => {
    return pours.map((entry) => [entry.title, ...entry.data]).flat();
  }, [pours]);
}

export function all() {
  const result = store.getTable("pours");
  const records = Object.keys(result).map((id) => ({ id, ...result[id] }));
  return records as PourRecord[];
}

export function usePour(id: string) {
  const row = useRow("pours", id, store);
  return { id, ...row } as PourRecord;
}

// Can use this before rendering any UI...
export function useDataIsReady() {
  let dataIsReady = useValue("initialized", store);
  console.log({ dataIsReady });
  return dataIsReady;
}

// Would prefer for this to be synchronous
async function init() {
  try {
    await persister.load();
  } catch (e) {
    console.log(`Failed to load persisted data:`);
    console.log(e);
  } finally {
    console.log('set initialized to true');
    store.setValue("initialized", true);
  }
  console.log("Loaded persisted data");
}

init();
