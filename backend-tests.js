/**
 * MediSage Backend E2E Test Suite (P0 + P1)
 * Run with the server started on :5000 — node backend-tests.js
 * Covers: health, auth (validation/brute-limit/profile/refresh/password flows),
 * documents (auth-gate, upload, list, file stream, patch, delete), clinical
 * interaction engine, family vault, FHIR bundle, dashboard aggregates, AI
 * routes, and CORS enforcement.
 */

const BASE = 'http://localhost:5000';
let pass = 0;
let fail = 0;
let fs = null;
let path = null;
const failures = [];

function check(name, cond, extra = '') {
  if (cond) {
    pass++;
    console.log(`  [PASS] ${name}`);
  } else {
    fail++;
    failures.push(name + (extra ? ` (${extra})` : ''));
    console.log(`  [FAIL] ${name} ${extra}`);
  }
}

async function req(method, path, { token, body, headers = {}, expect } = {}) {
  const h = { ...headers };
  if (token) h.Authorization = `Bearer ${token}`;
  if (body && !(body instanceof FormData) && !h['Content-Type']) h['Content-Type'] = 'application/json';
  const res = await fetch(BASE + path, {
    method,
    headers: h,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json, res };
}

async function waitForServer(retries = 20) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(BASE + '/');
      if (r.ok) return r.json();
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  return null;
}

