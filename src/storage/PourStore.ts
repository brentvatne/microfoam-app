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

import { exec } from "./db";

type PourRecord = {
  id: number;
  date_time: string;
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

export function all() {
  const { status, message, rows } = exec(`SELECT * FROM pours;`);

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

  // todo: trigger something to force usePours to update

  return rows[0];
}

export function usePours() {
  // todo: useSyncExternalStore
  const items = all();
  return items._array;
}
