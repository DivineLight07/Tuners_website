// Diagnostic: test the full admin create-user flow over HTTP
// Run with: node scripts/test_create_user.js

const BASE = 'http://localhost:5000';

async function run() {
  // ── Step 1: Login as admin ───────────────────────────────────────────────
  console.log('\n[1] Logging in as admin...');
  const loginRes = await fetch(`${BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@miuegypt.edu.eg',
      password: 'Admin123!'
    })
  });
  const loginData = await loginRes.json();

  if (!loginRes.ok) {
    console.error('❌ Login failed:', loginData);
    return;
  }
  const token = loginData.token;
  console.log('✅ Logged in. Token received.');

  // ── Step 2: Create a test user ───────────────────────────────────────────
  const testEmail = `testuser_${Date.now()}@miuegypt.edu.eg`;
  console.log(`\n[2] Creating test user: ${testEmail}`);

  const createRes = await fetch(`${BASE}/api/v1/auth/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Test User',
      email: testEmail,
      password: 'Test123!',
      universityId: 'TEST001',
      role: 'member'
    })
  });
  const createData = await createRes.json();

  if (!createRes.ok) {
    console.error('❌ Create user failed:', JSON.stringify(createData, null, 2));
    return;
  }
  console.log('✅ User created via API:', JSON.stringify(createData.user, null, 2));

  // ── Step 3: Verify it's in the DB via GET /users ─────────────────────────
  console.log('\n[3] Fetching all users from API...');
  const listRes = await fetch(`${BASE}/api/v1/auth/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const listData = await listRes.json();

  if (!listRes.ok) {
    console.error('❌ Could not list users:', listData);
    return;
  }

  const found = listData.users.find(u => u.email === testEmail);
  if (found) {
    console.log(`✅ New user IS visible in GET /users — total users: ${listData.users.length}`);
  } else {
    console.error(`❌ New user NOT found in GET /users list!`);
  }
}

run().catch(err => console.error('Fatal error:', err.message));
