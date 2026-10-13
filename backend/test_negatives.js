async function testNegatives() {
  const tests = [
    { name: 'Senior Citizen but age 25', profile: { role: 'Senior Citizen', age: 25, income: 50000, state: 'Tamil Nadu' } },
    { name: 'Child / Minor but age 35', profile: { role: 'Child / Minor', age: 35, income: 50000, state: 'Tamil Nadu' } },
    { name: 'Disabled but 10% disability', profile: { role: 'Disabled', disability_percent: 10, income: 50000, state: 'Tamil Nadu' } },
    { name: 'Low Income but income 50 Lakhs', profile: { role: 'Low-Income Family', income: 5000000, state: 'Tamil Nadu' } },
    { name: 'Widow scheme but Married male', profile: { role: 'Widow / Single Parent', marital_status: 'Married', gender: 'Male', income: 50000, state: 'Tamil Nadu' } }
  ];

  for (const t of tests) {
    const res = await fetch('http://localhost:5001/api/schemes/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t.profile)
    });
    const data = await res.json();
    console.log(`Test [${t.name}]: Eligible Count = ${data.eligibleCount}, Message = "${data.message || ''}"`);
  }
}
testNegatives();
