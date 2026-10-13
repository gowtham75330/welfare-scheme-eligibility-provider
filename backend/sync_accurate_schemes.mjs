import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALL_SCHEMES_DATA } from './schemes_data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'scheme_portal.db');

const db = new sqlite3.Database(dbPath);

export const ACCURATE_SCHEMES = ALL_SCHEMES_DATA;

export function syncDatabaseSchemes() {
  return new Promise((resolve, reject) => {
    console.log(`Starting sync of ${ACCURATE_SCHEMES.length} accurate schemes...`);

    db.serialize(() => {
      // 1. Clear existing schemes completely so we don't have duplicates or stale entries
      db.run('DELETE FROM schemes', (err) => {
        if (err) {
          console.error('Error clearing schemes:', err.message);
          return reject(err);
        }
        console.log('Cleared existing schemes to purge all duplicates.');

        // Reset autoincrement sequence
        db.run("DELETE FROM sqlite_sequence WHERE name = 'schemes'");

        const insertSql = `INSERT INTO schemes 
          (scheme_name, provider, target_role, category_required, gender_required, income_limit, 
           education_required, state, description, official_link, benefits, min_age, max_age, 
           disability_min_percent, land_status_required, max_land_area, marital_status_required, 
           occupation_required, employment_status_required, bpl_required, important_conditions, required_documents) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const stmt = db.prepare(insertSql);

        ACCURATE_SCHEMES.forEach((s) => {
          stmt.run([
            s.scheme_name,
            s.provider,
            s.target_role,
            s.category_required || 'All',
            s.gender_required || 'All',
            s.income_limit !== undefined ? s.income_limit : 9999999,
            s.education_required || 'All',
            s.state || 'All India',
            s.description || '',
            s.official_link || '',
            s.benefits || '',
            s.min_age || 0,
            s.max_age || 999,
            s.disability_min_percent || 0,
            s.land_status_required || 'All',
            s.max_land_area || 999999,
            s.marital_status_required || 'All',
            s.occupation_required || 'All',
            s.employment_status_required || 'All',
            s.bpl_required || 'All',
            s.important_conditions || '',
            s.required_documents || ''
          ]);
        });

        stmt.finalize((err) => {
          if (err) {
            console.error('Error finalizing insert:', err);
            return reject(err);
          }
          console.log(`Successfully synced ${ACCURATE_SCHEMES.length} unique, verified live schemes!`);

          // Verify counts by role
          db.all('SELECT target_role, COUNT(*) as count FROM schemes GROUP BY target_role ORDER BY target_role', [], (err, rows) => {
            if (err) console.error(err);
            else {
              console.log('Breakdown by role:');
              rows.forEach(r => console.log(`  - ${r.target_role}: ${r.count} schemes`));
            }
            db.close();
            resolve();
          });
        });
      });
    });
  });
}

// Execute immediately if run directly
syncDatabaseSchemes().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
