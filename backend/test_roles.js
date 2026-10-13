import db, { initDb } from './database.js';
import { evaluateSchemeEligibility } from './server.js';

async function testAll() {
  await initDb();
  
  db.all('SELECT * FROM schemes', (err, schemes) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    const testUsers = [
      { name: 'Student (Male)', role: 'Student', age: 20, gender: 'Male', state: 'Tamil Nadu', category: 'BC', income: 150000, education_level: 'Undergraduate' },
      { name: 'Student (Female)', role: 'Student', age: 20, gender: 'Female', state: 'Tamil Nadu', category: 'BC', income: 150000, education_level: 'Undergraduate' },
      { name: 'Women', role: 'Women', age: 28, gender: 'Female', state: 'Tamil Nadu', category: 'General', income: 120000 },
      { name: 'Disabled', role: 'Disabled', age: 25, gender: 'Male', state: 'Tamil Nadu', category: 'General', income: 90000, disability_percent: 60 },
      { name: 'Farmer', role: 'Farmer', age: 45, gender: 'Male', state: 'Tamil Nadu', category: 'General', income: 140000, land_area: 2.5 },
      { name: 'Unemployed', role: 'Unemployed', age: 24, gender: 'Male', state: 'Tamil Nadu', category: 'General', income: 60000, employment_status: 'unemployed' },
      { name: 'Senior Citizen', role: 'Senior Citizen', age: 67, gender: 'Male', state: 'Tamil Nadu', category: 'General', income: 80000, bpl_card: 'yes' },
      { name: 'Worker', role: 'Worker', age: 35, gender: 'Male', state: 'Tamil Nadu', category: 'General', income: 100000, work_sector: 'Construction' },
      { name: 'Child / Minor', role: 'Child / Minor', age: 8, gender: 'Female', state: 'Tamil Nadu', category: 'General', income: 90000 },
      { name: 'Entrepreneur / Self-Employed', role: 'Entrepreneur / Self-Employed', age: 32, gender: 'Female', state: 'Tamil Nadu', category: 'General', income: 250000, annual_turnover: 300000 },
      { name: 'Low-Income Family', role: 'Low-Income Family', age: 40, gender: 'Male', state: 'Tamil Nadu', category: 'General', income: 72000, bpl_card: 'yes' },
      { name: 'Widow / Single Parent', role: 'Widow / Single Parent', age: 34, gender: 'Female', state: 'Tamil Nadu', category: 'General', income: 85000, marital_status: 'widow' }
    ];

    console.log('======================================================================');
    console.log('       11 ROLES ELIGIBILITY ENGINE VALIDATION REPORT                  ');
    console.log('======================================================================');
    let allPassed = true;

    testUsers.forEach(u => {
      const eligible = schemes.filter(s => {
        const res = evaluateSchemeEligibility(u, s);
        return res.isEligible;
      });

      // Strict check: if male user, no female-only schemes must match!
      if (u.gender === 'Male') {
        const femaleLeak = eligible.filter(s => s.gender_required === 'Female');
        if (femaleLeak.length > 0) {
          allPassed = false;
          console.error(`[FAIL] Gender Leak: ${femaleLeak.length} Female schemes matched for ${u.name || u.role}!`);
          femaleLeak.forEach(fl => console.error(`       -> ${fl.scheme_name}`));
        }
      }

      // Strict check: if female user, no male-only schemes must match!
      if (u.gender === 'Female') {
        const maleLeak = eligible.filter(s => s.gender_required === 'Male');
        if (maleLeak.length > 0) {
          allPassed = false;
          console.error(`[FAIL] Gender Leak: ${maleLeak.length} Male schemes matched for ${u.name || u.role}!`);
          maleLeak.forEach(ml => console.error(`       -> ${ml.scheme_name}`));
        }
      }

      console.log(`[PASS] ${(u.name || u.role).padEnd(35)} -> ${eligible.length} Schemes Matched`);
      if (eligible.length === 0) {
        allPassed = false;
        console.error(`[FAIL] No schemes matched for: ${u.name || u.role}`);
      }
    });

    console.log('======================================================================');
    console.log(allPassed ? '>>> ALL 11 ROLES TESTED AND MATCHED ELIGIBLE SCHEMES SUCCESSFULLY! <<<' : '>>> SOME ROLES FAILED <<<');
    console.log('======================================================================');

    process.exit(allPassed ? 0 : 1);
  });
}

testAll();
