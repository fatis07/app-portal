import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface Organisasi {
  id: string;
  nama: string;
  singkatan: string;
  kod: string;
  jenis: 'bahagian_suk' | 'jabatan_negeri' | 'agensi_negeri' | 'lain';
  emel_umum: string;
  aktif: boolean;
  dicipta_pada: string;
}

export interface Pengguna {
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
  password_hash: string;
  log_masuk_terakhir?: string;
  dicipta_pada: string;
}

export interface KategoriPermohonan {
  id: string;
  kod: string;
  nama: string;
  penerangan: string;
  sla_hari_bekerja: {
    biasa: number;
    segera: number;
    kritikal: number;
  };
  wajib_semakan_penyelia: boolean;
  aktif: boolean;
  susunan: number;
}

export type StatusPermohonan =
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

export type TahapKeutamaan = 'biasa' | 'segera' | 'kritikal';

export type SaluranPenerimaan = 'sistem' | 'surat' | 'emel' | 'whatsapp' | 'telefon' | 'lain';

export interface Lampiran {
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

export interface Komen {
  id: string;
  permohonan_id: string;
  teks: string;
  jenis: 'awam' | 'dalaman';
  penulis_uid: string;
  penulis_nama: string;
  penulis_peranan: string;
  avatar_url?: string;
  lampiran_ids?: string[];
  dicipta_pada: string;
}

export interface SejarahStatus {
  id: string;
  permohonan_id: string;
  dari: StatusPermohonan;
  ke: StatusPermohonan;
  oleh_uid: string;
  oleh_nama: string;
  oleh_peranan: string;
  catatan: string;
  masa: string;
}

export interface Permohonan {
  id: string;
  no_rujukan: string;
  tajuk: string;
  penerangan: string;
  kategori_id: string;
  kategori_kod: string;
  kategori_nama: string;
  jenis_kemaskini: 'tambah' | 'ubah' | 'padam' | 'pembetulan';
  url_halaman: string;
  keutamaan: TahapKeutamaan;
  tarikh_dikehendaki?: string;
  saluran_penerimaan: SaluranPenerimaan;
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
  status: StatusPermohonan;
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
  lampiran: Lampiran[];
  komen: Komen[];
  sejarah_status: SejarahStatus[];
}

export interface AuditLog {
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

export interface Notifikasi {
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

export interface SystemConfig {
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

export interface PendingAccount {
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

interface DatabaseSchema {
  organisasi: Organisasi[];
  pengguna: Pengguna[];
  kategori: KategoriPermohonan[];
  permohonan: Permohonan[];
  audit_logs: AuditLog[];
  notifikasi: Notifikasi[];
  config: SystemConfig;
  pending_accounts: PendingAccount[];
}

const DB_FILE = path.resolve(process.cwd(), 'data/sppkpp_database.json');

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

export function generateInitialDatabase(): DatabaseSchema {
  const defaultPasswordHash = bcrypt.hashSync('Password123!@#', 10);

  const organisasi: Organisasi[] = [
    {
      id: 'org-btm',
      nama: 'Bahagian Teknologi Maklumat (BTM) SUK Pahang',
      singkatan: 'BTM SUK',
      kod: 'BTM',
      jenis: 'bahagian_suk',
      emel_umum: 'portal@pahang.gov.my',
      aktif: true,
      dicipta_pada: '2026-01-01T08:00:00Z',
    },
    {
      id: 'org-bpen',
      nama: 'Bahagian Perancang Ekonomi Negeri (BPEN) Pahang',
      singkatan: 'BPEN Pahang',
      kod: 'BPEN',
      jenis: 'bahagian_suk',
      emel_umum: 'bpen@pahang.gov.my',
      aktif: true,
      dicipta_pada: '2026-01-01T08:00:00Z',
    },
    {
      id: 'org-bkp',
      nama: 'Bahagian Khidmat Pengurusan (BKP) SUK Pahang',
      singkatan: 'BKP SUK',
      kod: 'BKP',
      jenis: 'bahagian_suk',
      emel_umum: 'bkp@pahang.gov.my',
      aktif: true,
      dicipta_pada: '2026-01-01T08:00:00Z',
    },
    {
      id: 'org-ukk',
      nama: 'Unit Komunikasi Korporat (UKK) Pejabat SUK Pahang',
      singkatan: 'UKK SUK',
      kod: 'UKK',
      jenis: 'bahagian_suk',
      emel_umum: 'ukk@pahang.gov.my',
      aktif: true,
      dicipta_pada: '2026-01-01T08:00:00Z',
    },
    {
      id: 'org-pdt-rompin',
      nama: 'Pejabat Daerah & Tanah Rompin',
      singkatan: 'PDT Rompin',
      kod: 'PDT_ROMPIN',
      jenis: 'jabatan_negeri',
      emel_umum: 'pdtrompin@pahang.gov.my',
      aktif: true,
      dicipta_pada: '2026-01-01T08:00:00Z',
    },
    {
      id: 'org-pdt-kuantan',
      nama: 'Pejabat Daerah & Tanah Kuantan',
      singkatan: 'PDT Kuantan',
      kod: 'PDT_KUANTAN',
      jenis: 'jabatan_negeri',
      emel_umum: 'pdtkuantan@pahang.gov.my',
      aktif: true,
      dicipta_pada: '2026-01-01T08:00:00Z',
    },
    {
      id: 'org-ptg',
      nama: 'Pejabat Tanah & Galian (PTG) Pahang',
      singkatan: 'PTG Pahang',
      kod: 'PTG',
      jenis: 'jabatan_negeri',
      emel_umum: 'ptg@pahang.gov.my',
      aktif: true,
      dicipta_pada: '2026-01-01T08:00:00Z',
    },
    {
      id: 'org-mbk',
      nama: 'Majlis Bandaraya Kuantan (MBK)',
      singkatan: 'MBK',
      kod: 'MBK',
      jenis: 'agensi_negeri',
      emel_umum: 'aduan@mbk.gov.my',
      aktif: true,
      dicipta_pada: '2026-01-01T08:00:00Z',
    }
  ];

  const pengguna: Pengguna[] = [
    {
      id: 'usr-faiz',
      nama_penuh: 'Ts. Mohd Faiz bin Azmi',
      emel: 'faiz.azmi@pahang.gov.my',
      no_telefon: '+60 9-512 6600 (Ext. 4412)',
      jawatan: 'Pegawai Portal Kanan',
      org_id: 'org-btm',
      peranan: 'pegawai_portal',
      status_akaun: 'aktif',
      mfa_didaftar: true,
      avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnKOSlKs8Jr7lao_uucyY5HGy91obzupKrUxHNOLATttpc5TzhQ3PoH0a6hqU4d_GnuFrBM0yY-Pxv3mr7spjSVw8BZs74RCVnAjWWSwZL-Rg0d64quhuV9hz3NpGbzbskCMXBOx0ERv4HbJfi5hxecrdC6WN1Zr6yTN8zXpgwM25Wp776AtbWal-xvDvUULD4uyyANHbt6qkT_pWrupcJtZRw6YHR-JQ3zUMUpH_EVxFFwxn6Db1q8A',
      password_hash: defaultPasswordHash,
      log_masuk_terakhir: '2026-03-29T08:30:00Z',
      dicipta_pada: '2025-10-01T08:00:00Z',
    },
    {
      id: 'usr-rahim',
      nama_penuh: 'En. Abdul Rahim bin Othman',
      emel: 'abdul.rahim@pahang.gov.my',
      no_telefon: '+60 9-512 6600 (Ext. 4413)',
      jawatan: 'Penolong Pegawai IT',
      org_id: 'org-btm',
      peranan: 'pegawai_portal',
      status_akaun: 'aktif',
      mfa_didaftar: true,
      avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAE7Tx8gwGIcxS5aqKXZZJTlbQ-76MryCDk4umStvb7T4uKYbFseoqdhYYPOGS6WaGUPoRDfQEhjKHLhDZAee3mXccfvyX68lMlnwIwb2DrF8sKoKcF7Yihf8HKU43vd-dnxDzkUJp3f9AI70tkKAYSe7W66rvnd0SOdTdMkT9ikD2wy_v0N71674zc-WdkXe0Y5rejnuWj2DhslePCIBMSPT1RrnVhhNZYoy0S0E7IhUGsSBHT9YN54A',
      password_hash: defaultPasswordHash,
      log_masuk_terakhir: '2026-03-29T08:15:00Z',
      dicipta_pada: '2025-10-01T08:00:00Z',
    },
    {
      id: 'usr-syuhada',
      nama_penuh: 'Pn. Nurul Syuhada binti Kassim',
      emel: 'nurul.syuhada@pahang.gov.my',
      no_telefon: '+60 9-512 6600 (Ext. 4414)',
      jawatan: 'Pereka Grafik & Web',
      org_id: 'org-btm',
      peranan: 'pegawai_portal',
      status_akaun: 'aktif',
      mfa_didaftar: true,
      avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCt7j4RdL1FfX3ARUy57oGXREHiHkKR3josiMaPiPQdrfZi8y0J7Yt1H4P4kN8jedk4UE7FLTH-VfnXpzQfmqensVTer_F3lhRY6Bj-U6t9s0b_Sj6skVKjQyHK6-Le91jSuCMg3BqLtIqs1dLNfO2Ongl0wx6KAsWX9fNXWqolTUQdimNnM-yl_qDfnnm7LwQoOmzlRpqr7tXQbD9Ie1ulvqj4CrpuTNfIGONQhTF32--ayQ5lsSWfAg',
      password_hash: defaultPasswordHash,
      log_masuk_terakhir: '2026-03-29T08:20:00Z',
      dicipta_pada: '2025-10-01T08:00:00Z',
    },
    {
      id: 'usr-salmiah',
      nama_penuh: 'Pn. Siti Salmiah binti Hashim',
      emel: 'siti.salmiah@pahang.gov.my',
      no_telefon: '+60 9-512 6600 (Ext. 4410)',
      jawatan: 'Ketua Pasukan Portal BTM',
      org_id: 'org-btm',
      peranan: 'ketua_seksyen',
      status_akaun: 'aktif',
      mfa_didaftar: true,
      password_hash: defaultPasswordHash,
      log_masuk_terakhir: '2026-03-29T07:45:00Z',
      dicipta_pada: '2025-09-01T08:00:00Z',
    },
    {
      id: 'usr-salmah',
      nama_penuh: 'Puan Salmah binti Dato\' Yahya',
      emel: 'salmah.yahya@pahang.gov.my',
      no_telefon: '+60 9-512 6600 (Ext. 2045)',
      jawatan: 'Penolong Pengarah Kanan',
      org_id: 'org-bkp',
      peranan: 'pemohon',
      status_akaun: 'aktif',
      mfa_didaftar: false,
      avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVGu9oiT3key6YNfSRkJmlWErZyZWHZnqOQhbMYROUBq7i8hqwJyOsR-fRASOrwLUDfhgDTRR_kR9vPJeHVdfEUD4rf2AoZQfnHvP_HcnKIp8mUMP_qZounNAF-1hRtBb8MqGM-cp6QpwsBT1qMOsOBgVj4YqExe_LvrwGw1cxot9eE6KSMKibz6DgHwAnY9KutrQ3t1_WadRnk5cYqEafoPDna8sK-poyOnAusFc5PN4yqB6oxirfcQ',
      password_hash: defaultPasswordHash,
      log_masuk_terakhir: '2026-03-29T09:00:00Z',
      dicipta_pada: '2025-11-15T08:00:00Z',
    },
    {
      id: 'usr-sitinurhaliza',
      nama_penuh: 'Puan Siti Nurhaliza binti Kamarudin',
      emel: 'sitinurhaliza@pahang.gov.my',
      no_telefon: '+60 9-512 6688 samb. 2104',
      jawatan: 'Pegawai Tadbir & Diplomatik (M48)',
      org_id: 'org-bpen',
      peranan: 'pemohon',
      status_akaun: 'aktif',
      mfa_didaftar: false,
      password_hash: defaultPasswordHash,
      dicipta_pada: '2025-12-01T08:00:00Z',
    },
    {
      id: 'usr-zainal',
      nama_penuh: 'Tuan Zainal bin Ismail',
      emel: 'zainal.btm@pahang.gov.my',
      no_telefon: '+60 9-512 6600 (Ext. 4401)',
      jawatan: 'Ketua Bahagian Teknologi Maklumat',
      org_id: 'org-btm',
      peranan: 'pengurusan',
      status_akaun: 'aktif',
      mfa_didaftar: true,
      password_hash: defaultPasswordHash,
      dicipta_pada: '2025-08-01T08:00:00Z',
    },
    {
      id: 'usr-audit',
      nama_penuh: 'Juruaudit Kanan ICT Negeri',
      emel: 'audit.portal@pahang.gov.my',
      no_telefon: '+60 9-512 6600 (Ext. 1102)',
      jawatan: 'Pegawai Audit Dalam',
      org_id: 'org-btm',
      peranan: 'juruaudit',
      status_akaun: 'aktif',
      mfa_didaftar: true,
      password_hash: defaultPasswordHash,
      dicipta_pada: '2025-08-01T08:00:00Z',
    },
    {
      id: 'usr-admin',
      nama_penuh: 'Pentadbir Sistem BTM SUK',
      emel: 'admin.portal@pahang.gov.my',
      no_telefon: '+60 9-512 6600 (Ext. 4400)',
      jawatan: 'Pentadbir Utama Sistem',
      org_id: 'org-btm',
      peranan: 'pentadbir_sistem',
      status_akaun: 'aktif',
      mfa_didaftar: true,
      password_hash: defaultPasswordHash,
      dicipta_pada: '2025-08-01T08:00:00Z',
    }
  ];

  const kategori: KategoriPermohonan[] = [
    {
      id: 'kat-brt',
      kod: 'BRT',
      nama: 'Kenyataan Media / Siaran Akhbar [BRT]',
      penerangan: 'Kenyataan akhbar YAB Menteri Besar, Exco Negeri, dan siaran media rasmi kerajaan negeri.',
      sla_hari_bekerja: { biasa: 5, segera: 2, kritikal: 1 },
      wajib_semakan_penyelia: true,
      aktif: true,
      susunan: 1,
    },
    {
      id: 'kat-pgm',
      kod: 'PGM',
      nama: 'Pengumuman Rasmi Kerajaan / Notis Tender [PGM]',
      penerangan: 'Pengumuman sebut harga, tender perolehan, jadual warta, dan notis penting awam.',
      sla_hari_bekerja: { biasa: 5, segera: 2, kritikal: 1 },
      wajib_semakan_penyelia: false,
      aktif: true,
      susunan: 2,
    },
    {
      id: 'kat-dir',
      kod: 'DIR',
      nama: 'Direktori Pegawai & Carta Organisasi Agensi [DIR]',
      penerangan: 'Kemaskini maklumat pegawai, direktori telefon, carta hirarki pentadbiran agensi.',
      sla_hari_bekerja: { biasa: 5, segera: 2, kritikal: 1 },
      wajib_semakan_penyelia: false,
      aktif: true,
      susunan: 3,
    },
    {
      id: 'kat-dok',
      kod: 'DOK',
      nama: 'Muat Turun Borang & Pekeliling Rasmi [DOK]',
      penerangan: 'Pekeliling perkhidmatan, borang permohonan kemudahan, dokumen dasar negeri.',
      sla_hari_bekerja: { biasa: 5, segera: 2, kritikal: 1 },
      wajib_semakan_penyelia: false,
      aktif: true,
      susunan: 4,
    },
    {
      id: 'kat-bnr',
      kod: 'BNR',
      nama: 'Banner Hero / Gelanggang Slider Utama Portal [BNR]',
      penerangan: 'Grafik banner dan slider kempen rasmi muka hadapan portal pahang.gov.my.',
      sla_hari_bekerja: { biasa: 5, segera: 2, kritikal: 1 },
      wajib_semakan_penyelia: true,
      aktif: true,
      susunan: 5,
    },
    {
      id: 'kat-glr',
      kod: 'GLR',
      nama: 'Galeri Foto Aktiviti & Liputan Rasmi [GLR]',
      penerangan: 'Album foto aktiviti rasmi lawatan pemimpin dan majlis kerajaan negeri.',
      sla_hari_bekerja: { biasa: 5, segera: 2, kritikal: 1 },
      wajib_semakan_penyelia: false,
      aktif: true,
      susunan: 6,
    },
    {
      id: 'kat-acr',
      kod: 'ACR',
      nama: 'Kalendar Acara & Program Kerajaan Negeri [ACR]',
      penerangan: 'Jadual takwim aktiviti, perayaan, dan sambutan rasmi peringkat negeri Pahang.',
      sla_hari_bekerja: { biasa: 5, segera: 2, kritikal: 1 },
      wajib_semakan_penyelia: false,
      aktif: true,
      susunan: 7,
    },
    {
      id: 'kat-lain',
      kod: 'LAIN',
      nama: 'Lain-lain Maklumat Statik Portal [LAIN]',
      penerangan: 'Pindaan teks pautan, pembetulan ejaan, atau pautan luaran.',
      sla_hari_bekerja: { biasa: 5, segera: 2, kritikal: 1 },
      wajib_semakan_penyelia: false,
      aktif: true,
      susunan: 8,
    }
  ];

  const permohonan: Permohonan[] = [
    {
      id: 'pmh-000142',
      no_rujukan: 'SPPKPP/2026/000142',
      tajuk: 'Kenyataan Media: Program Pelaburan Pahang Barakah 2026',
      penerangan: 'Penerbitan kenyataan media rasmi inisiatif pelaburan baharu negeri Pahang Darul Makmur serta dokumen lampiran pelaburan.',
      kategori_id: 'kat-brt',
      kategori_kod: 'BRT',
      kategori_nama: 'Kenyataan Media / Siaran Akhbar [BRT]',
      jenis_kemaskini: 'tambah',
      url_halaman: 'https://www.pahang.gov.my/berita/kenyataan-pelaburan-barakah-2026',
      keutamaan: 'kritikal',
      tarikh_dikehendaki: '2026-03-29',
      saluran_penerimaan: 'sistem',
      tarikh_terima: '2026-03-29T09:15:00Z',
      pemohon_uid: 'usr-sitinurhaliza',
      pemohon_snapshot: {
        nama: 'En. Khairul Annuar',
        emel: 'khairul.annuar@pahang.gov.my',
        telefon: '09-5126688',
        org_id: 'org-bpen',
        org_nama: 'BPEN Pahang',
        jawatan: 'Penolong Pengarah Pelaburan'
      },
      didaftar_oleh_uid: 'usr-sitinurhaliza',
      org_id: 'org-bpen',
      org_nama: 'BPEN Pahang',
      status: 'dalam_semakan',
      pegawai_uid: 'usr-faiz',
      pegawai_nama: 'Ts. Mohd Faiz bin Azmi',
      tarikh_diterima: '2026-03-29T09:15:00Z',
      sla_tarikh_akhir: '2026-03-30T09:15:00Z',
      sla_baki_teks: 'Baki 4j 15m',
      sla_peratus_tamat: 78,
      sla_jumlah_jeda_ms: 0,
      lewat: false,
      bil_lampiran: 2,
      bil_komen: 1,
      versi: 2,
      dipadam: false,
      dicipta_pada: '2026-03-29T09:15:00Z',
      dikemaskini_pada: '2026-03-29T09:30:00Z',
      lampiran: [
        {
          id: 'lmp-1',
          nama_fail: 'Kenyataan_Media_Pelaburan_Barakah_2026.pdf',
          jenis_mime: 'application/pdf',
          saiz_bait: 2450000,
          saiz_teks: '2.4 MB',
          laluan_storan: '/uploads/2026/03/Kenyataan_Media_Pelaburan_Barakah_2026.pdf',
          jenis_lampiran: 'sokongan',
          dimuat_naik_oleh: 'En. Khairul Annuar',
          dimuat_naik_pada: '2026-03-29T09:15:00Z',
          checksum_sha256: '9b7a3efd203a98ec56d98c...',
          status_imbasan: 'bersih',
        }
      ],
      komen: [
        {
          id: 'kom-1',
          permohonan_id: 'pmh-000142',
          teks: 'Mohon siaran segera sebelum jam 2 petang bagi sidang media rasmi petang ini.',
          jenis: 'awam',
          penulis_uid: 'usr-sitinurhaliza',
          penulis_nama: 'En. Khairul Annuar',
          penulis_peranan: 'pemohon',
          dicipta_pada: '2026-03-29T09:16:00Z',
        }
      ],
      sejarah_status: [
        {
          id: 'sh-1',
          permohonan_id: 'pmh-000142',
          dari: 'draf',
          ke: 'dihantar',
          oleh_uid: 'usr-sitinurhaliza',
          oleh_nama: 'En. Khairul Annuar',
          oleh_peranan: 'pemohon',
          catatan: 'Permohonan dihantar secara dalam talian.',
          masa: '2026-03-29T09:15:00Z',
        },
        {
          id: 'sh-2',
          permohonan_id: 'pmh-000142',
          dari: 'dihantar',
          ke: 'dalam_semakan',
          oleh_uid: 'usr-faiz',
          oleh_nama: 'Ts. Mohd Faiz bin Azmi',
          oleh_peranan: 'pegawai_portal',
          catatan: 'Permohonan diterima dan sedang disemak format kenyataan rasmi.',
          masa: '2026-03-29T09:20:00Z',
        }
      ]
    },
    {
      id: 'pmh-000141',
      no_rujukan: 'SPPKPP/2026/000141',
      tajuk: 'Pengumuman: Tender Terbuka Bekalan Peralatan ICT BTM 2026',
      penerangan: 'Muat naik dokumen tender sebut harga bekalan peralatan perkakasan pejabat ICT Suk Pahang.',
      kategori_id: 'kat-pgm',
      kategori_kod: 'PGM',
      kategori_nama: 'Pengumuman Rasmi Kerajaan / Notis Tender [PGM]',
      jenis_kemaskini: 'tambah',
      url_halaman: 'https://www.pahang.gov.my/index.php/tender-sebutharga/btm/2026/04-jadual',
      keutamaan: 'segera',
      tarikh_dikehendaki: '2026-03-30',
      saluran_penerimaan: 'surat',
      rujukan_surat: 'SUK.PHG.BTM.100-4/2/12(45)',
      tarikh_surat: '2026-03-28',
      tarikh_terima: '2026-03-28T16:30:00Z',
      pemohon_uid: 'usr-salmah',
      pemohon_snapshot: {
        nama: 'Puan Harlina',
        emel: 'harlina@pahang.gov.my',
        telefon: '09-5126600',
        org_id: 'org-bkp',
        org_nama: 'Bahagian Khidmat Pengurusan',
        jawatan: 'Ketua Penolong Pegawai Tadbir'
      },
      didaftar_oleh_uid: 'usr-faiz',
      org_id: 'org-bkp',
      org_nama: 'Bahagian Khidmat Pengurusan',
      status: 'dalam_tindakan',
      pegawai_uid: 'usr-rahim',
      pegawai_nama: 'En. Abdul Rahim bin Othman',
      tarikh_diterima: '2026-03-28T16:30:00Z',
      tarikh_mula_tindakan: '2026-03-29T08:30:00Z',
      sla_tarikh_akhir: '2026-03-30T17:00:00Z',
      sla_baki_teks: '1 hari 6 jam baki',
      sla_peratus_tamat: 45,
      sla_jumlah_jeda_ms: 0,
      lewat: false,
      bil_lampiran: 2,
      bil_komen: 0,
      versi: 3,
      dipadam: false,
      dicipta_pada: '2026-03-28T16:30:00Z',
      dikemaskini_pada: '2026-03-29T08:30:00Z',
      lampiran: [
        {
          id: 'lmp-2',
          nama_fail: 'Draf_Iklan_Tender_2026_Disahkan.pdf',
          jenis_mime: 'application/pdf',
          saiz_bait: 2516582,
          saiz_teks: '2.4 MB',
          laluan_storan: '/uploads/2026/03/Draf_Iklan_Tender_2026_Disahkan.pdf',
          jenis_lampiran: 'surat_rasmi',
          dimuat_naik_oleh: 'Puan Harlina',
          dimuat_naik_pada: '2026-03-28T16:30:00Z',
          checksum_sha256: '883921afdc9023...',
          status_imbasan: 'bersih',
        }
      ],
      komen: [],
      sejarah_status: [
        {
          id: 'sh-3',
          permohonan_id: 'pmh-000141',
          dari: 'dihantar',
          ke: 'diterima',
          oleh_uid: 'usr-faiz',
          oleh_nama: 'Ts. Mohd Faiz bin Azmi',
          oleh_peranan: 'pegawai_portal',
          catatan: 'Didaftarkan daripada saluran Surat Rasmi SUK.',
          masa: '2026-03-28T16:30:00Z',
        },
        {
          id: 'sh-4',
          permohonan_id: 'pmh-000141',
          dari: 'diterima',
          ke: 'dalam_tindakan',
          oleh_uid: 'usr-salmiah',
          oleh_nama: 'Pn. Siti Salmiah Hashim',
          oleh_peranan: 'ketua_seksyen',
          catatan: 'Diagihkan kepada En. Abdul Rahim untuk muat naik borang PDF.',
          masa: '2026-03-29T08:30:00Z',
        }
      ]
    },
    {
      id: 'pmh-000139',
      no_rujukan: 'SPPKPP/2026/000139',
      tajuk: 'Kemaskini Direktori: Pejabat Daerah & Tanah Rompin',
      penerangan: 'Pertukaran pegawai tadbir, nombor talian sambungan dan maklumat pejabat tanah daerah.',
      kategori_id: 'kat-dir',
      kategori_kod: 'DIR',
      kategori_nama: 'Direktori Pegawai & Carta Organisasi Agensi [DIR]',
      jenis_kemaskini: 'ubah',
      url_halaman: 'https://www.pahang.gov.my/direktori/pdt-rompin',
      keutamaan: 'biasa',
      tarikh_dikehendaki: '2026-03-25',
      saluran_penerimaan: 'emel',
      tarikh_terima: '2026-03-12T11:20:00Z',
      pemohon_uid: 'usr-salmah',
      pemohon_snapshot: {
        nama: 'Cik Syarifah',
        emel: 'syarifah@pahang.gov.my',
        telefon: '09-4145222',
        org_id: 'org-pdt-rompin',
        org_nama: 'PDT Rompin',
        jawatan: 'Penolong Pegawai Tadbir'
      },
      didaftar_oleh_uid: 'usr-rahim',
      org_id: 'org-pdt-rompin',
      org_nama: 'PDT Rompin',
      status: 'perlu_maklumat',
      pegawai_uid: 'usr-rahim',
      pegawai_nama: 'En. Abdul Rahim bin Othman',
      tarikh_diterima: '2026-03-12T11:20:00Z',
      sla_tarikh_akhir: '2026-03-19T17:00:00Z',
      sla_baki_teks: 'SLA Dijeda',
      sla_peratus_tamat: 30,
      sla_dijeda_pada: '2026-03-12T14:00:00Z',
      sla_sebab_jeda: 'Resolusi gambar rasmi tidak mematuhi piawaian web.',
      sla_jumlah_jeda_ms: 1209600000,
      lewat: false,
      bil_lampiran: 1,
      bil_komen: 2,
      versi: 4,
      dipadam: false,
      dicipta_pada: '2026-03-12T11:20:00Z',
      dikemaskini_pada: '2026-03-12T14:00:00Z',
      lampiran: [],
      komen: [
        {
          id: 'kom-2',
          permohonan_id: 'pmh-000139',
          teks: 'Mohon hantar semula gambar beresolusi sekurang-kurangnya 800x1000px dengan pencahayaan studio.',
          jenis: 'awam',
          penulis_uid: 'usr-rahim',
          penulis_nama: 'En. Abdul Rahim bin Othman',
          penulis_peranan: 'pegawai_portal',
          dicipta_pada: '2026-03-12T14:00:00Z',
        }
      ],
      sejarah_status: [
        {
          id: 'sh-5',
          permohonan_id: 'pmh-000139',
          dari: 'dihantar',
          ke: 'diterima',
          oleh_uid: 'usr-rahim',
          oleh_nama: 'En. Abdul Rahim bin Othman',
          oleh_peranan: 'pegawai_portal',
          catatan: 'Permohonan diterima melalui e-mel.',
          masa: '2026-03-12T11:20:00Z',
        },
        {
          id: 'sh-6',
          permohonan_id: 'pmh-000139',
          dari: 'diterima',
          ke: 'perlu_maklumat',
          oleh_uid: 'usr-rahim',
          oleh_nama: 'En. Abdul Rahim bin Othman',
          oleh_peranan: 'pegawai_portal',
          catatan: 'Status ditukar kepada Perlu Maklumat. Jam SLA dibekukan sementara menunggu resolusi baharu.',
          masa: '2026-03-12T14:00:00Z',
        }
      ]
    },
    {
      id: 'pmh-000138',
      no_rujukan: 'SPPKPP/2026/000138',
      tajuk: 'Album Foto: Majlis Sambutan Ihya Ramadan SUK Pahang 2026',
      penerangan: '14 keping imej resolusi tinggi sempena program Ihya Ramadan SUK untuk galeri foto portal rasmi.',
      kategori_id: 'kat-glr',
      kategori_kod: 'GLR',
      kategori_nama: 'Galeri Foto Aktiviti & Liputan Rasmi [GLR]',
      jenis_kemaskini: 'tambah',
      url_halaman: 'https://www.pahang.gov.my/galeri/ihya-ramadan-2026',
      keutamaan: 'biasa',
      tarikh_dikehendaki: '2026-03-16',
      saluran_penerimaan: 'whatsapp',
      tarikh_terima: '2026-03-11T14:45:00Z',
      pemohon_uid: 'usr-salmah',
      pemohon_snapshot: {
        nama: 'En. Firdaus',
        emel: 'firdaus.ukk@pahang.gov.my',
        telefon: '019-9887766',
        org_id: 'org-ukk',
        org_nama: 'Unit Komunikasi Korporat (UKK)',
        jawatan: 'Pegawai Penerangan'
      },
      didaftar_oleh_uid: 'usr-faiz',
      org_id: 'org-ukk',
      org_nama: 'Unit Komunikasi Korporat (UKK)',
      status: 'dihantar',
      sla_tarikh_akhir: '2026-03-16T17:00:00Z',
      sla_baki_teks: '3 hari baki',
      sla_peratus_tamat: 20,
      sla_jumlah_jeda_ms: 0,
      lewat: false,
      bil_lampiran: 14,
      bil_komen: 0,
      versi: 1,
      dipadam: false,
      dicipta_pada: '2026-03-11T14:45:00Z',
      dikemaskini_pada: '2026-03-11T14:45:00Z',
      lampiran: [],
      komen: [],
      sejarah_status: [
        {
          id: 'sh-7',
          permohonan_id: 'pmh-000138',
          dari: 'draf',
          ke: 'dihantar',
          oleh_uid: 'usr-faiz',
          oleh_nama: 'Ts. Mohd Faiz bin Azmi',
          oleh_peranan: 'pegawai_portal',
          catatan: 'Didaftarkan bagi pihak pemohon daripada arahan WhatsApp Unit Komunikasi Korporat.',
          masa: '2026-03-11T14:45:00Z',
        }
      ]
    },
    {
      id: 'pmh-000123',
      no_rujukan: 'SPPKPP/2026/000123',
      tajuk: 'Kemaskini Direktori Pegawai & Carta Organisasi Pejabat Setiausaha Kerajaan Negeri Pahang 2026',
      penerangan: 'Pertukaran Ketua Penolong Setiausaha (Pengurusan Sumber Manusia) kepada En. Ahmad Zulkifli bin Ismail berkuat kuasa 1 Oktober 2026. Kemaskini nombor sambungan telefon pejabat (Ext. 3409) dan emel rasmi baharu. Menggantikan fail PDF Carta Organisasi SUK 2026 dengan semakan warta terkini.',
      kategori_id: 'kat-dir',
      kategori_kod: 'DIR',
      kategori_nama: 'Direktori / Maklumat Perhubungan [DIR]',
      jenis_kemaskini: 'ubah',
      url_halaman: 'https://www.pahang.gov.my/direktori-pengurusan-suk',
      keutamaan: 'segera',
      tarikh_dikehendaki: '2026-09-26',
      saluran_penerimaan: 'surat',
      rujukan_surat: 'SUK.PHG.BTM.100-4/2/12',
      tarikh_surat: '2026-09-24',
      tarikh_terima: '2026-09-24T09:30:00Z',
      pemohon_uid: 'usr-salmah',
      pemohon_snapshot: {
        nama: 'Puan Salmah binti Dato\' Yahya',
        emel: 'salmah.yahya@pahang.gov.my',
        telefon: '+60 9-512 6600 (Ext. 2045)',
        org_id: 'org-bkp',
        org_nama: 'Bahagian Khidmat Pengurusan, Pejabat SUK Pahang',
        jawatan: 'Penolong Pengarah Kanan'
      },
      didaftar_oleh_uid: 'usr-faiz',
      org_id: 'org-bkp',
      org_nama: 'Bahagian Khidmat Pengurusan, Pejabat SUK Pahang',
      status: 'dalam_tindakan',
      pegawai_uid: 'usr-faiz',
      pegawai_nama: 'Ts. Mohd Faiz bin Azmi',
      tarikh_diterima: '2026-09-24T09:30:00Z',
      tarikh_mula_tindakan: '2026-09-25T14:00:00Z',
      sla_tarikh_akhir: '2026-09-26T09:30:00Z',
      sla_baki_teks: '1h 03j 22m',
      sla_peratus_tamat: 62,
      sla_jumlah_jeda_ms: 0,
      lewat: false,
      bil_lampiran: 2,
      bil_komen: 3,
      versi: 3,
      dipadam: false,
      dicipta_pada: '2026-09-24T09:30:00Z',
      dikemaskini_pada: '2026-09-25T14:15:00Z',
      lampiran: [
        {
          id: 'lmp-123-1',
          nama_fail: 'Carta_Organisasi_SUK_Pahang_Okt_2026_V1.pdf',
          jenis_mime: 'application/pdf',
          saiz_bait: 2516582,
          saiz_teks: '2.4 MB',
          laluan_storan: '/uploads/2026/09/Carta_Organisasi_SUK_Pahang_Okt_2026_V1.pdf',
          jenis_lampiran: 'sokongan',
          dimuat_naik_oleh: 'Puan Salmah binti Dato\' Yahya',
          dimuat_naik_pada: '2026-09-24T09:28:00Z',
          checksum_sha256: 'a7f89b1c3e44de902318ba84...',
          status_imbasan: 'bersih',
        },
        {
          id: 'lmp-123-2',
          nama_fail: 'Potret_Ahmad_Zulkifli_KP_SUK.jpg',
          jenis_mime: 'image/jpeg',
          saiz_bait: 860160,
          saiz_teks: '840 KB',
          laluan_storan: '/uploads/2026/09/Potret_Ahmad_Zulkifli_KP_SUK.jpg',
          jenis_lampiran: 'sokongan',
          dimuat_naik_oleh: 'Puan Salmah binti Dato\' Yahya',
          dimuat_naik_pada: '2026-09-24T09:29:00Z',
          checksum_sha256: 'c3f9112bc90048123e44a...',
          status_imbasan: 'bersih',
        }
      ],
      komen: [
        {
          id: 'kom-123-1',
          permohonan_id: 'pmh-000123',
          teks: 'Salam Ts. Faiz, dokumen lampiran telah disemak oleh Pejabat SUK. Harap maklum bahawa gambar baharu En. Ahmad Zulkifli telah disertakan dalam resolusi web standard. Terima kasih atas bantuan pihak BTM.',
          jenis: 'awam',
          penulis_uid: 'usr-salmah',
          penulis_nama: 'Puan Salmah binti Dato\' Yahya',
          penulis_peranan: 'Pemohon • BKP',
          dicipta_pada: '2026-09-24T09:35:00Z',
        },
        {
          id: 'kom-123-2',
          permohonan_id: 'pmh-000123',
          teks: 'Perlu semak saiz fail PDF carta organisasi kerana sebelum ini melebihi 15MB. Kami perlu kompres ke 1.8MB untuk mematuhi piawaian kelajuan capaian web MyGovEA.',
          jenis: 'dalaman',
          penulis_uid: 'usr-faiz',
          penulis_nama: 'Ts. Mohd Faiz bin Azmi',
          penulis_peranan: 'Nota Rahsia BTM',
          dicipta_pada: '2026-09-25T09:15:00Z',
        },
        {
          id: 'kom-123-3',
          permohonan_id: 'pmh-000123',
          teks: 'Waalaikumsalam Puan Salmah, semakan kod pangkalan data telah dimulakan. Kami sedang mengemas kini carta blok organisasi dan akan berkongsi pautan pratonton segera.',
          jenis: 'awam',
          penulis_uid: 'usr-faiz',
          penulis_nama: 'Ts. Mohd Faiz bin Azmi',
          penulis_peranan: 'Pegawai Portal • BTM',
          avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnKOSlKs8Jr7lao_uucyY5HGy91obzupKrUxHNOLATttpc5TzhQ3PoH0a6hqU4d_GnuFrBM0yY-Pxv3mr7spjSVw8BZs74RCVnAjWWSwZL-Rg0d64quhuV9hz3NpGbzbskCMXBOx0ERv4HbJfi5hxecrdC6WN1Zr6yTN8zXpgwM25Wp776AtbWal-xvDvUULD4uyyANHbt6qkT_pWrupcJtZRw6YHR-JQ3zUMUpH_EVxFFwxn6Db1q8A',
          dicipta_pada: '2026-09-25T14:10:00Z',
        }
      ],
      sejarah_status: [
        {
          id: 'sh-123-1',
          permohonan_id: 'pmh-000123',
          dari: 'draf',
          ke: 'dihantar',
          oleh_uid: 'usr-salmah',
          oleh_nama: 'Puan Salmah binti Dato\' Yahya',
          oleh_peranan: 'pemohon',
          catatan: 'Permohonan Dihantar oleh Puan Salmah melalui Saluran Surat Rasmi.',
          masa: '2026-09-24T09:30:00Z',
        },
        {
          id: 'sh-123-2',
          permohonan_id: 'pmh-000123',
          dari: 'dihantar',
          ke: 'diterima',
          oleh_uid: 'usr-faiz',
          oleh_nama: 'Ts. Mohd Faiz bin Azmi',
          oleh_peranan: 'pegawai_portal',
          catatan: 'Disaring oleh Sistem Autogate BTM. Semua fail lampiran lulus imbasan keselamatan ClamAV.',
          masa: '2026-09-24T11:15:00Z',
        },
        {
          id: 'sh-123-3',
          permohonan_id: 'pmh-000123',
          dari: 'diterima',
          ke: 'dalam_semakan',
          oleh_uid: 'usr-salmiah',
          oleh_nama: 'Pn. Siti Salmiah Hashim',
          oleh_peranan: 'ketua_seksyen',
          catatan: 'Diagihkan & Dalam Semakan kepada Ts. Mohd Faiz bin Azmi oleh Penyelia Portal (En. Rahim).',
          masa: '2026-09-25T08:30:00Z',
        },
        {
          id: 'sh-123-4',
          permohonan_id: 'pmh-000123',
          dari: 'dalam_semakan',
          ke: 'dalam_tindakan',
          oleh_uid: 'usr-faiz',
          oleh_nama: 'Ts. Mohd Faiz bin Azmi',
          oleh_peranan: 'pegawai_portal',
          catatan: 'Pengemaskinian direktori sedang diproses dalam staging server Kerajaan Negeri Pahang.',
          masa: '2026-09-25T14:00:00Z',
        }
      ]
    },
    {
      id: 'pmh-000128',
      no_rujukan: 'SPPKPP/2026/000128',
      tajuk: 'Kenyataan Media YAB Menteri Besar Mengenai Pakej Bantuan Pasca Banjir Daerah Temerloh',
      penerangan: 'Hebahan segera kenyataan media bantuan pasca banjir serta pekeliling pelaksanaan bantuan kewangan mangsa banjir daerah Temerloh.',
      kategori_id: 'kat-brt',
      kategori_kod: 'BRT',
      kategori_nama: 'Kenyataan Media',
      jenis_kemaskini: 'tambah',
      url_halaman: 'https://www.pahang.gov.my/berita/kenyataan-mb-bantuan-banjir',
      keutamaan: 'kritikal',
      tarikh_dikehendaki: '2026-03-26',
      saluran_penerimaan: 'sistem',
      tarikh_terima: '2026-03-26T08:45:00Z',
      pemohon_uid: 'usr-salmah',
      pemohon_snapshot: {
        nama: 'Ahmad Razali',
        emel: 'razali@pahang.gov.my',
        telefon: '09-5126600',
        org_id: 'org-bkp',
        org_nama: 'Pejabat YB Setiausaha Kerajaan',
        jawatan: 'Pen. Pegawai IT'
      },
      didaftar_oleh_uid: 'usr-salmah',
      org_id: 'org-bkp',
      org_nama: 'Pejabat YB Setiausaha Kerajaan',
      status: 'perlu_maklumat',
      pegawai_uid: 'usr-rahim',
      pegawai_nama: 'En. Abdul Rahim bin Othman',
      tarikh_diterima: '2026-03-26T08:45:00Z',
      sla_tarikh_akhir: '2026-03-27T08:45:00Z',
      sla_baki_teks: '06j 15m baki',
      sla_peratus_tamat: 74,
      sla_jumlah_jeda_ms: 0,
      lewat: false,
      bil_lampiran: 3,
      bil_komen: 1,
      versi: 2,
      dipadam: false,
      dicipta_pada: '2026-03-26T08:45:00Z',
      dikemaskini_pada: '2026-03-26T10:00:00Z',
      lampiran: [],
      komen: [],
      sejarah_status: []
    },
    {
      id: 'pmh-000121',
      no_rujukan: 'SPPKPP/2026/000121',
      tajuk: 'Siaran Hebahan Hari Bertemu Pelanggan Pejabat Daerah & Tanah Rompin Siri 1/2026',
      penerangan: 'Infografik hebahan tarikh, waktu, dan kaunter perkhidmatan hari bertemu pelanggan daerah Rompin.',
      kategori_id: 'kat-pgm',
      kategori_kod: 'PGM',
      kategori_nama: 'Pengumuman',
      jenis_kemaskini: 'tambah',
      url_halaman: 'https://www.pahang.gov.my/pengumuman/hari-bertemu-pelanggan-rompin-2026',
      keutamaan: 'biasa',
      tarikh_dikehendaki: '2026-03-28',
      saluran_penerimaan: 'sistem',
      tarikh_terima: '2026-03-24T11:10:00Z',
      pemohon_uid: 'usr-salmah',
      pemohon_snapshot: {
        nama: 'Puan Salmah binti Dato\' Yahya',
        emel: 'salmah.yahya@pahang.gov.my',
        telefon: '09-5126600',
        org_id: 'org-bkp',
        org_nama: 'BKP SUK Pahang',
        jawatan: 'Penolong Pengarah Kanan'
      },
      didaftar_oleh_uid: 'usr-salmah',
      org_id: 'org-bkp',
      org_nama: 'BKP SUK Pahang',
      status: 'dihantar',
      tarikh_diterima: '2026-03-24T11:10:00Z',
      sla_tarikh_akhir: '2026-03-31T17:00:00Z',
      sla_baki_teks: '92j baki',
      sla_peratus_tamat: 15,
      sla_jumlah_jeda_ms: 0,
      lewat: false,
      bil_lampiran: 1,
      bil_komen: 0,
      versi: 1,
      dipadam: false,
      dicipta_pada: '2026-03-24T11:10:00Z',
      dikemaskini_pada: '2026-03-24T11:10:00Z',
      lampiran: [],
      komen: [],
      sejarah_status: []
    },
    {
      id: 'pmh-000115',
      no_rujukan: 'SPPKPP/2026/000115',
      tajuk: 'Pemasangan Banner Interaktif Semarak Kasih Ramadan & Aidilfitri Negeri Pahang 1447H',
      penerangan: 'Pemasangan banner slider laman utama bersempena ketibaan Ramadan dan sambutan Aidilfitri peringkat negeri Pahang.',
      kategori_id: 'kat-bnr',
      kategori_kod: 'BNR',
      kategori_nama: 'Slider Utama',
      jenis_kemaskini: 'tambah',
      url_halaman: 'https://www.pahang.gov.my',
      keutamaan: 'segera',
      tarikh_dikehendaki: '2026-03-21',
      saluran_penerimaan: 'sistem',
      tarikh_terima: '2026-03-20T16:30:00Z',
      pemohon_uid: 'usr-salmah',
      pemohon_snapshot: {
        nama: 'Khairul Anwar',
        emel: 'khairul.anwar@pahang.gov.my',
        telefon: '09-5126600',
        org_id: 'org-ukk',
        org_nama: 'Unit Komunikasi Korporat (UKK)',
        jawatan: 'Pereka Web Kanan'
      },
      didaftar_oleh_uid: 'usr-salmah',
      org_id: 'org-ukk',
      org_nama: 'Unit Komunikasi Korporat (UKK)',
      status: 'selesai',
      pegawai_uid: 'usr-syuhada',
      pegawai_nama: 'Pn. Nurul Syuhada binti Kassim',
      tarikh_diterima: '2026-03-20T16:30:00Z',
      tarikh_mula_tindakan: '2026-03-20T17:00:00Z',
      tarikh_selesai: '2026-03-21T10:30:00Z',
      tarikh_ditutup: '2026-03-21T10:30:00Z',
      sla_tarikh_akhir: '2026-03-22T17:00:00Z',
      sla_baki_teks: 'Selesai dlm 18j (Menepati SLA)',
      sla_peratus_tamat: 100,
      sla_jumlah_jeda_ms: 0,
      lewat: false,
      url_hasil: 'https://www.pahang.gov.my/#banner-ramadan-1447',
      catatan_penyelesaian: 'Banner dimensi 1920x1080px telah dimuat naik dan lulus ujian responsive mobile.',
      bil_lampiran: 1,
      bil_komen: 1,
      versi: 3,
      dipadam: false,
      dicipta_pada: '2026-03-20T16:30:00Z',
      dikemaskini_pada: '2026-03-21T10:30:00Z',
      lampiran: [],
      komen: [],
      sejarah_status: []
    }
  ];

  const audit_logs: AuditLog[] = [
    {
      id: 'aud-001',
      masa: '2026-03-26T14:15:22.408Z',
      id_korelasi: 'CORR-992144',
      pelaku_uid: 'usr-faiz',
      pelaku_nama: 'Ts. Mohd Faiz bin Azmi',
      pelaku_peranan: 'Pegawai Portal • BTM SUK',
      pelaku_ip: '10.24.8.112',
      tindakan: 'PMH_STATUS_UBAH',
      entiti_jenis: 'permohonan',
      entiti_id: 'pmh-000123',
      no_rujukan: 'SPPKPP/2026/000123',
      sebelum: { status: 'DALAM_SEMAKAN' },
      selepas: { status: 'DALAM_TINDAKAN' },
      keterangan: 'Status tiket dikemaskini dari pengesahan awal kepada DALAM_TINDAKAN.',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      integriti: 'verified',
    },
    {
      id: 'aud-002',
      masa: '2026-03-26T13:40:05.112Z',
      id_korelasi: 'CORR-992019',
      pelaku_uid: 'usr-salmiah',
      pelaku_nama: 'Pn. Siti Salmiah Hashim',
      pelaku_peranan: 'Ketua Pasukan Portal',
      pelaku_ip: '10.24.8.44',
      tindakan: 'PMH_AGIH',
      entiti_jenis: 'permohonan',
      entiti_id: 'pmh-000123',
      no_rujukan: 'SPPKPP/2026/000123',
      sebelum: { pegawai_uid: null },
      selepas: { pegawai_uid: 'usr-faiz', pegawai_nama: 'Ts. Mohd Faiz bin Azmi' },
      keterangan: 'Agihan tugas tiket kemaskini warta kepada Ts. Mohd Faiz bin Azmi [SLA: 24 Jam].',
      hash: '9a8b1c4e7721dfac88019a...',
      integriti: 'verified',
    },
    {
      id: 'aud-003',
      masa: '2026-03-26T11:05:19.894Z',
      id_korelasi: 'CORR-991730',
      pelaku_uid: 'usr-danial',
      pelaku_nama: 'En. Wan Ahmad Danial',
      pelaku_peranan: 'Pemohon • PTG Pahang',
      pelaku_ip: '10.35.12.98',
      tindakan: 'LAMPIRAN_MUAT_NAIK',
      entiti_jenis: 'lampiran',
      entiti_id: 'lmp-warta-ptg',
      no_rujukan: 'SPPKPP/2026/000123',
      sebelum: null,
      selepas: { nama_fail: 'warta_ptg_mac2026.pdf', saiz: '2.4 MB' },
      keterangan: 'Lampiran warta_ptg_mac2026.pdf (2.4 MB) berjaya dimuat naik dan lulus antivirus.',
      hash: 'a7f89b1c3e44d882910a...',
      integriti: 'verified',
    },
    {
      id: 'aud-004',
      masa: '2026-03-26T08:30:00.010Z',
      id_korelasi: 'CORR-990812',
      pelaku_uid: 'usr-faiz',
      pelaku_nama: 'Ts. Mohd Faiz bin Azmi',
      pelaku_peranan: 'Pegawai Portal • BTM SUK',
      pelaku_ip: '10.24.8.112',
      tindakan: 'AUTH_LOGIN',
      entiti_jenis: 'pengguna',
      entiti_id: 'usr-faiz',
      no_rujukan: 'SSO-PAHANG-ID',
      keterangan: 'Log masuk berjaya melalui SUK Pahang SSO Gateway. Pengesyoran 2FA Kod OTP disahkan.',
      hash: 'f56ab098cc12e431...',
      integriti: 'verified',
    },
    {
      id: 'aud-005',
      masa: '2026-03-26T00:00:01.002Z',
      id_korelasi: 'CORR-989201',
      pelaku_uid: 'sys-daemon',
      pelaku_nama: 'Automasi Sistem (Daemon)',
      pelaku_peranan: 'Sistem Teras BTM',
      pelaku_ip: '127.0.0.1 (Internal)',
      tindakan: 'SYS_CONFIG',
      entiti_jenis: 'konfigurasi',
      entiti_id: 'SYS-OPTIMISTIC-LOCK',
      no_rujukan: 'v2026.03.26-REV3',
      keterangan: 'Penyelarasan nombor versi kunci optimistik pangkalan data BTM.',
      hash: '0981facb33100299...',
      integriti: 'verified',
    }
  ];

  const notifikasi: Notifikasi[] = [
    {
      id: 'notif-1',
      penerima_uid: 'usr-salmah',
      tajuk: 'Status Permohonan SPPKPP/2026/000115 Selesai',
      mesej: 'Status permohonan Pemasangan Banner Interaktif telah dimuat naik dan diterbitkan secara langsung di portal rasmi.',
      jenis: 'status',
      permohonan_id: 'pmh-000115',
      dibaca: false,
      dicipta_pada: '2026-03-29T10:00:00Z',
    },
    {
      id: 'notif-2',
      penerima_uid: 'usr-faiz',
      tajuk: 'Pindaan Maklumat Diminta untuk SPPKPP/2026/000139',
      mesej: 'Pegawai Penilai telah menukar status kepada Perlu Maklumat Tambahan berikutan resolusi gambar tidak mematuhi piawaian.',
      jenis: 'peringatan',
      permohonan_id: 'pmh-000139',
      dibaca: false,
      dicipta_pada: '2026-03-29T09:45:00Z',
    },
    {
      id: 'notif-3',
      penerima_uid: 'usr-faiz',
      tajuk: 'Agihan Tugas Baharu: SPPKPP/2026/000141',
      mesej: 'Ketua Seksyen Portal telah memperuntukkan tiket kepada anda untuk tindakan muat naik segera.',
      jenis: 'info',
      permohonan_id: 'pmh-000141',
      dibaca: false,
      dicipta_pada: '2026-03-29T08:30:00Z',
    }
  ];

  const config: SystemConfig = {
    sla_hari_biasa: 5,
    sla_hari_segera: 2,
    sla_hari_kritikal: 1,
    had_saiz_fail_mb: 10,
    had_bilangan_fail: 5,
    tamat_sesi_minit: 30,
    mfa_totp_diwajibkan: true,
    waktu_operasi: {
      mula: '08:00 AM',
      tamat: '05:00 PM',
      hari: 'Isnin hingga Jumaat',
      auto_tolak_cuti_am: true,
    },
    api_gateway: {
      status: 'aktif',
      latensi_ms: 42,
    },
    beban_pelayan: {
      node: 'NODE-KNT-01',
      penggunaan_cpu: '24.8%',
      storan_digunakan_gb: 412,
      storan_maksimum_tb: 1,
    }
  };

  const pending_accounts: PendingAccount[] = [
    {
      id: 'pend-1',
      nama_penuh: 'Nur Zulaikha binti Halim',
      no_mykad: '920412-06-5542',
      emel: 'zulaikha.ptg@pahang.gov.my',
      agensi_jabatan: 'Pejabat Tanah & Galian Pahang',
      bahagian: 'Bahagian Korporat',
      peranan_dimohon: 'Pegawai Agensi',
      tarikh_mohon: 'Hari ini, 09:42 AM',
      status: 'menunggu',
    },
    {
      id: 'pend-2',
      nama_penuh: 'Ahmad Muaz bin Razali',
      no_mykad: '880719-06-5121',
      emel: 'muaz.mbk@pahang.gov.my',
      agensi_jabatan: 'Majlis Bandaraya Kuantan (MBK)',
      bahagian: 'Unit Komunikasi Awam',
      peranan_dimohon: 'Pegawai Agensi',
      tarikh_mohon: 'Semalam, 04:15 PM',
      status: 'menunggu',
    },
    {
      id: 'pend-3',
      nama_penuh: 'Siti Hajar binti Osman',
      no_mykad: '950130-06-5834',
      emel: 'sitihajar.jps@pahang.gov.my',
      agensi_jabatan: 'Jabatan Pengairan dan Saliran Pahang',
      bahagian: 'Bahagian Pengurusan Banjir',
      peranan_dimohon: 'Penyelaras Portal BTM',
      tarikh_mohon: 'Semalam, 02:08 PM',
      status: 'menunggu',
    }
  ];

  return {
    organisasi,
    pengguna,
    kategori,
    permohonan,
    audit_logs,
    notifikasi,
    config,
    pending_accounts,
  };
}

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading database file, regenerating default:', e);
    }
    const initial = generateInitialDatabase();
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    try {
      ensureDirectoryExistence(DB_FILE);
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing to database file:', e);
    }
  }

