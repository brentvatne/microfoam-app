import { useSyncExternalStore, useCallback } from "react";
import { Blurhash } from "react-native-blurhash";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { v4 as uuid } from "uuid";

import { maybeCopyPhotoToDocumentsAsync } from "./fs";

let state: PourRecord[] = [];

// let state: PourRecord[] = [
//   {
//     blurhash: "LRH1i1^*0LaLxuS2NGWV9bR+%KW.",
//     dateTime: 1677528137014,
//     id: "8c48e51a-43ad-405c-a8eb-0b316225cbe2",
//     notes: "Some test data",
//     pattern: "Tulip",
//     photoUrl: "270E6703-076F-4B01-8996-71BB4D54CABB.jpg",
//     rating: 3,
//   },
// ];

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

export function toJSON() {
  return JSON.stringify(state);
}

export function loadFromJSON(json: string) {
  const nextState = JSON.parse(json).map((item) => ({
    ...item,
    id: item.id.toString(),
    photoUrl: item.photoUrl ?? item.photo_url,
    dateTime: parseInt(item.dateTime ?? item.date_time, 10),
  }));

  store.setState(() => nextState);
}

export function all() {
  return state;
}

export async function updateAsync(id: string, pour: PourRecord) {
  const { photoUrl, blurhash } = await processImageAsync({
    uri: pour.photoUrl,
    blurhash: pour.blurhash,
  });

  const nextPour = {
    ...pour,
    photoUrl: photoUrl,
    blurhash,
  };

  const idx = state.findIndex((p) => p.id === id);
  const nextState = [...state].splice(idx, 1, nextPour);
  store.setState(() => nextState);
}

async function processImageAsync(pour: { uri: string; blurhash?: string }) {
  const { uri } = pour;

  // Bail out if file is remote
  if (!uri.startsWith(FileSystem.cacheDirectory)) {
    return { photoUrl: uri, blurhash: pour.blurhash };
  }

  const resizedUri = await maybeShrinkImageAsync(uri, { width: 1000 });
  const thumbnail = await shrinkImageAsync(uri, { width: 50, height: 50 });

  const blurhash = await Blurhash.encode(thumbnail, 4, 3);
  const photoUrl = await maybeCopyPhotoToDocumentsAsync(resizedUri);
  const filename = photoUrl.split("/").pop();

  return { photoUrl: filename, blurhash };
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
  const id = uuid();
  const { photoUrl, blurhash } = await processImageAsync({
    uri: data.photoUrl,
    blurhash: data.blurhash,
  });

  const pour = {
    id,
    ...data,
    photoUrl: photoUrl,
    blurhash,
  };

  const nextState = [...state, pour];
  store.setState(() => nextState);

  return { id };
}

export function destroyAll() {
  const nextState = [];
  store.setState(() => nextState);
}

export function destroy(data: Pick<PourRecord, "id">) {
  const nextState = state.filter(({ id }) => id !== data.id);
  store.setState(() => nextState);
}

/** "yikes" below */

const createStore = () => {
  let state = all();
  const getState = () => state;
  const listeners = new Set();
  const setState = (fn) => {
    state = fn(state);
    // @ts-ignore
    listeners.forEach((l) => l());
  };
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  return { getState, setState, subscribe };
};

const useStore = (selector) => {
  return useSyncExternalStore(
    store.subscribe,
    useCallback(() => selector(store.getState(), [store, selector]), [])
  );
};

const store = createStore();

export function usePours() {
  return useStore((_state) => _state);
}

export function usePour(pourId: string | number) {
  let state = usePours();
  let pour = state.find((p) => p.id === pourId);
  return pour;
}
