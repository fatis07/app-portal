import React, { useState } from 'react';
import { api, ApplicationItem } from '../lib/api.ts';

interface DaftarSaluranLuarProps {
  onSuccess: (item: ApplicationItem) => void;
  onNavigate: (path: string) => void;
}

export const DaftarSaluranLuarView: React.FC<DaftarSaluranLuarProps> = ({ onSuccess, onNavigate }) => {
  const [saluran, setSaluran] = useState<'surat_rasmi' | 'emel_rasmi' | 'whatsapp_pimpinan' | 'serahan_fizikal'>('surat_rasmi');
  const [applicantType, setApplicantType] = useState<'registered' | 'unregistered'>('registered');

  // Form Fields
  const [noRujukanPunca, setNoRujukanPunca] = useState('SUK.PHG.BTM.100-4/2/12(45)');
  const [tarikhSurat, setTarikhSurat] = useState('2026-03-29');
  const [tarikhDiterima, setTarikhDiterima] = useState('2026-03-30T10:15');
  const [namaPemohon, setNamaPemohon] = useState('Puan Siti Nurhaliza binti Kamarudin');
  const [jabatanAgensi, setJabatanAgensi] = useState('Bahagian Perancang Ekonomi Negeri (BPEN) Pahang');
  const [emelPemohon, setEmelPemohon] = useState('sitinurhaliza@pahang.gov.my');
  const [telefonPemohon, setTelefonPemohon] = useState('09-5126688 samb. 2104');

  // Specification
  const [kategoriKandungan, setKategoriKandungan] = useState('Berita_Artikel');
  const [tahapKeutamaan, setTahapKeutamaan] = useState<'biasa' | 'segera' | 'kritikal'>('segera');
  const [tajukKemaskini, setTajukKemaskini] = useState('Penyusunan Semula Jadual Temuduga Terbuka Skim Perkhidmatan Awam Negeri Pahang 2026');
  const [urlSasaran, setUrlSasaran] = useState('https://pahang.gov.my/kerjaya/jadual-temuduga-2026');
  const [notaArahan, setNotaArahan] = useState(
    'Sila gantikan fail PDF lampiran lama dengan fail jadual bertarikh 29 Mac 2026. Kemaskini juga tarikh tutup pendaftaran kepada 15 April 2026 mengikut arahan surat SUK.'
  );

  const [autoNotify, setAutoNotify] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [uploadedFiles, setUploadedFiles] = useState([
    {
      id: 'f1',
      name: 'Surat_Rasmi_BPEN_Jadual_Temuduga_Mac2026.pdf',
      size: '2.4 MB • Dimuat naik oleh Pengguna',
      type: 'pdf',
    },
    {
      id: 'f2',
      name: 'Tangkapan_Skrin_Minit_Kelulusan_KSU.jpg',
      size: '840 KB • Resolusi Tinggi',
      type: 'img',
    },
  ]);

  const handleToggleApplicant = (type: 'registered' | 'unregistered') => {
    setApplicantType(type);
    if (type === 'registered') {
      setNamaPemohon('Puan Siti Nurhaliza binti Kamarudin');
      setEmelPemohon('sitinurhaliza@pahang.gov.my');
      setJabatanAgensi('Bahagian Perancang Ekonomi Negeri (BPEN) Pahang');
    } else {
      setNamaPemohon('');
      setEmelPemohon('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const saluranMap: Record<string, any> = {
        surat_rasmi: 'surat',
        emel_rasmi: 'emel',
        whatsapp_pimpinan: 'whatsapp',
        serahan_fizikal: 'lain',
      };

      const payload = {
        tajuk: tajukKemaskini,
        penerangan: notaArahan,
        kategori_id: 'kat-brt',
        kategori_kod: 'BRT',
        kategori_nama: kategoriKandungan.replace('_', ' '),
        jenis_kemaskini: 'ubah',
        url_halaman: urlSasaran,
        keutamaan: tahapKeutamaan,
        saluran_penerimaan: saluranMap[saluran] || 'surat',
        rujukan_surat: noRujukanPunca,
        tarikh_surat: tarikhSurat,
        tarikh_terima: new Date(tarikhDiterima).toISOString(),
        pemohon_snapshot: {
          nama: namaPemohon,
          emel: emelPemohon,
          telefon: telefonPemohon,
          org_id: 'org-bpen',
          org_nama: jabatanAgensi,
          jawatan: 'Pegawai Tadbir & Diplomatik',
        },
        org_id: 'org-bpen',
        org_nama: jabatanAgensi,
        lampiran: uploadedFiles.map((f) => ({
          id: f.id,
          nama_fail: f.name,
          jenis_mime: f.type === 'pdf' ? 'application/pdf' : 'image/jpeg',
          saiz_bait: 1024 * 1024,
          saiz_teks: f.size,
          laluan_storan: `/uploads/${f.name}`,
          jenis_lampiran: 'bukti_saluran',
          dimuat_naik_oleh: 'Ts. Mohd Faiz (BTM)',
          dimuat_naik_pada: new Date().toISOString(),
          checksum_sha256: 'a7f89b1c3e44...',
          status_imbasan: 'bersih',
        })),
      };

      const res = await api.registerExternal(payload);
      setToastMsg(`Permohonan luar telah dijana dengan ID ${res.item.no_rujukan} dan dialirkan ke queue.`);
      setTimeout(() => {
        onSuccess(res.item);
        onNavigate('queue-permohonan');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Gagal mendaftar permohonan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-[24px] text-tertiary-fixed">verified</span>
          <div>
            <h5 className="font-title-sm text-sm font-bold">Permohonan Telah Didaftar</h5>
            <p className="font-body-sm text-xs opacity-90">{toastMsg}</p>
          </div>
        </div>
      )}

      {/* Breadcrumb & Top Page Meta Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <nav className="flex items-center gap-2 font-label-sm text-xs text-on-surface-variant">
            <button onClick={() => onNavigate('dashboard-kerja')} className="hover:text-primary cursor-pointer">
              Utama
            </button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Pengurusan Portal</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-bold">Daftar Saluran Luar</span>
          </nav>
          <div className="flex items-center gap-3 pt-1">
            <div className="p-2.5 rounded-xl bg-primary-container text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[24px]">forward_to_inbox</span>
            </div>
            <div>
              <h1 className="font-headline-lg text-2xl text-on-surface tracking-tight font-bold">
                Daftar Permohonan Saluran Luar
              </h1>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-0.5 max-w-3xl leading-relaxed">
                Pendaftaran rekod permohonan kemaskini portal yang diterima di luar sistem (Surat Rasmi, E-mel BTM, WhatsApp Pimpinan). Memastikan 100% permohonan direkodkan secara rasmi mengikut standard tadbir urus ICT SUK Pahang.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action / Status Counter Pill */}
        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-sm flex items-center gap-3 border border-white/80">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-bold">SLA Saluran Luar</span>
              <span className="font-title-sm text-xs text-primary font-bold">Kemasukan Pantas &lt; 2 Jam</span>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Selection Matrix */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-title-sm text-sm text-on-surface flex items-center gap-2 font-bold">
            <span className="material-symbols-outlined text-[20px] text-primary">hub</span>
            Pilih Saluran Penerimaan Asal
          </h2>
          <span className="font-label-sm text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded font-medium">
            Wajib Dipilih
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Surat */}
          <div
            onClick={() => setSaluran('surat_rasmi')}
            className={`cursor-pointer p-4 rounded-2xl transition-all duration-200 border ${
              saluran === 'surat_rasmi'
                ? 'bg-primary text-white shadow-md border-primary'
                : 'bg-white/80 backdrop-blur-xl text-on-surface hover:shadow-md border-white/80'
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`p-2.5 rounded-xl ${
                  saluran === 'surat_rasmi' ? 'bg-primary-container text-white' : 'bg-surface-container text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">mark_email_read</span>
              </div>
              <span
                className={`font-label-sm text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${
                  saluran === 'surat_rasmi' ? 'bg-white text-primary' : 'bg-tertiary-container text-on-tertiary-container'
                }`}
              >
                Piawaian SUK
              </span>
            </div>
            <div className="mt-3">
              <h3 className="font-title-sm text-sm font-bold">Surat Rasmi Kerajaan</h3>
              <p className={`text-xs mt-1 line-clamp-2 ${saluran === 'surat_rasmi' ? 'text-white/80' : 'text-on-surface-variant'}`}>
                Warta berkanun, pekeliling, surat iringan jabatan &amp; minit fail SUK bertandatangan.
              </p>
            </div>
            <div className="mt-3 pt-2 flex items-center gap-1.5 text-xs opacity-90 border-t border-white/20">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Perlu No. Rujukan Fail</span>
            </div>
          </div>

          {/* Card 2: Emel */}
          <div
            onClick={() => setSaluran('emel_rasmi')}
            className={`cursor-pointer p-4 rounded-2xl transition-all duration-200 border ${
              saluran === 'emel_rasmi'
                ? 'bg-primary text-white shadow-md border-primary'
                : 'bg-white/80 backdrop-blur-xl text-on-surface hover:shadow-md border-white/80'
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`p-2.5 rounded-xl ${
                  saluran === 'emel_rasmi' ? 'bg-primary-container text-white' : 'bg-surface-container text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">alternate_email</span>
              </div>
              <span
                className={`font-label-sm text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${
                  saluran === 'emel_rasmi' ? 'bg-white text-primary' : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                Autentikasi
              </span>
            </div>
            <div className="mt-3">
              <h3 className="font-title-sm text-sm font-bold">E-mel Rasmi BTM</h3>
              <p className={`text-xs mt-1 line-clamp-2 ${saluran === 'emel_rasmi' ? 'text-white/80' : 'text-on-surface-variant'}`}>
                Diterima di peti masuk rasmi portal@pahang.gov.my atau webmaster.
              </p>
            </div>
            <div className="mt-3 pt-2 flex items-center gap-1.5 text-xs opacity-90 border-t border-white/20">
              <span className="material-symbols-outlined text-[16px]">domain_verification</span>
              <span>Domain rasmi .gov.my</span>
            </div>
          </div>

          {/* Card 3: WhatsApp */}
          <div
            onClick={() => setSaluran('whatsapp_pimpinan')}
            className={`cursor-pointer p-4 rounded-2xl transition-all duration-200 border ${
              saluran === 'whatsapp_pimpinan'
                ? 'bg-primary text-white shadow-md border-primary'
                : 'bg-white/80 backdrop-blur-xl text-on-surface hover:shadow-md border-white/80'
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`p-2.5 rounded-xl ${
                  saluran === 'whatsapp_pimpinan' ? 'bg-primary-container text-white' : 'bg-surface-container text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">bolt</span>
              </div>
              <span
                className={`font-label-sm text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${
                  saluran === 'whatsapp_pimpinan' ? 'bg-white text-error' : 'bg-error-container text-on-error-container'
                }`}
              >
                Khas / Pantas
              </span>
            </div>
            <div className="mt-3">
              <h3 className="font-title-sm text-sm font-bold">WhatsApp Pimpinan</h3>
              <p className={`text-xs mt-1 line-clamp-2 ${saluran === 'whatsapp_pimpinan' ? 'text-white/80' : 'text-on-surface-variant'}`}>
                Arahan segera YB SUK, Exco Kerajaan Negeri, atau Pegawai Kanan Kerajaan.
              </p>
            </div>
            <div className="mt-3 pt-2 flex items-center gap-1.5 text-xs opacity-90 border-t border-white/20">
              <span className="material-symbols-outlined text-[16px]">screenshot</span>
              <span>Wajib Lampiran Mesej</span>
            </div>
          </div>

          {/* Card 4: Kaunter */}
          <div
            onClick={() => setSaluran('serahan_fizikal')}
            className={`cursor-pointer p-4 rounded-2xl transition-all duration-200 border ${
              saluran === 'serahan_fizikal'
                ? 'bg-primary text-white shadow-md border-primary'
                : 'bg-white/80 backdrop-blur-xl text-on-surface hover:shadow-md border-white/80'
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`p-2.5 rounded-xl ${
                  saluran === 'serahan_fizikal' ? 'bg-primary-container text-white' : 'bg-surface-container text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">co_present</span>
              </div>
              <span
                className={`font-label-sm text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${
                  saluran === 'serahan_fizikal' ? 'bg-white text-primary' : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                Fizikal
              </span>
            </div>
            <div className="mt-3">
              <h3 className="font-title-sm text-sm font-bold">Kaunter / Serahan Fizikal</h3>
              <p className={`text-xs mt-1 line-clamp-2 ${saluran === 'serahan_fizikal' ? 'text-white/80' : 'text-on-surface-variant'}`}>
                Penghantaran thumbdrive, CD, poster cetakan terus ke kaunter khidmat BTM.
              </p>
            </div>
            <div className="mt-3 pt-2 flex items-center gap-1.5 text-xs opacity-90 border-t border-white/20">
              <span className="material-symbols-outlined text-[16px]">touch_app</span>
              <span>Borang Log Penerimaan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Administrative Entry Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Lajur Kiri: Maklumat Punca & Pemohon */}
          <div className="lg:col-span-6 bg-white/90 backdrop-blur-2xl rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 border border-white/80 text-xs sm:text-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-primary rounded-full"></span>
                  <h2 className="font-headline-md text-base text-on-surface font-bold">Bahagian 1: Punca &amp; Pemohon</h2>
                </div>
                <span className="font-label-sm text-[11px] text-on-surface-variant bg-surface-container px-2 py-1 rounded">
                  Langkah 1/2
                </span>
              </div>

              {/* No. Rujukan Fail */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-on-surface" htmlFor="no_rujukan_punca">
                    No. Rujukan Fail / Surat Punca <span className="text-error">*</span>
                  </label>
                  <span className="text-[11px] text-on-surface-variant">Format Rasmi Arkib SUK</span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[18px] text-primary">tag</span>
                  <input
                    id="no_rujukan_punca"
                    type="text"
                    required
                    value={noRujukanPunca}
                    onChange={(e) => setNoRujukanPunca(e.target.value)}
                    placeholder="Cth: SUK.PHG.BTM.100-4/2/12(45)"
                    className="w-full bg-surface-container-low/70 rounded-xl pl-10 pr-4 py-2.5 text-on-surface placeholder:text-outline-variant focus:bg-white focus:outline-none transition-all shadow-inner border border-slate-200"
                  />
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Sila masukkan rujukan penuh seperti yang tercetak pada kepala surat rasmi atau subjek e-mel.
                </p>
              </div>

              {/* Dual Date Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-on-surface" htmlFor="tarikh_surat">
                    Tarikh Dikeluarkan <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[18px] text-outline">calendar_today</span>
                    <input
                      id="tarikh_surat"
                      type="date"
                      required
                      value={tarikhSurat}
                      onChange={(e) => setTarikhSurat(e.target.value)}
                      className="w-full bg-surface-container-low/70 rounded-xl pl-10 pr-3 py-2 text-on-surface focus:bg-white focus:outline-none transition-all border border-slate-200"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-on-surface" htmlFor="tarikh_diterima">
                    Tarikh &amp; Masa Diterima di BTM <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[18px] text-outline">schedule</span>
                    <input
                      id="tarikh_diterima"
                      type="datetime-local"
                      required
                      value={tarikhDiterima}
                      onChange={(e) => setTarikhDiterima(e.target.value)}
                      className="w-full bg-surface-container-low/70 rounded-xl pl-10 pr-3 py-2 text-on-surface focus:bg-white focus:outline-none transition-all border border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Status Pangkalan Data Pemohon Toggle */}
              <div className="p-3 rounded-xl bg-surface-container-low/60 space-y-2 border border-slate-100">
                <div className="font-semibold text-on-surface flex items-center justify-between text-xs">
                  <span>Status Pangkalan Data Pemohon</span>
                  <span className="text-primary">Sistem HRMIS / Direktori SUK</span>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-surface-container rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => handleToggleApplicant('registered')}
                    className={`py-2 px-3 rounded-md text-xs transition-all text-center cursor-pointer ${
                      applicantType === 'registered'
                        ? 'bg-white shadow-sm text-primary font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Padankan Pengguna Berdaftar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleApplicant('unregistered')}
                    className={`py-2 px-3 rounded-md text-xs transition-all text-center cursor-pointer ${
                      applicantType === 'unregistered'
                        ? 'bg-white shadow-sm text-primary font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Pemohon Belum Mendaftar
                  </button>
                </div>
              </div>

              {/* Nama Pegawai Pemohon */}
              <div className="space-y-1">
                <label className="font-semibold text-on-surface" htmlFor="nama_pemohon">
                  Nama Pegawai Pemohon <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[18px] text-outline">person_search</span>
                  <input
                    id="nama_pemohon"
                    type="text"
                    required
                    value={namaPemohon}
                    onChange={(e) => setNamaPemohon(e.target.value)}
                    placeholder="Taip nama atau carian..."
                    className="w-full bg-surface-container-low/70 rounded-xl pl-10 pr-24 py-2.5 text-on-surface focus:bg-white focus:outline-none transition-all border border-slate-200"
                  />
                  {applicantType === 'registered' && (
                    <span className="absolute right-3 top-2.5 font-label-sm text-[11px] text-primary bg-primary-fixed/50 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> Disahkan
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-on-surface-variant block">Jawatan: Pegawai Tadbir &amp; Diplomatik (M48)</span>
              </div>

              {/* Bahagian / Jabatan */}
              <div className="space-y-1">
                <label className="font-semibold text-on-surface" htmlFor="jabatan_agensi">
                  Jabatan / Agensi / Bahagian Pemohon <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[18px] text-outline">apartment</span>
                  <select
                    id="jabatan_agensi"
                    value={jabatanAgensi}
                    onChange={(e) => setJabatanAgensi(e.target.value)}
                    className="w-full bg-surface-container-low/70 rounded-xl pl-10 pr-8 py-2.5 text-on-surface focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer border border-slate-200"
                  >
                    <option value="Bahagian Perancang Ekonomi Negeri (BPEN) Pahang">Bahagian Perancang Ekonomi Negeri (BPEN) Pahang</option>
                    <option value="Bahagian Khidmat Pengurusan (BKP) SUK Pahang">Bahagian Khidmat Pengurusan (BKP) SUK Pahang</option>
                    <option value="Pejabat Daerah & Tanah Lipis">Pejabat Daerah &amp; Tanah Lipis</option>
                    <option value="Pejabat Daerah & Tanah Kuantan">Pejabat Daerah &amp; Tanah Kuantan</option>
                    <option value="Bahagian Teknologi Maklumat (BTM) SUK">Bahagian Teknologi Maklumat (BTM) SUK</option>
                    <option value="Jabatan Agama Islam Pahang (JAIP)">Jabatan Agama Islam Pahang (JAIP)</option>
                    <option value="Yayasan Pahang">Yayasan Pahang</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-3 text-[18px] text-outline pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Contact Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-on-surface" htmlFor="emel_pemohon">
                    E-mel Rasmi Pemohon <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[18px] text-outline">mail</span>
                    <input
                      id="emel_pemohon"
                      type="email"
                      required
                      value={emelPemohon}
                      onChange={(e) => setEmelPemohon(e.target.value)}
                      className="w-full bg-surface-container-low/70 rounded-xl pl-10 pr-3 py-2 text-on-surface focus:bg-white focus:outline-none transition-all border border-slate-200"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-on-surface" htmlFor="telefon_pemohon">
                    No. Telefon / Sambungan <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[18px] text-outline">call</span>
                    <input
                      id="telefon_pemohon"
                      type="text"
                      required
                      value={telefonPemohon}
                      onChange={(e) => setTelefonPemohon(e.target.value)}
                      className="w-full bg-surface-container-low/70 rounded-xl pl-10 pr-3 py-2 text-on-surface focus:bg-white focus:outline-none transition-all border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pegawai Pendaftar Badge */}
            <div className="mt-4 pt-3 bg-surface-container-low/80 rounded-xl p-3 flex items-center justify-between border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-container text-white">
                  <span className="material-symbols-outlined text-[20px]">badge</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">
                    Pegawai Pendaftar (BTM)
                  </span>
                  <span className="font-title-sm text-xs text-on-surface font-bold">Ts. Mohd Faiz bin Azmi</span>
                </div>
              </div>
              <span className="font-label-sm text-[11px] text-primary font-semibold px-2 py-1 bg-white rounded-md shadow-xs border border-slate-100">
                ID: BTM-PORTAL-882
              </span>
            </div>
          </div>

          {/* Lajur Kanan: Spesifikasi Kemaskini Kandungan & Lampiran Bukti */}
          <div className="lg:col-span-6 bg-white/90 backdrop-blur-2xl rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 border border-white/80 text-xs sm:text-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-tertiary rounded-full"></span>
                  <h2 className="font-headline-md text-base text-on-surface font-bold">
                    Bahagian 2: Spesifikasi Kandungan
                  </h2>
                </div>
                <span className="font-label-sm text-[11px] text-on-surface-variant bg-surface-container px-2 py-1 rounded">
                  Langkah 2/2
                </span>
              </div>

              {/* Kategori & Keutamaan Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-on-surface" htmlFor="kategori_kandungan">
                    Kategori Kandungan <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[18px] text-outline">category</span>
                    <select
                      id="kategori_kandungan"
                      value={kategoriKandungan}
                      onChange={(e) => setKategoriKandungan(e.target.value)}
                      className="w-full bg-surface-container-low/70 rounded-xl pl-10 pr-8 py-2.5 text-on-surface focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer border border-slate-200"
                    >
                      <option value="Berita_Artikel">Berita &amp; Artikel Rasmi</option>
                      <option value="Pengumuman_Tender">Pengumuman &amp; Kenyataan Tender</option>
                      <option value="Galeri_Media">Galeri Foto &amp; Liputan Acara</option>
                      <option value="Direktori_Pegawai">Kemaskini Direktori Pegawai</option>
                      <option value="Banner_Slider">Banner Slider Laman Utama</option>
                      <option value="Penerbitan_Pekeliling">Penerbitan Dokumen / Pekeliling</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-3 text-[18px] text-outline pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-on-surface" htmlFor="tahap_keutamaan">
                    Tahap Keutamaan (SLA) <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[18px] text-outline">priority_high</span>
                    <select
                      id="tahap_keutamaan"
                      value={tahapKeutamaan}
                      onChange={(e) => setTahapKeutamaan(e.target.value as any)}
                      className="w-full bg-surface-container-low/70 rounded-xl pl-10 pr-8 py-2.5 text-on-surface focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer border border-slate-200"
                    >
                      <option value="biasa">Biasa (SLA 5 Hari Bekerja)</option>
                      <option value="segera">Segera (SLA 48 Jam)</option>
                      <option value="kritikal">Kritikal / Titah (SLA 24 Jam)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-3 text-[18px] text-outline pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              {/* Tajuk Permohonan */}
              <div className="space-y-1">
                <label className="font-semibold text-on-surface" htmlFor="tajuk_kemaskini">
                  Tajuk Kemaskini Portal <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[18px] text-outline">title</span>
                  <input
                    id="tajuk_kemaskini"
                    type="text"
                    required
                    value={tajukKemaskini}
                    onChange={(e) => setTajukKemaskini(e.target.value)}
                    placeholder="Ringkasan tajuk yang jelas..."
                    className="w-full bg-surface-container-low/70 rounded-xl pl-10 pr-4 py-2.5 text-on-surface focus:bg-white focus:outline-none transition-all border border-slate-200"
                  />
                </div>
              </div>

              {/* URL Halaman Sasaran */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-on-surface" htmlFor="url_sasaran">
                    URL Halaman Sasaran di Portal Pahang
                  </label>
                  <span className="text-[11px] text-on-surface-variant">Pilihan / Jika Ada</span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[18px] text-outline">link</span>
                  <input
                    id="url_sasaran"
                    type="url"
                    value={urlSasaran}
                    onChange={(e) => setUrlSasaran(e.target.value)}
                    placeholder="https://pahang.gov.my/..."
                    className="w-full bg-surface-container-low/70 rounded-xl pl-10 pr-4 py-2 text-on-surface focus:bg-white focus:outline-none transition-all border border-slate-200"
                  />
                </div>
              </div>

              {/* Nota Arahan */}
              <div className="space-y-1">
                <label className="font-semibold text-on-surface" htmlFor="nota_arahan">
                  Nota Arahan &amp; Ringkasan Keperluan <span className="text-error">*</span>
                </label>
                <textarea
                  id="nota_arahan"
                  rows={3}
                  required
                  value={notaArahan}
                  onChange={(e) => setNotaArahan(e.target.value)}
                  placeholder="Sebutkan arahan spesifik..."
                  className="w-full bg-surface-container-low/70 rounded-xl p-3 text-on-surface focus:bg-white focus:outline-none transition-all resize-none border border-slate-200"
                ></textarea>
              </div>

              {/* Zon Muat Naik Bukti Dokumen Asal */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-on-surface flex items-center gap-1.5 text-xs">
                    <span className="material-symbols-outlined text-[18px] text-primary">cloud_upload</span>
                    Lampiran Bukti Dokumen Asal <span className="text-error">*</span>
                  </label>
                  <span className="text-[11px] text-on-surface-variant">PDF, EML, PNG, JPG (≤ 25MB)</span>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low/70 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container transition-all border-2 border-dashed border-primary/20">
                  <div className="p-2 rounded-full bg-primary-container/20 text-primary">
                    <span className="material-symbols-outlined text-[28px]">upload_file</span>
                  </div>
                  <p className="font-semibold text-on-surface mt-2 text-xs">
                    Seret &amp; Lepaskan fail bukti di sini atau <span className="text-primary underline">Pilih Dari Fail</span>
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Imbasan PDF Surat Rasmi Bertandatangan, Tangkapan Skrin WhatsApp, atau Fail E-mel Asal.
                  </p>
                </div>

                {/* Uploaded File List */}
                <div className="space-y-2 mt-2">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-high/60 shadow-xs border border-slate-100"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 rounded bg-error-container text-on-error-container">
                          <span className="material-symbols-outlined text-[18px]">
                            {file.type === 'pdf' ? 'picture_as_pdf' : 'image'}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0 text-xs">
                          <span className="font-semibold text-on-surface truncate">{file.name}</span>
                          <span className="text-[11px] text-on-surface-variant">{file.size}</span>
                        </div>
                      </div>
                      <span className="font-label-sm text-[11px] px-2 py-0.5 rounded-full bg-white text-primary font-bold flex items-center gap-1 border border-slate-100">
                        <span className="material-symbols-outlined text-[14px]">security</span> Bersih
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Antivirus info */}
            <div className="mt-2 pt-2 flex items-center justify-between text-on-surface-variant font-label-sm text-xs bg-surface-container-low/40 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-tertiary">verified_user</span>
                <span>Imbasan Antivirus Automatik Diaktifkan (Kaspersky SUK Grid)</span>
              </div>
              <span className="text-primary font-bold">{uploadedFiles.length}/5 Fail Dilampirkan</span>
            </div>
          </div>
        </div>

        {/* Administrative Compliance & Automated Tracking Banner */}
        <div className="rounded-2xl p-4 bg-secondary-fixed/30 backdrop-blur-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-secondary-fixed/50">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary text-white mt-0.5 sm:mt-0 flex-shrink-0">
              <span className="material-symbols-outlined text-[22px]">policy</span>
            </div>
            <div className="space-y-0.5 text-xs">
              <h4 className="font-title-sm text-sm text-on-surface font-bold">Notis Pematuhan Pentadbiran &amp; Audit Rasmi</h4>
              <p className="text-on-surface-variant max-w-3xl leading-relaxed">
                Pendaftaran ini akan menjana No. Rujukan digital unik automatik (Format:{' '}
                <span className="font-mono text-primary font-bold">SPPKPP/2026/SL-XXXXX</span>) dan menghantar e-mel pengesahan penerimaan kepada pemohon berserta pautan penjejak SLA masa nyata. Tindakan ini direkodkan dalam Jejak Audit BTM.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 bg-white/80 px-3 py-1.5 rounded-lg shadow-xs border border-slate-100">
            <input
              id="autoNotifyCheck"
              type="checkbox"
              checked={autoNotify}
              onChange={(e) => setAutoNotify(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer"
            />
            <label htmlFor="autoNotifyCheck" className="font-label-sm text-xs text-on-surface cursor-pointer select-none">
              Hantar Notifikasi E-mel Serta-merta
            </label>
          </div>
        </div>

        {/* Sticky Bottom Action Footer Deck */}
        <div className="bg-white/95 backdrop-blur-2xl rounded-2xl p-4 shadow-md flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 border border-white/80">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('dashboard-kerja')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-label-md text-xs text-on-surface-variant hover:bg-surface-container-high transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
              Batal &amp; Kembali
            </button>
            <button
              type="button"
              onClick={() => alert('Draf saluran luar ini disimpan secara automatik.')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-label-md text-xs text-primary bg-primary-fixed/40 hover:bg-primary-fixed/70 transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Simpan Draf Sesi
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden xl:flex flex-col text-right mr-2 text-xs">
              <span className="text-on-surface-variant">Sasaran Destinasi:</span>
              <span className="font-bold text-primary">Queue Permohonan Portal (Segera)</span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-label-md text-xs font-bold text-white bg-primary hover:bg-primary-container shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
              <span>{submitting ? 'Mendaftarkan ke Queue...' : 'Daftar Rasmi & Masukkan ke Queue'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
