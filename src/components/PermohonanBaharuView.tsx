import React, { useState } from 'react';
import { api, ApplicationItem } from '../lib/api.ts';

interface PermohonanBaharuProps {
  onSuccess: (newApp: ApplicationItem) => void;
  onNavigate: (path: string) => void;
}

export const PermohonanBaharuView: React.FC<PermohonanBaharuProps> = ({ onSuccess, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(2);
  const [kategori, setKategori] = useState('BRT');
  const [jenisKemaskini, setJenisKemaskini] = useState<'tambah' | 'ubah' | 'padam' | 'pembetulan'>('ubah');
  const [tajuk, setTajuk] = useState('Pindaan Tarikh Tutup Iklan Sebutharga BTM 04/2026 dan Penambahan Dokumen Lampiran');
  const [urlHalaman, setUrlHalaman] = useState('https://www.pahang.gov.my/index.php/tender-sebutharga/btm/2026/04-jadual');
  const [keutamaan, setKeutamaan] = useState<'biasa' | 'segera' | 'kritikal'>('segera');
  const [tarikhSasaran, setTarikhSasaran] = useState('2026-03-30');
  const [arahanKerja, setArahanKerja] = useState(
    'Sila buat pindaan pada jadual tarikh tutup bagi tender sebutharga BTM 04/2026:\n1. Tarikh asal: 28 Mac 2026 (Jumaat) Jam 12.00 tengah hari.\n2. Pindaan tarikh baharu: 15 April 2026 (Rabu) Jam 12.00 tengah hari.\n3. Lampirkan dokumen Tambahan Spesifikasi Teknikal v2.pdf pada pautan muat turun sedia ada di halaman berkenaan.'
  );

  const [attachments, setAttachments] = useState([
    {
      id: 'att-1',
      nama_fail: 'Draf_Iklan_Tender_2026_Disahkan.pdf',
      saiz_teks: '2.4 MB',
      dimuat_naik_oleh: 'Dimuat naik oleh Pemohon',
      type: 'pdf',
    },
    {
      id: 'att-2',
      nama_fail: 'Lampiran_Spesifikasi_Teknikal_v2.docx',
      saiz_teks: '1.1 MB',
      dimuat_naik_oleh: 'Dokumen Word',
      type: 'doc',
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f, i) => ({
        id: `att-${Date.now()}-${i}`,
        nama_fail: f.name,
        saiz_teks: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        dimuat_naik_oleh: 'Dimuat naik oleh Pemohon',
        type: f.name.endsWith('.pdf') ? 'pdf' : 'doc',
      }));
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleSubmit = async (isDraft = false) => {
    setSubmitting(true);
    try {
      const payload: Partial<ApplicationItem> = {
        tajuk,
        penerangan: arahanKerja,
        kategori_id: `kat-${kategori.toLowerCase()}`,
        kategori_kod: kategori,
        kategori_nama:
          kategori === 'BRT'
            ? 'Kenyataan Media / Siaran Akhbar [BRT]'
            : kategori === 'PGM'
            ? 'Pengumuman Rasmi Kerajaan / Notis Tender [PGM]'
            : kategori === 'DIR'
            ? 'Direktori Pegawai & Carta Organisasi Agensi [DIR]'
            : 'Dokumen & Penerbitan Portal',
        jenis_kemaskini: jenisKemaskini,
        url_halaman: urlHalaman,
        keutamaan,
        tarikh_dikehendaki: tarikhSasaran,
        saluran_penerimaan: 'sistem',
        status: isDraft ? 'draf' : 'dihantar',
        lampiran: attachments.map((a) => ({
          id: a.id,
          nama_fail: a.nama_fail,
          jenis_mime: a.type === 'pdf' ? 'application/pdf' : 'application/msword',
          saiz_bait: 1024 * 1024 * 2,
          saiz_teks: a.saiz_teks,
          laluan_storan: `/uploads/${a.nama_fail}`,
          jenis_lampiran: 'sokongan',
          dimuat_naik_oleh: 'Pemohon',
          dimuat_naik_pada: new Date().toISOString(),
          checksum_sha256: 'e3b0c44298fc...',
          status_imbasan: 'bersih',
        })),
      };

      const res = await api.createPermohonan(payload);
      setSuccessToast(true);
      setTimeout(() => {
        onSuccess(res.item);
        onNavigate('permohonan-saya');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Gagal menghantar permohonan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Toast Feedback */}
      {successToast && (
        <div className="fixed top-24 right-8 z-50 p-4 rounded-xl bg-primary text-white shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-2xl text-tertiary-fixed">check_circle</span>
          <div>
            <span className="font-bold block text-sm">Permohonan Berjaya Dihantar!</span>
            <span className="text-xs opacity-90">No. Rujukan telah dijana dan dialirkan ke Seksyen Portal BTM.</span>
          </div>
        </div>
      )}

      {/* Breadcrumbs & Meta Context */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-label-md text-xs text-on-surface-variant">
          <button onClick={() => onNavigate('dashboard-kerja')} className="hover:text-primary transition-colors cursor-pointer">
            Utama
          </button>
          <span className="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
          <span>Borang Permohonan</span>
          <span className="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
          <span className="text-primary font-bold">Kemaskini Portal Pahang</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high/80 text-on-surface-variant font-label-sm text-xs border border-surface-container-highest/60">
          <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
          <span>
            SLA Terpakai: <strong className="text-primary font-bold">Waktu Bekerja Rasmi Pejabat SUK</strong>
          </span>
        </div>
      </div>

      {/* Header & Official Notice Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl p-6 shadow-[0_8px_24px_-4px_rgba(11,37,69,0.06)] border border-white/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-[11px] uppercase tracking-wider font-bold">
                FR-PMH-01
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-[11px]">
                Borang ID: SPPKPP-B06
              </span>
            </div>
            <h1 className="font-headline-lg text-2xl text-on-surface tracking-tight font-bold">
              Borang Permohonan Kemaskini Portal Pahang
            </h1>
            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              Sila lengkapkan butiran permohonan kemaskini kandungan laman web rasmi Portal Kerajaan Negeri Pahang (
              <span className="font-semibold text-primary">pahang.gov.my</span>) untuk semakan dan kelulusan BTM SUK Pahang.
            </p>
          </div>

          {/* Security Notice Pill */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-tertiary-fixed/40 text-on-tertiary-fixed-variant max-w-md shadow-sm border border-tertiary-container/30">
            <span className="material-symbols-outlined text-[24px] text-tertiary shrink-0 mt-0.5">verified_user</span>
            <div className="space-y-0.5 text-xs">
              <span className="font-label-md text-tertiary font-bold tracking-tight block">Peringatan Keselamatan Maklumat</span>
              <p className="font-body-sm leading-snug">
                Dokumen berstatus <strong>Rahsia Rasmi Kerajaan</strong> (Sulit / Rahsia / Rahsia Besar) <strong>TIDAK DIBENARKAN</strong> dimuat naik ke dalam sistem ini.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step Stepper Progress Component */}
      <div className="bg-white/85 backdrop-blur-xl rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(11,37,69,0.04)] border border-white/80">
        <div className="relative flex items-center justify-between max-w-4xl mx-auto">
          {/* Connecting Baseline */}
          <div className="absolute left-6 right-6 top-5 h-1 bg-surface-container-highest z-0"></div>
          {/* Progress Fill */}
          <div
            className="absolute left-6 top-5 h-1 bg-primary z-0 transition-all duration-500"
            style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '33%' : currentStep === 3 ? '66%' : '100%' }}
          ></div>

          {/* Step 1 */}
          <div onClick={() => setCurrentStep(1)} className="relative z-10 flex flex-col items-center cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-label-md text-sm shadow-md">
              <span className="material-symbols-outlined text-[20px]">check</span>
            </div>
            <div className="text-center mt-2">
              <span className="font-label-sm text-[10px] text-primary font-bold block uppercase tracking-wide">Langkah 1</span>
              <span className="font-body-sm text-xs text-on-surface font-semibold">Maklumat Asas</span>
            </div>
          </div>

          {/* Step 2 */}
          <div onClick={() => setCurrentStep(2)} className="relative z-10 flex flex-col items-center cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-white text-primary ring-4 ring-tertiary-container flex items-center justify-center font-label-md text-sm shadow-lg font-bold">
              2
            </div>
            <div className="text-center mt-2">
              <span className="font-label-sm text-[10px] text-tertiary font-bold block uppercase tracking-wide">
                Langkah 2 (Semasa)
              </span>
              <span className="font-title-sm text-xs text-on-surface font-bold">Butiran &amp; URL</span>
            </div>
          </div>

          {/* Step 3 */}
          <div onClick={() => setCurrentStep(3)} className="relative z-10 flex flex-col items-center cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-label-md text-sm font-semibold">
              3
            </div>
            <div className="text-center mt-2">
              <span className="font-label-sm text-[10px] text-outline-variant font-bold block uppercase tracking-wide">Langkah 3</span>
              <span className="font-body-sm text-xs text-on-surface-variant">Lampiran &amp; Bukti</span>
            </div>
          </div>

          {/* Step 4 */}
          <div onClick={() => setCurrentStep(4)} className="relative z-10 flex flex-col items-center cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-label-md text-sm font-semibold">
              4
            </div>
            <div className="text-center mt-2">
              <span className="font-label-sm text-[10px] text-outline-variant font-bold block uppercase tracking-wide">Langkah 4</span>
              <span className="font-body-sm text-xs text-on-surface-variant">Semakan &amp; Perakuan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form & File Preview Deck */}
        <div className="xl:col-span-8 space-y-6">
          {/* Main Form Container */}
          <div className="bg-white/90 backdrop-blur-2xl rounded-2xl p-6 shadow-[0_16px_36px_-6px_rgba(11,37,69,0.08)] space-y-5 border border-white/80">
            {/* Form Section Title */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-surface-container">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 rounded bg-primary"></span>
                <h2 className="font-headline-md text-base sm:text-lg text-on-surface font-bold">
                  Bahagian B: Spesifikasi &amp; Butiran Kandungan
                </h2>
              </div>
              <span className="font-label-sm text-xs text-outline font-medium">* Medan Wajib Diisi</span>
            </div>

            {/* Form Elements */}
            <div className="space-y-4 text-xs sm:text-sm">
              {/* 1. Kategori Kandungan */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-on-surface" htmlFor="kategori-kandungan">
                  1. Kategori Kandungan Portal <span className="text-error font-bold">*</span>
                </label>
                <div className="relative">
                  <select
                    id="kategori-kandungan"
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full h-11 px-3 bg-surface-container-low/90 rounded-lg text-on-surface focus:outline-none focus:bg-white transition-all appearance-none cursor-pointer border border-slate-200"
                  >
                    <option value="BRT">Kenyataan Media / Siaran Akhbar [BRT]</option>
                    <option value="PGM">Pengumuman Rasmi Kerajaan / Notis Tender [PGM]</option>
                    <option value="DIR">Direktori Pegawai &amp; Carta Organisasi Agensi [DIR]</option>
                    <option value="DOK">Muat Turun Borang &amp; Pekeliling Rasmi [DOK]</option>
                    <option value="BNR">Banner Hero / Gelanggang Slider Utama Portal [BNR]</option>
                    <option value="GLR">Galeri Foto Aktiviti &amp; Lawatan Rasmi YAB MB [GLR]</option>
                    <option value="ACR">Kalendar Acara &amp; Program Kerajaan Negeri [ACR]</option>
                    <option value="LAIN">Lain-lain Maklumat Statik Portal [LAIN]</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-3 text-[20px] text-outline pointer-events-none">
                    expand_more
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant">Penetapan kategori menentukan laluan kelulusan Pegawai Tadbir Portal.</p>
              </div>

              {/* 2. Jenis Kemaskini */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-on-surface">
                  2. Jenis Tindakan Kemaskini <span className="text-error font-bold">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {[
                    { key: 'tambah', label: 'Kandungan Baharu', desc: 'Cipta rekod atau artikel baharu', icon: 'add_circle' },
                    { key: 'ubah', label: 'Ubah Sedia Ada', desc: 'Pinda maklumat yang telah diterbitkan', icon: 'edit_document' },
                    { key: 'padam', label: 'Padam / Arkib', desc: 'Nyahaktifkan dari capaian umum', icon: 'delete_forever' },
                    { key: 'pembetulan', label: 'Ralat Tipografi', desc: 'Pembetulan ejaan/pautan rosak', icon: 'spellcheck' },
                  ].map((opt) => (
                    <label
                      key={opt.key}
                      onClick={() => setJenisKemaskini(opt.key as any)}
                      className={`relative flex flex-col p-3 rounded-xl cursor-pointer transition-all border ${
                        jenisKemaskini === opt.key
                          ? 'bg-primary-container text-white shadow-sm border-primary-container'
                          : 'bg-surface-container-low/70 hover:bg-surface-container text-on-surface border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`material-symbols-outlined text-[20px] ${jenisKemaskini === opt.key ? 'text-white' : 'text-primary'}`}>
                          {opt.icon}
                        </span>
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            jenisKemaskini === opt.key ? 'bg-white text-primary' : 'bg-surface-container-highest'
                          }`}
                        >
                          {jenisKemaskini === opt.key && <span className="material-symbols-outlined text-[14px]">done</span>}
                        </span>
                      </div>
                      <span className="font-bold text-xs">{opt.label}</span>
                      <span className={`text-[10px] leading-tight ${jenisKemaskini === opt.key ? 'text-white/80' : 'text-on-surface-variant'}`}>
                        {opt.desc}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. Tajuk Permohonan */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-on-surface" htmlFor="tajuk-permohonan">
                    3. Tajuk Permohonan Kemaskini <span className="text-error font-bold">*</span>
                  </label>
                  <span className={`font-mono text-xs ${tajuk.length >= 190 ? 'text-error font-bold' : 'text-on-surface-variant'}`}>
                    {tajuk.length} / 200 Aksara
                  </span>
                </div>
                <input
                  id="tajuk-permohonan"
                  type="text"
                  maxLength={200}
                  value={tajuk}
                  onChange={(e) => setTajuk(e.target.value)}
                  placeholder="Contoh: Pindaan Tarikh Tutup Iklan Sebutharga BTM 04/2026..."
                  className="w-full px-3 py-2.5 bg-surface-container-low/90 rounded-lg text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-white transition-all border border-slate-200"
                />
                <p className="text-[11px] text-on-surface-variant">Tajuk ringkas, padat dan mencerminkan kandungan secara jelas (Minimum 5 aksara).</p>
              </div>

              {/* 4. URL Halaman Portal */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-on-surface" htmlFor="portal-url">
                    4. URL Halaman Berkenaan di Portal Rasmi <span className="text-error font-bold">*</span>
                  </label>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-[11px] font-bold">
                    <span className="material-symbols-outlined text-[14px]">domain_verification</span>
                    Domain Sah: pahang.gov.my
                  </span>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-outline pointer-events-none">
                    link
                  </span>
                  <input
                    id="portal-url"
                    type="url"
                    value={urlHalaman}
                    onChange={(e) => setUrlHalaman(e.target.value)}
                    placeholder="https://www.pahang.gov.my/index.php/..."
                    className="w-full pl-9 pr-10 py-2.5 bg-surface-container-low/90 rounded-lg text-on-surface focus:outline-none focus:bg-white transition-all border border-slate-200"
                  />
                  <a
                    href={urlHalaman}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute right-2 p-1.5 rounded hover:bg-surface-container text-on-surface-variant transition-colors"
                    title="Buka pautan dalam tab baharu"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  </a>
                </div>
              </div>

              {/* Split Row: 5. Keutamaan & 6. Tarikh */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-on-surface" htmlFor="tahap-keutamaan">
                    5. Tahap Keutamaan &amp; Tempoh Sasaran <span className="text-error font-bold">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="tahap-keutamaan"
                      value={keutamaan}
                      onChange={(e) => setKeutamaan(e.target.value as any)}
                      className="w-full h-11 px-3 bg-surface-container-low/90 rounded-lg text-on-surface focus:outline-none focus:bg-white transition-all appearance-none cursor-pointer border border-slate-200"
                    >
                      <option value="biasa">Biasa — SLA 5 Hari Bekerja (Standard BTM)</option>
                      <option value="segera">Segera — SLA 2 Hari Bekerja (Notis / Hebahan)</option>
                      <option value="kritikal">Kritikal — SLA 1 Hari Bekerja (Kelulusan Pengarah)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-3 text-[20px] text-outline pointer-events-none">
                      expand_more
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-tertiary font-label-sm text-xs mt-1">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    <span>
                      Sasaran Penerbitan:{' '}
                      <strong>{keutamaan === 'kritikal' ? '24 Jam' : keutamaan === 'segera' ? '48 Jam' : '120 Jam'}</strong> dari tarikh kelulusan.
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-on-surface" htmlFor="tarikh-diterbitkan">
                    6. Tarikh Sasaran Penerbitan <span className="text-error font-bold">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-[18px] text-outline pointer-events-none">
                      event
                    </span>
                    <input
                      id="tarikh-diterbitkan"
                      type="date"
                      value={tarikhSasaran}
                      onChange={(e) => setTarikhSasaran(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-surface-container-low/90 rounded-lg text-on-surface focus:outline-none focus:bg-white transition-all border border-slate-200"
                    />
                  </div>
                  <p className="text-[11px] text-on-surface-variant">Tertakluk kepada waktu kelulusan pentadbir portal BTM.</p>
                </div>
              </div>

              {/* 7. Arahan Kerja & Nota */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-on-surface" htmlFor="arahan-kerja">
                    7. Arahan Kerja &amp; Nota Terperinci Kandungan <span className="text-error font-bold">*</span>
                  </label>
                  <div className="flex items-center gap-1 bg-surface-container-low px-2 py-0.5 rounded text-on-surface-variant border border-slate-200">
                    <button type="button" className="p-1 hover:text-primary font-bold text-xs">B</button>
                    <button type="button" className="p-1 hover:text-primary italic text-xs">I</button>
                    <button type="button" className="p-1 hover:text-primary underline text-xs">U</button>
                    <span className="w-px h-3 bg-outline-variant mx-1"></span>
                    <button type="button" className="p-1 hover:text-primary">
                      <span className="material-symbols-outlined text-[14px]">format_list_bulleted</span>
                    </button>
                  </div>
                </div>
                <textarea
                  id="arahan-kerja"
                  rows={5}
                  value={arahanKerja}
                  onChange={(e) => setArahanKerja(e.target.value)}
                  className="w-full p-3 bg-surface-container-low/90 rounded-lg text-on-surface focus:outline-none focus:bg-white transition-all resize-y border border-slate-200"
                ></textarea>
                <p className="text-[11px] text-on-surface-variant">Sertakan perbandingan sebelum/selepas untuk mempercepatkan proses kelulusan.</p>
              </div>
            </div>
          </div>

          {/* File Uploader & Attachment Showcase */}
          <div className="bg-white/90 backdrop-blur-2xl rounded-2xl p-6 shadow-[0_8px_24px_-4px_rgba(11,37,69,0.06)] space-y-4 border border-white/80">
            <div className="flex items-center justify-between pb-2 border-b-2 border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px] text-primary">cloud_upload</span>
                <h3 className="font-headline-md text-base text-on-surface font-bold">
                  Lampiran &amp; Dokumen Bukti (Langkah 3 Preview)
                </h3>
              </div>
              <span className="font-label-sm text-xs text-on-surface-variant font-medium">Maks 5 Dokumen</span>
            </div>

            {/* Drag and Drop Zone */}
            <label className="flex flex-col items-center justify-center p-6 rounded-xl bg-surface-container-low/50 hover:bg-surface-container-low transition-all text-center group cursor-pointer border-2 border-dashed border-primary/20">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-2 shadow-xs">
                <span className="material-symbols-outlined text-[26px]">upload_file</span>
              </div>
              <span className="font-title-sm text-sm text-on-surface font-semibold">
                Tarik &amp; Lepaskan fail di sini, atau klik untuk memilih fail
              </span>
              <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                Format Dibenarkan: <span className="font-semibold text-primary">PDF, DOCX, XLSX, JPG, PNG</span> (Maksimum 10MB setiap fail)
              </p>
              <input type="file" multiple onChange={handleFileDrop} className="hidden" />
            </label>

            {/* Attached Files List */}
            <div className="space-y-2">
              <span className="font-label-md text-xs text-on-surface-variant font-bold uppercase tracking-wider block">
                Senarai Lampiran Dimuat Naik ({attachments.length} Fail)
              </span>

              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low/80 hover:bg-surface-container transition-colors border border-slate-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded bg-error/10 text-error flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        {file.type === 'pdf' ? 'picture_as_pdf' : 'description'}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0 text-xs">
                      <span className="font-bold text-on-surface truncate">{file.nama_fail}</span>
                      <span className="text-on-surface-variant">{file.saiz_teks} • {file.dimuat_naik_oleh}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-label-sm text-[11px] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">security</span>
                      Disahkan Imbasan Antivirus
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(file.id)}
                      className="p-1 rounded text-on-surface-variant hover:text-error hover:bg-error-container transition-colors cursor-pointer"
                      title="Padam Lampiran"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action & Navigation Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-low text-primary hover:bg-surface-container font-label-md text-xs font-semibold transition-all border border-slate-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Simpan sebagai Draf</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('permohonan-saya')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-on-surface-variant hover:bg-surface-container-high font-label-md text-xs font-semibold transition-all border border-slate-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Batal / Kembali</span>
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-label-md text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>{submitting ? 'Menghantar ke BTM...' : 'Seterusnya: Semakan & Perakuan'}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Assistance */}
        <div className="xl:col-span-4 space-y-6">
          {/* Summary Widget */}
          <div className="bg-white/85 backdrop-blur-xl rounded-2xl p-4 shadow-[0_8px_24px_-4px_rgba(11,37,69,0.06)] space-y-3 border border-white/80 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-outline-variant font-bold uppercase tracking-wider">
                Ringkasan Status
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm font-bold">
                Draf Permohonan
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low space-y-2 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Pemohon:</span>
                <span className="font-semibold text-on-surface">Ts. Mohd Faiz bin Azmi</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Bahagian:</span>
                <span className="font-semibold text-on-surface">BTM SUK Pahang</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Tarikh Permohonan:</span>
                <span className="font-semibold text-on-surface">26 Mac 2026</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant px-1">
              <span className="material-symbols-outlined text-[18px] text-tertiary">lock_reset</span>
              <span>Borang disimpan automatik setiap 2 minit.</span>
            </div>
          </div>

          {/* SLA Standard Reference Matrix */}
          <div className="bg-white/85 backdrop-blur-xl rounded-2xl p-4 shadow-[0_8px_24px_-4px_rgba(11,37,69,0.06)] space-y-3 border border-white/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">timer</span>
              <h3 className="font-title-sm text-sm text-on-surface font-bold">Piagam Pelanggan &amp; Tempoh SLA</h3>
            </div>
            <p className="text-on-surface-variant">
              Piawaian tempoh masa tindakan oleh Pasukan Pentadbir Portal BTM SUK Pahang:
            </p>
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low/70 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                  <span className="font-semibold text-on-surface">Kritikal</span>
                </div>
                <span className="text-error font-bold">1 Hari Bekerja (24j)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low/70 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span>
                  <span className="font-semibold text-on-surface">Segera</span>
                </div>
                <span className="text-tertiary font-bold">2 Hari Bekerja (48j)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low/70 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  <span className="font-semibold text-on-surface">Biasa</span>
                </div>
                <span className="text-primary font-bold">5 Hari Bekerja (120j)</span>
              </div>
            </div>
          </div>

          {/* Guidelines & Checklist */}
          <div className="bg-white/85 backdrop-blur-xl rounded-2xl p-4 shadow-[0_8px_24px_-4px_rgba(11,37,69,0.06)] space-y-3 border border-white/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-tertiary">fact_check</span>
              <h3 className="font-title-sm text-sm text-on-surface font-bold">Panduan Penerbitan Kandungan</h3>
            </div>
            <ul className="space-y-2 text-on-surface-variant pt-1">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>
                <span>Pastikan teks telah disemak dari segi ejaan Bahasa Melayu (DKB).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>
                <span>Imej poster/banner wajib berkualiti tinggi (1920x1080px untuk Slider).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>
                <span>Surat rasmi kelulusan Ketua Jabatan diperlukan bagi permohonan Kritikal.</span>
              </li>
            </ul>
          </div>

          {/* Live Helpdesk */}
          <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-container p-5 text-white shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px]">support_agent</span>
              <span className="font-title-sm text-sm font-bold">Perlukan Bantuan Segera?</span>
            </div>
            <p className="text-xs text-on-primary-container leading-relaxed">
              Hubungi Meja Bantuan Seksyen Portal &amp; Multimedia, BTM SUK Pahang:
            </p>
            <div className="space-y-1 text-xs pt-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">call</span>
                <span>Sambungan: <strong className="underline">ext. 1244 / 1245</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">mail</span>
                <span>E-mel: <strong className="underline">portal@pahang.gov.my</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
