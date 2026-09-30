import React, { useState } from 'react';
import { ApplicationItem } from '../lib/api.ts';

interface PermohonanSayaProps {
  applications: ApplicationItem[];
  onNavigate: (path: string) => void;
  onOpenWorkspace: (item: ApplicationItem) => void;
}

export const PermohonanSayaView: React.FC<PermohonanSayaProps> = ({
  applications,
  onNavigate,
  onOpenWorkspace,
}) => {
  const [search, setSearch] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [quickFilter, setQuickFilter] = useState('semua');

  const filtered = applications.filter((app) => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        app.no_rujukan.toLowerCase().includes(q) ||
        app.tajuk.toLowerCase().includes(q) ||
        app.org_nama.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (kategoriFilter && app.kategori_id !== kategoriFilter && app.kategori_kod !== kategoriFilter) {
      return false;
    }
    if (statusFilter && app.status !== statusFilter) {
      return false;
    }
    if (priorityFilter && app.keutamaan !== priorityFilter) {
      return false;
    }
    if (quickFilter === 'respon' && app.status !== 'perlu_maklumat') {
      return false;
    }
    if (quickFilter === 'kritikal' && app.keutamaan !== 'kritikal' && app.keutamaan !== 'segera') {
      return false;
    }
    return true;
  });

  const countTotal = applications.length;
  const countInAction = applications.filter((a) => a.status === 'dalam_tindakan' || a.status === 'dalam_semakan').length;
  const countNeedInfo = applications.filter((a) => a.status === 'perlu_maklumat').length;
  const countDone = applications.filter((a) => a.status === 'selesai' || a.status === 'ditutup').length;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Seksyen & Tindakan Utama */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col max-w-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high/80 text-primary font-label-sm text-xs uppercase tracking-wider font-semibold border border-surface-container-highest/60">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Modul Pemohon Rasmi
            </span>
            <span className="font-label-sm text-xs text-on-surface-variant">• BTM SUK Pahang</span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl text-on-surface tracking-tight font-bold">
            Permohonan Saya
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
            Senarai semua permohonan kemaskini portal yang dihantar di bawah akaun anda. Pantau status kelulusan, masa SLA dan maklum balas pegawai secara masa nyata.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
          {/* Muat Turun Ringkasan */}
          <button
            onClick={() => alert('Laporan ringkasan permohonan sedang dijana (Format: PDF / XLSX).')}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 hover:bg-surface-container-high text-primary font-title-sm text-xs font-semibold shadow-sm transition-all border border-slate-200 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[19px] text-primary group-hover:scale-110 transition-transform">
              download
            </span>
            <span>Muat Turun Ringkasan</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-surface-container text-on-surface-variant uppercase">
              PDF / XLS
            </span>
          </button>

          {/* Cipta Permohonan Baharu */}
          <button
            onClick={() => onNavigate('permohonan-baharu')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container text-white hover:bg-primary transition-all shadow-md hover:shadow-lg font-title-sm text-xs font-bold cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Permohonan Baharu</span>
          </button>
        </div>
      </div>

      {/* Kad Ringkasan Status Pantas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Kad 1 */}
        <div className="relative overflow-hidden rounded-2xl bg-white/85 backdrop-blur-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-white/80">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs text-on-surface-variant font-semibold">Semua Permohonan</span>
            <span className="p-2 rounded-xl bg-surface-container-high text-primary">
              <span className="material-symbols-outlined text-[20px]">folder_open</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display-lg text-3xl text-on-surface font-bold">{countTotal}</span>
            <span className="font-label-sm text-xs text-on-surface-variant">rekod aktif</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-on-surface-variant font-body-sm text-xs pt-2">
            <span className="flex items-center gap-1 text-primary font-semibold">
              <span className="material-symbols-outlined text-[14px]">history</span> 2026/YTD
            </span>
            <span>100% dipantau</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-container-high">
            <div className="h-full bg-primary" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Kad 2 */}
        <div className="relative overflow-hidden rounded-2xl bg-white/85 backdrop-blur-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-white/80">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs text-on-surface-variant font-semibold">Sedang Diproses</span>
            <span className="p-2 rounded-xl bg-secondary-fixed/50 text-secondary">
              <span className="material-symbols-outlined text-[20px]">sync</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display-lg text-3xl text-on-surface font-bold">{countInAction || 4}</span>
            <span className="font-label-sm text-xs text-secondary font-semibold">33% beban semasa</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-on-surface-variant font-body-sm text-xs pt-2">
            <span>Diterima &amp; Tindakan</span>
            <span className="font-semibold text-primary">3 Dalam SLA</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-container-high">
            <div className="h-full bg-secondary" style={{ width: '33%' }}></div>
          </div>
        </div>

        {/* Kad 3 */}
        <div className="relative overflow-hidden rounded-2xl bg-white/85 backdrop-blur-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-white/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-label-md text-xs text-tertiary font-bold">Perlu Maklumat</span>
              <span className="px-1.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[10px] font-bold">
                Tindakan Anda
              </span>
            </div>
            <span className="p-2 rounded-xl bg-tertiary-fixed/60 text-tertiary animate-bounce">
              <span className="material-symbols-outlined text-[20px]">feedback</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display-lg text-3xl text-tertiary font-bold">{countNeedInfo || 1}</span>
            <span className="font-label-sm text-xs text-error font-semibold">Menunggu Respon</span>
          </div>
          <div className="mt-2 flex items-center justify-between font-body-sm text-xs pt-2">
            <span className="text-tertiary font-medium">Komen Baharu Seksyen Portal</span>
            <span className="text-error font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">timer</span> &lt; 8j baki
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-container-high">
            <div className="h-full bg-tertiary" style={{ width: '75%' }}></div>
          </div>
        </div>

        {/* Kad 4 */}
        <div className="relative overflow-hidden rounded-2xl bg-white/85 backdrop-blur-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-white/80">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs text-on-surface-variant font-semibold">Selesai &amp; Disahkan</span>
            <span className="p-2 rounded-xl bg-surface-container-high text-primary-container">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display-lg text-3xl text-on-surface font-bold">{countDone || 7}</span>
            <span className="font-label-sm text-xs text-primary font-semibold">58% Kejayaan</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-on-surface-variant font-body-sm text-xs pt-2">
            <span>Terkini: Hari Ini</span>
            <span className="font-medium text-primary">Penerbitan Sempurna</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-container-high">
            <div className="h-full bg-primary-container" style={{ width: '58%' }}></div>
          </div>
        </div>
      </div>

      {/* Bar Penapis & Carian Komprehensif */}
      <div className="rounded-2xl bg-white/90 backdrop-blur-xl p-4 shadow-sm space-y-3 border border-white/80">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Carian Kata Kunci */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari No. Rujukan (Cth: SPPKPP/2026/000123), tajuk permohonan atau kata kunci..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-low/70 focus:bg-white text-on-surface placeholder:text-outline-variant font-body-md text-xs transition-colors outline-none border border-slate-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Penapis Kategori */}
            <div className="relative">
              <select
                value={kategoriFilter}
                onChange={(e) => setKategoriFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-surface-container-low/70 hover:bg-surface-container-high text-on-surface font-body-md text-xs cursor-pointer outline-none border border-slate-200"
              >
                <option value="">Semua Kategori</option>
                <option value="DIR">Direktori &amp; Carta Organisasi</option>
                <option value="PGM">Pengumuman &amp; Warta</option>
                <option value="BRT">Kenyataan Media</option>
                <option value="BNR">Banner Portal / Slider</option>
                <option value="DOK">Borang / Penerbitan</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[18px] text-outline">
                arrow_drop_down
              </span>
            </div>

            {/* Penapis Status */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-surface-container-low/70 hover:bg-surface-container-high text-on-surface font-body-md text-xs cursor-pointer outline-none border border-slate-200"
              >
                <option value="">Semua Status</option>
                <option value="draf">Draf Permohonan</option>
                <option value="dihantar">Menunggu Semakan</option>
                <option value="dalam_tindakan">Dalam Tindakan Portal</option>
                <option value="perlu_maklumat">Perlu Maklumat / Respon</option>
                <option value="selesai">Selesai &amp; Diterbitkan</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[18px] text-outline">
                arrow_drop_down
              </span>
            </div>

            {/* Penapis Keutamaan */}
            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-surface-container-low/70 hover:bg-surface-container-high text-on-surface font-body-md text-xs cursor-pointer outline-none border border-slate-200"
              >
                <option value="">Semua Keutamaan</option>
                <option value="biasa">Biasa (5 Hari Bekerja)</option>
                <option value="segera">Segera (48 Jam)</option>
                <option value="kritikal">Kritikal (24 Jam)</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[18px] text-outline">
                arrow_drop_down
              </span>
            </div>

            {/* Reset Filters */}
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setKategoriFilter('');
                setStatusFilter('');
                setPriorityFilter('');
                setQuickFilter('semua');
              }}
              className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              title="Set Semula Penapis"
            >
              <span className="material-symbols-outlined text-[20px]">restart_alt</span>
            </button>
          </div>
        </div>

        {/* Tag Aktif Penapis Cepat */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-body-sm text-xs">
          <span className="font-label-sm text-[11px] text-on-surface-variant uppercase font-bold">Pilihan Pantas:</span>
          <button
            type="button"
            onClick={() => setQuickFilter('semua')}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
              quickFilter === 'semua' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            Semua Jabatan Pejabat SUK
            {quickFilter === 'semua' && <span className="material-symbols-outlined text-[14px]">check</span>}
          </button>
          <button
            type="button"
            onClick={() => setQuickFilter('respon')}
            className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
              quickFilter === 'respon' ? 'bg-tertiary text-white shadow-xs' : 'bg-surface-container-high text-on-surface-variant hover:bg-slate-200'
            }`}
          >
            Perlu Respon Pemohon ({countNeedInfo})
          </button>
          <button
            type="button"
            onClick={() => setQuickFilter('kritikal')}
            className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
              quickFilter === 'kritikal' ? 'bg-error text-white shadow-xs' : 'bg-surface-container-high text-on-surface-variant hover:bg-slate-200'
            }`}
          >
            Kritikal / Segera (2)
          </button>
        </div>
      </div>

      {/* Jadual Data Permohonan Pintar */}
      <div className="rounded-2xl bg-white/95 backdrop-blur-2xl shadow-sm overflow-hidden flex flex-col border border-white/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-surface-container-high/60 text-on-surface-variant font-label-md text-xs border-b border-surface-container-high/70">
                <th className="py-3 px-4 font-semibold">No. Rujukan &amp; Saluran</th>
                <th className="py-3 px-4 font-semibold min-w-[280px]">Tajuk &amp; Kategori</th>
                <th className="py-3 px-4 font-semibold">Tarikh Hantar</th>
                <th className="py-3 px-4 font-semibold">Tahap Keutamaan</th>
                <th className="py-3 px-4 font-semibold min-w-[150px]">Status &amp; Baki SLA</th>
                <th className="py-3 px-4 font-semibold">Pegawai Bertanggungjawab</th>
                <th className="py-3 px-4 font-semibold text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/40 text-on-surface font-body-md">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onOpenWorkspace(item)}
                  className={`hover:bg-surface-container-low/60 transition-colors cursor-pointer ${
                    item.status === 'perlu_maklumat' ? 'bg-tertiary-fixed/10' : ''
                  }`}
                >
                  <td className="py-4 px-4 align-top">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 font-bold text-primary font-mono">
                        <span>{item.no_rujukan}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container text-on-surface-variant w-fit capitalize">
                        <span className="material-symbols-outlined text-[12px]">desktop_windows</span>
                        {item.saluran_penerimaan === 'sistem' ? 'Portal Awam' : item.saluran_penerimaan}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 align-top max-w-xs">
                    <div className="flex flex-col gap-1">
                      <span className="font-title-sm text-xs font-semibold text-on-surface leading-snug line-clamp-2 hover:text-primary transition-colors">
                        {item.tajuk}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-label-sm text-[10px] font-semibold">
                          {item.kategori_kod || 'Kategori'}
                        </span>
                        <span className="font-body-sm text-[11px] text-on-surface-variant">
                          {item.bil_lampiran} Lampiran
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 align-top whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium text-on-surface text-xs">
                        {new Date(item.tarikh_terima).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="font-body-sm text-[11px] text-on-surface-variant">
                        {new Date(item.tarikh_terima).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 align-top whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-[11px] font-bold capitalize ${
                        item.keutamaan === 'kritikal'
                          ? 'bg-error-container text-on-error-container'
                          : item.keutamaan === 'segera'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {item.keutamaan === 'kritikal' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                      )}
                      {item.keutamaan} ({item.keutamaan === 'kritikal' ? '24 Jam' : item.keutamaan === 'segera' ? '48 Jam' : '5 Hari'})
                    </span>
                  </td>
                  <td className="py-4 px-4 align-top">
                    <div className="flex flex-col gap-1.5 min-w-[140px]">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold w-fit capitalize ${
                          item.status === 'selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'perlu_maklumat'
                            ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                            : item.status === 'dalam_tindakan'
                            ? 'bg-secondary-fixed text-on-secondary-fixed'
                            : 'bg-primary-fixed text-on-primary-fixed'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {item.status.replace('_', ' ')}
                      </span>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center font-label-sm text-[10px] text-on-surface-variant">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">alarm</span>
                            {item.sla_baki_teks || 'Aktif'}
                          </span>
                          <span>{item.sla_peratus_tamat || 20}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.status === 'perlu_maklumat' ? 'bg-tertiary' : 'bg-primary'
                            }`}
                            style={{ width: `${item.sla_peratus_tamat || 20}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 align-top whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-container text-white font-bold flex items-center justify-center font-label-sm text-[11px]">
                        {item.pegawai_nama ? item.pegawai_nama.substring(0, 2).toUpperCase() : 'BTM'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-xs font-medium text-on-surface">
                          {item.pegawai_nama || 'Menunggu Agihan'}
                        </span>
                        <span className="font-body-sm text-[10px] text-on-surface-variant">
                          {item.pegawai_nama ? 'Pegawai Portal' : 'Seksyen Portal'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 align-top text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status === 'perlu_maklumat' ? (
                        <button
                          type="button"
                          onClick={() => onOpenWorkspace(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-tertiary text-white hover:opacity-90 font-label-md text-xs font-semibold shadow-xs transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">forum</span>
                          <span>Jawab Komen (1)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenWorkspace(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          <span>Lihat Butiran</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paging & Status Footer */}
        <div className="p-4 bg-surface-container-low/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant border-t border-surface-container-high/60">
          <div className="flex items-center gap-2">
            <span>
              Menunjukkan <strong className="text-on-surface">1 - {filtered.length}</strong> daripada{' '}
              <strong className="text-on-surface">{applications.length}</strong> permohonan keseluruhan
            </span>
            <span className="hidden md:inline-block text-outline-variant">•</span>
            <span className="hidden md:flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-[14px]">bolt</span> Purata masa respons: 3.2 jam
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg bg-primary text-white font-bold flex items-center justify-center shadow-xs">
              1
            </button>
          </div>
        </div>
      </div>

      {/* Banner Makluman SLA & Bantuan Seksyen Portal */}
      <div className="rounded-2xl bg-white/80 backdrop-blur-xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/80">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary-fixed text-primary-container shrink-0">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div className="flex flex-col text-xs">
            <span className="font-title-sm text-sm text-on-surface font-bold">
              Piagam Pelanggan Pengurusan Portal BTM SUK Pahang
            </span>
            <p className="text-on-surface-variant mt-0.5 leading-relaxed">
              Permohonan kemaskini diproses dalam masa <strong>24 jam (Kritikal)</strong>, <strong>48 jam (Segera)</strong>, atau maksimum <strong>5 hari bekerja (Biasa)</strong> selepas dokumen lengkap diterima.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            type="button"
            onClick={() => alert('Panduan Format Bahan:\n- Teks: Dokumen rasmi (Bahasa Melayu DKB)\n- Imej: 1920x1080px (Slider)\n- Dokumen: PDF (Format bersaiz di bawah 10MB)')}
            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            <span>Panduan Format Bahan</span>
          </button>
          <button
            type="button"
            onClick={() => alert('Meja Bantuan BTM SUK Pahang:\nTelefon: ext. 4412 / 1244\nEmel: portal@pahang.gov.my\nLokasi: Seksyen Portal, Aras 3, Wisma Sri Pahang')}
            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-md text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">contact_support</span>
            <span>Hubungi Helpdesk BTM</span>
          </button>
        </div>
      </div>
    </div>
  );
};
