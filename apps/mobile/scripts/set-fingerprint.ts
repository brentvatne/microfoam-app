import path from 'path';
import { ensureDir, ensureFile, writeJson } from 'fs-extra';
import * as Fingerprint from '@expo/fingerprint';
import JsonFile from '@expo/json-file';
import chalk from 'chalk';

async function main() {
  const fingerprintCacheDir = path.join(process.cwd(), '.fingerprint');
  await ensureDir(fingerprintCacheDir);
  const result = await Fingerprint.createFingerprintAsync(process.cwd());

  const fingerprintJsonFile = path.join(fingerprintCacheDir, `${result.hash}.json`);
  await ensureFile(fingerprintJsonFile);
  await writeJson(fingerprintJsonFile, { sources: result.sources, hash: result.hash });

  console.log(path.join(process.cwd(), 'app.json'));
  const appConfigFile = new JsonFile(path.join(process.cwd(), 'app.json'));
  const config = await appConfigFile.readAsync();

  await appConfigFile.writeAsync({
    ...config,
    expo: {
      // @ts-ignore
      ...config.expo,
      runtimeVersion: result.hash
    }
  });

  console.log('');
  console.log(`🏃 Updated ${chalk.bold('runtimeVersion')} to ${chalk.bold(result.hash)} in app.json`);
  console.log(`🗂️  Saved full fingerprint to ${fingerprintJsonFile}`);
  console.log('');
}

main();