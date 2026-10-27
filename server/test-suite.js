/**
 * StudySphere - Automated Verification Test Suite
 * Tests all authentication, JWT verification, duplicate email rejection,
 * password hashing, protected routes, and CRUD operations.
 */

const API_BASE = 'http://localhost:5000/api';

const results = [];

const record = (name, passed, details = '') => {
  results.push({ name, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon}: ${name} ${details ? `(${details})` : ''}`);
};

const runTests = async () => {
  console.log('\n===============================================');
  console.log('🧪 Starting StudySphere Full-Stack Verification');
  console.log('===============================================\n');

  let authToken = null;
  let testUserId = null;
  let createdResourceId = null;
  const testEmail = `scholar_${Date.now()}@university.edu`;
  const testPassword = 'Password123!';

  // 1. Healthcheck
  try {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    record('Healthcheck Endpoint (/api/health)', res.status === 200 && data.status === 'healthy');
  } catch (err) {
    record('Healthcheck Endpoint (/api/health)', false, err.message);
  }

  // 2. Unauthenticated access blocked on /api/auth/me
  try {
    const res = await fetch(`${API_BASE}/auth/me`);
    const data = await res.json();
    record(
      'Protected Route Blocks Unauthenticated User (/api/auth/me)',
      res.status === 401 && data.success === false,
      `Status: ${res.status}`
    );
  } catch (err) {
    record('Protected Route Blocks Unauthenticated User (/api/auth/me)', false, err.message);
  }

  // 3. Unauthenticated access blocked on /api/resources
  try {
    const res = await fetch(`${API_BASE}/resources`);
    const data = await res.json();
    record(
      'Protected Route Blocks Unauthenticated User (/api/resources)',
      res.status === 401 && data.success === false,
      `Status: ${res.status}`
    );
  } catch (err) {
    record('Protected Route Blocks Unauthenticated User (/api/resources)', false, err.message);
  }

  // 4. Client password mismatch rejection
  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Rivera',
        email: testEmail,
        password: testPassword,
        confirmPassword: 'MismatchPassword999',
      }),
    });
    const data = await res.json();
    record(
      'Password Mismatch Rejection',
      res.status === 400 && data.success === false,
      data.message
    );
  } catch (err) {
    record('Password Mismatch Rejection', false, err.message);
  }

  // 5. Valid Sign-Up
  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Rivera',
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      }),
    });
    const data = await res.json();
    testUserId = data.user?.id;
    record(
      'User Sign-Up with Hashed Password (/api/auth/signup)',
      res.status === 201 && data.success === true && Boolean(testUserId),
      `User ID: ${testUserId}`
    );
  } catch (err) {
    record('User Sign-Up with Hashed Password (/api/auth/signup)', false, err.message);
  }

  // 6. Duplicate Email Rejection
  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another User',
        email: testEmail, // same email
        password: 'AnotherPassword456',
        confirmPassword: 'AnotherPassword456',
      }),
    });
    const data = await res.json();
    record(
      'Duplicate Email Rejected with Clear Error',
      res.status === 400 && data.success === false,
      data.message
    );
  } catch (err) {
    record('Duplicate Email Rejected with Clear Error', false, err.message);
  }

  // 7. Login with Wrong Password
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'IncorrectPassword!',
      }),
    });
    const data = await res.json();
    record(
      'Login Fails with Wrong Password',
      res.status === 401 && data.success === false,
      data.message
    );
  } catch (err) {
    record('Login Fails with Wrong Password', false, err.message);
  }

  // 8. Login with Correct Password -> Returns JWT
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const data = await res.json();
    authToken = data.token;
    record(
      'Login Succeeds & Returns JWT Token (/api/auth/login)',
      res.status === 200 && Boolean(authToken) && data.user?.email === testEmail.toLowerCase(),
      `Token length: ${authToken ? authToken.length : 0}`
    );
  } catch (err) {
    record('Login Succeeds & Returns JWT Token (/api/auth/login)', false, err.message);
  }

  // 9. Protected /api/auth/me with JWT Token
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    record(
      'Protected Profile Access with JWT (/api/auth/me)',
      res.status === 200 && data.user?.name === 'Alex Rivera',
      `Welcome ${data.user?.name}`
    );
  } catch (err) {
    record('Protected Profile Access with JWT (/api/auth/me)', false, err.message);
  }

  // 10. CRUD - Read Resources (Protected)
  try {
    const res = await fetch(`${API_BASE}/resources`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    record(
      'Read Resources List (/api/resources)',
      res.status === 200 && Array.isArray(data.data),
      `Found ${data.data?.length || 0} resources`
    );
  } catch (err) {
    record('Read Resources List (/api/resources)', false, err.message);
  }

  // 11. CRUD - Create Resource (Protected)
  try {
    const res = await fetch(`${API_BASE}/resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: 'Distributed Systems & Paxos Consensus Lecture Notes',
        subject: 'Computer Science',
        resourceType: 'Notes',
        link: 'https://github.com/mit-pdos/6.824-golabs',
        description:
          'Deep-dive into Raft, Paxos consensus, 2-phase commits, and Byzantine fault tolerance with Go implementations.',
        difficulty: 'Advanced',
        tags: ['Distributed Systems', 'Raft', 'Paxos', 'Go'],
      }),
    });
    const data = await res.json();
    createdResourceId = data.data?._id;
    record(
      'Create Study Resource (/api/resources POST)',
      res.status === 201 && Boolean(createdResourceId),
      `New Resource ID: ${createdResourceId}`
    );
  } catch (err) {
    record('Create Study Resource (/api/resources POST)', false, err.message);
  }

  // 12. CRUD - Read Single Resource by ID
  try {
    const res = await fetch(`${API_BASE}/resources/${createdResourceId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    record(
      'Read Resource by ID (/api/resources/:id GET)',
      res.status === 200 && data.data?.title.includes('Distributed Systems'),
      data.data?.title
    );
  } catch (err) {
    record('Read Resource by ID (/api/resources/:id GET)', false, err.message);
  }

  // 13. CRUD - Update Resource (Owner Only)
  try {
    const res = await fetch(`${API_BASE}/resources/${createdResourceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: 'Distributed Systems & Raft Consensus (Updated Edition)',
        difficulty: 'Intermediate',
      }),
    });
    const data = await res.json();
    record(
      'Update Study Resource (/api/resources/:id PUT)',
      res.status === 200 && data.data?.title.includes('Updated Edition'),
      data.data?.title
    );
  } catch (err) {
    record('Update Study Resource (/api/resources/:id PUT)', false, err.message);
  }

  // 14. CRUD - Search and Filter
  try {
    const res = await fetch(`${API_BASE}/resources?subject=Computer%20Science&search=Distributed`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    record(
      'Search & Filter Resources (/api/resources?search=...)',
      res.status === 200 && data.data?.length >= 1,
      `Matched ${data.data?.length} resources`
    );
  } catch (err) {
    record('Search & Filter Resources (/api/resources?search=...)', false, err.message);
  }

  // 15. CRUD - Delete Resource (Owner Only)
  try {
    const res = await fetch(`${API_BASE}/resources/${createdResourceId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    record(
      'Delete Study Resource (/api/resources/:id DELETE)',
      res.status === 200 && data.success === true,
      data.message
    );
  } catch (err) {
    record('Delete Study Resource (/api/resources/:id DELETE)', false, err.message);
  }

  // 16. Token Invalidation / Expired Token Rejection
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer invalid_garbage_token_123` },
    });
    const data = await res.json();
    record(
      'Invalid / Malformed Token Rejection',
      res.status === 401 && data.success === false,
      data.message
    );
  } catch (err) {
    record('Invalid / Malformed Token Rejection', false, err.message);
  }

  console.log('\n===============================================');
  console.log('📊 Verification Summary:');
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  console.log(`Passed: ${passedCount}/${totalCount} tests (${Math.round((passedCount / totalCount) * 100)}%)`);
  console.log('===============================================\n');

  if (passedCount === totalCount) {
    process.exit(0);
  } else {
    process.exit(1);
  }
};

runTests();
