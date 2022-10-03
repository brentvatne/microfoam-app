import { useSyncExternalStore, useCallback } from "react";
import { Blurhash } from "react-native-blurhash";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

import { exec } from "./db";
import { maybeCopyPhotoToDocumentsAsync } from "./fs";

export type PourRecord = {
  id: number;
  date_time: number;
  /* Web URL or local filename (not full path) from documents directory */
  photo_url?: string;
  rating: number;
  notes?: string;
  blurhash?: string;
  pattern?: string;
};

export function toJSON() {
  return JSON.stringify(
    all().map((item) => ({
      ...item,
    }))
  );
}

function toRow(pour: PourRecord) {
  return [
    pour.id,
    pour.date_time,
    pour.photo_url,
    pour.rating,
    pour.notes,
    pour.blurhash,
    pour.pattern,
  ];
}

export function loadFromJSON(json: string) {
  // gross?
  const rows = JSON.parse(json).map((item) =>
    toRow({
      ...item,
      date_time: parseInt(item.date_time, 10),
    })
  );

  // ok now clear it
  destroyAll();

  rows.forEach((row) => {
    const { status, message } = exec(
      `
    INSERT INTO pours (id, date_time, photo_url, rating, notes, blurhash, pattern)
      VALUES (?, ?, ?, ?, ?, ?, ?);
  `,
      row
    );

    if (status === 1) {
      throw new Error(message);
    }
  });

  store.setState(() => all());
}

export function all() {
  const { status, message, rows } = exec(
    `SELECT * FROM pours ORDER BY ID DESC;`
  );

  if (status === 1) {
    throw new Error(message);
  }

  return rows._array as PourRecord[];
}

// TODO: make pour accept Partial<PourRecord>
export async function updateAsync(id: number, pour: PourRecord) {
  const { photoUrl, blurhash } = await processImageAsync({
    uri: pour.photo_url,
    blurhash: pour.blurhash,
  });

  const { status, message } = exec(
    `
    UPDATE pours
      SET date_time = ?, photo_url = ?, rating = ?, notes = ?, blurhash = ?, pattern = ?
      WHERE id = ?;
  `,
    [
      pour.date_time,
      photoUrl,
      pour.rating,
      pour.notes,
      blurhash,
      pour.pattern,
      id,
    ]
  );

  if (status === 1) {
    throw new Error(message);
  }

  store.setState(() => all());
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
  const { photoUrl, blurhash } = await processImageAsync({
    uri: data.photo_url,
    blurhash: data.blurhash,
  });
  const { status, rows, message } = exec(
    `
		INSERT INTO pours (date_time, photo_url, rating, notes, blurhash, pattern)
			VALUES (?, ?, ?, ?, ?, ?);
	`,
    [data.date_time, photoUrl, data.rating, data.notes, blurhash, data.pattern]
  );

  if (status === 1) {
    throw new Error(message);
  }

  store.setState(() => all());

  return rows[0];
}

export function destroy(data: Pick<PourRecord, "id">) {
  const { status, message } = exec(`DELETE FROM pours WHERE id = ?;`, [
    data.id,
  ]);

  if (status === 1) {
    throw new Error(message);
  }

  store.setState(() => all());
}

export function destroyAll() {
  const { status, message } = exec(`DELETE FROM pours;`);

  if (status === 1) {
    throw new Error(message);
  }

  store.setState(() => all());
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
  let state = useStore((state) => state);
  return state;
}

export function usePour(pourId: string | number) {
  // dumb, should always be number - but we get it from the route params which are strings
  const id = parseInt(pourId.toString(), 10);
  let state = usePours();
  let pour = state.find((p) => p.id === id);
  return pour;
}
