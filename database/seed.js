const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Create database connection
const db = new sqlite3.Database('./database.sqlite');

// Delete all existing records first
db.run('DELETE FROM users', (err) => {
  if (err) {
    console.error('Error deleting existing records:', err);
  } else {
    console.log('Existing records deleted successfully');
  }
});

// Read the JSON file
try {
  const rawData = fs.readFileSync(path.join(__dirname, '5MB.json'));
  const jsonData = JSON.parse(rawData);

  // Begin transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Current date for createdDate field
    const createdDate = new Date().toISOString();

    // Prepare the statement for upserting data
    const stmt = db.prepare(`INSERT OR REPLACE INTO users 
      (id, displayId, name, position, state, language, version, bio, createdDate) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
    // Insert each record
    jsonData.forEach((record, index) => {
      const uniqueId = `${index}_${record.id}`; // Combining index and original id
      const version = String(record.version || ''); // Convert version to string
      stmt.run(
        uniqueId,
        record.id, // Original id becomes displayId
        record.name,
        index, // Using array index as position
        'LA', // Hardcoded state
        record.language || '', // Add language field
        version, // Add version as string
        record.bio || '', // Add bio field
        createdDate,
        (err) => {
          if (err) {
            console.error('Error inserting record:', err);
          }
        }
      );
    });

    // Finalize statement
    stmt.finalize();

    // Commit transaction
    db.run('COMMIT', (err) => {
      if (err) {
        console.error('Error committing transaction:', err);
      } else {
        console.log('Data seeding completed successfully');
      }
    });
  });

} catch (error) {
  console.error('Error reading or parsing JSON file:', error);
} finally {
  // Close database connection
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
  });
}