  public save() {
    this.saveData(this.data);
  }

  public getRaw(): DatabaseSchema {
    return this.data;
  }

  // --- Users & Auth ---
  public findUserByEmail(email: string): Pengguna | undefined {
    return this.data.pengguna.find(u => u.emel.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): Pengguna | undefined {
    return this.data.pengguna.find(u => u.id === id);
  }

  public createUser(user: Omit<Pengguna, 'id' | 'dicipta_pada'>): Pengguna {
    const newUser: Pengguna = {
      ...user,
      id: `usr-${Date.now()}`,
      dicipta_pada: new Date().toISOString(),
    };
    this.data.pengguna.push(newUser);
    this.save();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<Pengguna>): Pengguna | undefined {
    const user = this.findUserById(id);
    if (!user) return undefined;
    Object.assign(user, updates);
    this.save();
    return user;
  }

  // --- Applications ---
  public getAllPermohonan(): Permohonan[] {
    return this.data.permohonan.filter(p => !p.dipadam);
  }

  public getPermohonanById(id: string): Permohonan | undefined {
    return this.data.permohonan.find(p => p.id === id || p.no_rujukan === id);
  }

  public createPermohonan(p: Partial<Permohonan>, actor: Pengguna): Permohonan {
    const count = this.data.permohonan.length + 1;
    const year = new Date().getFullYear();
    const formattedNum = String(count + 142).padStart(6, '0');
    const no_rujukan = p.saluran_penerimaan && p.saluran_penerimaan !== 'sistem'
      ? `SPPKPP/${year}/SL-${String(count + 490).padStart(5, '0')}`
      : `SPPKPP/${year}/${formattedNum}`;

    const newPermohonan: Permohonan = {
      id: `pmh-${Date.now()}`,
      no_rujukan,
      tajuk: p.tajuk || 'Permohonan Kemaskini Portal',
      penerangan: p.penerangan || '',
      kategori_id: p.kategori_id || 'kat-brt',
      kategori_kod: p.kategori_kod || 'BRT',
      kategori_nama: p.kategori_nama || 'Berita / Kenyataan Media',
      jenis_kemaskini: p.jenis_kemaskini || 'tambah',
      url_halaman: p.url_halaman || 'https://www.pahang.gov.my',
      keutamaan: p.keutamaan || 'biasa',
      tarikh_dikehendaki: p.tarikh_dikehendaki || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      saluran_penerimaan: p.saluran_penerimaan || 'sistem',
      rujukan_surat: p.rujukan_surat,
      tarikh_surat: p.tarikh_surat,
      tarikh_terima: p.tarikh_terima || new Date().toISOString(),
      pemohon_uid: p.pemohon_uid || actor.id,
      pemohon_snapshot: p.pemohon_snapshot || {
        nama: actor.nama_penuh,
        emel: actor.emel,
        telefon: actor.no_telefon,
        org_id: actor.org_id,
        org_nama: 'Pejabat SUK Pahang',
        jawatan: actor.jawatan,
      },
      didaftar_oleh_uid: actor.id,
      org_id: p.org_id || actor.org_id,
      org_nama: p.org_nama || 'Pejabat SUK Pahang',
      status: p.saluran_penerimaan && p.saluran_penerimaan !== 'sistem' ? 'diterima' : (p.status || 'dihantar'),
      pegawai_uid: p.pegawai_uid,
      pegawai_nama: p.pegawai_nama,
      sla_tarikh_akhir: new Date(Date.now() + 86400000 * 2).toISOString(),
      sla_baki_teks: p.keutamaan === 'kritikal' ? '24 Jam' : p.keutamaan === 'segera' ? '48 Jam' : '5 Hari',
      sla_peratus_tamat: 10,
      sla_jumlah_jeda_ms: 0,
      lewat: false,
      bil_lampiran: (p.lampiran && p.lampiran.length) || 0,
      bil_komen: 0,
      versi: 1,
      dipadam: false,
      dicipta_pada: new Date().toISOString(),
      dikemaskini_pada: new Date().toISOString(),
      lampiran: p.lampiran || [],
      komen: [],
      sejarah_status: [
        {
          id: `sh-${Date.now()}`,
          permohonan_id: `pmh-${Date.now()}`,
          dari: 'draf',
          ke: p.saluran_penerimaan && p.saluran_penerimaan !== 'sistem' ? 'diterima' : 'dihantar',
          oleh_uid: actor.id,
          oleh_nama: actor.nama_penuh,
          oleh_peranan: actor.peranan,
          catatan: p.saluran_penerimaan && p.saluran_penerimaan !== 'sistem'
            ? `Didaftar melalui saluran luar (${p.saluran_penerimaan}) oleh ${actor.nama_penuh}.`
            : 'Permohonan dihantar oleh pemohon.',
          masa: new Date().toISOString(),
        }
      ]
    };

    this.data.permohonan.unshift(newPermohonan);

    // Audit log
    this.addAuditLog({
      tindakan: p.saluran_penerimaan && p.saluran_penerimaan !== 'sistem' ? 'PMH_DAFTAR_SALURAN_LUAR' : 'PMH_HANTAR',
      entiti_jenis: 'permohonan',
      entiti_id: newPermohonan.id,
      no_rujukan: newPermohonan.no_rujukan,
      pelaku: actor,
      keterangan: `Permohonan baru ${newPermohonan.no_rujukan} (${newPermohonan.tajuk}) telah berjaya didaftarkan.`,
      selepas: { status: newPermohonan.status, keutamaan: newPermohonan.keutamaan },
    });

    this.save();
    return newPermohonan;
  }

  public updatePermohonanStatus(
    id: string,
    keStatus: StatusPermohonan,
    alasan: string,
    actor: Pengguna,
    extra?: { url_hasil?: string; catatan_penyelesaian?: string }
  ): Permohonan | undefined {
    const item = this.getPermohonanById(id);
    if (!item) return undefined;

    const dariStatus = item.status;
    item.status = keStatus;
    item.versi += 1;
    item.dikemaskini_pada = new Date().toISOString();

    if (extra?.url_hasil) item.url_hasil = extra.url_hasil;
    if (extra?.catatan_penyelesaian) item.catatan_penyelesaian = extra.catatan_penyelesaian;

    if (keStatus === 'perlu_maklumat') {
      item.sla_dijeda_pada = new Date().toISOString();
      item.sla_sebab_jeda = alasan;
      item.sla_baki_teks = 'SLA Dijeda';
    } else if (dariStatus === 'perlu_maklumat') {
      item.sla_dijeda_pada = undefined;
      item.sla_sebab_jeda = undefined;
      item.sla_baki_teks = 'Aktif Berjalan';
    }

    if (keStatus === 'selesai') {
      item.tarikh_selesai = new Date().toISOString();
      item.tarikh_ditutup = new Date().toISOString();
      item.sla_peratus_tamat = 100;
    }

    // Add status history
    item.sejarah_status.push({
      id: `sh-${Date.now()}`,
      permohonan_id: item.id,
      dari: dariStatus,
      ke: keStatus,
      oleh_uid: actor.id,
      oleh_nama: actor.nama_penuh,
      oleh_peranan: actor.peranan,
      catatan: alasan || `Peralihan status kepada ${keStatus}`,
      masa: new Date().toISOString(),
    });

    // Add Audit Log
    this.addAuditLog({
      tindakan: 'PMH_STATUS_UBAH',
      entiti_jenis: 'permohonan',
      entiti_id: item.id,
      no_rujukan: item.no_rujukan,
      pelaku: actor,
      sebelum: { status: dariStatus },
      selepas: { status: keStatus, ...extra },
      keterangan: `Status permohonan ${item.no_rujukan} diubah dari ${dariStatus} kepada ${keStatus}. Catatan: ${alasan || '-'}`,
    });

    // Notify applicant if finished or paused
    if (keStatus === 'selesai' || keStatus === 'perlu_maklumat') {
      this.data.notifikasi.unshift({
        id: `notif-${Date.now()}`,
        penerima_uid: item.pemohon_uid,
        tajuk: keStatus === 'selesai' ? `Permohonan ${item.no_rujukan} Selesai & Diterbitkan` : `Tindakan Diperlukan: ${item.no_rujukan}`,
        mesej: alasan || (keStatus === 'selesai' ? 'Kandungan portal telah siap dikemaskini dan diterbitkan secara langsung.' : 'Maklumat tambahan diperlukan daripada pihak anda.'),
        jenis: keStatus === 'selesai' ? 'status' : 'peringatan',
        permohonan_id: item.id,
        dibaca: false,
        dicipta_pada: new Date().toISOString(),
      });
    }

    this.save();
    return item;
  }

  public assignPermohonan(
    id: string,
    pegawaiId: string,
    pegawaiNama: string,
    actor: Pengguna
  ): Permohonan | undefined {
    const item = this.getPermohonanById(id);
    if (!item) return undefined;

    const oldPegawai = item.pegawai_nama;
    item.pegawai_uid = pegawaiId;
    item.pegawai_nama = pegawaiNama;
    item.dikemaskini_pada = new Date().toISOString();
    if (item.status === 'diterima' || item.status === 'dihantar') {
      item.status = 'dalam_semakan';
    }

    this.addAuditLog({
      tindakan: 'PMH_AGIH',
      entiti_jenis: 'permohonan',
      entiti_id: item.id,
      no_rujukan: item.no_rujukan,
      pelaku: actor,
      sebelum: { pegawai: oldPegawai },
      selepas: { pegawai: pegawaiNama },
      keterangan: `Tugasan bagi tiket ${item.no_rujukan} diperuntukkan kepada ${pegawaiNama}.`,
    });

    this.data.notifikasi.unshift({
      id: `notif-${Date.now()}`,
      penerima_uid: pegawaiId,
      tajuk: `Tugasan Baharu Diserahkan: ${item.no_rujukan}`,
      mesej: `Anda telah ditugaskan untuk mengendalikan permohonan kemaskini portal: ${item.tajuk}`,
      jenis: 'info',
      permohonan_id: item.id,
      dibaca: false,
      dicipta_pada: new Date().toISOString(),
    });

    this.save();
    return item;
  }

  public addComment(
    permohonanId: string,
    teks: string,
    jenis: 'awam' | 'dalaman',
    actor: Pengguna
  ): Komen | undefined {
    const item = this.getPermohonanById(permohonanId);
    if (!item) return undefined;

    const newComment: Komen = {
      id: `kom-${Date.now()}`,
      permohonan_id: item.id,
      teks,
      jenis,
      penulis_uid: actor.id,
      penulis_nama: actor.nama_penuh,
      penulis_peranan: actor.peranan,
      avatar_url: actor.avatar_url,
      dicipta_pada: new Date().toISOString(),
    };

    item.komen.push(newComment);
    item.bil_komen = item.komen.length;
    item.dikemaskini_pada = new Date().toISOString();

    this.addAuditLog({
      tindakan: 'KOMEN_TAMBAH',
      entiti_jenis: 'permohonan',
      entiti_id: item.id,
      no_rujukan: item.no_rujukan,
      pelaku: actor,
      keterangan: `Komen (${jenis === 'dalaman' ? 'Sulit Dalaman BTM' : 'Awam'}) ditambah pada tiket ${item.no_rujukan}.`,
    });

    this.save();
    return newComment;
  }

  public addAuditLog(entry: {
    tindakan: string;
    entiti_jenis: string;
    entiti_id: string;
    no_rujukan?: string;
    pelaku: Pengguna;
    keterangan: string;
    sebelum?: any;
    selepas?: any;
  }) {
    const id = `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const corrId = `CORR-${Math.floor(100000 + Math.random() * 900000)}`;

    const log: AuditLog = {
      id,
      masa: new Date().toISOString(),
      id_korelasi: corrId,
      pelaku_uid: entry.pelaku.id,
      pelaku_nama: entry.pelaku.nama_penuh,
      pelaku_peranan: entry.pelaku.jawatan || entry.pelaku.peranan,
      pelaku_ip: '10.24.8.112',
      tindakan: entry.tindakan,
      entiti_jenis: entry.entiti_jenis,
      entiti_id: entry.entiti_id,
      no_rujukan: entry.no_rujukan,
      sebelum: entry.sebelum,
      selepas: entry.selepas,
      keterangan: entry.keterangan,
      hash,
      integriti: 'verified',
    };

    this.data.audit_logs.unshift(log);
    // keep max 500
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs.pop();
    }
  }

  // --- Configuration ---
  public updateConfig(updates: Partial<SystemConfig>, actor: Pengguna) {
    Object.assign(this.data.config, updates);
    this.addAuditLog({
      tindakan: 'SYS_CONFIG',
      entiti_jenis: 'konfigurasi',
      entiti_id: 'SYS-GLOBAL',
      pelaku: actor,
      keterangan: 'Parameter tadbir urus dan had sistem dikemaskini oleh pentadbir.',
      selepas: updates,
    });
    this.save();
    return this.data.config;
  }

  // --- Pending Accounts ---
  public approvePendingAccount(pendingId: string, actor: Pengguna) {
    const pending = this.data.pending_accounts.find(p => p.id === pendingId);
    if (!pending) return false;
    pending.status = 'diluluskan';

    const defaultPasswordHash = bcrypt.hashSync('Password123!@#', 10);
    this.createUser({
      nama_penuh: pending.nama_penuh,
      emel: pending.emel,
      no_telefon: '+60 9-512 6600',
      jawatan: pending.peranan_dimohon,
      org_id: 'org-bpen',
      peranan: 'pemohon',
      status_akaun: 'aktif',
      mfa_didaftar: false,
      password_hash: defaultPasswordHash,
    });

    this.addAuditLog({
      tindakan: 'AKAUN_LULUS',
      entiti_jenis: 'pengguna',
      entiti_id: pendingId,
      pelaku: actor,
      keterangan: `Kelulusan akaun pengguna ${pending.nama_penuh} (${pending.emel}) disahkan oleh ${actor.nama_penuh}.`,
    });

    this.save();
    return true;
  }

  public rejectPendingAccount(pendingId: string, actor: Pengguna) {
    const pending = this.data.pending_accounts.find(p => p.id === pendingId);
    if (!pending) return false;
    pending.status = 'ditolak';

    this.addAuditLog({
      tindakan: 'AKAUN_GANTUNG',
      entiti_jenis: 'pengguna',
      entiti_id: pendingId,
      pelaku: actor,
      keterangan: `Pendaftaran akaun pengguna ${pending.nama_penuh} ditolak.`,
    });

    this.save();
    return true;
  }
}

export const db = new Database();
