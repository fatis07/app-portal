import React, { useState } from 'react';
import { ApplicationItem } from '../lib/api.ts';

interface LaporanStatistikProps {
  applications: ApplicationItem[];
}

export const LaporanStatistikView: React.FC<LaporanStatistikProps> = ({ applications }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('bulan');

  // KPI Calculations
  const totalApps = applications.length;
  const completedApps = applications.filter((a) => a.status === 'selesai' || a.status === 'ditutup').length;
  const overdueApps = applications.filter((a) => a.lewat).length;
  const inProgressApps = applications.filter((a) => a.status === 'dalam_tindakan' || a.status === 'menunggu_semakan').length;
  const slaComplianceRate = totalApps > 0 ? (((totalApps - overdueApps) / totalApps) * 100).toFixed(1) : '96.4';

  // Category counts
  const categoryStats = [
    { name: 'Berita, Pengumuman & Kenyataan Media', count: 18, color: 'bg-primary', pct: '38%' },
    { name: 'Direktori Kakitangan & Carta Organisasi', count: 12, color: 'bg-secondary', pct: '25%' },
    { name: 'Iklan Tender & Sebut Harga Kerajaan', count: 8, color: 'bg-tertiary', pct: '17%' },
    { name: 'Warta, Enakmen & Pekeliling Rasmi', count: 6, color: 'bg-amber-600', pct: '13%' },
    { name: 'Borang & Dokumen Muat Turun', count: 4, color: 'bg-emerald-600', pct: '7%' },
  ];

  // Officer Performance
  const officerStats = [
    { name: 'Ts. Mohd Faiz bin Azmi', role: 'Pegawai TM F44', completed: 28, overdue: 0, compliance: '100%', avgTime: '1.4 Hari' },
    { name: 'Pn. Siti Nurhaliza binti Ramli', role: 'Penolong Pegawai TM FA32', completed: 22, overdue: 1, compliance: '95.5%', avgTime: '1.8 Hari' },
    { name: 'En. Ahmad Zulkifli bin Hashim', role: 'Penolong Pegawai TM FA29', completed: 19, overdue: 0, compliance: '100%', avgTime: '1.6 Hari' },
    { name: 'Cik Farah Diana binti Kamaruddin', role: 'Juruteknik Komputer FT19', completed: 15, overdue: 0, compliance: '100%', avgTime: '1.1 Hari' },
  ];

  // Organization volume
  const agencyStats = [
    { name: 'Pejabat YAB Menteri Besar Pahang', count: 14, sla: '100%' },
    { name: 'Bahagian Pengurusan Sumber Manusia (BPSM)', count: 12, sla: '98%' },
    { name: 'Bahagian Korporat & Komunikasi SUK', count: 10, sla: '95%' },
    { name: 'Jabatan Kerja Raya (JKR) Negeri Pahang', count: 7, sla: '100%' },
    { name: 'Pejabat Tanah dan Galian (PTG) Pahang', count: 6, sla: '92%' },
  ];

  const handleExportCSV = () => {
    const headers = ['No Rujukan', 'Tajuk', 'Agensi', 'Kategori', 'Keutamaan', 'Status', 'SLA Patuh'];
    const rows = applications.map(a => [
      a.no_rujukan,
      `"${a.tajuk.replace(/"/g, '""')}"`,
      `"${a.org_nama.replace(/"/g, '""')}"`,
      a.kategori_nama,
      a.keutamaan,
      a.status,
      a.lewat ? 'TIDAK' : 'YA'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LAPORAN-PRESTASI-SPPKPP-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-fixed/60 text-primary border border-primary/20">
              Analitik &amp; Pelaporan Eksekutif
            </span>
            <span className="text-xs text-on-surface-variant font-medium">BTM SUK Negeri Pahang</span>
          </div>
          <h1 className="font-title-lg text-on-surface font-bold text-2xl tracking-tight">
            Laporan Prestasi &amp; Pematuhan Piagam Pelanggan
          </h1>
          <p className="font-body-md text-on-surface-variant text-sm mt-0.5">
            Analisis metrik keberkesanan perkhidmatan portal rasmi, kepatuhan had masa SLA, dan taburan kategori kemaskini.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-surface-container p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'bulan', label: 'Bulan Ini' },
              { id: 'suku', label: 'Suku Tahunan' },
              { id: 'tahun', label: 'Tahun 2026' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedPeriod === p.id
                    ? 'bg-white text-primary shadow-xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs flex items-center gap-1.5 border border-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Eksport CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/90 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Cetak Penyata</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Kadar Pematuhan SLA
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-on-surface font-mono">{slaComplianceRate}%</div>
            <div className="text-xs text-emerald-700 flex items-center gap-1 mt-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>Sasaran Piagam &ge; 95% (Tercapai)</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Purata Masa Penyelesaian
            </span>
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">avg_time</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-on-surface font-mono">1.8 Hari</div>
            <div className="text-xs text-on-surface-variant mt-1">
              Had maksimum piagam: 3.0 Hari
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Jumlah Selesai
            </span>
            <span className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-on-surface font-mono">{completedApps} / {totalApps}</div>
            <div className="text-xs text-on-surface-variant mt-1">
              {inProgressApps} tiket sedang aktif diambil tindakan
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Tiket Melebihi SLA
            </span>
            <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-rose-700 font-mono">{overdueApps}</div>
            <div className="text-xs text-on-surface-variant mt-1">
              Tindakan segera diperlukan untuk audit
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2 Columns: Category Breakdown & Department Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-title-sm text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">pie_chart</span>
              Taburan Mengikut Kategori Kemaskini
            </h2>
            <span className="text-xs text-on-surface-variant">48 Keseluruhan</span>
          </div>

          <div className="space-y-3 pt-2">
            {categoryStats.map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-on-surface">
                  <span className="truncate pr-2">{cat.name}</span>
                  <span className="font-mono font-bold">{cat.count} ({cat.pct})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                  <div className={`h-full rounded-full ${cat.color}`} style={{ width: cat.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Volume */}
        <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-title-sm text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">corporate_fare</span>
              Agensi / Jabatan Paling Aktif
            </h2>
            <span className="text-xs text-on-surface-variant">Pematuhan SLA</span>
          </div>

          <div className="space-y-3 pt-2">
            {agencyStats.map((agency, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high flex items-center justify-between gap-3 text-xs"
              >
                <div className="truncate">
                  <div className="font-bold text-on-surface truncate">{agency.name}</div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5">{agency.count} permohonan diproses</div>
                </div>
                <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px]">
                  {agency.sla}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Officer Productivity Table */}
      <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-surface-container-high/60 flex items-center justify-between">
          <div>
            <h2 className="font-title-sm text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">engineering</span>
              Prestasi Pegawai Seksyen Portal BTM
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Rekod throughput penyelesaian tiket dan purata masa kerja bagi setiap pegawai.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant uppercase font-semibold border-b border-surface-container-high">
              <tr>
                <th className="px-6 py-3.5">Nama Pegawai &amp; Jawatan</th>
                <th className="px-6 py-3.5">Tiket Selesai</th>
                <th className="px-6 py-3.5">Melebihi SLA</th>
                <th className="px-6 py-3.5">Kadar Pematuhan</th>
                <th className="px-6 py-3.5">Purata Masa Tindakan</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/60">
              {officerStats.map((off, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/40">
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm text-on-surface">{off.name}</div>
                    <div className="text-[11px] text-on-surface-variant">{off.role}</div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-sm text-primary">
                    {off.completed}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-sm">
                    {off.overdue > 0 ? (
                      <span className="text-rose-600">{off.overdue}</span>
                    ) : (
                      <span className="text-emerald-700">0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-sm text-emerald-700">
                    {off.compliance}
                  </td>
                  <td className="px-6 py-4 font-mono text-on-surface">
                    {off.avgTime}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Cemerlang
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
