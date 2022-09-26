/**
 * PourStore.create({ date: '...', pourRating: 1, milkRating: 1, photoUrl: '..', videoUrl: '..',  goodNotes: '..', improvementNotes: '...' })
 * PourStore.all();
 * PourStore.first(10, { order: 'asc' });
 * PourStore.last(10);
 * PourStore.best(10);
 * PourStore.worst(10);
 * PourStore.improvementNotes(10);
 *
 * const pours = usePours(PourStore.all);
 * -> when `create`  or update, invalidate and get them all again
 *
 * PourStore.update(id, pour)
 */

import { useSyncExternalStore, useCallback } from "react";
import { exec } from "./db";

type PourRecord = {
  id: number;
  date_time: number;
  photo_url?: string;
  video_url?: string;
  rating: number;
  notes?: string;
};

/** TODO: js object that we map  */
type Pour = {
  id: number;
  date_time: Date;
};

export function toJSON() {
  return JSON.stringify(
    all()._array.map((item) => ({
      ...item,
      photo_url: null, // TODO: upload to some object store and then fail toJSON if not uploaded
    }))
  );
}

function toRow(pour) {
  return [
    pour.id,
    pour.date_time,
    pour.photo_url,
    pour.video_url,
    pour.rating,
    pour.notes,
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
    INSERT INTO pours (id, date_time, photo_url, video_url, rating, notes)
      VALUES (?, ?, ?, ?, ?, ?);
  `,
      row
    );

    if (status === 1) {
      throw new Error(message);
    }
  });

  store.setState(() => all()._array);
}

export function all() {
  const { status, message, rows } = exec(
    `SELECT * FROM pours ORDER BY ID DESC;`
  );

  if (status === 1) {
    throw new Error(message);
  }

  return rows;
}

export function create(data: Omit<PourRecord, "id">) {
  const { status, rows, message } = exec(
    `
		INSERT INTO pours (date_time, photo_url, video_url, rating, notes)
			VALUES (?, ?, ?, ?, ?);
	)`,
    [data.date_time, data.photo_url, data.video_url, data.rating, data.notes]
  );

  if (status === 1) {
    throw new Error(message);
  }

  store.setState(() => all()._array);

  return rows[0];
}

export function destroy(data: Pick<PourRecord, "id">) {
  const { status, message } = exec(`DELETE FROM pours WHERE id = ?;`, [
    data.id,
  ]);

  if (status === 1) {
    throw new Error(message);
  }

  store.setState(() => all()._array);
}

export function destroyAll() {
  const { status, message } = exec(`DELETE FROM pours;`);

  if (status === 1) {
    throw new Error(message);
  }

  store.setState(() => all()._array);
}

/** "yikes" below */

const createStore = () => {
  let state = all()._array;
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