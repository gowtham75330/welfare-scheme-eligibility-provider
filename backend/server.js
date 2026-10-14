import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db, { initDb } from './database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

// CORS - Allow frontend (Vercel) to talk to backend (Render)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all origins for now (restrict later)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors()); // Handle preflight requests
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me_in_prod';

// Initialize DB
initDb();

// Middleware to verify JWT
const authenticateUser = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// =======================
// AUTHENTICATION ROUTES
// =======================

// User Registration
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  try {
    // Check if user exists
    db.get('SELECT email FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) throw err;
      if (row) return res.status(400).json({ message: 'User already exists' });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Save user
      db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
        [name, email, hashedPassword], 
        function(err) {
          if (err) return res.status(500).json({ message: 'Database error', error: err.message });
          
          const token = jwt.sign({ id: this.lastID, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
          res.json({ token, user: { id: this.lastID, name, email } });
      });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// User Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    
    // Remove password before sending
    const { password: pwd, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  });
});

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM admin WHERE username = ?', [username], async (err, admin) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin.id, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { username: admin.username, role: 'admin' } });
  });
});

// =======================
// CONTACT & FEEDBACK
// =======================

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  db.run('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)', 
    [name, email, message], function(err) {
      if (err) return res.status(500).json({ message: 'Error saving message' });
      res.json({ message: 'Message sent successfully!' });
  });
});

app.get('/api/admin/contacts', authenticateUser, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  
  db.all('SELECT * FROM contacts ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json({ contacts: rows });
  });
});

// =======================
// USER PROFILE ROUTES
// =======================

// =======================
// USER PROFILE ROUTES
// =======================

const USER_COLUMNS = `
  id, name, email, role, age, gender, state, district, category, income, 
  education_level, institution_type, occupation, employment_status, 
  disability_percent, disability_type, land_status, land_area, 
  marital_status, family_size, bpl_card, business_type, annual_turnover, work_sector
`;

// Get Profile
app.get('/api/users/profile', authenticateUser, (req, res) => {
  db.get(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`, [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  });
});

// Update Profile Form
app.put('/api/users/profile', authenticateUser, (req, res) => {
  const {
    role, age, gender, state, district, category, income,
    education_level, institution_type, occupation, employment_status,
    disability_percent, disability_type, land_status, land_area,
    marital_status, family_size, bpl_card, business_type, annual_turnover, work_sector
  } = req.body;

  const updateSql = `UPDATE users SET 
    role = ?, age = ?, gender = ?, state = ?, district = ?, 
    category = ?, income = ?, education_level = ?, institution_type = ?,
    occupation = ?, employment_status = ?, disability_percent = ?, disability_type = ?,
    land_status = ?, land_area = ?, marital_status = ?, family_size = ?,
    bpl_card = ?, business_type = ?, annual_turnover = ?, work_sector = ?
    WHERE id = ?`;

  const params = [
    role || '', age ? Number(age) : null, gender || '', state || '', district || '',
    category || '', income !== undefined && income !== '' ? Number(income) : 0,
    education_level || '', institution_type || '', occupation || '', employment_status || '',
    disability_percent ? Number(disability_percent) : 0, disability_type || '',
    land_status || '', land_area ? Number(land_area) : 0, marital_status || '',
    family_size ? Number(family_size) : 1, bpl_card || 'No', business_type || '',
    annual_turnover ? Number(annual_turnover) : 0, work_sector || '',
    req.user.id
  ];

  db.run(updateSql, params, function(err) {
    if (err) return res.status(500).json({ message: 'Database update failed', error: err.message });

    db.get(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`, [req.user.id], (err, updatedUser) => {
      if (err) return res.status(500).json({ message: 'Error retrieving updated profile' });
      res.json({ message: 'Profile updated successfully', user: updatedUser });
    });
  });
});

// =======================
// SCHEMES / FILTER ENGINE ROUTES
// =======================

// Public: Get all available schemes
app.get('/api/schemes', (req, res) => {
  db.all('SELECT * FROM schemes ORDER BY target_role, id', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json({ schemes: rows, total: rows.length });
  });
});

// Get all schemes (Admin)
app.get('/api/admin/schemes', authenticateUser, (req, res) => {

  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  
  db.all('SELECT * FROM schemes ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json({ schemes: rows });
  });
});

// Get user count (Admin)
app.get('/api/admin/users', authenticateUser, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  
  db.all('SELECT id, name, email, role, state, district, income, category FROM users ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json({ users: rows });
  });
});

