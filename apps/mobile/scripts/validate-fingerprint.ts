import { getConfig } from 'expo/config';
import * as Fingerprint from '@expo/fingerprint';

async function main() {
  const config = getConfig(process.cwd());
  const result = await Fingerprint.createFingerprintAsync(process.cwd());

  if (config.exp.runtimeVersion !== result.hash) {
    console.error(`Fingerprint changed`)
    console.warn(`${config.exp.runtimeVersion} → ${result.hash}`)
    // todo: read the cached fingerprint file and diff it
    // Fingerprint.diffFingerprintChangesAsync(
    // )
    console.warn(` ----------- `)
    process.exit(-1)
    throw new Error('Fingerprint changed.')
  }

  console.log(result.hash);
}

main();