(async () => {
  const health = await waitForServer();
  if (!health) { console.error('Server not reachable on :5000'); process.exit(1); }
  console.log(`Server up — mode: ${health.database}\n`);

  // ---------------- 1. AUTH ----------------
  console.log('== AUTH ==');
  const badReg = await req('POST', '/api/auth/register', { body: { name: 'x', email: 'not-an-email', password: '123' } });
  check('register rejects invalid input (400)', badReg.status === 400, JSON.stringify(badReg.json));

  const stamp = Date.now();
  const email = `testuser${stamp}@medisage.health`;
  const goodReg = await req('POST', '/api/auth/register', {
    body: { name: 'Test User', email, password: 'Test1234', bloodGroup: 'A+ Positive' },
  });
  check('register succeeds (201 + token + user)', goodReg.status === 201 && goodReg.json.token && goodReg.json.user, JSON.stringify(goodReg.json));
  check('public register forces patient role', goodReg.json.user?.role === 'patient');
  let token = goodReg.json.token;
  let refreshToken = goodReg.json.refreshToken;

  const noAuthProfile = await req('GET', '/api/auth/profile');
  check('profile without token -> 401', noAuthProfile.status === 401);

  const profile = await req('GET', '/api/auth/profile', { token });
  check('profile with token returns user', profile.status === 200 && profile.json.email === email);

  const login1 = await req('POST', '/api/auth/login', { body: { email, password: 'Test1234' } });
  check('login returns token + refresh', login1.status === 200 && login1.json.token && login1.json.refreshToken);

  const badLogin = await req('POST', '/api/auth/login', { body: { email, password: 'WrongPass1' } });
  check('wrong password -> 401', badLogin.status === 401);

  // Refresh rotation
  const refreshed = await req('POST', '/api/auth/refresh', { body: { refreshToken } });
  check('refresh issues new access token', refreshed.status === 200 && refreshed.json.token);
  token = refreshed.json.token;
  refreshToken = refreshed.json.refreshToken;

  // Reuse of rotated refresh token should fail (single-use when DB online)
  if (health.database === 'mongodb') {
    const reuse = await req('POST', '/api/auth/refresh', { body: { refreshToken: goodReg.json.refreshToken } });
    check('rotated refresh token rejected (single-use)', reuse.status === 401, JSON.stringify(reuse.json));
  } else {
    console.log('  [SKIP] single-use refresh rotation (requires DB-backed store; local resilient mode skipped)');
  }

  // Change password -> tokenVersion bump + old access rejected (DB mode)
  const chg = await req('PUT', '/api/auth/change-password', {
    token: login1.json.token,
    body: { currentPassword: 'Test1234', newPassword: 'NewPass123' },
  });
  if (health.database === 'mongodb') {
    const oldAccess = await req('GET', '/api/auth/profile', { token: login1.json.token });
    check('access token invalidated after password change', oldAccess.status === 401);
    const relogin = await req('POST', '/api/auth/login', { body: { email, password: 'NewPass123' } });
    check('login with new password', relogin.status === 200);
    token = relogin.json.token;
  } else {
    const relogin = await req('POST', '/api/auth/login', { body: { email, password: 'NewPass123' } });
    check('login with new password (local mode)', relogin.status === 200);
    token = relogin.json.token;
  }

  // Forgot/reset
  const forgot = await req('POST', '/api/auth/forgot-password', { body: { email } });
  check('forgot-password returns neutral ok', forgot.status === 200);
  const forgotUnknown = await req('POST', '/api/auth/forgot-password', { body: { email: 'nobody@nowhere.io' } });
  check('forgot-password for unknown email does not leak (200)', forgotUnknown.status === 200);

  // ---------------- 2. DOCUMENTS ----------------
  console.log('\n== DOCUMENTS ==');
  const extractNoAuth = await req('POST', '/api/documents/extract', { body: { textContent: 'LDL 138 mg/dL' } });
  check('extract requires auth (was public before)', extractNoAuth.status === 401);

  const extractAuth = await req('POST', '/api/documents/extract', {
    token,
    body: { textContent: 'LDL 138 mg/dL, HbA1c 5.8%, Serum Creatinine 1.1 mg/dL' },
  });
  check('extract with auth works', extractAuth.status === 200 && Array.isArray(extractAuth.json.extractedEntities), JSON.stringify(extractAuth.status));

  const fd = new FormData();
  fd.append('title', 'Test Lipid Panel');
  fd.append('documentType', 'lab-report');
  fd.append('doctor', 'Dr. Test');
  fd.append('hospital', 'Test Clinic');
  fd.append('diagnosis', 'Dyslipidemia');
  fd.append('medications', JSON.stringify(['Atorvastatin', 'Telmisartan']));
  fd.append(
    'textContent',
    'LDL 138 mg/dL, Total Cholesterol 215 mg/dL, HDL 54 mg/dL, HbA1c 5.8%'
  );
  fd.append('file', new Blob(['this is a test lab report file'], { type: 'text/plain' }), 'report1.txt');
  const up = await req('POST', '/api/documents/upload', { token, body: fd });
  check('document upload (201)', up.status === 201, JSON.stringify(up.json));
  const doc = up.json?.document;

  check('upload response hides filePath', doc && doc.filePath === undefined);

  const list = await req('GET', '/api/documents', { token });
  check('documents list returns array', list.status === 200 && Array.isArray(list.json));
  check('documents list hides filePath fields', list.status === 200 && Array.isArray(list.json) && list.json.every((d) => d.filePath === undefined || typeof d.filePath !== 'string'));

  // file stream
  if (doc && doc._id) {
    const fileRes = await fetch(BASE + `/api/documents/${doc._id}/file`, { headers: { Authorization: `Bearer ${token}` } });
    const fileText = await fileRes.text();
    check('authenticated file download streams content', fileRes.status === 200 && fileText.includes('test lab report'));

    const fileNoAuth = await fetch(BASE + `/api/documents/${doc._id}/file`);
    check('file download requires auth', fileNoAuth.status === 401);

    const patch = await req('PATCH', `/api/documents/${doc._id}`, {
      token,
      body: { title: 'Test Lipid Panel (corrected)', metadata: { doctor: 'Dr. Corrected' } },
    });
    check('document metadata patch', patch.status === 200 && patch.json.document?.title?.includes('corrected'));

    const del = await req('DELETE', `/api/documents/${doc._id}`, { token });
    check('document delete', del.status === 200);
  }

  // bad upload type rejected
  const fdBad = new FormData();
  fdBad.append('file', new Blob(['MZ...'], { type: 'application/x-msdownload' }), 'virus.exe');
  const badUpload = await req('POST', '/api/documents/upload', { token, body: fdBad });
  check('disallowed file type rejected', badUpload.status === 400, JSON.stringify(badUpload.status));

  // ---------------- 2b. ENCRYPTION AT REST ----------------
  console.log('\n== ENCRYPTION AT REST ==');
  fs = require('fs');
  path = require('path');
  const uploadsDir = path.join(__dirname, 'server', 'uploads');
  const uploadFiles = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).filter((f) => f.endsWith('.txt')) : [];
  if (uploadFiles.length) {
    const newest = uploadFiles
      .map((f) => ({ f, t: fs.statSync(path.join(uploadsDir, f)).mtimeMs }))
      .sort((a, b) => b.t - a.t)[0].f;
    const rawOnDisk = fs.readFileSync(path.join(uploadsDir, newest));
    check('stored file is AES-256-GCM enveloped ("MSV1" magic)', rawOnDisk.subarray(0, 4).toString('ascii') === 'MSV1');
    check('plaintext not stored at rest', !rawOnDisk.toString('utf8').includes('test lab report'));
  } else {
    console.log('  [WARN] no uploads found to inspect');
  }

  // ---------------- 2c. HTTPONLY COOKIE SESSIONS ----------------
  console.log('\n== COOKIE SESSIONS ==');
  // capture Set-Cookie headers from the raw response
  const cookieRegRes = await fetch(BASE + '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Cookie User 2', email: `cookie2${stamp}@medisage.health`, password: 'Test1234' }),
  });
  const setCookies = cookieRegRes.headers.getSetCookie ? cookieRegRes.headers.getSetCookie() : [];
  const sessionCookie = setCookies.find((c) => c.startsWith('medisage_token='));
  const refreshCookie = setCookies.find((c) => c.startsWith('medisage_refresh='));
  check('register sets httpOnly session cookie', Boolean(sessionCookie && sessionCookie.includes('HttpOnly')));
  check('refresh cookie scoped to /api/auth', Boolean(refreshCookie && refreshCookie.toLowerCase().includes('path=/api/auth')));

  // refresh via cookie only (no body token)
  const cookieJar = setCookies.map((c) => c.split(';')[0]).join('; ');
  const refreshByCookie = await fetch(BASE + '/api/auth/refresh', { method: 'POST', headers: { Cookie: cookieJar } });
  const refreshByCookieBody = await refreshByCookie.json().catch(() => null);
  check('refresh works via httpOnly cookie (no body token)', refreshByCookie.status === 200 && Boolean(refreshByCookieBody?.token));

  // auth via cookie only (no Authorization header)
  const cookieOnlyAuth = await fetch(BASE + '/api/auth/profile', { headers: { Cookie: `medisage_token=${refreshByCookieBody.token}` } });
  check('profile accessible with cookie token only', cookieOnlyAuth.status === 200, `status=${cookieOnlyAuth.status}`);

  // ---------------- 2d. AUDIT TRAIL ----------------
  console.log('\n== AUDIT TRAIL ==');
  // generate activity, then read own audit log
  await req('PUT', '/api/auth/change-password', {
    token,
    body: { currentPassword: 'NewPass123', newPassword: 'AuditPass1' },
  });
  const reAfterChange = await req('POST', '/api/auth/login', { body: { email, password: 'AuditPass1' } });
  token = reAfterChange.json.token;

  const auditMe = await req('GET', '/api/audit/me', { token });
  check('self audit log returns entries', auditMe.status === 200 && Array.isArray(auditMe.json.entries) && auditMe.json.entries.length > 0);
  const actions = new Set((auditMe.json?.entries || []).map((e) => e.action));
  check('audit records login + password_changed', actions.has('login') && actions.has('password_changed'), [...actions].slice(0, 6).join(','));
  check('audit entries are hash-chained', (auditMe.json?.entries || []).every((e) => typeof e.hash === 'string' && e.hash.length === 64));
  check('audit never stores passwords', JSON.stringify(auditMe.json?.entries || []).toLowerCase().includes('test1234') === false);

  const auditChainVerifyForbidden = await req('GET', '/api/audit/verify', { token });
  check('chain verification admin-gated (403 for patient)', auditChainVerifyForbidden.status === 403);

  const auditNoAuth = await req('GET', '/api/audit/me');
  check('audit endpoints require auth', auditNoAuth.status === 401);

  // ---------------- 3. CLINICAL ENGINE ----------------
  console.log('\n== CLINICAL INTERACTION ENGINE ==');
  const scan = await req('POST', '/api/clinical/sandbox', {
    token,
    body: { medications: ['Telmisartan', 'Ibuprofen', 'Atorvastatin', 'Atorvastatin'], allergies: ['Penicillin'], egfr: 42 },
  });
  check('sandbox returns alerts', scan.status === 200 && Array.isArray(scan.json.alerts));
  check('flags NSAID+ARB critical interaction', (scan.json.alerts || []).some((a) => a.id === 'INT-002'));
  check('flags statin duplicate', (scan.json.alerts || []).some((a) => a.type === 'duplicate'));
  check('flags metformin/nsaid renal caution', (scan.json.alerts || []).some((a) => a.type === 'condition'));
  check('summary counts correct (1 critical, 1 high renal caution)', scan.json.summary?.critical === 1 && scan.json.summary?.high === 1, JSON.stringify(scan.json.summary));
  console.log('     summary:', JSON.stringify(scan.json?.summary));

  const noAuthScan = await req('POST', '/api/clinical/sandbox', { body: { medications: ['aspirin'] } });
  check('clinical endpoints require auth', noAuthScan.status === 401);

  // ---------------- 4. FAMILY ----------------
  console.log('\n== FAMILY VAULT ==');
  if (health.database === 'mongodb') {
    const fam = await req('POST', '/api/family', {
      token,
      body: { name: 'Miya Vance', relationship: 'spouse', bloodGroup: 'B- Negative', allergies: ['Sulfonamide'] },
    });
    check('family member created', fam.status === 201 && fam.json.member, JSON.stringify(fam.json?.error || fam.status));
    const famList = await req('GET', '/api/family', { token });
    check('family list contains member', famList.status === 200 && famList.json.some((m) => m.name === 'Miya Vance'));
    const famBad = await req('POST', '/api/family', { token, body: { name: 'O', relationship: 'hacker' } });
    check('family validation rejects bad input', famBad.status === 400);
    if (fam.json?.member?._id) {
      const famUpd = await req('PUT', `/api/family/${fam.json.member._id}`, { token, body: { bloodGroup: 'B+ Positive' } });
      check('family member update', famUpd.status === 200);
      const famDel = await req('DELETE', `/api/family/${fam.json.member._id}`, { token });
      check('family member delete', famDel.status === 200);
    }
  } else {
    console.log('  [SKIP] family vault CRUD (requires the database; returns 503 in local mode)');
  }

  // ---------------- 5. DASHBOARD ----------------
  console.log('\n== DASHBOARD ==');
  const stats = await req('GET', '/api/dashboard/stats', { token });
  check('dashboard stats shape', stats.status === 200 && stats.json.totals && Array.isArray(stats.json.latestBiomarkers));
  const trends = await req('GET', '/api/dashboard/trends?range=all', { token });
  check('trends endpoint returns series', trends.status === 200 && Array.isArray(trends.json.series));

  // ---------------- 6. FHIR ----------------
  console.log('\n== FHIR EXPORT ==');
  if (health.database === 'mongodb') {
    // Seed one live document (the earlier upload was deleted in the delete test)
    const fhirFd = new FormData();
    fhirFd.append('title', 'FHIR Seed Panel');
    fhirFd.append('documentType', 'lab-report');
    fhirFd.append('medications', JSON.stringify(['Atorvastatin']));
    fhirFd.append('textContent', 'LDL 121 mg/dL, Total Cholesterol 198 mg/dL, HDL 58 mg/dL');
    fhirFd.append('file', new Blob(['fhir seed report contents'], { type: 'text/plain' }), 'fhir-seed.txt');
    await req('POST', '/api/documents/upload', { token, body: fhirFd });

    const fhir = await req('GET', '/api/fhir/bundle', { token });
    check('fhir bundle is a document Bundle', fhir.status === 200 && fhir.json.resourceType === 'Bundle' && fhir.json.type === 'document');
    const types = new Set((fhir.json?.entry || []).map((e) => e.resource.resourceType));
    check('fhir bundle contains Patient/Observation/MedicationStatement', ['Patient', 'Observation', 'MedicationStatement'].every((t) => types.has(t)), [...types].join(','));
  } else {
    console.log('  [SKIP] FHIR bundle export (requires the database; returns 503 in local mode)');
  }

  // ---------------- 7. AI ----------------
  console.log('\n== AI ==');
  const history = await req('POST', '/api/ai/analyze-history', { token, body: {} });
  check('analyze-history with real user (source recorded)', history.status === 200 && history.json.source);
  console.log('     source:', history.json.source);

  const insurance = await req('POST', '/api/ai/recommend-insurance', { token, body: {} });
  check('insurance matcher returns ranked plans', insurance.status === 200 && insurance.json.plans?.[0].matchScore >= insurance.json.plans[1].matchScore);

  const chat = await req('POST', '/api/ai/chat', { token, body: { messages: [{ role: 'user', content: 'What is my cholesterol?' }] } });
  check('chat companion responds', chat.status === 200 && chat.json.reply);
  console.log('     chat reply:', chat.json.reply?.slice(0, 90));

  const aiNoAuth = await req('POST', '/api/ai/chat', { body: { messages: [{ role: 'user', content: 'hi' }] } });
  check('ai chat requires auth (fixes req.userId bug)', aiNoAuth.status === 401);

  // ---------------- 8. CORS & headers ----------------
  console.log('\n== SECURITY HEADERS ==');
  const corsRes = await fetch(BASE + '/api/auth/profile', {
    headers: { Origin: 'http://evil-origin.com' },
  });
  const corsHeader = corsRes.headers.get('access-control-allow-origin');
  check('CORS blocks non-whitelisted origin', corsHeader !== 'http://evil-origin.com');

  const whitelisted = await fetch(BASE + '/api/dashboard/stats', {
    headers: { Origin: 'http://localhost:5173', Authorization: `Bearer ${token}` },
  });
  check('CORS allows whitelisted origin', whitelisted.headers.get('access-control-allow-origin') === 'http://localhost:5173');
  const xfo = whitelisted.headers.get('x-frame-options');
  check('helmet headers present', Boolean(xfo || whitelisted.headers.get('content-security-policy')));

  // Unknown route
  const unknown = await req('GET', '/api/nope');
  check('unknown API route -> 404 JSON', unknown.status === 404 && unknown.json?.error);

  // ---------------- summary ----------------
  console.log(`\n========================================`);
  console.log(`RESULT: ${pass} passed, ${fail} failed`);
  if (failures.length) {
    console.log('Failures:');
    failures.forEach((f) => console.log('  - ' + f));
    process.exit(1);
  }
  process.exit(0);
})();
