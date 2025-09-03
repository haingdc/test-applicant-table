const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Drop existing table
db.run('DROP TABLE IF EXISTS users', (err) => {
  if (err) {
    console.error('Error dropping table:', err);
  } else {
    console.log('Existing table dropped');
  }
});

const createTableQuery = `
  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    displayId TEXT,
    name TEXT,
    position INTEGER,
    state TEXT,
    language TEXT,
    version TEXT,
    bio TEXT,
    createdDate DATETIME
  )
`;

db.serialize(() => {
  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Table created successfully');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('Database connection closed');
  }
});
