import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = new sqlite3.Database(path.join(__dirname, 'scheme_portal.db'));

const docsByRole = {
  'Student': 'Aadhaar Card | School/College Admission Proof | Mark Sheet / Bonafide Certificate | Caste Certificate (if SC/ST/OBC) | Bank Account Passbook | Income Certificate | Passport Photo',
  'Women': 'Aadhaar Card | Ration Card / Family Card | Bank Account Passbook | Income Certificate | Age Proof (Birth Certificate/Aadhaar) | Passport Photo | Marriage Certificate (if applicable)',
  'Disabled': 'Aadhaar Card | UDID Card / Disability Certificate (from CMO) | Bank Account Passbook | Income Certificate | Age Proof | Caste Certificate (if applicable) | Passport Photo | Medical Certificate',
  'Farmer': 'Aadhaar Card | Patta / Land Records (Chitta & Adangal) | Bank Account Passbook | Kisan Credit Card (if any) | Caste Certificate (if applicable) | Income Certificate | Passport Photo',
  'Unemployed': 'Aadhaar Card | Employment Exchange Registration Card | Educational Qualification Certificates | Bank Account Passbook | Income Certificate | Domicile/Residence Certificate | Passport Photo',
  'Senior Citizen': 'Aadhaar Card | Age Proof (Birth Certificate / Voter ID / Aadhaar) | Bank Account Passbook | Income Certificate | Ration Card | Residence Proof | Passport Photo',
  'Worker': 'Aadhaar Card | e-Shram Card / Labour Registration Card | Bank Account Passbook | Employer Certificate or Self-Declaration | Income Proof | Domicile Certificate | Passport Photo',
  'Child / Minor': "Aadhaar Card (Child + Parent) | Birth Certificate | Parent/Guardian Income Certificate | School Enrollment Proof | Caste Certificate (if applicable) | Bank Account Passbook (Parent) | Passport Photo",
  'Entrepreneur / Self-Employed': 'Aadhaar Card | PAN Card | Bank Account Passbook | Business Plan / Project Report | Udyam / MSME Registration (if any) | Income Proof | Caste Certificate (if applicable) | Passport Photo',
  'Low-Income Family': 'Aadhaar Card | Ration Card (BPL / AAY / PHH) | Bank Account Passbook | Income Certificate | Family Card | Caste Certificate (if applicable) | Residence Proof | Passport Photo',
  'Widow / Single Parent': 'Aadhaar Card | Husband Death Certificate (for widows) | Ration Card / Family Card | Bank Account Passbook | Income Certificate | Children Birth Certificates | Caste Certificate (if applicable) | Passport Photo',
};

// Serialize ensures ALTER runs before UPDATE
db.serialize(() => {
  // Add column if it doesn't exist (ignore if already present)
  db.run('ALTER TABLE schemes ADD COLUMN required_documents TEXT', () => {});

  const roles = Object.entries(docsByRole);
  let done = 0;

  roles.forEach(([role, docs]) => {
    db.run('UPDATE schemes SET required_documents = ? WHERE target_role = ?', [docs, role], function(err) {
      if (err) {
        console.error(`Error for ${role}:`, err.message);
      } else {
        console.log(`✅ ${role}: updated ${this.changes} schemes`);
      }
      done++;
      if (done === roles.length) {
        db.get('SELECT COUNT(*) as cnt FROM schemes WHERE required_documents IS NOT NULL AND required_documents != ""', (e, r) => {
          console.log(`\n📋 Total schemes with required_documents: ${r?.cnt || 0} / 76`);
          db.close();
        });
      }
    });
  });
});
