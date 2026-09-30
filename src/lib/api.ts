export interface User {
  id: string;
  nama_penuh: string;
  emel: string;
  no_telefon: string;
  jawatan: string;
  org_id: string;
  peranan: 'pemohon' | 'pegawai_portal' | 'ketua_seksyen' | 'pengurusan' | 'juruaudit' | 'pentadbir_sistem';
  status_akaun: 'aktif' | 'menunggu_kelulusan' | 'digantung' | 'dinyahaktif';
  mfa_didaftar: boolean;
  avatar_url?: string;
}

export interface Attachment {
  id: string;
  nama_fail: string;
  jenis_mime: string;
  saiz_bait: number;
  saiz_teks: string;
  laluan_storan: string;
  jenis_lampiran: 'sokongan' | 'surat_rasmi' | 'bukti_saluran' | 'hasil';
  dimuat_naik_oleh: string;
  dimuat_naik_pada: string;
  checksum_sha256: string;
  status_imbasan: 'bersih' | 'sedang_imbas' | 'ditolak';
}

export interface CommentItem {
  id: string;
  permohonan_id: string;
  teks: string;
  jenis: 'awam' | 'dalaman';
  penulis_uid: string;
  penulis_nama: string;
  penulis_peranan: string;
  avatar_url?: string;
  dicipta_pada: string;
}

export interface StatusHistoryItem {
  id: string;
  permohonan_id: string;
  dari: string;
  ke: string;
  oleh_uid: string;
  oleh_nama: string;
  oleh_peranan: string;
  catatan: string;
  masa: string;
}

export interface ApplicationItem {
  id: string;
  no_rujukan: string;
  tajuk: string;
  penerangan: string;
  kategori_id: string;
  kategori_kod: string;
  kategori_nama: string;
  jenis_kemaskini: 'tambah' | 'ubah' | 'padam' | 'pembetulan';
  url_halaman: string;
  keutamaan: 'biasa' | 'segera' | 'kritikal';
  tarikh_dikehendaki?: string;
  saluran_penerimaan: 'sistem' | 'surat' | 'emel' | 'whatsapp' | 'telefon' | 'lain';
  rujukan_surat?: string;
  tarikh_surat?: string;
  tarikh_terima: string;
  pemohon_uid: string;
  pemohon_snapshot: {
    nama: string;
    emel: string;
    telefon: string;
    org_id: string;
    org_nama: string;
    jawatan: string;
  };
  didaftar_oleh_uid: string;
  org_id: string;
  org_nama: string;
  status:
    | 'draf'
    | 'dihantar'
    | 'diterima'
    | 'dalam_semakan'
    | 'perlu_maklumat'
    | 'dalam_tindakan'
    | 'menunggu_semakan'
    | 'selesai'
    | 'ditutup'
    | 'ditolak'
    | 'dibatalkan';
  pegawai_uid?: string;
  pegawai_nama?: string;
  tarikh_diterima?: string;
  tarikh_mula_tindakan?: string;
  tarikh_selesai?: string;
  tarikh_ditutup?: string;
  sla_tarikh_akhir?: string;
  sla_baki_teks?: string;
  sla_peratus_tamat?: number;
  sla_dijeda_pada?: string;
  sla_sebab_jeda?: string;
  sla_jumlah_jeda_ms: number;
  lewat: boolean;
  url_hasil?: string;
  catatan_penyelesaian?: string;
  kod_alasan_tolak?: string;
  alasan_tolak?: string;
  bil_lampiran: number;
  bil_komen: number;
  versi: number;
  dipadam: boolean;
  dicipta_pada: string;
  dikemaskini_pada: string;
  lampiran: Attachment[];
  komen: CommentItem[];
  sejarah_status: StatusHistoryItem[];
}

export interface AuditRecord {
  id: string;
  masa: string;
  id_korelasi: string;
  pelaku_uid: string;
  pelaku_nama: string;
  pelaku_peranan: string;
  pelaku_ip: string;
  tindakan: string;
  entiti_jenis: string;
  entiti_id: string;
  no_rujukan?: string;
  sebelum?: any;
  selepas?: any;
  keterangan: string;
  hash: string;
  integriti: 'verified' | 'unverified';
}

export interface NotificationItem {
  id: string;
  penerima_uid: string;
  tajuk: string;
  mesej: string;
  jenis: 'info' | 'peringatan' | 'sla' | 'status';
  pautan?: string;
  permohonan_id?: string;
  dibaca: boolean;
  dicipta_pada: string;
}

export interface SystemConfigData {
  sla_hari_biasa: number;
  sla_hari_segera: number;
  sla_hari_kritikal: number;
  had_saiz_fail_mb: number;
  had_bilangan_fail: number;
  tamat_sesi_minit: number;
  mfa_totp_diwajibkan: boolean;
  waktu_operasi: {
    mula: string;
    tamat: string;
    hari: string;
    auto_tolak_cuti_am: boolean;
  };
  api_gateway: {
    status: 'aktif' | 'tidak_aktif';
    latensi_ms: number;
  };
  beban_pelayan: {
    node: string;
    penggunaan_cpu: string;
    storan_digunakan_gb: number;
    storan_maksimum_tb: number;
  };
}

