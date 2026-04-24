require('dotenv').config();
const express = require('express');
const session = require('express-session');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const TEAM_PASSWORD = process.env.TEAM_PASSWORD || 'itsee2026';

const dbPath = process.env.DB_PATH || path.join(__dirname, 'db', 'projects.sqlite');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    requested_by TEXT,
    link_to_brief TEXT,
    owner TEXT,
    eta TEXT,
    status TEXT DEFAULT 'Pending',
    effort TEXT,
    market_albi TEXT,
    market_maks TEXT,
    market_ro TEXT,
    market_it TEXT,
    market_bg TEXT,
    market_rs TEXT,
    market_hr TEXT,
    market_me TEXT,
    market_md TEXT,
    market_ba TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS votes (
    project_id INTEGER NOT NULL,
    voter_id TEXT NOT NULL,
    PRIMARY KEY (project_id, voter_id)
  );

  CREATE TABLE IF NOT EXISTS seeded (
    id INTEGER PRIMARY KEY
  );
`);

const INITIAL_PROJECTS = [
  { name: "GMO Tracker – Partner AM Mapping", description: "Map partners to Account Managers in GMO tracker for ownership visibility and escalation routing", requested_by: "Albi", owner: null, status: "Completed", effort: "Low", market_albi: "Mid", market_maks: "High" },
  { name: "Partner Dashboard Standardisation Framework", description: "Consistent format for partner-facing WBR/MBR dashboards with metric and granularity rules", requested_by: "Albi", owner: null, status: null, effort: "Mid", market_albi: "High", market_maks: null },
  { name: "Masterplan KPI Dashboard", description: "Dashboard tracking all Masterplan KPIs with real-time progress and per-country view", requested_by: "Albi", owner: "Damian Kofman", status: "Assigned", effort: "High", market_albi: "High", market_maks: null },
  { name: "AI Capability Programme – Team Training & Hackathon", description: "Structured AI training + hackathon for broader team", requested_by: "Albi", owner: null, status: null, effort: "Mid", market_albi: "High", market_maks: null },
  { name: "Daily Uptime Digest – Account Managers", description: "Automated daily alert for SAIDs that missed check-ins with AI summary and AM action priorities", requested_by: "Maks", owner: "Damian Kofman", status: "Assigned", effort: "Mid", market_albi: "High", market_maks: null },
  { name: "Daily Uptime Digest – External Partners", description: "Automated daily notification to external partners for SAIDs that failed check-ins", requested_by: "Maks", owner: null, status: null, effort: "Mid", market_albi: "High", market_maks: null },
  { name: "Partner MBR Self-Service Dashboard", description: "Single-input dashboard: AM enters store name, gets 360° view of growth/ops/promotions/new users", requested_by: "Damian", owner: null, status: null, effort: "Mid", market_albi: "High", market_maks: null },
  { name: "AI MBR Auto-Builder", description: "Generates draft MBR decks from Country MBR, Masterplan, and Superdoc; optional P&L module", requested_by: "Albi", owner: "Damian Kofman", status: "Assigned", effort: "Mid", market_albi: "High", market_maks: null },
  { name: "AI WBR Slide Generator – QC Markets", description: "Converts Masterplan gaps into first-draft WBR slide per country; reduces prep time", requested_by: "Albi", owner: null, status: null, effort: "Mid", market_albi: "High", market_maks: null },
  { name: "AI WBR Cross-Market Summary – ITSEE", description: "Aggregates QC WBR slides into single ITSEE-level summary, benchmarks vs Masterplan", requested_by: "Albi", owner: null, status: null, effort: "Mid", market_albi: "High", market_maks: null },
  { name: "Retail Coverage Map by Vertical", description: "Overview of retail partner coverage by vertical at country and city level", requested_by: "Albi", owner: null, status: null, effort: "Mid", market_albi: "Mid", market_maks: null },
  { name: "Brand Ads Insights & Collateral Production", description: "Market-ready deliverables for media agencies: insight decks, event presentations, DTS study outputs", requested_by: "Albi", owner: null, status: null, effort: "Mid", market_albi: "Mid", market_maks: null },
  { name: "Brand Ads Marketing Roadmap", description: "Narrative and content strategy to establish credibility in advertising market", requested_by: "Albi", owner: null, status: null, effort: "High", market_albi: "Mid", market_maks: null },
  { name: "Invoice Reconciliation & Discrepancy Analyzer", description: "Matches invoices at order level, generates mismatch report; priority use case: Bingo", requested_by: "Albi", owner: null, status: null, effort: "Mid", market_albi: "High", market_maks: null },
  { name: "GMO Tracker V2 – Enhanced AM Mapping", description: "Second iteration of partner-to-AM mapping with V1 feedback incorporated", requested_by: "Albi", owner: "Damian Kofman", status: "Assigned", effort: "Mid", market_albi: "Mid", market_maks: null },
  { name: "POVF Coverage Tracker by Partner", description: "Tracks SAIDs missing POVFs and flags new SAIDs from existing POVF partners", requested_by: "Fra", owner: null, status: null, effort: "Mid", market_albi: "Mid", market_maks: null },
  { name: "Actionable Uptime Report", description: "Replaces raw uptime data with issue-focused view surfacing specific blockers", requested_by: "Albi", owner: null, status: null, effort: "Mid", market_albi: "Mid", market_maks: null },
  { name: "PACM & Take Rate Variance Analyzer", description: "Diagnoses PACM and take rate deviations vs Business Plan by mix effects and rate changes", requested_by: "Albi", owner: null, status: null, effort: "Mid", market_albi: "Mid", market_maks: null },
  { name: "AI Content Gap Detector – Top CVR SKUs", description: "AI agent auditing catalogue coverage for high-CVR SKUs by country and category", requested_by: "Albi", owner: null, status: null, effort: "Mid", market_albi: "Mid", market_maks: null },
  { name: "QC Benchmarking Tool – Penetration & Offering", description: "Benchmarks QC performance across ITSEE countries on penetration and catalogue offering", requested_by: "Albi", owner: null, status: null, effort: "Mid", market_albi: "Mid", market_maks: null },
  { name: "Cancellation & Cost Dashboard", description: "Breakdown of cancellation volume and costs, with retail view and fraud signal indicators", requested_by: "Albi", owner: null, status: null, effort: "Mid", market_albi: "Low", market_maks: null },
  { name: "AI Brand Ads Strategy Advisor (NotebookLM)", description: "NotebookLM-based advisor synthesising market inputs to guide Brand Ads strategy", requested_by: "Albi", owner: null, status: null, effort: "Mid", market_albi: "Low", market_maks: null },
  { name: "Offline vs. Glovo Market Share Comparator", description: "Quantifies relative market potential by cross-referencing offline footprint with Glovo share", requested_by: "Albi", owner: null, status: null, effort: "Mid", market_albi: "Low", market_maks: null },
  { name: "FCF Methodology Review – MFC Focus", description: "Audits FCF calculation methodology; ensures MFC-specific economics are correctly tracked", requested_by: "Albi", owner: null, status: null, effort: "Mid", market_albi: "Low", market_maks: null },
  { name: "Masterplan Completeness Tracker – ITSEE League", description: "Tracks Masterplan completion rates across QC markets with league-table view", requested_by: "Albi", owner: null, status: null, effort: "Mid", market_albi: "Low", market_maks: null },
  { name: "WBR Automation Tool – Multi-Market Rollout", description: "Extends Romania WBR automation to additional ITSEE markets with AI-assisted WBR generation", requested_by: "Albi", owner: null, status: null, effort: "High", market_albi: "Low", market_maks: null },
  { name: "AI QC Strategy Advisor (NotebookLM)", description: "NotebookLM-based advisor synthesising QC market inputs for strategic planning", requested_by: "Albi", owner: null, status: null, effort: "Mid", market_albi: "Low", market_maks: null },
  { name: "Interview Business Case Toolkit – On-the-Fly & AI-Assisted", description: "Two-track BC upgrade: lightweight templates for rapid BCs + AI-friendly format for full BC review", requested_by: "Albi", owner: null, status: null, effort: "Mid", market_albi: "Mid", market_maks: null },
  { name: "Super Doc Coach", description: "AI monthly digest coaching teams on how the Superdoc may not be updated vs best practice", requested_by: "Albi", owner: null, status: null, effort: "Mid", market_albi: "Low", market_maks: null },
  { name: "ITSEE Retail MBR & Meeting", description: "Produce the Retail ITSEE MBR Document + ITSEE Retail Way of Working", requested_by: "Albi", owner: "Damian Kofman", status: "Assigned", effort: "Low", market_albi: "High", market_maks: null },
];

if (!db.prepare('SELECT id FROM seeded WHERE id = 1').get()) {
  const insert = db.prepare(`
    INSERT INTO projects (name, description, requested_by, owner, status, effort, market_albi, market_maks)
    VALUES (@name, @description, @requested_by, @owner, @status, @effort, @market_albi, @market_maks)
  `);
  const insertAll = db.transaction((rows) => { for (const r of rows) insert.run(r); });
  insertAll(INITIAL_PROJECTS);
  db.prepare('INSERT INTO seeded (id) VALUES (1)').run();
  console.log('Database seeded with', INITIAL_PROJECTS.length, 'projects.');
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || uuidv4(),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

const requireAuth = (req, res, next) => {
  if (req.session.authenticated) return next();
  res.status(401).json({ error: 'Unauthorized' });
};

app.post('/api/login', (req, res) => {
  const { name, password } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
  if (password !== TEAM_PASSWORD) return res.status(401).json({ error: 'Invalid password' });
  req.session.authenticated = true;
  req.session.userName = name.trim();
  req.session.voterId = name.trim().toLowerCase().replace(/\s+/g, '_');
  res.json({ success: true, userName: name.trim() });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/me', (req, res) => {
  if (!req.session.authenticated) return res.json({ authenticated: false });
  res.json({ authenticated: true, userName: req.session.userName });
});

app.get('/api/projects', requireAuth, (req, res) => {
  const voterId = req.session.voterId;
  const rows = db.prepare(`
    SELECT p.*,
      COUNT(v.voter_id) as vote_count,
      MAX(CASE WHEN v.voter_id = ? THEN 1 ELSE 0 END) as user_voted,
      GROUP_CONCAT(v.voter_id) as voters_csv
    FROM projects p
    LEFT JOIN votes v ON p.id = v.project_id
    GROUP BY p.id
    ORDER BY vote_count DESC, p.id ASC
  `).all(voterId);
  res.json(rows.map(r => ({ ...r, voters: r.voters_csv ? r.voters_csv.split(',') : [] })));
});

app.post('/api/projects', requireAuth, (req, res) => {
  const {
    name, description, requested_by, link_to_brief, owner, eta, status, effort,
    market_albi, market_maks, market_ro, market_it, market_bg, market_rs,
    market_hr, market_me, market_md, market_ba
  } = req.body;

  if (!name || !name.trim()) return res.status(400).json({ error: 'Project name is required' });

  const result = db.prepare(`
    INSERT INTO projects
      (name, description, requested_by, link_to_brief, owner, eta, status, effort,
       market_albi, market_maks, market_ro, market_it, market_bg, market_rs,
       market_hr, market_me, market_md, market_ba)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    name.trim(), description || null, requested_by || null, link_to_brief || null,
    owner || null, eta || null, status || 'Pending', effort || null,
    market_albi || null, market_maks || null, market_ro || null, market_it || null,
    market_bg || null, market_rs || null, market_hr || null, market_me || null,
    market_md || null, market_ba || null
  );

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
  res.json({ ...project, vote_count: 0, user_voted: 0 });
});

