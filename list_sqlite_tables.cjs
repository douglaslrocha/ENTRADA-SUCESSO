const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function run() {
  try {
    const db = await open({
      filename: path.join(__dirname, 'backend', 'data', 'database.sqlite'),
      driver: sqlite3.Database
    });
    
    // Get all tables
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table';");
    console.log('Tables:', tables.map(t => t.name));
    
    // Get schema of each table
    for (const t of tables) {
      if (t.name.startsWith('sqlite_') || t.name === '_migrations') continue;
      const schema = await db.all(`PRAGMA table_info(${t.name});`);
      console.log(`\nTable Schema for ${t.name}:`);
      console.log(schema);
    }
  } catch (err) {
    console.error(err);
  }
}
run();
