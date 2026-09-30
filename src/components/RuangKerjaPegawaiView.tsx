import React, { useState } from 'react';
import { api, ApplicationItem, User } from '../lib/api.ts';

interface RuangKerjaPegawaiProps {
  application: ApplicationItem;
  currentUser: User | null;
  onBack: () => void;
  onRefresh: () => void;
}

export const RuangKerjaPegawaiView: React.FC<RuangKerjaPegawaiProps> = ({
  application,
  currentUser,
  onBack,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'kandungan' | 'diff' | 'sandbox' | 'selesai'>('kandungan');
  const [commentType, setCommentType] = useState<'awam' | 'dalaman'>('awam');
  const [commentText, setCommentText] = useState<string>('');
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);

  // Status updates & modal states
  const [pauseModalOpen, setPauseModalOpen] = useState<boolean>(false);
  const [pauseReason, setPauseReason] = useState<string>('Menunggu maklum balas / kelulusan fail asal daripada pemohon');
  const [completeModalOpen, setCompleteModalOpen] = useState<boolean>(false);
  const [resultUrl, setResultUrl] = useState<string>(
    application.url_hasil || `https://pahang.gov.my/${application.kategori_kod || 'berita'}/${application.no_rujukan.toLowerCase()}`
  );
  const [completionNotes, setCompletionNotes] = useState<string>('Semua kemaskini telah disahkan dan diterbitkan di Portal Rasmi Kerajaan Negeri Pahang.');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Work draft state
  const [draftContent, setDraftContent] = useState<string>(
    application.penerangan || 'Kandungan baru sedang disunting untuk penerbitan di portal rasmi...'
  );

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      await api.addComment(application.id, commentText, commentType);
      setCommentText('');
      setToastMessage({ type: 'success', text: 'Komen berjaya dihantar.' });
      onRefresh();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Gagal menghantar komen.' });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handlePauseSla = async () => {
    setIsProcessing(true);
    try {
      await api.pauseSla(application.id, pauseReason);
      setToastMessage({ type: 'success', text: 'SLA permohonan telah dijeda.' });
      setPauseModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Gagal menjeda SLA.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (!resultUrl.trim()) {
      setToastMessage({ type: 'error', text: 'Sila masukkan URL hasil penerbitan portal.' });
      return;
    }
    setIsProcessing(true);
    try {
      await api.completeApplication(application.id, resultUrl, completionNotes);
      setToastMessage({ type: 'success', text: 'Permohonan berjaya diselesaikan & diterbitkan!' });
      setCompleteModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Gagal menyelesaikan permohonan.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsProcessing(true);
    try {
      await api.updateStatus(application.id, newStatus);
      setToastMessage({ type: 'success', text: `Status dikemaskini kepada: ${newStatus}` });
      onRefresh();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Gagal mengemaskini status.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">
              {toastMessage.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="text-sm font-medium">{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)}>
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Top Bar with Navigation & Actions */}
      <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors"
            title="Kembali ke senarai"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-primary text-sm sm:text-base tracking-wide">
                {application.no_rujukan}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                  application.keutamaan === 'kritikal'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : application.keutamaan === 'segera'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {application.keutamaan}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                  application.status === 'selesai'
                    ? 'bg-emerald-100 text-emerald-800'
                    : application.status === 'dalam_tindakan'
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {application.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="font-title-sm text-on-surface font-bold text-lg sm:text-xl truncate max-w-xl mt-0.5">
              {application.tajuk}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {application.status !== 'selesai' && application.status !== 'ditutup' && (
            <>
              {application.sla_dijeda_pada ? (
                <button
                  disabled={isProcessing}
                  onClick={() => handleStatusChange('dalam_tindakan')}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-600 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  <span>Sambung Semula SLA</span>
                </button>
              ) : (
                <button
                  onClick={() => setPauseModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold flex items-center gap-1.5 hover:bg-surface-container-highest transition-colors border border-surface-container-high"
                >
                  <span className="material-symbols-outlined text-[16px]">pause_circle</span>
                  <span>Jeda SLA</span>
                </button>
              )}

              {application.status === 'diterima' && (
                <button
                  disabled={isProcessing}
                  onClick={() => handleStatusChange('dalam_tindakan')}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-sky-700 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  <span>Mula Tindakan</span>
                </button>
              )}

              {application.status === 'dalam_tindakan' && (
                <button
                  disabled={isProcessing}
                  onClick={() => handleStatusChange('menunggu_semakan')}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-700 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Hantar Untuk Semakan Penyelia</span>
                </button>
              )}

              <button
                onClick={() => setCompleteModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 transition-colors shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">task_alt</span>
                <span>Selesaikan &amp; Terbit</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Info Permohonan & Dokumen Sokongan (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Metadata Card */}
          <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm space-y-4">
            <h2 className="font-title-sm text-sm font-bold text-on-surface uppercase tracking-wider text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">info</span>
              Maklumat Asas &amp; Pemohon
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-on-surface-variant block">Agensi / Bahagian:</span>
                <span className="font-bold text-on-surface">{application.org_nama}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-on-surface-variant block">Nama Pemohon:</span>
                  <span className="font-medium text-on-surface">{application.pemohon_snapshot.nama}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Jawatan:</span>
                  <span className="font-medium text-on-surface">{application.pemohon_snapshot.jawatan}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-on-surface-variant block">E-mel:</span>
                  <span className="font-medium text-on-surface truncate block">{application.pemohon_snapshot.emel}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Telefon:</span>
                  <span className="font-medium text-on-surface">{application.pemohon_snapshot.telefon}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-surface-container-high/60">
                <span className="text-on-surface-variant block">Kategori &amp; Tindakan:</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-2 py-0.5 rounded bg-surface-container font-semibold text-primary">
                    {application.kategori_nama}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-high uppercase font-bold text-[10px]">
                    {application.jenis_kemaskini}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-on-surface-variant block">URL Halaman Sasaran:</span>
                <a
                  href={application.url_halaman}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-primary hover:underline break-all block mt-0.5 flex items-center gap-1"
                >
                  <span className="truncate">{application.url_halaman}</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>
              {application.rujukan_surat && (
                <div className="pt-2 border-t border-surface-container-high/60">
                  <span className="text-on-surface-variant block">Rujukan Surat Rasmi:</span>
                  <span className="font-mono font-bold text-on-surface">{application.rujukan_surat}</span>
                  <span className="text-[11px] text-on-surface-variant ml-2">
                    ({application.tarikh_surat || 'N/A'})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Attachments Card */}
          <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-title-sm text-sm font-bold text-on-surface uppercase tracking-wider text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">attachment</span>
                Lampiran &amp; Bukti Rasmi
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-container-high">
                {application.lampiran?.length || 0} fail
              </span>
            </div>

            <div className="space-y-2">
              {(!application.lampiran || application.lampiran.length === 0) ? (
                <div className="p-4 text-center text-xs text-on-surface-variant bg-surface-container-low rounded-xl">
                  Tiada fail lampiran disertakan.
                </div>
              ) : (
                application.lampiran.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="material-symbols-outlined text-primary text-[22px]">
                        {file.jenis_mime?.includes('pdf')
                          ? 'picture_as_pdf'
                          : file.jenis_mime?.includes('image')
                          ? 'image'
                          : 'description'}
                      </span>
                      <div className="truncate">
                        <div className="font-semibold text-xs text-on-surface truncate">{file.nama_fail}</div>
                        <div className="text-[10px] text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                          <span>{file.saiz_teks}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold">
                            <span className="material-symbols-outlined text-[12px]">verified_user</span>
                            ClamAV Bersih
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Memuat turun fail: ${file.nama_fail}`)}
                      className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                      title="Muat Turun"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Workspace Editor & Visual Diff / Sandbox (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tab Navigation */}
          <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-2 border border-white/60 shadow-sm flex items-center gap-1">
            {[
              { id: 'kandungan', label: 'Teks & Arahan', icon: 'edit_note' },
              { id: 'diff', label: 'Perbandingan Visual (Diff)', icon: 'difference' },
              { id: 'sandbox', label: 'Pratonton Sandbox', icon: 'preview' },
              { id: 'selesai', label: 'Hasil Penerbitan', icon: 'published_with_changes' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm min-h-[460px] flex flex-col">
            {activeTab === 'kandungan' && (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Arahan Pemohon &amp; Draf Kandungan
                  </span>
                  <span className="text-[11px] text-on-surface-variant">Mod Pengeditan Langsung</span>
                </div>
                <div className="p-3 bg-surface-container-low rounded-xl text-xs text-on-surface leading-relaxed border border-surface-container-high/60">
                  <div className="font-semibold text-primary mb-1">Penerangan Asal Pemohon:</div>
                  <p className="whitespace-pre-wrap">{application.penerangan}</p>
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="text-xs font-bold text-on-surface mb-1">
                    Kandungan Perubahan / HTML CMS:
                  </label>
                  <textarea
                    rows={12}
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    className="w-full flex-1 p-3.5 bg-surface-container-lowest font-mono text-xs text-on-surface border border-surface-container-high rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    placeholder="Masukkan draf pengubahsuaian kod HTML atau teks portal rasmi di sini..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'diff' && (
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Perbandingan Kandungan (Asal vs Draf Baru)
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    Side-by-Side Diff
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  {/* Before */}
                  <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
                    <div className="font-bold text-rose-800 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">remove_circle</span>
                      Kandungan Semasa Di Portal
                    </div>
                    <div className="text-[11px] text-rose-900 bg-white p-2.5 rounded-lg border border-rose-100 whitespace-pre-wrap leading-relaxed">
                      {application.url_halaman}
                      {'\n\n[Status Semasa]: '}
                      Halaman memaparkan maklumat terdahulu yang memerlukan pembaharuan terkini seperti yang dimohon.
                    </div>
                  </div>

                  {/* After */}
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                    <div className="font-bold text-emerald-800 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">add_circle</span>
                      Cadangan Kemaskini Baharu
                    </div>
                    <div className="text-[11px] text-emerald-900 bg-white p-2.5 rounded-lg border border-emerald-100 whitespace-pre-wrap leading-relaxed">
                      {draftContent}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sandbox' && (
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-on-surface">Simulasi Pratonton Portal Pahang</span>
                  </div>
                  <span className="text-[11px] font-mono text-on-surface-variant">sandbox.pahang.gov.my</span>
                </div>

                {/* Simulated Portal Browser Window */}
                <div className="flex-1 border border-surface-container-high rounded-xl overflow-hidden flex flex-col bg-white">
                  <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex-1 bg-white px-3 py-1 rounded text-[11px] font-mono text-slate-600 truncate border border-slate-200">
                      https://pahang.gov.my{application.url_halaman.replace(/https?:\/\/[^/]+/, '')}
                    </div>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                      <div className="border-b pb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                          Portal Rasmi Kerajaan Negeri Pahang • {application.kategori_nama}
                        </span>
                        <h2 className="text-lg font-bold text-slate-900 mt-1">{application.tajuk}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Diterbitkan oleh Seksyen Portal BTM SUK Pahang</p>
                      </div>
                      <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {draftContent}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'selesai' && (
              <div className="space-y-4 flex-1">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    Status Penerbitan Langsung
                  </div>
                  {application.status === 'selesai' ? (
                    <p>Permohonan ini telah disahkan selesai dan boleh diakses di pautan portal rasmi di bawah.</p>
                  ) : (
                    <p>Sahkan bahawa kemaskini telah diterbitkan sebelum menutup tiket permohonan ini.</p>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      URL Halaman Hasil Penerbitan Rasmi:
                    </label>
                    <input
                      type="url"
                      value={resultUrl}
                      onChange={(e) => setResultUrl(e.target.value)}
                      placeholder="https://pahang.gov.my/..."
                      className="w-full p-2.5 text-xs font-mono bg-surface-container-lowest border border-surface-container-high rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Catatan Penyelesaian:
                    </label>
                    <textarea
                      rows={4}
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      className="w-full p-2.5 text-xs bg-surface-container-lowest border border-surface-container-high rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>

                  {application.status !== 'selesai' && (
                    <button
                      onClick={handleComplete}
                      disabled={isProcessing}
                      className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Sahkan Selesai &amp; Tutup Tiket
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: SLA Countdown, Audit Timeline & Comments (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* SLA Status Widget */}
          <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">timer</span>
                Pemantauan SLA
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  application.lewat
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {application.lewat ? 'Melebihi SLA' : 'Mematuhi SLA'}
              </span>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-high/60 space-y-1">
              <div className="text-xs text-on-surface-variant">Baki Tempoh Tindakan:</div>
              <div className="text-lg font-bold text-on-surface font-mono">
                {application.sla_baki_teks || '2 hari 4 jam'}
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${
                    application.lewat ? 'bg-rose-500' : 'bg-primary'
                  }`}
                  style={{ width: `${application.sla_peratus_tamat || 65}%` }}
                />
              </div>
            </div>

            {application.sla_dijeda_pada && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                <span className="font-bold block">SLA Sedang Dijeda:</span>
                <span>{application.sla_sebab_jeda}</span>
              </div>
            )}
          </div>

          {/* Comments Feed */}
          <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-title-sm text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">forum</span>
                Perbincangan &amp; Nota
              </h3>
              {/* Internal vs Public toggle */}
              <div className="flex bg-surface-container p-0.5 rounded-lg text-[10px] font-semibold">
                <button
                  onClick={() => setCommentType('awam')}
                  className={`px-2 py-0.5 rounded ${
                    commentType === 'awam' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant'
                  }`}
                >
                  Awam
                </button>
                <button
                  onClick={() => setCommentType('dalaman')}
                  className={`px-2 py-0.5 rounded ${
                    commentType === 'dalaman' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant'
                  }`}
                >
                  Dalaman
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {(!application.komen || application.komen.length === 0) ? (
                <div className="text-center text-xs text-on-surface-variant py-4">
                  Tiada komen lagi. Mulakan perbincangan.
                </div>
              ) : (
                application.komen.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl text-xs space-y-1 border ${
                      item.jenis === 'dalaman'
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : 'bg-surface-container-low border-surface-container-high text-on-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] truncate">{item.penulis_nama}</span>
                      <span className="text-[10px] text-on-surface-variant">
                        {item.dicipta_pada ? new Date(item.dicipta_pada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    {item.jenis === 'dalaman' && (
                      <span className="inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                        Nota Dalaman BTM
                      </span>
                    )}
                    <p className="text-xs leading-relaxed mt-1">{item.teks}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="space-y-2 pt-2 border-t border-surface-container-high/60">
              <textarea
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={commentType === 'dalaman' ? 'Tulis nota sulit BTM...' : 'Tulis mesej kepada pemohon...'}
                className="w-full p-2.5 text-xs bg-surface-container-lowest border border-surface-container-high rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !commentText.trim()}
                className="w-full py-2 bg-primary text-on-primary font-bold text-xs rounded-xl shadow hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmittingComment ? 'Menghantar...' : 'Hantar Komen'}
              </button>
            </form>
          </div>

          {/* Status Timeline History */}
          <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm space-y-3">
            <h3 className="font-title-sm text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">history</span>
              Kronologi Status
            </h3>

            <div className="relative pl-4 space-y-4 border-l-2 border-primary/20 text-xs">
              {application.sejarah_status?.map((hist, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white" />
                  <div className="font-bold text-on-surface capitalize">
                    {hist.ke.replace(/_/g, ' ')}
                  </div>
                  <div className="text-[10px] text-on-surface-variant">
                    {hist.oleh_nama} • {new Date(hist.masa).toLocaleString('ms-MY', { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                  {hist.catatan && (
                    <div className="text-[11px] text-on-surface-variant italic mt-0.5">
                      "{hist.catatan}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pause SLA Modal */}
      {pauseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/80">
            <h3 className="font-title-sm font-bold text-on-surface text-lg mb-2">
              Jeda Tempoh SLA
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Penjedaan SLA membolehkan jam kiraan berhenti sementara menunggu maklum balas luaran atau kerja penyelenggaraan.
            </p>
            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold text-on-surface">Pilih Justifikasi Penjedaan:</label>
              {[
                'Menunggu maklum balas / kelulusan fail asal daripada pemohon',
                'Penyelenggaraan pelayan / Gangguan teknikal CMS kerajaan',
                'Semakan perundangan / Pengesahan warta rasmi',
                'Cuti peristiwa khas Negeri Pahang',
              ].map((reason, i) => (
                <label
                  key={i}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-surface-container-high hover:bg-surface-container-low text-xs cursor-pointer"
                >
                  <input
                    type="radio"
                    name="pauseReasonRadio"
                    checked={pauseReason === reason}
                    onChange={() => setPauseReason(reason)}
                    className="text-primary focus:ring-primary"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPauseModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high"
              >
                Batal
              </button>
              <button
                disabled={isProcessing}
                onClick={handlePauseSla}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {isProcessing ? 'Menjeda...' : 'Sahkan Jeda SLA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Application Modal */}
      {completeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/80">
            <h3 className="font-title-sm font-bold text-emerald-800 text-lg mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">task_alt</span>
              Pengesahan Penyelesaian Tiket
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Sila pastikan kemaskini telah disiarkan secara langsung di portal rasmi. Notifikasi e-mel automatik akan dihantar kepada pemohon.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  URL Penerbitan Langsung:
                </label>
                <input
                  type="url"
                  value={resultUrl}
                  onChange={(e) => setResultUrl(e.target.value)}
                  className="w-full p-2.5 text-xs font-mono bg-surface-container-lowest border border-surface-container-high rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Catatan Penutupan:
                </label>
                <textarea
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full p-2.5 text-xs bg-surface-container-lowest border border-surface-container-high rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCompleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high"
              >
                Batal
              </button>
              <button
                disabled={isProcessing}
                onClick={handleComplete}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {isProcessing ? 'Menutup...' : 'Sahkan Selesai & Hantar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
