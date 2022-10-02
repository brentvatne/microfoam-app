import * as FileSystem from "expo-file-system";
import assert from "assert";

export const PHOTOS_DIRECTORY = `${FileSystem.documentDirectory}photos`;

export function isLocalFile(uri: string) {
  return !uri.startsWith("http");
}

export async function getLocalPhotoInfoAsync(uri: string) {
  assert(isLocalFile(uri), "Expected local file");

  const localPath = getPathToPhoto(uri);
  const info = await FileSystem.getInfoAsync(localPath);
  return { size: info.size, modificationTime: info.modificationTime };
}

export function getPathToPhoto(photoUrlOrFilename: string) {
  if (
    photoUrlOrFilename.startsWith(FileSystem.cacheDirectory) ||
    !isLocalFile(photoUrlOrFilename)
  ) {
    return photoUrlOrFilename;
  }

  let filename = photoUrlOrFilename;
  if (photoUrlOrFilename.startsWith("file://")) {
    filename = photoUrlOrFilename.split("/").pop();
  }

  return `${PHOTOS_DIRECTORY}/${filename}`;
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