// Add Scheme (Admin)
app.post('/api/admin/schemes', authenticateUser, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

  const s = req.body;
  const insertSql = `INSERT INTO schemes 
    (scheme_name, provider, target_role, category_required, gender_required, income_limit, education_required, state, description, official_link, benefits, min_age, max_age, disability_min_percent, land_status_required, max_land_area, marital_status_required, occupation_required, employment_status_required, bpl_required, important_conditions, required_documents) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(insertSql,
    [
      s.scheme_name, s.provider, s.target_role, s.category_required || 'All',
      s.gender_required || 'All', s.income_limit ? Number(s.income_limit) : 9999999,
      s.education_required || 'All', s.state || 'All India', s.description, s.official_link,
      s.benefits || '', s.min_age ? Number(s.min_age) : 0, s.max_age ? Number(s.max_age) : 999,
      s.disability_min_percent ? Number(s.disability_min_percent) : 0, s.land_status_required || 'All',
      s.max_land_area ? Number(s.max_land_area) : 999999, s.marital_status_required || 'All',
      s.occupation_required || 'All', s.employment_status_required || 'All', s.bpl_required || 'All',
      s.important_conditions || '', s.required_documents || ''
    ],
    function(err) {
      if (err) return res.status(500).json({ message: 'Failed to add scheme', error: err.message });
      res.json({ message: 'Scheme added successfully!', id: this.lastID });
    }
  );
});

// Delete Scheme (Admin)
app.delete('/api/admin/schemes/:id', authenticateUser, (req, res) => {
   if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

   db.run('DELETE FROM schemes WHERE id = ?', [req.params.id], function(err) {
     if (err) return res.status(500).json({ message: 'Failed to delete scheme' });
     res.json({ message: 'Scheme deleted' });
   });
});

// Update Scheme (Admin)
app.put('/api/admin/schemes/:id', authenticateUser, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

  const s = req.body;
  const updateSql = `UPDATE schemes SET 
    scheme_name = ?, provider = ?, target_role = ?, category_required = ?, 
    gender_required = ?, income_limit = ?, education_required = ?, state = ?, 
    description = ?, official_link = ?, benefits = ?, min_age = ?, max_age = ?, 
    disability_min_percent = ?, land_status_required = ?, max_land_area = ?, 
    marital_status_required = ?, occupation_required = ?, employment_status_required = ?, 
    bpl_required = ?, important_conditions = ?, required_documents = ? 
    WHERE id = ?`;

  db.run(updateSql,
    [
      s.scheme_name, s.provider, s.target_role, s.category_required || 'All',
      s.gender_required || 'All', s.income_limit ? Number(s.income_limit) : 9999999,
      s.education_required || 'All', s.state || 'All India', s.description, s.official_link,
      s.benefits || '', s.min_age ? Number(s.min_age) : 0, s.max_age ? Number(s.max_age) : 999,
      s.disability_min_percent ? Number(s.disability_min_percent) : 0, s.land_status_required || 'All',
      s.max_land_area ? Number(s.max_land_area) : 999999, s.marital_status_required || 'All',
      s.occupation_required || 'All', s.employment_status_required || 'All', s.bpl_required || 'All',
      s.important_conditions || '', s.required_documents || '', req.params.id
    ],
    function(err) {
      if (err) return res.status(500).json({ message: 'Failed to update scheme', error: err.message });
      res.json({ message: 'Scheme updated!' });
    }
  );
});

// =======================
// SAVED SCHEMES ROUTES
// =======================

// Save a scheme
app.post('/api/schemes/save', authenticateUser, (req, res) => {
  const { scheme_id } = req.body;

  // Check if already saved
  db.get('SELECT * FROM saved_schemes WHERE user_id = ? AND scheme_id = ?', [req.user.id, scheme_id], (err, row) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (row) return res.status(400).json({ message: 'Scheme already saved' });

    db.run('INSERT INTO saved_schemes (user_id, scheme_id) VALUES (?, ?)', [req.user.id, scheme_id], function(err) {
      if (err) return res.status(500).json({ message: 'Failed to save scheme' });
      res.json({ message: 'Scheme saved successfully!' });
    });
  });
});

// Get user's saved schemes
app.get('/api/schemes/saved', authenticateUser, (req, res) => {
  db.all(`
    SELECT schemes.*, saved_schemes.id as saved_id 
    FROM saved_schemes 
    JOIN schemes ON saved_schemes.scheme_id = schemes.id 
    WHERE saved_schemes.user_id = ?
    ORDER BY saved_schemes.created_at DESC`, [req.user.id], (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json({ schemes: rows });
  });
});

// Remove a saved scheme
app.delete('/api/schemes/saved/:id', authenticateUser, (req, res) => {
  db.run('DELETE FROM saved_schemes WHERE user_id = ? AND scheme_id = ?', [req.user.id, req.params.id], function(err) {
    if (err) return res.status(500).json({ message: 'Failed to unsave scheme' });
    res.json({ message: 'Scheme removed from saved list' });
  });
});

// =======================
// APPLICATION TRACKING ROUTES
// =======================

// Update or set application status
app.post('/api/applications/status', authenticateUser, (req, res) => {
  const { scheme_id, status, notes } = req.body;
  if (!scheme_id || !status) {
    return res.status(400).json({ message: 'Scheme ID and Status are required' });
  }

  db.get('SELECT * FROM applications WHERE user_id = ? AND scheme_id = ?', [req.user.id, scheme_id], (err, row) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });

    if (row) {
      db.run(
        'UPDATE applications SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, notes || row.notes || '', row.id],
        function(err) {
          if (err) return res.status(500).json({ message: 'Failed to update application status' });
          res.json({ message: 'Application status updated successfully!', status });
        }
      );
    } else {
      const today = new Date().toISOString().split('T')[0];
      db.run(
        'INSERT INTO applications (user_id, scheme_id, status, application_date, notes) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, scheme_id, status, today, notes || ''],
        function(err) {
          if (err) return res.status(500).json({ message: 'Failed to record application status' });
          res.json({ message: 'Application status recorded!', status, id: this.lastID });
        }
      );
    }
  });
});

// Get user's tracked applications
app.get('/api/applications', authenticateUser, (req, res) => {
  db.all(`
    SELECT applications.*, schemes.scheme_name, schemes.provider, schemes.target_role, schemes.official_link, schemes.benefits
    FROM applications
    JOIN schemes ON applications.scheme_id = schemes.id
    WHERE applications.user_id = ?
    ORDER BY applications.updated_at DESC`, [req.user.id], (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json({ applications: rows });
  });
});

// Admin: Get all application records
app.get('/api/admin/applications', authenticateUser, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

  db.all(`
    SELECT applications.*, users.name as user_name, users.email as user_email, schemes.scheme_name, schemes.target_role
    FROM applications
    JOIN users ON applications.user_id = users.id
    JOIN schemes ON applications.scheme_id = schemes.id
    ORDER BY applications.updated_at DESC`, [], (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json({ applications: rows });
  });
});

// =====================================
// CORE MULTI-ROLE ELIGIBILITY ENGINE
// =====================================

export const evaluateSchemeEligibility = (user, scheme) => {
  // Normalize strings
  const normUserRole = (user.role || '').trim().toLowerCase();
  const normSchemeRole = (scheme.target_role || '').trim().toLowerCase();

  const userState = (user.state || '').trim();
  const schemeState = (scheme.state || 'All India').trim();
  const normUserState = userState.toLowerCase().replace(/\s+/g, '');
  const normSchemeState = schemeState.toLowerCase().replace(/\s+/g, '');

  const userGender = (user.gender || '').trim().toLowerCase();
  const schemeGender = (scheme.gender_required || 'All').trim().toLowerCase();

  const userCategory = (user.category || '').trim().toLowerCase();
  const schemeCategory = (scheme.category_required || 'All').trim().toLowerCase();

  const userIncome = user.income !== undefined && user.income !== null && user.income !== '' ? Number(user.income) : 0;
  const schemeIncomeLimit = scheme.income_limit !== undefined && scheme.income_limit !== null ? Number(scheme.income_limit) : 9999999;

  const userAge = user.age !== undefined && user.age !== null && user.age !== '' ? Number(user.age) : null;
  const schemeMinAge = scheme.min_age ? Number(scheme.min_age) : 0;
  const schemeMaxAge = scheme.max_age ? Number(scheme.max_age) : 999;

  const userEdu = (user.education_level || '').trim().toLowerCase();
  const schemeEdu = (scheme.education_required || 'All').trim().toLowerCase();

  const userDisability = user.disability_percent ? Number(user.disability_percent) : 0;
  const schemeDisabilityMin = scheme.disability_min_percent ? Number(scheme.disability_min_percent) : 0;

  const userLandArea = user.land_area ? Number(user.land_area) : 0;
  const schemeMaxLand = scheme.max_land_area ? Number(scheme.max_land_area) : 999999;
  const userLandStatus = (user.land_status || '').trim().toLowerCase();
  const schemeLandStatus = (scheme.land_status_required || 'All').trim().toLowerCase();

  const userMarital = (user.marital_status || '').trim().toLowerCase();
  const schemeMarital = (scheme.marital_status_required || 'All').trim().toLowerCase();

  const userWorkSector = (user.work_sector || '').trim().toLowerCase();
  const schemeOcc = (scheme.occupation_required || 'All').trim().toLowerCase();

  const userEmployment = (user.employment_status || '').trim().toLowerCase();
  const schemeEmployment = (scheme.employment_status_required || 'All').trim().toLowerCase();

  const isBpl = (user.bpl_card || '').toLowerCase() === 'yes' || userIncome <= 100000;
  const schemeBpl = (scheme.bpl_required || 'All').trim().toLowerCase();

  const reasons = [];

  // 1. Role condition
  let roleMatched = false;
  if (normSchemeRole === 'all') {
    roleMatched = true;
    reasons.push('Open to all citizen categories');
  } else if (normSchemeRole === normUserRole) {
    roleMatched = true;
    reasons.push(`Selected identity directly matches scheme role: ${user.role}`);
  } else if (normUserRole === 'student' && normSchemeRole.includes('student')) {
    roleMatched = true;
    reasons.push('Matches student education scholarship category');
  } else if (normUserRole === 'women' && normSchemeRole.includes('women')) {
    roleMatched = true;
    reasons.push('Matches women welfare programme criteria');
  } else if (normUserRole === 'disabled' && (normSchemeRole.includes('disabled') || normSchemeRole.includes('differently'))) {
    roleMatched = true;
    reasons.push('Matches differently-abled welfare category');
  } else if (normUserRole === 'farmer' && normSchemeRole.includes('farmer')) {
    roleMatched = true;
    reasons.push('Matches agriculture & farming welfare scheme');
  } else if (normUserRole === 'unemployed' && normSchemeRole.includes('unemployed')) {
    roleMatched = true;
    reasons.push('Matches employment generation & unemployment aid criteria');
  } else if (normUserRole === 'senior citizen' && normSchemeRole.includes('senior')) {
    roleMatched = true;
    reasons.push('Matches senior citizen pension & welfare criteria');
  } else if (normUserRole === 'worker' && normSchemeRole.includes('worker')) {
    roleMatched = true;
    reasons.push('Matches unorganized/construction worker social security criteria');
  } else if (normUserRole === 'child / minor' && (normSchemeRole.includes('child') || normSchemeRole.includes('minor'))) {
    roleMatched = true;
    reasons.push('Matches child & minor welfare grant criteria');
  } else if (normUserRole === 'entrepreneur / self-employed' && (normSchemeRole.includes('entrepreneur') || normSchemeRole.includes('self-employed'))) {
    roleMatched = true;
    reasons.push('Matches MSME & micro-enterprise business finance criteria');
  } else if (normUserRole === 'low-income family' && (normSchemeRole.includes('low-income') || normSchemeRole.includes('low income'))) {
    roleMatched = true;
    reasons.push('Matches low-income / BPL family sustenance scheme');
  } else if (normUserRole === 'widow / single parent' && (normSchemeRole.includes('widow') || normSchemeRole.includes('single parent'))) {
    roleMatched = true;
    reasons.push('Matches widow & single parent social security criteria');
  }

  // Strict: Do not display unrelated schemes as eligible
  if (!roleMatched) return { isEligible: false };

  // Role-specific baseline requirements
  if (normUserRole === 'disabled') {
    if (userDisability < 40) return { isEligible: false };
  }

  if (normUserRole === 'widow / single parent') {
    if (userMarital === 'married' || userMarital === 'unmarried') return { isEligible: false };
  }

  if (normUserRole === 'women') {
    if (userGender && userGender !== 'female') return { isEligible: false };
  }

  // 2. State condition
  let stateMatched = false;
  if (normSchemeState === 'allindia' || normSchemeState === 'all' || !scheme.state) {
    stateMatched = true;
    reasons.push('Applicable across All India');
  } else if (normUserState && (normSchemeState === normUserState || normSchemeState.includes(normUserState) || normUserState.includes(normSchemeState))) {
    stateMatched = true;
    reasons.push(`State residency criteria verified: ${user.state}`);
  }
  if (!stateMatched) return { isEligible: false };

  // 3. Gender condition
  let genderMatched = false;
  const isFemaleScheme = schemeGender === 'female' || schemeGender === 'women' || schemeGender === 'girl' || schemeGender === 'girls';
  const isMaleScheme = schemeGender === 'male' || schemeGender === 'men' || schemeGender === 'boy' || schemeGender === 'boys';
  const isAllGenderScheme = schemeGender === 'all' || schemeGender === 'any' || schemeGender === 'both' || !schemeGender;

  if (isAllGenderScheme) {
    genderMatched = true;
  } else if (isFemaleScheme) {
    if (userGender === 'female') {
      genderMatched = true;
      reasons.push('Meets female candidate eligibility criteria');
    }
  } else if (isMaleScheme) {
    if (userGender === 'male') {
      genderMatched = true;
      reasons.push('Meets male candidate eligibility criteria');
    }
  } else if (userGender && schemeGender === userGender) {
    genderMatched = true;
    reasons.push(`Gender requirement met: ${user.gender}`);
  }
  if (!genderMatched) return { isEligible: false };

  // 4. Social Category condition
  let categoryMatched = false;
  if (schemeCategory === 'all') {
    categoryMatched = true;
  } else if (userCategory && (schemeCategory === userCategory || schemeCategory.includes(userCategory))) {
    categoryMatched = true;
    reasons.push(`Category criteria met: ${user.category}`);
  }
  if (!categoryMatched) return { isEligible: false };

  // 5. Income condition
  if (userIncome > schemeIncomeLimit) {
    return { isEligible: false };
  } else {
    reasons.push(
      schemeIncomeLimit === 9999999 
        ? 'No income ceiling restriction' 
        : `Annual Family Income (₹${userIncome.toLocaleString()}) is within limit (≤ ₹${schemeIncomeLimit.toLocaleString()})`
    );
  }

  // 6. Age condition
  if (userAge !== null) {
    if (userAge < schemeMinAge) return { isEligible: false };
    if (userAge > schemeMaxAge) return { isEligible: false };

    if (normUserRole === 'senior citizen' && userAge < 60) return { isEligible: false };
    if (normUserRole === 'child / minor' && userAge >= 18) return { isEligible: false };

    if (schemeMinAge > 0 || schemeMaxAge < 999) {
      reasons.push(`Age (${userAge} yrs) satisfies qualifying range (${schemeMinAge > 0 ? schemeMinAge : 0} to ${schemeMaxAge < 999 ? schemeMaxAge : 'No limit'} yrs)`);
    }
  } else {
    // If age is mandatory for Senior Citizen or Child / Minor
    if (normUserRole === 'senior citizen' && schemeMinAge >= 60) {
      // Must not pass if profile indicates not senior
    }
  }

  // 7. Education condition
  if (schemeEdu !== 'all' && schemeEdu !== 'none' && schemeEdu !== '') {
    if (userEdu) {
      const matchLevel = userEdu.includes(schemeEdu) || schemeEdu.includes(userEdu) ||
        (schemeEdu === 'undergraduate' && (userEdu.includes('degree') || userEdu.includes('college') || userEdu.includes('undergraduate') || userEdu.includes('diploma'))) ||
        (schemeEdu === 'college' && (userEdu.includes('degree') || userEdu.includes('college') || userEdu.includes('undergraduate') || userEdu.includes('postgraduate'))) ||
        (schemeEdu === 'diploma' && (userEdu.includes('diploma') || userEdu.includes('college') || userEdu.includes('undergraduate'))) ||
        (schemeEdu === 'postgraduate' && (userEdu.includes('postgraduate') || userEdu.includes('master'))) ||
        (schemeEdu === 'school' && userEdu.includes('school'));
      if (!matchLevel) return { isEligible: false };
      reasons.push(`Current education level (${user.education_level}) satisfies course requirements`);
    }
  }

  // 8. Disability Percentage condition
  if (schemeDisabilityMin > 0) {
    if (userDisability < schemeDisabilityMin) return { isEligible: false };
    reasons.push(`Certified disability (${userDisability}%) meets mandatory minimum (${schemeDisabilityMin}%)`);
  }

  // 9. Land Area / Landholding condition (Farmer)
  if (normUserRole === 'farmer') {
    if (schemeMaxLand < 999999 && userLandArea > schemeMaxLand) return { isEligible: false };
    if (schemeLandStatus !== 'all') {
      if (schemeLandStatus.includes('landowner') && userLandStatus.includes('landless')) {
        return { isEligible: false };
      }
    }
    if (userLandArea > 0) {
      reasons.push(`Cultivable land area (${userLandArea} acres) is within small/marginal limits`);
    } else if (userLandStatus) {
      reasons.push(`Land status: ${user.land_status}`);
    }
  }

  // 10. Marital Status condition (Widow / Single Parent / Women)
  if (schemeMarital !== 'all' && schemeMarital !== '') {
    if (userMarital) {
      if (schemeMarital.includes('widow') && !userMarital.includes('widow') && !userMarital.includes('single')) {
        return { isEligible: false };
      }
      reasons.push(`Marital status requirement verified: ${user.marital_status}`);
    }
  }

  // 11. BPL / Low-Income Card condition
  if (schemeBpl === 'yes') {
    if (!isBpl) return { isEligible: false };
    reasons.push('Below Poverty Line (BPL) / Priority Ration Card holder verified');
  }

  // 12. Occupation / Work Sector condition
  if (schemeOcc !== 'all' && schemeOcc !== '') {
    if (userWorkSector && !userWorkSector.includes(schemeOcc) && !schemeOcc.includes(userWorkSector)) {
      return { isEligible: false };
    }
    if (userWorkSector) {
      reasons.push(`Worker sector verified: ${user.work_sector}`);
    }
  }

  // 13. Employment status condition
  if (schemeEmployment === 'unemployed') {
    if (userEmployment && userEmployment !== 'unemployed' && userEmployment !== 'job seeker') {
      return { isEligible: false };
    }
    reasons.push('Unemployed job seeker status verified');
  }

  return { isEligible: true, reasons };
};

// Filter Engine Endpoint (Uses Logged-in User Profile)
app.get('/api/schemes/eligible', authenticateUser, (req, res) => {
  db.get(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`, [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (!user || !user.role) {
      return res.status(400).json({ 
        message: 'Please complete your profile first by selecting your role and details.',
        schemes: [],
        totalAvailable: 0
      });
    }

    db.all('SELECT * FROM schemes', [], (err, schemes) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });

      const eligibleSchemes = [];

      for (const scheme of schemes) {
        const result = evaluateSchemeEligibility(user, scheme);
        if (result.isEligible) {
          eligibleSchemes.push({
            ...scheme,
            eligibility_reasons: result.reasons,
            benefits: scheme.benefits || 'Financial assistance & government subsidies as per official guidelines.',
            important_conditions: scheme.important_conditions || `Role: ${scheme.target_role} | Income Limit: ${scheme.income_limit === 9999999 ? 'No limit' : '₹' + scheme.income_limit.toLocaleString()} | State: ${scheme.state}`
          });
        }
      }

      res.json({
        user: {
          name: user.name,
          role: user.role,
          gender: user.gender,
          state: user.state,
          category: user.category,
          income: user.income
        },
        schemes: eligibleSchemes,
        totalAvailable: schemes.length,
        eligibleCount: eligibleSchemes.length,
        message: eligibleSchemes.length === 0 ? 'No eligible schemes found based on the information provided.' : undefined
      });
    });
  });
});

