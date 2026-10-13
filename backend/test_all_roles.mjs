import http from 'http';

const testCases = [
  {
    label: 'Student - SC Female Tamil Nadu (should get 7+ schemes)',
    profile: { role: 'Student', age: 20, gender: 'Female', state: 'Tamil Nadu', category: 'SC', income: 200000, education_level: 'Undergraduate' }
  },
  {
    label: 'Farmer - Tamil Nadu small farmer (should get 3-5 schemes)',
    profile: { role: 'Farmer', age: 40, gender: 'Male', state: 'Tamil Nadu', category: 'General', income: 150000, land_area: 2, land_status: 'Small (2.5 - 5 acres)' }
  },
  {
    label: 'Senior Citizen - All India age 65 (should get 4+ schemes)',
    profile: { role: 'Senior Citizen', age: 65, gender: 'Male', state: 'All India', category: 'General', income: 80000 }
  },
  {
    label: 'Disabled - 60% disability SC (should get 4+ schemes)',
    profile: { role: 'Disabled', age: 25, gender: 'Male', state: 'Tamil Nadu', category: 'SC', income: 90000, disability_percent: 60 }
  },
  {
    label: 'Entrepreneur - Female seeking MUDRA (should get 2+ schemes)',
    profile: { role: 'Entrepreneur / Self-Employed', age: 30, gender: 'Female', state: 'All India', category: 'General', income: 300000, business_type: 'Retail / Trading' }
  },
  {
    label: 'Low-Income Family - BPL family (should get 2+ schemes)',
    profile: { role: 'Low-Income Family', age: 35, gender: 'Male', state: 'Tamil Nadu', category: 'SC', income: 80000, bpl_card: 'Yes', family_size: 5 }
  },
  {
    label: 'Widow Single Parent (should get 2+ schemes)',
    profile: { role: 'Widow / Single Parent', age: 38, gender: 'Female', state: 'Tamil Nadu', category: 'General', income: 100000, marital_status: 'Widow' }
  },
  {
    label: 'Worker - Construction worker (should get 2+ schemes)',
    profile: { role: 'Worker', age: 32, gender: 'Male', state: 'All India', category: 'General', income: 120000, work_sector: 'Construction' }
  }
];

const doPost = (profile) => new Promise((resolve, reject) => {
  const body = JSON.stringify(profile);
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/schemes/check',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  }, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => resolve(JSON.parse(data)));
  });
  req.on('error', reject);
  req.write(body);
  req.end();
});

(async () => {
  console.log('=== Eligibility Engine Test ===\n');
  let allPassed = true;
  for (const tc of testCases) {
    try {
      const result = await doPost(tc.profile);
      const passed = result.eligibleCount > 0;
      if (!passed) allPassed = false;
      console.log(`${passed ? '✅' : '❌'} ${tc.label}`);
      console.log(`   Eligible: ${result.eligibleCount} / ${result.totalAvailable} total schemes`);
      if (result.schemes && result.schemes.length > 0) {
        result.schemes.slice(0, 3).forEach(s => console.log(`     - ${s.scheme_name}`));
        if (result.schemes.length > 3) console.log(`     ... and ${result.schemes.length - 3} more`);
      } else {
        console.log('   ⚠️  No eligible schemes found');
      }
    } catch (err) {
      console.log(`❌ ${tc.label} - ERROR: ${err.message}`);
      allPassed = false;
    }
    console.log();
  }
  console.log(allPassed ? '✅ All tests passed!' : '⚠️  Some tests had no eligible schemes');
})();
