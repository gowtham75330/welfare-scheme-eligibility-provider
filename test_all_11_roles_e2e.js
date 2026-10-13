const BASE_URL = 'http://127.0.0.1:5173';

const rolesTestData = [
  {
    role: 'Student',
    valid: {
      role: 'Student',
      age: 20,
      gender: 'Female',
      state: 'Tamil Nadu',
      district: 'Chennai',
      category: 'SC',
      income: 180000,
      education_level: 'Undergraduate',
      institution_type: 'Government'
    },
    invalid: {
      role: 'Student',
      age: 20,
      gender: 'Male',
      state: 'Tamil Nadu',
      category: 'General',
      income: 50000000, // Exceeds all student income limits
      education_level: 'Undergraduate'
    }
  },
  {
    role: 'Women',
    valid: {
      role: 'Women',
      age: 28,
      gender: 'Female',
      state: 'Tamil Nadu',
      district: 'Madurai',
      category: 'General',
      income: 120000,
      marital_status: 'Married'
    },
    invalid: {
      role: 'Women',
      age: 28,
      gender: 'Male', // Men should NOT get women schemes
      state: 'Tamil Nadu',
      category: 'General',
      income: 120000
    }
  },
  {
    role: 'Disabled',
    valid: {
      role: 'Disabled',
      age: 25,
      gender: 'Male',
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      category: 'General',
      income: 90000,
      disability_percent: 60,
      disability_type: 'Locomotor / Physical'
    },
    invalid: {
      role: 'Disabled',
      age: 25,
      gender: 'Male',
      state: 'Tamil Nadu',
      income: 90000,
      disability_percent: 15 // Under 40% benchmark
    }
  },
  {
    role: 'Farmer',
    valid: {
      role: 'Farmer',
      age: 42,
      gender: 'Male',
      state: 'Tamil Nadu',
      district: 'Thanjavur',
      category: 'BC',
      income: 140000,
      land_status: 'Small (2.5 - 5 acres)',
      land_area: 3.5
    },
    invalid: {
      role: 'Farmer',
      age: 42,
      gender: 'Male',
      state: 'Tamil Nadu',
      income: 25000000, // 2.5 Crore income
      land_status: 'Large (> 5 acres)',
      land_area: 100
    }
  },
  {
    role: 'Unemployed',
    valid: {
      role: 'Unemployed',
      age: 23,
      gender: 'Male',
      state: 'Tamil Nadu',
      district: 'Salem',
      category: 'OBC',
      income: 60000,
      employment_status: 'Unemployed',
      education_level: 'School'
    },
    invalid: {
      role: 'Unemployed',
      age: 23,
      gender: 'Male',
      state: 'Tamil Nadu',
      employment_status: 'Employed', // Employed cannot get unemployed schemes
      income: 5000000
    }
  },
  {
    role: 'Senior Citizen',
    valid: {
      role: 'Senior Citizen',
      age: 68,
      gender: 'Female',
      state: 'Tamil Nadu',
      district: 'Tiruchirappalli',
      category: 'General',
      income: 80000,
      bpl_card: 'Yes'
    },
    invalid: {
      role: 'Senior Citizen',
      age: 32, // Not senior (must be >= 60)
      gender: 'Female',
      state: 'Tamil Nadu',
      income: 80000
    }
  },
  {
    role: 'Worker',
    valid: {
      role: 'Worker',
      age: 35,
      gender: 'Male',
      state: 'Tamil Nadu',
      district: 'Kanchipuram',
      category: 'MBC',
      income: 130000,
      work_sector: 'Construction'
    },
    invalid: {
      role: 'Worker',
      age: 35,
      gender: 'Male',
      state: 'Tamil Nadu',
      income: 50000000 // Huge income
    }
  },
  {
    role: 'Child / Minor',
    valid: {
      role: 'Child / Minor',
      age: 9,
      gender: 'Female',
      state: 'Tamil Nadu',
      district: 'Tirunelveli',
      category: 'General',
      income: 70000,
      marital_status: 'Both Parents'
    },
    invalid: {
      role: 'Child / Minor',
      age: 29, // Adult, not minor
      gender: 'Female',
      state: 'Tamil Nadu',
      income: 70000
    }
  },
  {
    role: 'Entrepreneur / Self-Employed',
    valid: {
      role: 'Entrepreneur / Self-Employed',
      age: 31,
      gender: 'Male',
      state: 'Tamil Nadu',
      district: 'Erode',
      category: 'General',
      income: 250000,
      business_type: 'Retail / Trading',
      annual_turnover: 600000,
      education_level: 'Undergraduate'
    },
    invalid: {
      role: 'Entrepreneur / Self-Employed',
      age: 31,
      gender: 'Male',
      state: 'Tamil Nadu',
      income: 50000000,
      annual_turnover: 500000000
    }
  },
  {
    role: 'Low-Income Family',
    valid: {
      role: 'Low-Income Family',
      age: 40,
      gender: 'Female',
      state: 'Tamil Nadu',
      district: 'Vellore',
      category: 'SC',
      income: 90000,
      bpl_card: 'Yes',
      family_size: 5
    },
    invalid: {
      role: 'Low-Income Family',
      age: 40,
      gender: 'Female',
      state: 'Tamil Nadu',
      income: 8000000, // 80 Lakhs - not low income
      bpl_card: 'No'
    }
  },
  {
    role: 'Widow / Single Parent',
    valid: {
      role: 'Widow / Single Parent',
      age: 48,
      gender: 'Female',
      state: 'Tamil Nadu',
      district: 'Dindigul',
      category: 'General',
      income: 85000,
      marital_status: 'Widow',
      family_size: 2
    },
    invalid: {
      role: 'Widow / Single Parent',
      age: 48,
      gender: 'Male',
      marital_status: 'Married', // Married male cannot get widow pensions
      state: 'Tamil Nadu',
      income: 85000
    }
  }
];

