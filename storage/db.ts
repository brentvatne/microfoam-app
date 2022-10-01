import { QuickSQLite } from "react-native-quick-sqlite";

const DATABASE_NAME = "microfoam.db";

/** Wrapper around executeSql for convenience */
export function exec(query: string, params = []) {
  const result = QuickSQLite.executeSql(DATABASE_NAME, query, params);
  return result;
}
/** Open DB and init schema if needed */
export function init() {
  _open();

  if (!_schemaIsValid()) {
    _createSchema();
    console.log("initialized schema");
  }
}

/** Drop all tables and re-init */
export function clear() {
  exec(`DROP TABLE pours;`);
  init();
}

/**
 *
 * Helpers
 *
 */

function _open() {
  const { status, message } = QuickSQLite.open(DATABASE_NAME, "databases");

  if (status === 1) {
    throw new Error(message);
  } else {
    console.log(`opened ${DATABASE_NAME}`);
  }
}

function _close() {
  const { status, message } = QuickSQLite.close(DATABASE_NAME);

  if (status === 1) {
    throw new Error(message);
  } else {
    console.log(`closed ${DATABASE_NAME}`);
  }
}

function _schemaIsValid() {
  const { metadata } = exec(`SELECT * FROM pours;`);
  return metadata !== undefined;
}

function _createSchema() {
  let { status, message } = exec(`
    CREATE TABLE pours (
      id INTEGER PRIMARY KEY,
      date_time INTEGER NOT NULL,
      photo_url TEXT,
      blurhash TEXT,
      rating INTEGER NOT NULL,
      notes TEXT
    );
  `);

  if (status === 1) {
    console.error(message);
  }
}

// Init DB immediately so we can query at top level in other app code
init();
