const testRoles = [
  { role: 'Student', education_level: 'Undergraduate', income: 200000, category: 'SC', state: 'Tamil Nadu', gender: 'Female' },
  { role: 'Women', gender: 'Female', income: 150000, state: 'Tamil Nadu', age: 28 },
  { role: 'Disabled', disability_percent: 60, income: 80000, state: 'Tamil Nadu', age: 25 },
  { role: 'Farmer', land_status: 'Small (2.5 - 5 acres)', land_area: 3, income: 150000, state: 'Tamil Nadu' },
  { role: 'Unemployed', employment_status: 'Unemployed', income: 50000, state: 'Tamil Nadu', age: 24, education_level: 'School' },
  { role: 'Senior Citizen', age: 65, income: 80000, state: 'Tamil Nadu' },
  { role: 'Worker', work_sector: 'Construction', income: 120000, state: 'Tamil Nadu', age: 30 },
  { role: 'Child / Minor', age: 8, gender: 'Female', income: 60000, state: 'Tamil Nadu' },
  { role: 'Entrepreneur / Self-Employed', business_type: 'Retail / Trading', annual_turnover: 500000, income: 200000, state: 'Tamil Nadu', age: 26 },
  { role: 'Low-Income Family', income: 100000, bpl_card: 'Yes', family_size: 4, state: 'Tamil Nadu' },
  { role: 'Widow / Single Parent', marital_status: 'Widow', gender: 'Female', income: 90000, state: 'Tamil Nadu', age: 45 }
];

async function run() {
  for (const t of testRoles) {
    const res = await fetch('http://localhost:5001/api/schemes/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t)
    });
    const data = await res.json();
    console.log(`Role: [${t.role}] -> Matched ${data.eligibleCount} schemes:`);
    (data.schemes || []).forEach(s => {
      console.log(`   * ${s.scheme_name} (${s.provider})`);
      console.log(`     Benefits: ${s.benefits}`);
      console.log(`     Reasons: ${s.eligibility_reasons.slice(0, 2).join('; ')}`);
    });
    console.log('--------------------------------------------------');
  }
}
run();