export interface PendingAccountItem {
  id: string;
  nama_penuh: string;
  no_mykad: string;
  emel: string;
  agensi_jabatan: string;
  bahagian: string;
  peranan_dimohon: string;
  tarikh_mohon: string;
  status: 'menunggu' | 'diluluskan' | 'ditolak';
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('sppkpp_token');
  }

  public setToken(t: string | null) {
    this.token = t;
    if (t) {
      localStorage.setItem('sppkpp_token', t);
    } else {
      localStorage.removeItem('sppkpp_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Ralat komunikasi pelayan.');
    }
    return data;
  }

  // Auth
  async login(email: string, password?: string) {
    const data = await this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(payload: { nama_penuh: string; emel: string; no_telefon?: string; jawatan?: string; agensi?: string; password: string }) {
    const data = await this.request<{ token: string; user: User; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(data.token);
    return data;
  }

  async getCurrentUser() {
    return this.request<{ user: User }>('/api/auth/me');
  }

  async switchUser(userId: string) {
    const data = await this.request<{ token: string; user: User }>('/api/auth/switch', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    this.setToken(data.token);
    return data;
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch {}
    this.setToken(null);
  }

  async getUsers() {
    return this.request<{ users: any[] }>('/api/users');
  }

  // Applications
  async getPermohonanList(params?: { status?: string; keutamaan?: string; kategori?: string; q?: string; saluran?: string; pemohonOnly?: boolean }) {
    const qp = new URLSearchParams();
    if (params?.status) qp.set('status', params.status);
    if (params?.keutamaan) qp.set('keutamaan', params.keutamaan);
    if (params?.kategori) qp.set('kategori', params.kategori);
    if (params?.saluran) qp.set('saluran', params.saluran);
    if (params?.q) qp.set('q', params.q);
    if (params?.pemohonOnly) qp.set('pemohonOnly', 'true');

    return this.request<{ items: ApplicationItem[]; total: number }>(`/api/permohonan?${qp.toString()}`);
  }

  async getPermohonanById(id: string) {
    return this.request<{ item: ApplicationItem }>(`/api/permohonan/${id}`);
  }

  async createPermohonan(payload: Partial<ApplicationItem>) {
    return this.request<{ item: ApplicationItem; message: string }>('/api/permohonan', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async registerExternal(payload: any) {
    return this.request<{ item: ApplicationItem; message: string }>('/api/saluran-luar', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateStatus(id: string, status: string, alasan?: string, extra?: { url_hasil?: string; catatan_penyelesaian?: string }) {
    return this.request<{ item: ApplicationItem; message: string }>(`/api/permohonan/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, alasan, ...extra }),
    });
  }

  async assignOfficer(id: string, pegawai_uid: string, pegawai_nama: string) {
    return this.request<{ item: ApplicationItem; message: string }>(`/api/permohonan/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ pegawai_uid, pegawai_nama }),
    });
  }

  async pauseSla(id: string, sebab: string) {
    return this.request<{ item: ApplicationItem; message: string }>(`/api/permohonan/${id}/pause-sla`, {
      method: 'POST',
      body: JSON.stringify({ sebab }),
    });
  }

  async completeApplication(id: string, url_hasil: string, catatan?: string) {
    return this.request<{ item: ApplicationItem; message: string }>(`/api/permohonan/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ url_hasil, catatan }),
    });
  }

  async addComment(id: string, teks: string, jenis: 'awam' | 'dalaman' = 'awam') {
    return this.request<{ comment: CommentItem; message: string }>(`/api/permohonan/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ teks, jenis }),
    });
  }

  async bulkAssign(method: 'lowest_load' | 'round_robin' | 'skill_match') {
    return this.request<{ message: string }>('/api/agihan/bulk', {
      method: 'POST',
      body: JSON.stringify({ method }),
    });
  }

  // Audit
  async getAuditLogs(params?: { tindakan?: string; correlation_id?: string; actor?: string }) {
    const qp = new URLSearchParams();
    if (params?.tindakan) qp.set('tindakan', params.tindakan);
    if (params?.correlation_id) qp.set('correlation_id', params.correlation_id);
    if (params?.actor) qp.set('actor', params.actor);

    return this.request<{ logs: AuditRecord[]; total: number }>(`/api/audit?${qp.toString()}`);
  }

  async getAuditPayload(id: string) {
    return this.request<{ payload: any }>(`/api/audit/${id}/payload`);
  }

  // Configuration
  async getConfig() {
    return this.request<{ config: SystemConfigData; pending_accounts: PendingAccountItem[] }>('/api/config');
  }

  async updateConfig(payload: Partial<SystemConfigData>) {
    return this.request<{ config: SystemConfigData; message: string }>('/api/config', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async approveAccount(id: string) {
    return this.request<{ message: string }>(`/api/config/pending-accounts/${id}/approve`, {
      method: 'POST',
    });
  }

  async rejectAccount(id: string) {
    return this.request<{ message: string }>(`/api/config/pending-accounts/${id}/reject`, {
      method: 'POST',
    });
  }

  // Notifications
  async getNotifications() {
    return this.request<{ notifikasi: NotificationItem[] }>('/api/notifikasi');
  }

  async markNotificationRead(id: string) {
    return this.request<{ success: boolean }>(`/api/notifikasi/${id}/read`, {
      method: 'POST',
    });
  }
}

export const api = new ApiService();
