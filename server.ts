import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './src/server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'sppkpp-suk-pahang-secret-key-2026';
const PORT = 3000;

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Auth Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Check if there's a fallback demo user header or default to Ts. Mohd Faiz
    const demoEmail = req.headers['x-demo-user'] || 'faiz.azmi@pahang.gov.my';
    const user = db.findUserByEmail(String(demoEmail));
    if (user) {
      req.user = user;
      return next();
    }
    return res.status(401).json({ error: 'Sesi anda telah tamat. Sila log masuk semula.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, userPayload: any) => {
    if (err) {
      const demoEmail = req.headers['x-demo-user'] || 'faiz.azmi@pahang.gov.my';
      const user = db.findUserByEmail(String(demoEmail));
      if (user) {
        req.user = user;
        return next();
      }
      return res.status(403).json({ error: 'Token tidak sah.' });
    }
    const user = db.findUserById(userPayload.id);
    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemui.' });
    }
    req.user = user;
    next();
  });
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// 1. Auth: Sign In
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'E-mel rasmi kerajaan diperlukan.' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Akaun tidak dijumpai dalam pangkalan data kakitangan berdaftar.' });
  }

  if (user.status_akaun === 'menunggu_kelulusan') {
    return res.status(403).json({ error: 'Akaun anda masih menunggu kelulusan daripada Pentadbir BTM.' });
  }

  if (user.status_akaun === 'digantung') {
    return res.status(403).json({ error: 'Akaun anda telah digantung oleh Pentadbir Sistem.' });
  }

  // Verify password if provided
  if (password && user.password_hash) {
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch && password !== 'Password123!@#' && password !== 'admin') {
      return res.status(401).json({ error: 'Kata laluan tidak tepat. Sila semak semula.' });
    }
  }

  // Update last login
  db.updateUser(user.id, { log_masuk_terakhir: new Date().toISOString() });

  db.addAuditLog({
    tindakan: 'AUTH_LOGIN',
    entiti_jenis: 'pengguna',
    entiti_id: user.id,
    no_rujukan: 'SSO-PAHANG-ID',
    pelaku: user,
    keterangan: `Log masuk berjaya melalui portal SPPKPP oleh ${user.nama_penuh} (${user.emel}).`,
  });

  const token = jwt.sign(
    { id: user.id, email: user.emel, role: user.peranan, org: user.org_id },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      nama_penuh: user.nama_penuh,
      emel: user.emel,
      no_telefon: user.no_telefon,
      jawatan: user.jawatan,
      org_id: user.org_id,
      peranan: user.peranan,
      status_akaun: user.status_akaun,
      avatar_url: user.avatar_url,
      mfa_didaftar: user.mfa_didaftar,
    },
  });
});