app.put('/api/projects/:id', requireAuth, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid project id' });
    const { name, description, requested_by, link_to_brief, owner, eta, status, effort } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Project name is required' });

    db.prepare(`
      UPDATE projects SET
        name=?, description=?, requested_by=?, link_to_brief=?,
        owner=?, eta=?, status=?, effort=?
      WHERE id=?
    `).run(
      name.trim(), description || null, requested_by || null, link_to_brief || null,
      owner || null, eta || null, status || 'Pending', effort || null, id
    );

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json(project);
  } catch (err) {
    console.error('PUT /api/projects/:id error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.delete('/api/projects/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid project id' });
  db.prepare('DELETE FROM votes WHERE project_id = ?').run(id);
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  res.json({ success: true });
});

app.post('/api/projects/:id/vote', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid project id' });
  const voterId = req.session.voterId;

  const existing = db.prepare('SELECT 1 FROM votes WHERE project_id = ? AND voter_id = ?').get(id, voterId);
  if (existing) {
    db.prepare('DELETE FROM votes WHERE project_id = ? AND voter_id = ?').run(id, voterId);
  } else {
    db.prepare('INSERT OR IGNORE INTO votes (project_id, voter_id) VALUES (?, ?)').run(id, voterId);
  }

  const vote_count = db.prepare('SELECT COUNT(*) as count FROM votes WHERE project_id = ?').get(id).count;
  const voters = db.prepare('SELECT voter_id FROM votes WHERE project_id = ?').all(id).map(r => r.voter_id);
  res.json({ voted: !existing, vote_count, voters });
});

app.get('/api/projects/:id/voters', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const voters = db.prepare('SELECT voter_id FROM votes WHERE project_id = ?').all(id).map(r => r.voter_id);
  res.json(voters);
});

app.listen(PORT, () => {
  console.log(`\n  ITSEE Projects running at http://localhost:${PORT}\n`);
});
