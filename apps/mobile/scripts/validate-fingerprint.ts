import * as Fingerprint from "@expo/fingerprint";
import { getConfig } from "expo/config";
import { readFileSync } from "fs-extra";
import path from "path";
import chalk from "chalk";

async function main() {
  const config = getConfig(process.cwd());
  const currentFingerprint = await Fingerprint.createFingerprintAsync(
    process.cwd(),
  );

  if (config.exp.runtimeVersion === currentFingerprint.hash) {
    console.log(
      `✅ ${chalk.bold("runtimeVersion")} in app.json matches the current project fingerprint`,
    );
    process.exit(0);
  }

  const fingerprintPath = path.join(
    process.cwd(),
    ".fingerprint",
    `${config.exp.runtimeVersion}.json`,
  );
  try {
    const previousFingerprint = JSON.parse(readFileSync(fingerprintPath));
    console.log(
      JSON.stringify(
        Fingerprint.diffFingerprints(previousFingerprint, currentFingerprint),
        null,
        2,
      ),
    );
  } catch {
    console.warn(
      `Unable to read previous fingerprint data at ${fingerprintPath}, skipped diff.`,
    );
  }

  console.log("");
  console.log(" ---------------------------------------- ");
  console.log("");
  console.error(
    `Fingerprint changed. See diff above, run ${chalk.bold("npm run fingerprint:set")} to update it.`,
  );
  console.log("");
  console.warn(
    `${chalk.bold(chalk.yellow(config.exp.runtimeVersion))} → ${chalk.bold(chalk.green(currentFingerprint.hash))}`,
  );
  console.log("");
  process.exit(-1);
}

main();