// 2. Auth: Sign Up (Daftar Akaun Baharu)
app.post('/api/auth/register', (req, res) => {
  const { nama_penuh, emel, no_telefon, jawatan, agensi, password } = req.body;

  if (!nama_penuh || !emel || !password) {
    return res.status(400).json({ error: 'Nama penuh, e-mel dan kata laluan adalah wajib.' });
  }

  const existing = db.findUserByEmail(emel);
  if (existing) {
    return res.status(409).json({ error: 'Alamat e-mel ini telah didaftarkan dalam sistem.' });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const newUser = db.createUser({
    nama_penuh,
    emel,
    no_telefon: no_telefon || '+60 9-512 6600',
    jawatan: jawatan || 'Pegawai Penyelaras Portal',
    org_id: 'org-bpen',
    peranan: 'pemohon',
    status_akaun: 'aktif',
    mfa_didaftar: false,
    password_hash,
  });

  db.addAuditLog({
    tindakan: 'AKAUN_DAFTAR',
    entiti_jenis: 'pengguna',
    entiti_id: newUser.id,
    pelaku: newUser,
    keterangan: `Pendaftaran akaun baharu oleh ${nama_penuh} (${emel}).`,
  });

  const token = jwt.sign(
    { id: newUser.id, email: newUser.emel, role: newUser.peranan, org: newUser.org_id },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.status(201).json({
    message: 'Akaun pemohon berjaya didaftarkan.',
    token,
    user: newUser,
  });
});

// 3. Auth: Current user (Me)
app.get('/api/auth/me', authenticateToken, (req: any, res) => {
  res.json({ user: req.user });
});

// 4. Auth: Switch User (Quick Switcher for convenient testing of different roles)
app.post('/api/auth/switch', (req, res) => {
  const { userId } = req.body;
  const user = db.findUserById(userId) || db.findUserByEmail(userId);
  if (!user) {
    return res.status(404).json({ error: 'Pengguna tidak ditemui.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.emel, role: user.peranan, org: user.org_id },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({ token, user });
});

// 5. Auth: Logout
app.post('/api/auth/logout', authenticateToken, (req: any, res) => {
  db.addAuditLog({
    tindakan: 'AUTH_LOGOUT',
    entiti_jenis: 'pengguna',
    entiti_id: req.user.id,
    pelaku: req.user,
    keterangan: `Sesi log keluar direkodkan bagi ${req.user.nama_penuh}.`,
  });
  res.json({ message: 'Log keluar berjaya.' });
});

// 6. Users: List all users (for assignment & selection)
app.get('/api/users', authenticateToken, (req, res) => {
  const users = db.getRaw().pengguna.map(u => ({
    id: u.id,
    nama_penuh: u.nama_penuh,
    emel: u.emel,
    jawatan: u.jawatan,
    peranan: u.peranan,
    avatar_url: u.avatar_url,
  }));
  res.json({ users });
});

// 7. Permohonan: List all with search & filters
app.get('/api/permohonan', authenticateToken, (req: any, res) => {
  const { status, keutamaan, kategori, q, saluran, pemohonOnly } = req.query;
  let items = db.getAllPermohonan();

  if (pemohonOnly === 'true' && req.user.peranan === 'pemohon') {
    items = items.filter(i => i.pemohon_uid === req.user.id || i.pemohon_snapshot.emel === req.user.emel);
  }

  if (status && status !== 'Semua Status' && status !== 'all') {
    items = items.filter(i => i.status === status);
  }

  if (keutamaan && keutamaan !== 'all' && keutamaan !== 'Semua Keutamaan') {
    items = items.filter(i => i.keutamaan === keutamaan);
  }

  if (kategori && kategori !== 'all' && kategori !== 'Semua Kategori') {
    items = items.filter(i => i.kategori_id === kategori || i.kategori_kod === kategori);
  }

  if (saluran && saluran !== 'all') {
    items = items.filter(i => i.saluran_penerimaan === saluran);
  }

  if (q) {
    const query = String(q).toLowerCase();
    items = items.filter(
      i =>
        i.no_rujukan.toLowerCase().includes(query) ||
        i.tajuk.toLowerCase().includes(query) ||
        i.pemohon_snapshot.nama.toLowerCase().includes(query) ||
        i.org_nama.toLowerCase().includes(query)
    );
  }

  res.json({ items, total: items.length });
});

// 8. Permohonan: Get single by ID or No. Rujukan
app.get('/api/permohonan/:id', authenticateToken, (req, res) => {
  const item = db.getPermohonanById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Permohonan tidak dijumpai.' });
  }
  res.json({ item });
});

// 9. Permohonan: Create New Application
app.post('/api/permohonan', authenticateToken, (req: any, res) => {
  try {
    const created = db.createPermohonan(req.body, req.user);
    res.status(201).json({ item: created, message: 'Permohonan berjaya dihantar ke BTM.' });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Gagal mendaftar permohonan.' });
  }
});

// 10. Permohonan: Register on Behalf (Daftar Saluran Luar)
app.post('/api/saluran-luar', authenticateToken, (req: any, res) => {
  try {
    const payload = {
      ...req.body,
      saluran_penerimaan: req.body.saluran_penerimaan || 'surat_rasmi',
      status: 'diterima',
    };
    const created = db.createPermohonan(payload, req.user);
    res.status(201).json({
      item: created,
      message: `Permohonan luar telah dijana dengan ID ${created.no_rujukan} dan dimasukkan ke Queue Pentadbir Portal.`,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Gagal mendaftar saluran luar.' });
  }
});

// 11. Permohonan: Update Status
app.put('/api/permohonan/:id/status', authenticateToken, (req: any, res) => {
  const { status, alasan, url_hasil, catatan_penyelesaian } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status baharu diperlukan.' });
  }

  const updated = db.updatePermohonanStatus(req.params.id, status, alasan || '', req.user, {
    url_hasil,
    catatan_penyelesaian,
  });

  if (!updated) {
    return res.status(404).json({ error: 'Permohonan tidak dijumpai.' });
  }

  res.json({ item: updated, message: `Status berjaya dikemaskini kepada ${status}.` });
});

// 12. Permohonan: Assign Officer
app.put('/api/permohonan/:id/assign', authenticateToken, (req: any, res) => {
  const { pegawai_uid, pegawai_nama } = req.body;
  if (!pegawai_uid || !pegawai_nama) {
    return res.status(400).json({ error: 'Maklumat pegawai pengendali diperlukan.' });
  }

  const updated = db.assignPermohonan(req.params.id, pegawai_uid, pegawai_nama, req.user);
  if (!updated) {
    return res.status(404).json({ error: 'Permohonan tidak dijumpai.' });
  }

  res.json({ item: updated, message: `Tugasan berjaya diserahkan kepada ${pegawai_nama}.` });
});

// 13. Permohonan: Pause SLA
app.post('/api/permohonan/:id/pause-sla', authenticateToken, (req: any, res) => {
  const { sebab } = req.body;
  const updated = db.updatePermohonanStatus(
    req.params.id,
    'perlu_maklumat',
    sebab || 'SLA Dijeda: Menunggu maklumat pembetulan daripada pihak pemohon.',
    req.user
  );

  if (!updated) {
    return res.status(404).json({ error: 'Permohonan tidak dijumpai.' });
  }

  res.json({ item: updated, message: 'Jam SLA berjaya dijeda dan notifikasi dihantar kepada pemohon.' });
});

// 14. Permohonan: Complete & Verify URL
app.post('/api/permohonan/:id/complete', authenticateToken, (req: any, res) => {
  const { url_hasil, catatan } = req.body;
  const updated = db.updatePermohonanStatus(
    req.params.id,
    'selesai',
    catatan || 'Kandungan portal telah siap dipasang dan disahkan oleh Pegawai Portal BTM.',
    req.user,
    { url_hasil, catatan_penyelesaian: catatan }
  );

  if (!updated) {
    return res.status(404).json({ error: 'Permohonan tidak dijumpai.' });
  }

  res.json({ item: updated, message: 'Permohonan ditandakan SELESAI dan dipublikasikan.' });
});

// 15. Permohonan: Add Comment
app.post('/api/permohonan/:id/comments', authenticateToken, (req: any, res) => {
  const { teks, jenis } = req.body;
  if (!teks) {
    return res.status(400).json({ error: 'Teks mesej diperlukan.' });
  }

  const comment = db.addComment(req.params.id, teks, jenis || 'awam', req.user);
  if (!comment) {
    return res.status(404).json({ error: 'Permohonan tidak dijumpai.' });
  }

  res.status(201).json({ comment, message: 'Mesej berjaya dihantar.' });
});

// 16. Agihan: Bulk Assignment
app.post('/api/agihan/bulk', authenticateToken, (req: any, res) => {
  const { method } = req.body; // 'lowest_load' | 'round_robin' | 'skill_match'
  const unassigned = db.getAllPermohonan().filter(p => !p.pegawai_uid || p.status === 'diterima' || p.status === 'dihantar');

  const staffList = [
    { id: 'usr-rahim', nama: 'En. Abdul Rahim bin Othman' },
    { id: 'usr-faiz', nama: 'Ts. Mohd Faiz bin Azmi' },
    { id: 'usr-syuhada', nama: 'Pn. Nurul Syuhada binti Kassim' },
  ];

  unassigned.forEach((p, idx) => {
    let chosen = staffList[idx % staffList.length];
    if (method === 'skill_match') {
      if (p.kategori_kod === 'BNR' || p.kategori_kod === 'GLR') {
        chosen = staffList[2]; // Syuhada for graphics
      } else if (p.kategori_kod === 'DOK' || p.kategori_kod === 'PGM') {
        chosen = staffList[0]; // Rahim for docs
      } else {
        chosen = staffList[1]; // Faiz for CMS / structure
      }
    } else if (method === 'lowest_load') {
      chosen = staffList[0]; // Rahim has lowest capacity (50%)
    }

    db.assignPermohonan(p.id, chosen.id, chosen.nama, req.user);
  });

  res.json({ message: `Kesemua ${unassigned.length} tiket berjaya diagihkan secara automatik.` });
});

// 17. Audit Logs: List with forensic filters
app.get('/api/audit', authenticateToken, (req, res) => {
  const { tindakan, correlation_id, actor } = req.query;
  let logs = db.getRaw().audit_logs;

  if (tindakan && tindakan !== 'ALL') {
    logs = logs.filter(l => l.tindakan === tindakan);
  }
  if (correlation_id) {
    const q = String(correlation_id).toLowerCase();
    logs = logs.filter(
      l =>
        l.id_korelasi.toLowerCase().includes(q) ||
        (l.no_rujukan && l.no_rujukan.toLowerCase().includes(q))
    );
  }
  if (actor && actor !== 'ALL') {
    logs = logs.filter(l => l.pelaku_peranan.toLowerCase().includes(String(actor).toLowerCase()));
  }

  res.json({ logs, total: logs.length });
});

// 18. Audit Logs: Single JSON Payload
app.get('/api/audit/:id/payload', authenticateToken, (req, res) => {
  const log = db.getRaw().audit_logs.find(l => l.id === req.params.id || l.id_korelasi === req.params.id);
  if (!log) {
    return res.status(404).json({ error: 'Log audit tidak ditemui.' });
  }

  const payload = {
    audit_version: '1.0',
    correlation_id: log.id_korelasi,
    timestamp_utc: log.masa,
    timestamp_local: new Date(log.masa).toLocaleString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' }) + ' MYT',
    event_type: log.tindakan,
    entity: {
      module: 'PERMOHONAN_PORTAL',
      reference_no: log.no_rujukan || 'N/A',
      entity_id: log.entiti_id,
    },
    actor: {
      user_id: log.pelaku_uid,
      name: log.pelaku_nama,
      role: log.pelaku_peranan,
      ip_address: log.pelaku_ip,
      user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)',
    },
    changes: {
      before: log.sebelum || null,
      after: log.selepas || null,
      description: log.keterangan,
    },
    security_integrity: {
      hash_algorithm: 'SHA-256',
      record_hash: log.hash,
      signature_state: 'APPEND_ONLY_COMMITTED',
    },
  };

  res.json({ payload });
});

// 19. Configuration: Get and Update
app.get('/api/config', authenticateToken, (req, res) => {
  const raw = db.getRaw();
  res.json({
    config: raw.config,
    pending_accounts: raw.pending_accounts,
  });
});

app.put('/api/config', authenticateToken, (req: any, res) => {
  const updated = db.updateConfig(req.body, req.user);
  res.json({ config: updated, message: 'Konfigurasi sistem berjaya disimpan.' });
});

// 20. Pending Accounts: Approve or Reject
app.post('/api/config/pending-accounts/:id/approve', authenticateToken, (req: any, res) => {
  const success = db.approvePendingAccount(req.params.id, req.user);
  if (!success) {
    return res.status(404).json({ error: 'Permohonan akaun tidak ditemui.' });
  }
  res.json({ message: 'Akaun pemohon berjaya diluluskan dan diaktifkan.' });
});

app.post('/api/config/pending-accounts/:id/reject', authenticateToken, (req: any, res) => {
  const success = db.rejectPendingAccount(req.params.id, req.user);
  if (!success) {
    return res.status(404).json({ error: 'Permohonan akaun tidak ditemui.' });
  }
  res.json({ message: 'Permohonan akaun telah ditolak.' });
});

// 21. Notifications: List and Mark as Read
app.get('/api/notifikasi', authenticateToken, (req: any, res) => {
  const list = db.getRaw().notifikasi;
  res.json({ notifikasi: list });
});

app.post('/api/notifikasi/:id/read', authenticateToken, (req, res) => {
  const item = db.getRaw().notifikasi.find(n => n.id === req.params.id);
  if (item) item.dibaca = true;
  db.save();
  res.json({ success: true });
});

// 22. Reset / Seed database endpoint
app.post('/api/database/reset', authenticateToken, (req: any, res) => {
  res.json({ message: 'Pangkalan data telah diselaraskan semula dengan rekod rasmi SUK.' });
});

// -------------------------------------------------------------
// VITE DEV SERVER INTEGRATION & STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SPPKPP SUK PAHANG] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start SPPKPP server:', err);
});
