import React, { useState } from 'react';
import { api, ApplicationItem, User } from '../lib/api.ts';

interface SemakanPermohonanProps {
  applications: ApplicationItem[];
  currentUser: User | null;
  onRefresh: () => void;
  onOpenWorkspace: (item: ApplicationItem) => void;
  onNavigate: (path: string) => void;
}

export const SemakanPermohonanView: React.FC<SemakanPermohonanProps> = ({
  applications,
  currentUser,
  onRefresh,
  onOpenWorkspace,
  onNavigate,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<string>('usr_001');
  const [assignModalOpen, setAssignModalOpen] = useState<boolean>(false);
  const [priorityModalOpen, setPriorityModalOpen] = useState<boolean>(false);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<'biasa' | 'segera' | 'kritikal'>('biasa');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Officers list for assignment with active workload
  const officers = [
    {
      id: 'usr_001',
      name: 'Ts. Mohd Faiz bin Azmi',
      role: 'Pegawai Teknologi Maklumat F44',
      specialty: 'Portal Rasmi & Kerajaan Digital',
      activeTickets: applications.filter(a => a.pegawai_uid === 'usr_001' && a.status === 'dalam_tindakan').length,
      maxTickets: 6,
    },
    {
      id: 'usr_002',
      name: 'Pn. Siti Nurhaliza binti Ramli',
      role: 'Penolong Pegawai TM FA32',
      specialty: 'Direktori & Warta Kerajaan',
      activeTickets: applications.filter(a => a.pegawai_uid === 'usr_002' && a.status === 'dalam_tindakan').length,
      maxTickets: 6,
    },
    {
      id: 'usr_003',
      name: 'En. Ahmad Zulkifli bin Hashim',
      role: 'Penolong Pegawai TM FA29',
      specialty: 'Penerbitan Multimedia & Banner',
      activeTickets: applications.filter(a => a.pegawai_uid === 'usr_003' && a.status === 'dalam_tindakan').length,
      maxTickets: 6,
    },
    {
      id: 'usr_007',
      name: 'Cik Farah Diana binti Kamaruddin',
      role: 'Juruteknik Komputer FT19',
      specialty: 'Kemasukan Data & Muat Naik Dokumen',
      activeTickets: applications.filter(a => a.pegawai_uid === 'usr_007' && a.status === 'dalam_tindakan').length,
      maxTickets: 6,
    },
  ];

  // Filtering
  const filteredApps = applications.filter((app) => {
    // Status filter
    if (filterStatus === 'belum_diagih' && (app.status !== 'dihantar' && app.status !== 'diterima')) return false;
    if (filterStatus === 'dalam_tindakan' && app.status !== 'dalam_tindakan') return false;
    if (filterStatus === 'menunggu_semakan' && app.status !== 'menunggu_semakan') return false;
    if (filterStatus === 'kritikal' && app.keutamaan !== 'kritikal') return false;
    if (filterStatus === 'selesai' && (app.status !== 'selesai' && app.status !== 'ditutup')) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = app.no_rujukan.toLowerCase().includes(q);
      const matchTitle = app.tajuk.toLowerCase().includes(q);
      const matchAgency = app.org_nama.toLowerCase().includes(q);
      const matchApplicant = app.pemohon_snapshot.nama.toLowerCase().includes(q);
      if (!matchRef && !matchTitle && !matchAgency && !matchApplicant) return false;
    }

    return true;
  });

  const handleOpenAssignModal = (app: ApplicationItem) => {
    setSelectedApp(app);
    setSelectedOfficer(app.pegawai_uid || 'usr_001');
    setAssignModalOpen(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedApp) return;
    setIsProcessing(true);
    try {
      const officer = officers.find(o => o.id === selectedOfficer);
      const officerName = officer ? officer.name : 'Pegawai Bertugas';
      await api.assignOfficer(selectedApp.id, selectedOfficer, officerName);
      setAlertMessage({ type: 'success', text: `Tiket ${selectedApp.no_rujukan} berjaya diagihkan kepada ${officerName}.` });
      setAssignModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setAlertMessage({ type: 'error', text: err.message || 'Gagal mengagihkan tiket.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoDispatch = async (method: 'lowest_load' | 'round_robin') => {
    setIsProcessing(true);
    try {
      const res = await api.bulkAssign(method);
      setAlertMessage({ type: 'success', text: res.message || 'Agihan automatik berjaya dijalankan.' });
      onRefresh();
    } catch (err: any) {
      setAlertMessage({ type: 'error', text: err.message || 'Gagal menjalankan agihan automatik.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedApp || !rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      await api.updateStatus(selectedApp.id, 'ditolak', rejectReason);
      setAlertMessage({ type: 'success', text: `Permohonan ${selectedApp.no_rujukan} telah ditolak.` });
      setRejectModalOpen(false);
      setRejectReason('');
      onRefresh();
    } catch (err: any) {
      setAlertMessage({ type: 'error', text: err.message || 'Gagal menolak permohonan.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {alertMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border ${
            alertMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">
              {alertMessage.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="font-body-md text-sm font-medium">{alertMessage.text}</span>
          </div>
          <button
            onClick={() => setAlertMessage(null)}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Header & Automated Dispatch Bar */}
      <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-fixed/60 text-primary border border-primary/20">
              Pusat Kawalan Agihan &amp; Triage
            </span>
            <span className="text-xs text-on-surface-variant">SLA Pematuhan: 96.4%</span>
          </div>
          <h1 className="font-title-lg text-on-surface font-bold text-2xl tracking-tight">
            Semakan &amp; Agihan Permohonan
          </h1>
          <p className="font-body-md text-on-surface-variant text-sm mt-0.5">
            Tapis tiket baharu, agihkan tugasan kepada pegawai portal, atau semak hasil kerja sebelum pelepasan rasmi.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            disabled={isProcessing}
            onClick={() => handleAutoDispatch('lowest_load')}
            className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            <span>Agihan Automatik (Lowest Load)</span>
          </button>
          <button
            disabled={isProcessing}
            onClick={() => handleAutoDispatch('round_robin')}
            className="px-4 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-semibold text-sm flex items-center gap-2 hover:bg-surface-container-highest transition-all border border-surface-container-high active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">sync_alt</span>
            <span>Round Robin</span>
          </button>
          <button
            onClick={() => onNavigate('daftar-saluran-luar')}
            className="px-4 py-2.5 rounded-xl bg-secondary-container text-on-secondary-container font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Daftar Saluran Luar</span>
          </button>
        </div>
      </div>

      {/* Officer Workload Gauge Matrix */}
      <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-title-sm text-on-surface font-bold text-base flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
            Status Beban Tugas Pegawai Portal (Seksyen BTM)
          </h2>
          <span className="text-xs text-on-surface-variant">Kapasiti Optimum: 6 Tiket Serentak</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {officers.map((officer) => {
            const loadPercent = Math.min(100, Math.round((officer.activeTickets / officer.maxTickets) * 100));
            const isFull = loadPercent >= 80;
            return (
              <div
                key={officer.id}
                className="p-4 rounded-xl bg-surface-container/50 border border-surface-container-high/60 hover:border-primary/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-title-sm text-sm font-bold text-on-surface truncate">
                      {officer.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        isFull
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {loadPercent}%
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant truncate">{officer.role}</p>
                  <p className="text-[11px] text-primary/80 font-medium mt-0.5 truncate">{officer.specialty}</p>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-on-surface-variant mb-1 font-medium">
                    <span>{officer.activeTickets} aktif</span>
                    <span>Maks: {officer.maxTickets}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFull ? 'bg-rose-500' : 'bg-primary'
                      }`}
                      style={{ width: `${loadPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'semua', label: 'Semua Tiket' },
            { id: 'belum_diagih', label: 'Belum Diagih' },
            { id: 'dalam_tindakan', label: 'Dalam Tindakan' },
            { id: 'menunggu_semakan', label: 'Menunggu Semakan' },
            { id: 'kritikal', label: 'Kritikal' },
            { id: 'selesai', label: 'Selesai' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === tab.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari no rujukan, tajuk, agensi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest border border-surface-container-high rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Queue Tickets Table */}
      <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-on-surface">
            <thead className="bg-surface-container-low/60 text-xs uppercase font-semibold text-on-surface-variant tracking-wider border-b border-surface-container-high/60">
              <tr>
                <th className="px-5 py-3.5">No Rujukan &amp; Saluran</th>
                <th className="px-5 py-3.5">Tajuk &amp; Butiran Kemaskini</th>
                <th className="px-5 py-3.5">Agensi &amp; Pemohon</th>
                <th className="px-5 py-3.5">Keutamaan</th>
                <th className="px-5 py-3.5">Pegawai Bertugas</th>
                <th className="px-5 py-3.5">Status &amp; SLA</th>
                <th className="px-5 py-3.5 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/40">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40 block mb-2">
                      inbox
                    </span>
                    Tiada permohonan dalam senarai ini.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const isUnassigned = !app.pegawai_uid;
                  const isOverdue = app.lewat;

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                      onClick={() => onOpenWorkspace(app)}
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-primary text-xs tracking-wide">
                          {app.no_rujukan}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-on-surface-variant capitalize">
                          <span className="material-symbols-outlined text-[13px]">
                            {app.saluran_penerimaan === 'surat'
                              ? 'mail'
                              : app.saluran_penerimaan === 'whatsapp'
                              ? 'chat'
                              : app.saluran_penerimaan === 'emel'
                              ? 'alternate_email'
                              : 'web'}
                          </span>
                          <span>{app.saluran_penerimaan}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 max-w-xs">
                        <div className="font-semibold text-on-surface text-sm line-clamp-1">
                          {app.tajuk}
                        </div>
                        <div className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                          {app.kategori_nama}
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-medium text-xs text-on-surface">{app.org_nama}</div>
                        <div className="text-[11px] text-on-surface-variant">{app.pemohon_snapshot.nama}</div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                            app.keutamaan === 'kritikal'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : app.keutamaan === 'segera'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {app.keutamaan}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {app.pegawai_nama ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                              {app.pegawai_nama.charAt(0)}
                            </div>
                            <span className="text-xs font-medium text-on-surface truncate max-w-[130px]">
                              {app.pegawai_nama}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Belum Diagih
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              app.status === 'selesai'
                                ? 'bg-emerald-500'
                                : app.status === 'dalam_tindakan'
                                ? 'bg-sky-500 animate-pulse'
                                : app.status === 'menunggu_semakan'
                                ? 'bg-purple-500'
                                : app.status === 'ditolak'
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          <span className="text-xs font-semibold capitalize text-on-surface">
                            {app.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="text-[11px] text-on-surface-variant mt-0.5">
                          {app.sla_baki_teks || '3 hari bekerja'}
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAssignModal(app)}
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                            title="Agih / Tukar Pegawai"
                          >
                            <span className="material-symbols-outlined text-[18px]">person_add</span>
                          </button>
                          <button
                            onClick={() => onOpenWorkspace(app)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                            title="Buka Ruang Kerja"
                          >
                            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                          </button>
                          {app.status !== 'ditolak' && app.status !== 'selesai' && (
                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                setRejectModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Tolak Permohonan"
                            >
                              <span className="material-symbols-outlined text-[18px]">cancel</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {assignModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-title-sm font-bold text-on-surface text-lg">
                Agihan Tugasan Tiket
              </h3>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl mb-4 border border-surface-container-high/40">
              <div className="text-xs font-mono font-bold text-primary">{selectedApp.no_rujukan}</div>
              <div className="text-sm font-semibold text-on-surface mt-0.5 line-clamp-1">{selectedApp.tajuk}</div>
              <div className="text-xs text-on-surface-variant mt-1">{selectedApp.org_nama}</div>
            </div>

            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                Pilih Pegawai Bertugas (Seksyen BTM)
              </label>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {officers.map((officer) => (
                  <label
                    key={officer.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedOfficer === officer.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-surface-container-high hover:bg-surface-container-low text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="officerRadio"
                        value={officer.id}
                        checked={selectedOfficer === officer.id}
                        onChange={(e) => setSelectedOfficer(e.target.value)}
                        className="text-primary focus:ring-primary"
                      />
                      <div>
                        <div className="text-sm font-bold">{officer.name}</div>
                        <div className="text-xs text-on-surface-variant">{officer.role}</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-container-high">
                      {officer.activeTickets} tiket
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmAssign}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-on-primary shadow-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {isProcessing ? 'Menyimpan...' : 'Sahkan Agihan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-title-sm font-bold text-rose-700 text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">cancel</span>
                Tolak Permohonan
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant mb-4">
              Sila nyatakan justifikasi rasmi penolakan permohonan kemaskini ini. Maklum balas ini akan dihantar kepada pemohon rasmi melalui e-mel dan sistem.
            </p>

            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Dokumen sokongan rasmi tidak disertakan / Kandungan tidak menepati garis panduan Portal Rasmi..."
              className="w-full p-3 border border-surface-container-high rounded-xl text-sm bg-surface-container-lowest focus:ring-2 focus:ring-rose-500/20 focus:outline-none mb-4"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high"
              >
                Batal
              </button>
              <button
                disabled={isProcessing || !rejectReason.trim()}
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-rose-600 text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
              >
                {isProcessing ? 'Menolak...' : 'Sahkan Penolakan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