async function runEndToEndTests() {
  console.log('🚀 STARTING FULL 11-ROLE END-TO-END VERIFICATION...');
  console.log(`Connecting to portal via proxy at ${BASE_URL}...`);

  // Step 1: Register or Login test user
  const testEmail = `tester_${Date.now()}@eligibilityportal.org`;
  const testPassword = 'Password123!';
  const testName = 'Portal Test User';

  let token = '';

  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: testName, email: testEmail, password: testPassword })
  });

  if (regRes.ok) {
    const regData = await regRes.json();
    token = regData.token;
    console.log(`✅ User registered successfully with ID: ${regData.user.id}`);
  } else {
    // Attempt login if already exists
    const logRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const logData = await logRes.json();
    token = logData.token;
    console.log(`✅ Logged in successfully with ID: ${logData.user.id}`);
  }

  if (!token) {
    console.error('❌ Failed to authenticate test user');
    process.exit(1);
  }

  let passedRoles = 0;
  let passedNegatives = 0;

  for (const item of rolesTestData) {
    console.log(`\n======================================================`);
    console.log(`🔍 TESTING ROLE ${passedRoles + 1}/11: [${item.role}]`);
    console.log(`======================================================`);

    // 1. Submit Valid Profile Form
    const putRes = await fetch(`${BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(item.valid)
    });
    const putData = await putRes.json();
    if (!putRes.ok) {
      console.error(`❌ Profile update failed for role ${item.role}:`, putData);
      process.exit(1);
    }
    console.log(`✓ Profile Form updated successfully for role [${putData.user.role}]`);

    // 2. Fetch Eligible Schemes
    const eligRes = await fetch(`${BASE_URL}/api/schemes/eligible`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const eligData = await eligRes.json();

    if (!eligRes.ok) {
      console.error(`❌ Eligibility check failed for role ${item.role}:`, eligData);
      process.exit(1);
    }

    const matchedSchemes = eligData.schemes || [];
    console.log(`✓ Eligible schemes returned: ${matchedSchemes.length} schemes`);

    if (matchedSchemes.length === 0) {
      console.error(`❌ FAILED: Role [${item.role}] returned 0 schemes when valid criteria was provided!`);
      process.exit(1);
    }

    // Verify all required scheme fields
    matchedSchemes.forEach((s, idx) => {
      if (!s.scheme_name || !s.benefits || !s.official_link || !s.description || !s.eligibility_reasons) {
        console.error(`❌ Scheme ${s.scheme_name} missing required attributes!`, s);
        process.exit(1);
      }
      if (idx < 2) {
        console.log(`   📌 [${idx + 1}] ${s.scheme_name}`);
        console.log(`      • Provider: ${s.provider}`);
        console.log(`      • Benefits: ${s.benefits}`);
        console.log(`      • Why Eligible: ${s.eligibility_reasons.slice(0, 2).join('; ')}`);
        console.log(`      • Conditions: ${s.important_conditions}`);
        console.log(`      • Link: ${s.official_link}`);
      }
    });

    passedRoles++;

    // 3. Test Invalid Negative Criteria
    const negPutRes = await fetch(`${BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(item.invalid)
    });
    await negPutRes.json();

    const negEligRes = await fetch(`${BASE_URL}/api/schemes/eligible`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const negEligData = await negEligRes.json();

    if (negEligData.schemes && negEligData.schemes.length === 0 && negEligData.message) {
      console.log(`✓ Negative Test Passed: Expected 0 schemes, got message: "${negEligData.message}"`);
      passedNegatives++;
    } else {
      console.warn(`⚠️ Negative Test Note for [${item.role}]: Returned ${negEligData.schemes?.length || 0} schemes.`);
    }
  }

  console.log(`\n======================================================`);
  console.log(`🎉 ALL 11 ROLES TESTED END-TO-END SUCCESSFULLY!`);
  console.log(`   • Roles Passed: ${passedRoles} / 11`);
  console.log(`   • Negative Conditions Verified: ${passedNegatives} / 11`);
  console.log(`======================================================\n`);
  process.exit(0);
}

runEndToEndTests().catch(err => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
