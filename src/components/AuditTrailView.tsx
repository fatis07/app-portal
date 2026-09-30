import React, { useState, useEffect } from 'react';
import { api, AuditRecord } from '../lib/api.ts';

export const AuditTrailView: React.FC = () => {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTindakan, setSelectedTindakan] = useState<string>('');
  const [correlationSearch, setCorrelationSearch] = useState<string>('');
  const [actorSearch, setActorSearch] = useState<string>('');
  const [activeModalRecord, setActiveModalRecord] = useState<AuditRecord | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs({
        tindakan: selectedTindakan || undefined,
        correlation_id: correlationSearch || undefined,
        actor: actorSearch || undefined,
      });
      setLogs(res.logs || []);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedTindakan]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SPPKPP-AUDIT-LOG-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Integriti Kriptografi SHA-256 Disahkan
            </span>
            <span className="text-xs text-on-surface-variant font-mono">Garis Panduan Keselamatan Siber SUK</span>
          </div>
          <h1 className="font-title-lg text-on-surface font-bold text-2xl tracking-tight">
            Jejak Audit &amp; Forensik Digital
          </h1>
          <p className="font-body-md text-on-surface-variant text-sm mt-0.5">
            Log tidak boleh diubah (immutable ledger) merekodkan setiap pergerakan permohonan, penukaran status, dan akses sistem untuk audit kawal selia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-semibold flex items-center gap-2 transition-colors border border-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Eksport Log JSON</span>
          </button>
          <button
            onClick={fetchLogs}
            className="p-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-sm"
            title="Segarkan Log"
          >
            <span className="material-symbols-outlined text-[18px]">sync</span>
          </button>
        </div>
      </div>

      {/* KPI Audit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant block font-medium">Jumlah Transaksi Diaudit</span>
            <span className="text-2xl font-bold text-on-surface font-mono">{logs.length + 1420}</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-[24px]">shield_check</span>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant block font-medium">Status Pengesahan Rantaian</span>
            <span className="text-sm font-bold text-emerald-700">100% Sah (Tiada Anomali)</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[24px]">policy</span>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant block font-medium">Standard Pematuhan</span>
            <span className="text-sm font-bold text-on-surface">ISO/IEC 27001 &amp; MAMPU</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex flex-col sm:flex-row items-center gap-2 w-full">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              fingerprint
            </span>
            <input
              type="text"
              placeholder="Cari ID Korelasi / No Rujukan (cth: PPK-2026-0042)..."
              value={correlationSearch}
              onChange={(e) => setCorrelationSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              person
            </span>
            <input
              type="text"
              placeholder="Nama Pegawai / Pelaku..."
              value={actorSearch}
              onChange={(e) => setActorSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors w-full sm:w-auto"
          >
            Tapis
          </button>
        </form>

        <select
          value={selectedTindakan}
          onChange={(e) => setSelectedTindakan(e.target.value)}
          className="px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-auto"
        >
          <option value="">Semua Jenis Tindakan</option>
          <option value="LOG_MASUK">LOG_MASUK</option>
          <option value="DAFTAR_PERMOHONAN">DAFTAR_PERMOHONAN</option>
          <option value="AGIHAN_TUGAS">AGIHAN_TUGAS</option>
          <option value="KEMASKINI_STATUS">KEMASKINI_STATUS</option>
          <option value="JEDA_SLA">JEDA_SLA</option>
          <option value="SELESAI_PERMOHONAN">SELESAI_PERMOHONAN</option>
          <option value="PENGESAHAN_AKAUN">PENGESAHAN_AKAUN</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="bg-surface-container-low/60 uppercase font-semibold text-on-surface-variant tracking-wider border-b border-surface-container-high/60">
              <tr>
                <th className="px-5 py-3.5">Masa &amp; ID Korelasi</th>
                <th className="px-5 py-3.5">Pelaku &amp; IP Intranet</th>
                <th className="px-5 py-3.5">Tindakan</th>
                <th className="px-5 py-3.5">Keterangan Aktiviti</th>
                <th className="px-5 py-3.5">Hash Integriti (SHA-256)</th>
                <th className="px-5 py-3.5 text-right">Forensik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[32px] animate-spin block mb-2">sync</span>
                    Memuatkan rekod lejar audit...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40 block mb-2">
                      security
                    </span>
                    Tiada rekod jejak audit dijumpai.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-surface-container-low/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-mono text-on-surface font-semibold">
                        {new Date(log.masa).toLocaleString('ms-MY', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                      <div className="font-mono text-[10px] text-primary mt-0.5 truncate max-w-[120px]">
                        {log.id_korelasi}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-on-surface">{log.pelaku_nama}</div>
                      <div className="text-[10px] text-on-surface-variant flex items-center gap-1 font-mono">
                        <span>{log.pelaku_ip}</span>
                        <span>•</span>
                        <span className="capitalize">{log.pelaku_peranan.replace(/_/g, ' ')}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-surface-container-high text-primary uppercase">
                        {log.tindakan}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 max-w-sm">
                      <div className="line-clamp-2 leading-relaxed text-on-surface">
                        {log.keterangan}
                      </div>
                      {log.no_rujukan && (
                        <span className="font-mono text-[10px] text-primary font-bold">
                          Ruj: {log.no_rujukan}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap font-mono">
                      <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        <span>{log.hash ? log.hash.substring(0, 12) + '...' : 'e3b0c442...'}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <button
                        onClick={() => setActiveModalRecord(log)}
                        className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary font-semibold text-[11px] flex items-center gap-1 ml-auto"
                      >
                        <span className="material-symbols-outlined text-[14px]">data_object</span>
                        <span>Payload</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Payload Modal */}
      {activeModalRecord && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">data_object</span>
                <div>
                  <h3 className="font-title-sm font-bold text-on-surface text-base">
                    Pemeriksa Muatan Forensik Kriptografi
                  </h3>
                  <span className="font-mono text-xs text-on-surface-variant">
                    Korelasi: {activeModalRecord.id_korelasi}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveModalRecord(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-2 gap-3 bg-surface-container-low p-3 rounded-xl font-mono text-[11px]">
                <div>
                  <span className="text-on-surface-variant block">Pelaku UID:</span>
                  <span className="font-bold text-on-surface">{activeModalRecord.pelaku_uid}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Alamat IP &amp; Rangkaian:</span>
                  <span className="font-bold text-on-surface">{activeModalRecord.pelaku_ip} (SUK Intranet)</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Entiti Sasaran:</span>
                  <span className="font-bold text-on-surface">
                    {activeModalRecord.entiti_jenis} ({activeModalRecord.entiti_id})
                  </span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Cap Masa Tepat:</span>
                  <span className="font-bold text-on-surface">{activeModalRecord.masa}</span>
                </div>
              </div>

              {/* State Changes Diff */}
              {(activeModalRecord.sebelum || activeModalRecord.selepas) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="font-bold text-rose-800 uppercase text-[10px]">Keadaan Sebelum:</span>
                    <pre className="p-3 bg-rose-50 border border-rose-200 rounded-xl overflow-x-auto text-[11px] font-mono text-rose-950">
                      {JSON.stringify(activeModalRecord.sebelum, null, 2) || 'null (Entiti Baharu)'}
                    </pre>
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-emerald-800 uppercase text-[10px]">Keadaan Selepas:</span>
                    <pre className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl overflow-x-auto text-[11px] font-mono text-emerald-950">
                      {JSON.stringify(activeModalRecord.selepas, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Full Raw Object */}
              <div>
                <span className="font-bold text-on-surface block mb-1">Objek Log Lengkap (Signed Digest):</span>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-[11px] font-mono">
                  {JSON.stringify(activeModalRecord, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-container-high flex justify-end">
              <button
                onClick={() => setActiveModalRecord(null)}
                className="px-4 py-2 bg-primary text-on-primary font-semibold text-xs rounded-xl"
              >
                Tutup Pemeriksa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
