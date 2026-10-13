const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./scheme_portal.db');

// First add the column (ignore error if exists)
db.run('ALTER TABLE schemes ADD COLUMN required_documents TEXT', () => {});

const docsByRole = {
  'Student': 'Aadhaar Card | School/College Admission Proof | Mark Sheet / Bonafide Certificate | Caste Certificate (SC/ST/OBC) | Bank Account Passbook | Income Certificate | Passport Photo',
  'Women': 'Aadhaar Card | Ration Card / Family Card | Bank Account Passbook | Income Certificate | Age Proof | Passport Photo | Marriage Certificate (if applicable)',
  'Disabled': 'Aadhaar Card | UDID Card / Disability Certificate (from CMO) | Bank Account Passbook | Income Certificate | Age Proof | Caste Certificate (if applicable) | Medical Certificate | Passport Photo',
  'Farmer': 'Aadhaar Card | Patta / Land Records (Chitta & Adangal) | Bank Account Passbook | Kisan Credit Card (if any) | Caste Certificate (if applicable) | Income Certificate | Passport Photo',
  'Unemployed': 'Aadhaar Card | Employment Exchange Registration Card | Educational Qualification Certificates | Bank Account Passbook | Income Certificate | Domicile Certificate | Passport Photo',
  'Senior Citizen': 'Aadhaar Card | Age Proof (Birth Certificate / Voter ID) | Bank Account Passbook | Income Certificate | Ration Card | Residence Proof | Passport Photo',
  'Worker': 'Aadhaar Card | e-Shram Card / Labour Registration Card | Bank Account Passbook | Employer Certificate or Self-Declaration | Income Proof | Domicile Certificate | Passport Photo',
  'Child / Minor': 'Aadhaar Card (Child + Parent) | Birth Certificate | Parent Income Certificate | School Enrollment Proof | Caste Certificate (if applicable) | Bank Passbook (Parent) | Passport Photo',
  'Entrepreneur / Self-Employed': 'Aadhaar Card | PAN Card | Bank Account Passbook | Business Plan / Project Report | Udyam / MSME Registration (if any) | Income Proof | Caste Certificate (if applicable) | Passport Photo',
  'Low-Income Family': 'Aadhaar Card | Ration Card (BPL / AAY / PHH) | Bank Account Passbook | Income Certificate | Family Card | Caste Certificate (if applicable) | Residence Proof | Passport Photo',
  'Widow / Single Parent': 'Aadhaar Card | Husband Death Certificate (for widows) | Ration Card / Family Card | Bank Account Passbook | Income Certificate | Children Birth Certificates | Caste Certificate (if applicable) | Passport Photo',
};

setTimeout(() => {
  let completed = 0;
  const roles = Object.keys(docsByRole);
  
  roles.forEach(role => {
    db.run(
      'UPDATE schemes SET required_documents = ? WHERE target_role = ?',
      [docsByRole[role], role],
      function(err) {
        if (err) console.error(`Error for ${role}:`, err.message);
        else console.log(`Updated ${this.changes} schemes for role: ${role}`);
        completed++;
        if (completed === roles.length) {
          db.get('SELECT COUNT(*) as cnt FROM schemes WHERE required_documents IS NOT NULL AND required_documents != ""', (e, r) => {
            console.log(`\nTotal schemes with documents: ${r && r.cnt}`);
            db.close();
          });
        }
      }
    );
  });
}, 500);
