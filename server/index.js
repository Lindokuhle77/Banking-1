// Mock aggregator API. Stands in for a real open-banking aggregator. No real bank is contacted.
// Demo-grade security: opaque session tokens, sign-in rate limit, per-user saved connections.
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { institutions, SCOPES, buildConnectionData, demoUser } = require('../shared/mockData');

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

// ---- saved connections (survive server restarts) ----
const DATA_FILE = path.join(__dirname, 'data.json');
let store = { connections: {} };
try { store = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { /* first run */ }
const save = () => {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2)); } catch (e) { console.error('Could not save data:', e.message); }
};
const mine = user => (store.connections[user] = store.connections[user] || []);

// ---- sessions and sign-in ----
const SESSION_MS = 8 * 60 * 60 * 1000;
const sessions = new Map();
const attempts = new Map();
const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

app.post('/auth/login', (req, res) => {
  const now = Date.now();
  let a = attempts.get(req.ip);
  if (!a || a.resetAt < now) { a = { count: 0, resetAt: now + 60000 }; attempts.set(req.ip, a); }
  if (a.count >= 5) return res.status(429).json({ error: 'Too many sign-in attempts. Wait a minute and try again.' });
  const { username, password } = req.body || {};
  const ok = safeEqual(String(username || '').toLowerCase(), demoUser.username) && safeEqual(password || '', demoUser.password);
  if (!ok) { a.count++; return res.status(401).json({ error: 'Username or password is incorrect.' }); }
  attempts.delete(req.ip);
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, { username: demoUser.username, expires: now + SESSION_MS });
  res.json({ token });
});

function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  const s = sessions.get(token);
  if (!s || s.expires < Date.now()) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Your session has expired. Sign in again.' });
  }
  req.user = s.username;
  req.token = token;
  next();
}

app.post('/auth/logout', requireAuth, (req, res) => { sessions.delete(req.token); res.status(204).end(); });

// ---- bank linking ----
const consents = new Map();
let counter = 0;
const wait = ms => new Promise(r => setTimeout(r, ms));

app.get('/institutions', requireAuth, async (req, res) => { await wait(300); res.json(institutions); });

app.get('/connections', requireAuth, (req, res) => res.json(mine(req.user)));

app.post('/links', requireAuth, async (req, res) => {
  await wait(400);
  const inst = institutions.find(i => i.id === (req.body && req.body.institutionId));
  if (!inst) return res.status(404).json({ error: 'We do not support that bank yet.' });
  const consentId = 'consent_' + crypto.randomBytes(6).toString('hex');
  consents.set(consentId, { inst, user: req.user });
  res.json({ consentId, institutionId: inst.id, institutionName: inst.name, scopes: SCOPES, expiresInDays: 90 });
});

app.post('/links/:consentId/approve', requireAuth, async (req, res) => {
  await wait(800);
  const c = consents.get(req.params.consentId);
  if (!c || c.user !== req.user) return res.status(404).json({ error: 'This request has expired. Start again.' });
  consents.delete(req.params.consentId);
  const connection = { id: 'conn_' + Date.now().toString(36) + ++counter, institutionId: c.inst.id, institutionName: c.inst.name, linkedAt: new Date().toISOString() };
  mine(req.user).push(connection);
  save();
  res.json({ connection, data: buildConnectionData(c.inst.id) });
});

app.get('/connections/:id/data', requireAuth, async (req, res) => {
  await wait(600);
  const c = mine(req.user).find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'That bank is no longer connected.' });
  res.json(buildConnectionData(c.institutionId));
});

app.delete('/connections/:id', requireAuth, async (req, res) => {
  await wait(300);
  store.connections[req.user] = mine(req.user).filter(x => x.id !== req.params.id);
  save();
  res.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Khaya mock API running on port ${PORT}`));
