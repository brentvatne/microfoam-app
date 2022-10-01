import * as FileSystem from "expo-file-system";

export const PHOTOS_DIRECTORY = `${FileSystem.documentDirectory}photos`;

export function isLocalFile(uri: string) {
  return !uri.startsWith("http");
}

export async function ensureDirectoryExistsAsync(directory) {
  const info = await FileSystem.getInfoAsync(directory);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(directory);
  }
}

export async function copyPhotoToDocumentsAsync(uri) {
  const name = uri.split("/").pop();
  await ensureDirectoryExistsAsync(PHOTOS_DIRECTORY);
  const newPath = `${PHOTOS_DIRECTORY}/${name}`;
  await FileSystem.copyAsync({
    from: uri,
    to: newPath,
  });
  return newPath;
}

export async function maybeCopyPhotoToDocumentsAsync(uri) {
  if (uri.startsWith(PHOTOS_DIRECTORY)) {
    return uri;
  }
  return copyPhotoToDocumentsAsync(uri);
}