// Direct Check Endpoint (Allows Testing Any Profile / Role combination on-the-fly)
app.post('/api/schemes/check', (req, res) => {
  const profile = req.body;
  if (!profile || !profile.role) {
    return res.status(400).json({ message: 'Please select a role to evaluate eligibility' });
  }

  db.all('SELECT * FROM schemes', [], (err, schemes) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });

    const eligibleSchemes = [];

    for (const scheme of schemes) {
      const result = evaluateSchemeEligibility(profile, scheme);
      if (result.isEligible) {
        eligibleSchemes.push({
          ...scheme,
          eligibility_reasons: result.reasons,
          benefits: scheme.benefits || 'Financial assistance & government subsidies as per official guidelines.',
          important_conditions: scheme.important_conditions || `Role: ${scheme.target_role} | Income Limit: ${scheme.income_limit === 9999999 ? 'No limit' : '₹' + scheme.income_limit.toLocaleString()} | State: ${scheme.state}`
        });
      }
    }

    res.json({
      schemes: eligibleSchemes,
      totalAvailable: schemes.length,
      eligibleCount: eligibleSchemes.length,
      message: eligibleSchemes.length === 0 ? 'No eligible schemes found based on the information provided.' : undefined
    });
  });
});

// Express error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err.stack || err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// Process-level crash prevention
process.on('uncaughtException', (err) => {
  console.error('Process Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Process Unhandled Rejection:', reason);
});

// Start server on port 5001 (avoids collisions with port 5000)
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is in use. Please check running processes.`);
  } else {
    console.error('Server error:', err);
  }
});


