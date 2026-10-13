import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import { ALL_SCHEMES_DATA } from './schemes_data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'scheme_portal.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Initialize database schema and data
export const initDb = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      // Create Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT,
        age INTEGER,
        gender TEXT,
        state TEXT,
        district TEXT,
        category TEXT,
        income INTEGER,
        education_level TEXT,
        institution_type TEXT
      )`);

      // Create Schemes table
      db.run(`CREATE TABLE IF NOT EXISTS schemes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scheme_name TEXT NOT NULL,
        provider TEXT NOT NULL,
        target_role TEXT,
        category_required TEXT,
        gender_required TEXT,
        income_limit INTEGER,
        education_required TEXT,
        state TEXT,
        description TEXT,
        official_link TEXT
      )`);

      // Create Admin table
      db.run(`CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )`);

      // Create Contacts table for feedback/queries
      db.run(`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Create Saved Schemes table for bookmarking
      db.run(`CREATE TABLE IF NOT EXISTS saved_schemes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        scheme_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(scheme_id) REFERENCES schemes(id)
      )`);

      // Create Applications table for tracking scheme applications
      db.run(`CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        scheme_id INTEGER NOT NULL,
        status TEXT DEFAULT 'Not Applied',
        application_date TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(scheme_id) REFERENCES schemes(id)
      )`);

      // Auto-migrate tables to add any missing columns safely
      const addColumnIfNotExists = (tableName, columnName, columnDef) => {
        db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
          if (!err && rows) {
            const exists = rows.some(r => r.name.toLowerCase() === columnName.toLowerCase());
            if (!exists) {
              db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`, (err) => {
                if (err) console.error(`Error adding column ${columnName} to ${tableName}:`, err.message);
                else console.log(`Added column ${columnName} to ${tableName}`);
              });
            }
          }
        });
      };

      // ── USERS: Core role fields ──
      addColumnIfNotExists('users', 'occupation', 'TEXT');
      addColumnIfNotExists('users', 'employment_status', 'TEXT');
      addColumnIfNotExists('users', 'disability_percent', 'INTEGER DEFAULT 0');
      addColumnIfNotExists('users', 'disability_type', 'TEXT');
      addColumnIfNotExists('users', 'land_status', 'TEXT');
      addColumnIfNotExists('users', 'land_area', 'REAL DEFAULT 0');
      addColumnIfNotExists('users', 'marital_status', 'TEXT');
      addColumnIfNotExists('users', 'family_size', 'INTEGER DEFAULT 1');
      addColumnIfNotExists('users', 'bpl_card', 'TEXT DEFAULT "No"');
      addColumnIfNotExists('users', 'business_type', 'TEXT');
      addColumnIfNotExists('users', 'annual_turnover', 'INTEGER DEFAULT 0');
      addColumnIfNotExists('users', 'work_sector', 'TEXT');

      // ── USERS: Student fields ──
      addColumnIfNotExists('users', 'course_name', 'TEXT');
      addColumnIfNotExists('users', 'year_of_study', 'TEXT');
      addColumnIfNotExists('users', 'college_name', 'TEXT');
      addColumnIfNotExists('users', 'first_graduate', 'TEXT DEFAULT "No"');
      addColumnIfNotExists('users', 'minority_status', 'TEXT DEFAULT "No"');
      addColumnIfNotExists('users', 'is_hosteller', 'TEXT DEFAULT "No"');
      addColumnIfNotExists('users', 'parent_status', 'TEXT');

      // ── USERS: Women fields ──
      addColumnIfNotExists('users', 'pregnancy_status', 'TEXT DEFAULT "No"');
      addColumnIfNotExists('users', 'number_of_children', 'INTEGER DEFAULT 0');
      addColumnIfNotExists('users', 'widow_status', 'TEXT DEFAULT "No"');
      addColumnIfNotExists('users', 'single_parent', 'TEXT DEFAULT "No"');

      // ── USERS: Disabled fields ──
      addColumnIfNotExists('users', 'disability_certificate', 'TEXT DEFAULT "No"');
      addColumnIfNotExists('users', 'udid_card', 'TEXT DEFAULT "No"');
      addColumnIfNotExists('users', 'assistive_device', 'TEXT DEFAULT "No"');

      // ── USERS: Farmer fields ──
      addColumnIfNotExists('users', 'farmer_type', 'TEXT');
      addColumnIfNotExists('users', 'crop_type', 'TEXT');
      addColumnIfNotExists('users', 'irrigation_status', 'TEXT');
      addColumnIfNotExists('users', 'agricultural_activity', 'TEXT');
      addColumnIfNotExists('users', 'tenant_farmer', 'TEXT DEFAULT "No"');
      addColumnIfNotExists('users', 'bank_account', 'TEXT DEFAULT "No"');
      addColumnIfNotExists('users', 'livestock', 'TEXT DEFAULT "No"');
      addColumnIfNotExists('users', 'farming_equipment', 'TEXT DEFAULT "No"');
      addColumnIfNotExists('users', 'crop_loss', 'TEXT DEFAULT "No"');
      addColumnIfNotExists('users', 'natural_disaster_affected', 'TEXT DEFAULT "No"');

      // ── USERS: Unemployed fields ──
      addColumnIfNotExists('users', 'skills', 'TEXT');
      addColumnIfNotExists('users', 'previously_employed', 'TEXT DEFAULT "No"');
      addColumnIfNotExists('users', 'years_of_experience', 'INTEGER DEFAULT 0');
      addColumnIfNotExists('users', 'employment_exchange_reg', 'TEXT DEFAULT "No"');

      // ── USERS: Senior Citizen fields ──
      addColumnIfNotExists('users', 'pension_status', 'TEXT');
      addColumnIfNotExists('users', 'living_status', 'TEXT');

      // ── USERS: Worker fields ──
      addColumnIfNotExists('users', 'employment_type', 'TEXT');
      addColumnIfNotExists('users', 'monthly_income', 'INTEGER DEFAULT 0');
      addColumnIfNotExists('users', 'worker_registration', 'TEXT DEFAULT "No"');
      addColumnIfNotExists('users', 'labour_card', 'TEXT DEFAULT "No"');

      // ── USERS: Child / Minor fields ──
      addColumnIfNotExists('users', 'school_name', 'TEXT');
      addColumnIfNotExists('users', 'school_type', 'TEXT');
      addColumnIfNotExists('users', 'orphan_status', 'TEXT DEFAULT "No"');
      addColumnIfNotExists('users', 'child_labour_status', 'TEXT DEFAULT "No"');
      addColumnIfNotExists('users', 'number_of_siblings', 'INTEGER DEFAULT 0');

      // ── USERS: Entrepreneur fields ──
      addColumnIfNotExists('users', 'business_stage', 'TEXT');
      addColumnIfNotExists('users', 'business_location', 'TEXT');
      addColumnIfNotExists('users', 'business_registration', 'TEXT DEFAULT "No"');
      addColumnIfNotExists('users', 'startup_status', 'TEXT DEFAULT "No"');
      addColumnIfNotExists('users', 'employment_generated', 'INTEGER DEFAULT 0');
      addColumnIfNotExists('users', 'loan_required', 'TEXT DEFAULT "No"');

      // ── USERS: Low-Income Family fields ──
      addColumnIfNotExists('users', 'number_of_dependents', 'INTEGER DEFAULT 0');
      addColumnIfNotExists('users', 'ration_card_type', 'TEXT');
      addColumnIfNotExists('users', 'housing_status', 'TEXT');
      addColumnIfNotExists('users', 'land_ownership', 'TEXT');
      addColumnIfNotExists('users', 'disability_in_family', 'TEXT DEFAULT "No"');
      addColumnIfNotExists('users', 'senior_in_family', 'TEXT DEFAULT "No"');

      // ── USERS: Widow / Single Parent fields ──
      addColumnIfNotExists('users', 'children_age', 'TEXT');
      addColumnIfNotExists('users', 'children_education', 'TEXT');

      // ── SCHEMES: criteria & content columns ──
      addColumnIfNotExists('schemes', 'benefits', 'TEXT');
      addColumnIfNotExists('schemes', 'min_age', 'INTEGER DEFAULT 0');
      addColumnIfNotExists('schemes', 'max_age', 'INTEGER DEFAULT 999');
      addColumnIfNotExists('schemes', 'disability_min_percent', 'INTEGER DEFAULT 0');
      addColumnIfNotExists('schemes', 'land_status_required', 'TEXT DEFAULT "All"');
      addColumnIfNotExists('schemes', 'max_land_area', 'REAL DEFAULT 999999');
      addColumnIfNotExists('schemes', 'marital_status_required', 'TEXT DEFAULT "All"');
      addColumnIfNotExists('schemes', 'occupation_required', 'TEXT DEFAULT "All"');
      addColumnIfNotExists('schemes', 'employment_status_required', 'TEXT DEFAULT "All"');
      addColumnIfNotExists('schemes', 'bpl_required', 'TEXT DEFAULT "All"');
      addColumnIfNotExists('schemes', 'important_conditions', 'TEXT');
      addColumnIfNotExists('schemes', 'required_documents', 'TEXT');


      // Comprehensive dataset covering all 11 roles (120+ schemes)
      const allRoleSchemes = ALL_SCHEMES_DATA;

      // Populate or update the schemes
      setTimeout(() => {
        allRoleSchemes.forEach((s) => {
          db.get('SELECT id FROM schemes WHERE scheme_name = ?', [s.scheme_name], (err, row) => {
            if (!row) {
              const insertSql = `INSERT INTO schemes 
                (scheme_name, provider, target_role, category_required, gender_required, income_limit, education_required, state, description, official_link, benefits, min_age, max_age, disability_min_percent, land_status_required, max_land_area, marital_status_required, occupation_required, employment_status_required, bpl_required, important_conditions, required_documents)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
              db.run(insertSql, [
                s.scheme_name, s.provider, s.target_role, s.category_required, s.gender_required, s.income_limit,
                s.education_required || 'All', s.state, s.description, s.official_link, s.benefits || '',
                s.min_age || 0, s.max_age || 999, s.disability_min_percent || 0, s.land_status_required || 'All',
                s.max_land_area || 999999, s.marital_status_required || 'All', s.occupation_required || 'All',
                s.employment_status_required || 'All', s.bpl_required || 'All', s.important_conditions || '',
                s.required_documents || ''
              ]);
            } else {
              // Update with rich fields if not yet updated
              const updateSql = `UPDATE schemes SET 
                benefits = COALESCE(NULLIF(benefits, ''), ?),
                important_conditions = COALESCE(NULLIF(important_conditions, ''), ?),
                required_documents = COALESCE(NULLIF(required_documents, ''), ?),
                min_age = CASE WHEN min_age IS NULL OR min_age = 0 THEN ? ELSE min_age END,
                max_age = CASE WHEN max_age IS NULL OR max_age = 999 THEN ? ELSE max_age END,
                disability_min_percent = CASE WHEN disability_min_percent IS NULL OR disability_min_percent = 0 THEN ? ELSE disability_min_percent END,
                land_status_required = CASE WHEN land_status_required IS NULL OR land_status_required = 'All' THEN ? ELSE land_status_required END,
                max_land_area = CASE WHEN max_land_area IS NULL OR max_land_area = 999999 THEN ? ELSE max_land_area END,
                marital_status_required = CASE WHEN marital_status_required IS NULL OR marital_status_required = 'All' THEN ? ELSE marital_status_required END
                WHERE id = ?`;
              db.run(updateSql, [
                s.benefits || '', s.important_conditions || '', s.required_documents || '',
                s.min_age || 0, s.max_age || 999,
                s.disability_min_percent || 0, s.land_status_required || 'All', s.max_land_area || 999999,
                s.marital_status_required || 'All', row.id
              ]);
            }
          });
        });

        // Also backfill benefits & conditions for any older schemes in DB that have empty benefits
        db.all("SELECT id, scheme_name, provider, target_role, income_limit, state FROM schemes WHERE benefits IS NULL OR benefits = ''", (err, rows) => {
          if (!err && rows && rows.length > 0) {
            rows.forEach(r => {
              const defaultBenefit = `Financial support / scholarship assistance under ${r.provider || 'Government'} guidelines.`;
              const defaultCond = `Target Role: ${r.target_role} | Income Limit: ${r.income_limit === 9999999 ? 'No limit' : '₹' + r.income_limit.toLocaleString()} | State: ${r.state}`;
              db.run("UPDATE schemes SET benefits = ?, important_conditions = ? WHERE id = ?", [defaultBenefit, defaultCond, r.id]);
            });
          }
        });
      }, 500);

      // Seed admin user
      db.get("SELECT count(*) as count FROM admin", async (err, row) => {
        if (!err && row.count === 0) {
          const hashedPassword = await bcrypt.hash('admin5809', 10);
          db.run("INSERT INTO admin (username, password) VALUES (?, ?)", ['admin', hashedPassword]);
          console.log("Seeded default admin user (admin / admin5809).");
        }
      });

      resolve();
    });
  });
};

export default db;
