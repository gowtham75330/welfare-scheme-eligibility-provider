import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'scheme_portal.db');

const db = new sqlite3.Database(dbPath);

// Fix any capitalization issues
db.run("UPDATE schemes SET target_role = 'Student' WHERE target_role = 'student'", function(err) {
  if (err) console.error(err);
  else console.log('Fixed lowercase student rows:', this.changes);
});

// Check all unique roles in DB
db.all("SELECT DISTINCT target_role, COUNT(*) as cnt FROM schemes GROUP BY target_role ORDER BY target_role", (err, rows) => {
  if (err) console.error(err);
  else {
    console.log('\nAll roles in DB:');
    rows.forEach(r => console.log(`  ${r.target_role}: ${r.cnt} schemes`));
    console.log('\nTotal:', rows.reduce((s, r) => s + r.cnt, 0));
  }
  db.close();
});
