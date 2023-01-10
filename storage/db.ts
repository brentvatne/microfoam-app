import { open } from "react-native-quick-sqlite";

const DATABASE_NAME = "microfoam.db";
const db = open({ name: DATABASE_NAME, location: "databases" });

/** Wrapper around execute for convenience */
export function exec(query: string, params = []) {
  try {
    return db.execute(query, params);
  } catch (e) {
    console.error(e.message);
    throw e;
  }
}
/** Init schema if needed */
export function init() {
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

function _schemaIsValid() {
  try {
    const { metadata } = exec(`SELECT * FROM pours;`);
    console.log(metadata)
    return metadata !== undefined;
  } catch(e) {
    return false;
  }
}

function _createSchema() {
  exec(`
    CREATE TABLE pours (
      id INTEGER PRIMARY KEY,
      date_time INTEGER NOT NULL,
      photo_url TEXT,
      pattern TEXT,
      blurhash TEXT,
      rating INTEGER NOT NULL,
      notes TEXT
    );
  `);
}

// Init DB immediately so we can query at top level in other app code
init();
