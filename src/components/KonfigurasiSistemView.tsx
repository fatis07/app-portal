import React, { useState, useEffect } from 'react';
import { api, SystemConfigData, PendingAccountItem } from '../lib/api.ts';

export const KonfigurasiSistemView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sla' | 'waktu' | 'akaun' | 'sekuriti' | 'nod'>('sla');
  const [config, setConfig] = useState<SystemConfigData | null>(null);
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccountItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await api.getConfig();
      setConfig(res.config);
      setPendingAccounts(res.pending_accounts || []);
    } catch (err: any) {
      console.error('Failed to load system config', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setIsSaving(true);
    try {
      const res = await api.updateConfig(config);
      setToastMessage({ type: 'success', text: 'Konfigurasi sistem berjaya disimpan ke pangkalan data rasmi!' });
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Gagal menyimpan konfigurasi.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveAccount = async (id: string, name: string) => {
    try {
      await api.approveAccount(id);
      setToastMessage({ type: 'success', text: `Akaun ${name} berjaya diluluskan untuk akses rasmi.` });
      fetchConfig();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Gagal meluluskan akaun.' });
    }
  };

  const handleRejectAccount = async (id: string, name: string) => {
    try {
      await api.rejectAccount(id);
      setToastMessage({ type: 'success', text: `Permohonan akaun ${name} telah ditolak.` });
      fetchConfig();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Gagal menolak akaun.' });
    }
  };

  if (loading || !config) {
    return (
      <div className="p-12 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-[36px] animate-spin block mb-2">sync</span>
        Memuatkan tetapan parameter sistem...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
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
            <span className="text-xs font-semibold">{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)}>
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-fixed/60 text-primary border border-primary/20">
              Modul Pentadbiran BTM
            </span>
            <span className="text-xs text-on-surface-variant">Kawalan Polisi &amp; Keselamatan</span>
          </div>
          <h1 className="font-title-lg text-on-surface font-bold text-2xl tracking-tight">
            Konfigurasi Sistem &amp; Polisi SLA
          </h1>
          <p className="font-body-md text-on-surface-variant text-sm mt-0.5">
            Urus Piagam Pelanggan, waktu pejabat rasmi SUK, kelulusan pendaftaran kakitangan baharu, dan had muat naik fail.
          </p>
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={isSaving}
          className="px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl shadow hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-surface-container-lowest/80 p-2 rounded-2xl border border-white/60">
        {[
          { id: 'sla', label: 'Polisi & Had SLA', icon: 'schedule' },
          { id: 'waktu', label: 'Waktu Operasi & Cuti', icon: 'event_available' },
          { id: 'akaun', label: 'Kelulusan Akaun Baharu', icon: 'how_to_reg', count: pendingAccounts.length },
          { id: 'sekuriti', label: 'Had & Keselamatan Siber', icon: 'security' },
          { id: 'nod', label: 'Infrastruktur Pelayan', icon: 'dns' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm">
        {/* TAB 1: Polisi SLA */}
        {activeTab === 'sla' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-title-sm text-base font-bold text-on-surface">
                Matriks Piagam Pelanggan (SLA Berdasarkan Keutamaan)
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Masa tindak balas dalam hari bekerja rasmi. Melebihi tempoh ini akan mengaktifkan amaran eskalasi kepada Ketua Seksyen.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-700">Keutamaan Biasa</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200">Standard</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={config.sla_hari_biasa}
                    onChange={(e) => setConfig({ ...config, sla_hari_biasa: Number(e.target.value) })}
                    className="w-20 p-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-lg font-bold text-center font-mono focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-xs font-semibold text-on-surface">Hari Bekerja</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Untuk permohonan kemaskini teks biasa, direktori pegawai, atau muat naik risalah warta.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-amber-700">Keutamaan Segera</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                    Penting
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={config.sla_hari_segera}
                    onChange={(e) => setConfig({ ...config, sla_hari_segera: Number(e.target.value) })}
                    className="w-20 p-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-lg font-bold text-center font-mono focus:ring-2 focus:ring-amber-500/20"
                  />
                  <span className="text-xs font-semibold text-on-surface">Hari Bekerja</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Untuk hebahan program rasmi kerajaan yang bertarikh hampir atau kenyataan media berjadual.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-rose-700">Keutamaan Kritikal</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">
                    Mendesak
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={3}
                    value={config.sla_hari_kritikal}
                    onChange={(e) => setConfig({ ...config, sla_hari_kritikal: Number(e.target.value) })}
                    className="w-20 p-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-lg font-bold text-center font-mono focus:ring-2 focus:ring-rose-500/20"
                  />
                  <span className="text-xs font-semibold text-on-surface">Hari Bekerja</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Arahan khas YAB Menteri Besar, YB Setiausaha Kerajaan, pengumuman bencana banjir atau krisis negeri.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Waktu Operasi */}
        {activeTab === 'waktu' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-title-sm text-base font-bold text-on-surface">
                Waktu Pejabat &amp; Polisi Penjedaan Hujung Minggu
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Kiraan jam SLA hanya dikira pada waktu bekerja rasmi pejabat SUK Negeri Pahang.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high space-y-3">
                <div className="text-xs font-bold text-on-surface">Waktu Operasi Bekerja:</div>
                <div className="flex items-center gap-3">
                  <div>
                    <label className="text-[11px] text-on-surface-variant block mb-1">Mula:</label>
                    <input
                      type="time"
                      value={config.waktu_operasi.mula}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          waktu_operasi: { ...config.waktu_operasi, mula: e.target.value },
                        })
                      }
                      className="p-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-on-surface-variant block mb-1">Tamat:</label>
                    <input
                      type="time"
                      value={config.waktu_operasi.tamat}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          waktu_operasi: { ...config.waktu_operasi, tamat: e.target.value },
                        })
                      }
                      className="p-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="text-xs text-on-surface font-medium pt-2">
                  Hari: <span className="font-bold text-primary">{config.waktu_operasi.hari}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high space-y-3">
                <div className="text-xs font-bold text-on-surface">Jeda Automatik Cuti Am:</div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.waktu_operasi.auto_tolak_cuti_am}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        waktu_operasi: {
                          ...config.waktu_operasi,
                          auto_tolak_cuti_am: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="text-xs text-on-surface">
                    Jeda pengiraan SLA secara automatik pada Cuti Kelepasan Am &amp; Cuti Peristiwa Negeri Pahang
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Kelulusan Akaun Baharu */}
        {activeTab === 'akaun' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-title-sm text-base font-bold text-on-surface">
                  Peti Masuk Kelulusan Akaun Kakitangan Awam
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Pengguna luaran daripada agensi luar negeri yang mendaftar akaun mesti disahkan oleh Pentadbir BTM sebelum dapat menghantar permohonan.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-surface-container-high">
                {pendingAccounts.length} Permohonan
              </span>
            </div>

            <div className="overflow-x-auto border border-surface-container-high rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low text-on-surface-variant uppercase font-semibold border-b border-surface-container-high">
                  <tr>
                    <th className="px-4 py-3">Nama Pegawai &amp; MyKad</th>
                    <th className="px-4 py-3">Agensi / Jabatan</th>
                    <th className="px-4 py-3">E-mel Rasmi</th>
                    <th className="px-4 py-3">Peranan Dimohon</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Tindakan Pentadbir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/60">
                  {pendingAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant">
                        Tiada permohonan akaun baharu yang menunggu kelulusan.
                      </td>
                    </tr>
                  ) : (
                    pendingAccounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-surface-container-low/40">
                        <td className="px-4 py-3">
                          <div className="font-bold text-on-surface">{acc.nama_penuh}</div>
                          <div className="font-mono text-[10px] text-on-surface-variant">{acc.no_mykad}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-on-surface">{acc.agensi_jabatan}</div>
                          <div className="text-[10px] text-on-surface-variant">{acc.bahagian}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-primary">{acc.emel}</td>
                        <td className="px-4 py-3 uppercase text-[10px] font-bold text-on-surface-variant">
                          {acc.peranan_dimohon}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              acc.status === 'diluluskan'
                                ? 'bg-emerald-100 text-emerald-800'
                                : acc.status === 'ditolak'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {acc.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {acc.status === 'menunggu' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleApproveAccount(acc.id, acc.nama_penuh)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 shadow-xs"
                              >
                                Lulus
                              </button>
                              <button
                                onClick={() => handleRejectAccount(acc.id, acc.nama_penuh)}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 shadow-xs"
                              >
                                Tolak
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-on-surface-variant italic">Tindakan selesai</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Sekuriti Siber */}
        {activeTab === 'sekuriti' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-title-sm text-base font-bold text-on-surface">
                Parameter Had Sistem &amp; Dasar Keselamatan
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Konfigurasi had muat naik fail, tempoh tamat sesi pengguna, dan keselamatan dua faktor (MFA).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high space-y-2">
                <span className="text-xs font-bold text-on-surface block">Had Saiz Muat Naik Dokumen:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={config.had_saiz_fail_mb}
                    onChange={(e) => setConfig({ ...config, had_saiz_fail_mb: Number(e.target.value) })}
                    className="w-20 p-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-sm font-bold text-center font-mono"
                  />
                  <span className="text-xs font-semibold text-on-surface">MB per fail</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Kekangan ClamAV Antivirus bagi mengelakkan limpahan memori imbasan.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high space-y-2">
                <span className="text-xs font-bold text-on-surface block">Tamat Sesi Tidak Aktif:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={10}
                    max={120}
                    value={config.tamat_sesi_minit}
                    onChange={(e) => setConfig({ ...config, tamat_sesi_minit: Number(e.target.value) })}
                    className="w-20 p-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-sm font-bold text-center font-mono"
                  />
                  <span className="text-xs font-semibold text-on-surface">Minit</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Pengguna akan dilog keluar secara automatik selepas tempoh dorman.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high space-y-2">
                <span className="text-xs font-bold text-on-surface block">Pengesahan 2-Faktor (MFA TOTP):</span>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={config.mfa_totp_diwajibkan}
                    onChange={(e) => setConfig({ ...config, mfa_totp_diwajibkan: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-semibold text-on-surface">
                    Wajibkan untuk Pentadbir &amp; Pegawai Portal
                  </span>
                </label>
                <p className="text-[11px] text-on-surface-variant">
                  Memerlukan aplikasi MyGovID Authenticator atau Google Authenticator.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Infrastruktur Pelayan */}
        {activeTab === 'nod' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-title-sm text-base font-bold text-on-surface">
                Telemetri Node Pelayan BTM &amp; Storan Data
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Pemantauan masa nyata pelayan hosting Pusat Data Negeri Pahang.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high space-y-2">
                <span className="text-xs text-on-surface-variant block font-medium">Nod Komputer Aktif</span>
                <div className="text-sm font-bold font-mono text-primary">{config.beban_pelayan.node}</div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Kesihatan Sistem: Optimum</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high space-y-2">
                <span className="text-xs text-on-surface-variant block font-medium">Penggunaan CPU &amp; Beban Memori</span>
                <div className="text-xl font-bold font-mono text-on-surface">{config.beban_pelayan.penggunaan_cpu}</div>
                <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '18%' }} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high space-y-2">
                <span className="text-xs text-on-surface-variant block font-medium">Storan Lampiran Dokumen</span>
                <div className="text-xl font-bold font-mono text-on-surface">
                  {config.beban_pelayan.storan_digunakan_gb} GB / {config.beban_pelayan.storan_maksimum_tb} TB
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '4.2%' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
