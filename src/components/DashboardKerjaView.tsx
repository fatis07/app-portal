import React, { useState } from 'react';
import { ApplicationItem } from '../lib/api.ts';

interface DashboardKerjaProps {
  applications: ApplicationItem[];
  onNavigate: (path: string) => void;
  onOpenWorkspace: (item: ApplicationItem) => void;
  onRefresh: () => void;
}

export const DashboardKerjaView: React.FC<DashboardKerjaProps> = ({
  applications,
  onNavigate,
  onOpenWorkspace,
  onRefresh,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'hari' | '7hari' | '30hari' | '2026'>('hari');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [sortBy, setSortBy] = useState('SLA Terdekat Dulu');

  const filteredApps = applications.filter((app) => {
    if (statusFilter === 'Semua Status') return true;
    if (statusFilter === 'Dihantar / Baharu') return app.status === 'dihantar';
    if (statusFilter === 'Dalam Semakan') return app.status === 'dalam_semakan';
    if (statusFilter === 'Dalam Tindakan') return app.status === 'dalam_tindakan';
    if (statusFilter === 'Perlu Maklumat') return app.status === 'perlu_maklumat';
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-xs uppercase tracking-wider mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>Portal Rasmi Kerajaan Negeri Pahang • Live Telemetry</span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl text-on-surface tracking-tight font-bold">
            Dashboard Kerja &amp; Status Semasa
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-0.5">
            Seksyen Portal, Bahagian Teknologi Maklumat • Pejabat Setiausaha Kerajaan Negeri Pahang
          </p>
        </div>

        {/* Global Actions & Time-span Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Filter Segment */}
          <div className="inline-flex p-1 rounded-xl bg-surface-container/70 backdrop-blur-md shadow-sm border border-white/60">
            <button
              onClick={() => setFilterPeriod('hari')}
              className={`px-3 py-1.5 rounded-lg font-label-md text-xs transition-all ${
                filterPeriod === 'hari'
                  ? 'bg-white text-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Hari Ini
            </button>
            <button
              onClick={() => setFilterPeriod('7hari')}
              className={`px-3 py-1.5 rounded-lg font-label-md text-xs transition-all ${
                filterPeriod === '7hari'
                  ? 'bg-white text-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              7 Hari
            </button>
            <button
              onClick={() => setFilterPeriod('30hari')}
              className={`px-3 py-1.5 rounded-lg font-label-md text-xs transition-all ${
                filterPeriod === '30hari'
                  ? 'bg-white text-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              30 Hari
            </button>
            <button
              onClick={() => setFilterPeriod('2026')}
              className={`px-3 py-1.5 rounded-lg font-label-md text-xs transition-all ${
                filterPeriod === '2026'
                  ? 'bg-white text-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Tahun 2026
            </button>
          </div>

          {/* Action CTAs */}
          <button
            onClick={() => onNavigate('daftar-saluran-luar')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/90 backdrop-blur-md text-primary font-label-md text-xs font-semibold hover:bg-surface-container-high transition-all shadow-sm border border-slate-100 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">input</span>
            <span>Daftar Saluran Luar</span>
          </button>
          <button
            onClick={() => onNavigate('permohonan-baharu')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container text-white font-label-md text-xs font-semibold hover:bg-primary transition-all shadow-md hover:shadow-lg cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Permohonan Baharu</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Permohonan Baharu */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white/85 backdrop-blur-xl shadow-[0_8px_24px_-4px_rgba(11,37,69,0.06)] border border-white/80 flex flex-col justify-between group hover:-translate-y-0.5 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-fixed/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider block font-semibold">
                Permohonan Baharu
              </span>
              <span className="font-body-sm text-xs text-on-surface-variant/80">Belum Disahkan Penerimaan</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary border border-surface-container-high/50">
              <span className="material-symbols-outlined text-[22px]">inbox</span>
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display-lg text-3xl font-bold text-on-surface tracking-tight">14</span>
              <span className="font-body-sm text-xs text-on-surface-variant">rekod</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +4 hari ini
            </span>
          </div>
          <div className="mt-3 pt-2 bg-surface-container/50 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
            <span className="font-label-sm text-xs text-primary font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Perlu Tindakan Segera
            </span>
            <span className="font-body-sm text-xs text-on-surface-variant">Queue #1-14</span>
          </div>
        </div>

        {/* KPI 2: Tugasan Saya */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white/85 backdrop-blur-xl shadow-[0_8px_24px_-4px_rgba(11,37,69,0.06)] border border-white/80 flex flex-col justify-between group hover:-translate-y-0.5 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary-fixed/30 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider block font-semibold">
                Tugasan Saya
              </span>
              <span className="font-body-sm text-xs text-on-surface-variant/80">Sedang Diproses (Faiz Azmi)</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary border border-surface-container-high/50">
              <span className="material-symbols-outlined text-[22px]">pending_actions</span>
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display-lg text-3xl font-bold text-on-surface tracking-tight">8</span>
              <span className="font-body-sm text-xs text-on-surface-variant">tugasan</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">timer</span>
              3 Hampir Tamat
            </span>
          </div>
          <div className="mt-3 pt-2 bg-surface-container/50 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
            <span className="font-label-sm text-xs text-secondary font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              Status: Aktif &amp; Terancang
            </span>
            <span className="font-body-sm text-xs text-on-surface-variant">2 Menunggu Bahan</span>
          </div>
        </div>

        {/* KPI 3: Menghampiri / Lewat SLA */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white/85 backdrop-blur-xl shadow-[0_8px_24px_-4px_rgba(11,37,69,0.06)] border border-white/80 flex flex-col justify-between group hover:-translate-y-0.5 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-error-container/40 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-xs text-error uppercase tracking-wider block font-bold">
                Kritikal / Melebihi SLA
              </span>
              <span className="font-body-sm text-xs text-on-surface-variant/80">Risiko Pelanggaran Piagam</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-error-container/40 flex items-center justify-center text-error border border-error-container">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display-lg text-3xl font-bold text-error tracking-tight">2</span>
              <span className="font-body-sm text-xs text-error/80 font-medium">kes dikesan</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-xs font-semibold">
              Amaran Eskalasi BTM
            </span>
          </div>
          <div className="mt-3 pt-2 bg-error-container/20 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
            <span className="font-label-sm text-xs text-error font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
              Tindakan Pembetulan Segera
            </span>
            <span className="font-body-sm text-xs text-error font-mono">&gt; 48 Jam Draf</span>
          </div>
        </div>

        {/* KPI 4: Selesai Bulan Ini & Pematuhan SLA */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white/85 backdrop-blur-xl shadow-[0_8px_24px_-4px_rgba(11,37,69,0.06)] border border-white/80 flex flex-col justify-between group hover:-translate-y-0.5 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-surface-container-high/60 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider block font-semibold">
                Prestasi Selesai (Bulan Ini)
              </span>
              <span className="font-body-sm text-xs text-on-surface-variant/80">Kadar Pematuhan Piagam Pelanggan</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary-container border border-surface-container-high/50">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-display-lg text-3xl font-bold text-on-surface tracking-tight">94.2%</span>
              <span className="font-body-sm text-xs text-on-surface-variant">(142 kes)</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">check</span>
              Sasaran ≥90%
            </span>
          </div>
          <div className="mt-3 pt-2 bg-surface-container/50 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
            <span className="font-label-sm text-xs text-on-surface-variant flex items-center gap-1">
              Purata Masa Siap: <strong className="text-on-surface">1.4 hari</strong>
            </span>
            <span className="font-body-sm text-xs text-primary font-semibold">Tercapai</span>
          </div>
        </div>
      </div>

      {/* Analytical & Distribution Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Insight: SLA Health Overview & Intake Trend (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white/85 backdrop-blur-xl shadow-[0_8px_24px_-4px_rgba(11,37,69,0.06)] border border-white/80 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary border border-surface-container">
                <span className="material-symbols-outlined text-[20px]">speed</span>
              </div>
              <div>
                <h2 className="font-title-sm text-sm text-on-surface font-bold">Kesihatan SLA &amp; Trend Bebanan Kerja</h2>
                <p className="font-body-sm text-xs text-on-surface-variant">Pematuhan mengikut kategori tahap keutamaan permohonan</p>
              </div>
            </div>
            <span className="font-label-sm text-xs px-2.5 py-1 rounded bg-surface-container text-on-surface-variant font-medium">
              Minggu ke-16 (2026)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-3">
            {/* Biasa */}
            <div className="p-3 rounded-xl bg-surface-container/50 border border-surface-container-high/40">
              <div className="flex justify-between items-center mb-1">
                <span className="font-label-sm text-xs text-on-surface-variant">Biasa (≤ 5 Hari)</span>
                <span className="font-label-sm text-xs text-primary font-bold">98%</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '98%' }}></div>
              </div>
              <span className="font-body-sm text-[11px] text-on-surface-variant mt-1.5 block">89 daripada 91 selesai</span>
            </div>

            {/* Segera */}
            <div className="p-3 rounded-xl bg-surface-container/50 border border-surface-container-high/40">
              <div className="flex justify-between items-center mb-1">
                <span className="font-label-sm text-xs text-on-surface-variant">Segera (≤ 2 Hari)</span>
                <span className="font-label-sm text-xs text-tertiary font-bold">92%</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-tertiary h-full rounded-full" style={{ width: '92%' }}></div>
              </div>
              <span className="font-body-sm text-[11px] text-on-surface-variant mt-1.5 block">36 daripada 39 selesai</span>
            </div>

            {/* Kritikal */}
            <div className="p-3 rounded-xl bg-surface-container/50 border border-surface-container-high/40">
              <div className="flex justify-between items-center mb-1">
                <span className="font-label-sm text-xs text-on-surface-variant">Kritikal (≤ 24 Jam)</span>
                <span className="font-label-sm text-xs text-error font-bold">85%</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-error h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
              <span className="font-body-sm text-[11px] text-on-surface-variant mt-1.5 block">11 daripada 13 selesai</span>
            </div>
          </div>

          {/* Compact SVG Intake Sparkline/Bar Visual */}
          <div className="pt-2 bg-surface-container/30 rounded-xl p-3 border border-surface-container/40">
            <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-xs mb-2">
              <span>Kadar Permohonan Diterima vs Diselesaikan (7 Hari Terakhir)</span>
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary-container"></span> Masuk</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-secondary"></span> Selesai</span>
              </span>
            </div>
            <div className="h-16 w-full flex items-end justify-between gap-2 px-2">
              {[
                { day: 'Isn', inH: '60%', outH: '50%' },
                { day: 'Sel', inH: '75%', outH: '70%' },
                { day: 'Rab', inH: '90%', outH: '85%' },
                { day: 'Kha', inH: '65%', outH: '60%' },
                { day: 'Jum', inH: '80%', outH: '75%' },
                { day: 'Sab', inH: '30%', outH: '30%' },
                { day: 'Ahd', inH: '20%', outH: '20%' },
              ].map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center gap-1 h-12">
                    <div className="w-2.5 bg-primary-container rounded-t" style={{ height: item.inH }}></div>
                    <div className="w-2.5 bg-secondary rounded-t" style={{ height: item.outH }}></div>
                  </div>
                  <span className="font-label-sm text-[0.625rem] text-on-surface-variant">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Insight: Saluran Penerimaan Breakdown (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white/85 backdrop-blur-xl shadow-[0_8px_24px_-4px_rgba(11,37,69,0.06)] border border-white/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary border border-surface-container">
                  <span className="material-symbols-outlined text-[20px]">hub</span>
                </div>
                <div>
                  <h2 className="font-title-sm text-sm text-on-surface font-bold">Saluran Penerimaan BTM</h2>
                  <p className="font-body-sm text-xs text-on-surface-variant">Pecahan mod permohonan terkini</p>
                </div>
              </div>
              <span className="font-label-sm text-xs text-primary font-bold">142 Jumlah</span>
            </div>

            <div className="space-y-2 mt-2">
              {/* Mod 1 */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">desktop_windows</span>
                  </span>
                  <div>
                    <span className="font-label-md text-xs text-on-surface block font-semibold leading-tight">
                      Portal SPPKPP (Dalam Talian)
                    </span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">
                      Automatik verifikasi identiti MyGovUC
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-title-sm text-sm text-on-surface font-bold">65%</span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant block">92 rekod</span>
                </div>
              </div>

              {/* Mod 2 */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">description</span>
                  </span>
                  <div>
                    <span className="font-label-md text-xs text-on-surface block font-semibold leading-tight">
                      Surat Rasmi / Memo SUK
                    </span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">
                      Didaftar melalui kaunter BTM
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-title-sm text-sm text-on-surface font-bold">18%</span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant block">26 rekod</span>
                </div>
              </div>

              {/* Mod 3 */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                  </span>
                  <div>
                    <span className="font-label-md text-xs text-on-surface block font-semibold leading-tight">
                      E-mel BTM Portal
                    </span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">
                      portal@pahang.gov.my
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-title-sm text-sm text-on-surface font-bold">12%</span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant block">17 rekod</span>
                </div>
              </div>

              {/* Mod 4 */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                  </span>
                  <div>
                    <span className="font-label-md text-xs text-on-surface block font-semibold leading-tight">
                      WhatsApp / Arahan Pantas
                    </span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">
                      Kenyataan tergempar pimpinan
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-title-sm text-sm text-on-surface font-bold">5%</span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant block">7 rekod</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 flex items-center justify-between text-on-surface-variant font-label-sm text-xs">
            <span className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-[16px]">sync_alt</span>
              Penyelarasan auto-arkib aktif
            </span>
            <button
              onClick={() => onNavigate('jejak-audit')}
              className="text-primary hover:underline font-semibold cursor-pointer"
              type="button"
            >
              Lihat Audit Saluran →
            </button>
          </div>
        </div>
      </div>

      {/* Operational Work Queue: Data Table Section */}
      <div className="rounded-2xl bg-white/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(11,37,69,0.06)] border border-white/80 overflow-hidden">
        {/* Table Header Toolbar */}
        <div className="p-4 bg-white/80 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-surface-container-high">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">assignment</span>
            </div>
            <div>
              <h2 className="font-title-sm text-sm text-on-surface font-bold">Senarai Kerja Aktif &amp; Tindakan Segera</h2>
              <span className="font-body-sm text-xs text-on-surface-variant">
                Memaparkan {filteredApps.length} permohonan berstatus keutamaan tinggi untuk perhatian pegawai
              </span>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[18px] text-outline pointer-events-none">
                filter_list
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-8 pr-7 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-xs focus:outline-none focus:bg-white cursor-pointer border border-slate-200"
              >
                <option>Semua Status</option>
                <option>Dihantar / Baharu</option>
                <option>Dalam Semakan</option>
                <option>Dalam Tindakan</option>
                <option>Perlu Maklumat</option>
              </select>
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[18px] text-outline pointer-events-none">
                sort
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-8 pr-7 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-xs focus:outline-none focus:bg-white cursor-pointer border border-slate-200"
              >
                <option>SLA Terdekat Dulu</option>
                <option>Keutamaan Tertinggi</option>
                <option>Tarikh Diterima (Terkini)</option>
              </select>
            </div>

            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors"
              title="Muat Semula Queue"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-md text-sm border-collapse">
            <thead>
              <tr className="bg-surface-container/70 text-on-surface-variant font-label-md text-xs tracking-wider border-b border-surface-container-high/60">
                <th className="py-3 px-4">No. Rujukan</th>
                <th className="py-3 px-4 min-w-[240px]">Tajuk &amp; Kategori</th>
                <th className="py-3 px-4">Agensi / Bahagian</th>
                <th className="py-3 px-4">Saluran</th>
                <th className="py-3 px-4">Keutamaan</th>
                <th className="py-3 px-4">Status Terkini</th>
                <th className="py-3 px-4 min-w-[190px]">SLA &amp; Baki Masa</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/50 text-on-surface">
              {filteredApps.slice(0, 5).map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-surface-container-low/70 transition-colors bg-white/40 cursor-pointer"
                  onClick={() => onOpenWorkspace(app)}
                >
                  <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                    <span className="font-label-md text-xs font-bold text-primary">{app.no_rujukan}</span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant block">
                      {new Date(app.tarikh_terima).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short' })},{' '}
                      {new Date(app.tarikh_terima).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 align-middle">
                    <div className="font-title-sm text-xs font-semibold text-on-surface leading-tight hover:text-primary transition-colors">
                      {app.tajuk}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 font-label-sm text-[10px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                        <span className="material-symbols-outlined text-[13px]">article</span>
                        {app.kategori_kod || 'Kategori'}
                      </span>
                      <span className="font-body-sm text-[11px] text-on-surface-variant">
                        {app.bil_lampiran} Lampiran
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                    <span className="font-label-md text-xs text-on-surface block font-semibold">{app.org_nama}</span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">{app.pemohon_snapshot?.nama}</span>
                  </td>
                  <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-[11px] text-on-surface capitalize">
                      <span className="material-symbols-outlined text-[14px] text-primary">
                        {app.saluran_penerimaan === 'surat'
                          ? 'description'
                          : app.saluran_penerimaan === 'emel'
                          ? 'mail'
                          : app.saluran_penerimaan === 'whatsapp'
                          ? 'chat'
                          : 'desktop_windows'}
                      </span>
                      {app.saluran_penerimaan}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold capitalize ${
                        app.keutamaan === 'kritikal'
                          ? 'bg-error-container text-on-error-container'
                          : app.keutamaan === 'segera'
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {app.keutamaan === 'kritikal' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
                      )}
                      {app.keutamaan}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-[11px] font-semibold capitalize ${
                        app.status === 'selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'dalam_tindakan'
                          ? 'bg-secondary-container/60 text-secondary'
                          : app.status === 'perlu_maklumat'
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                          : 'bg-surface-container-high text-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {app.status === 'selesai'
                          ? 'check_circle'
                          : app.status === 'dalam_tindakan'
                          ? 'published_with_changes'
                          : app.status === 'perlu_maklumat'
                          ? 'help_outline'
                          : 'rate_review'}
                      </span>
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 align-middle">
                    <div className="space-y-1">
                      <div
                        className={`flex justify-between items-center font-label-sm text-xs font-bold ${
                          app.keutamaan === 'kritikal'
                            ? 'text-error'
                            : app.keutamaan === 'segera'
                            ? 'text-tertiary'
                            : 'text-primary'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">alarm</span>
                          {app.sla_baki_teks || 'Aktif'}
                        </span>
                        <span>{app.sla_peratus_tamat || 40}%</span>
                      </div>
                      <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            app.keutamaan === 'kritikal'
                              ? 'bg-error'
                              : app.keutamaan === 'segera'
                              ? 'bg-tertiary-container'
                              : 'bg-primary'
                          }`}
                          style={{ width: `${app.sla_peratus_tamat || 40}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenWorkspace(app)}
                        className="px-3 py-1.5 rounded bg-primary-container text-white font-label-sm text-xs hover:bg-primary transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                        type="button"
                      >
                        <span>Proses</span>
                        <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-white/80 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-surface-container-high text-xs text-on-surface-variant">
          <div className="flex items-center gap-3">
            <span>Menunjukkan <strong>1 - {Math.min(5, filteredApps.length)}</strong> daripada <strong>{filteredApps.length}</strong> permohonan aktif</span>
            <div className="hidden md:flex items-center gap-1.5 text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              <span>Kemas kini langsung setiap 30 saat</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('queue-permohonan')}
            className="text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Semua Antrian Queue</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Bottom Real-time Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Activity Stream (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white/85 backdrop-blur-xl shadow-[0_8px_24px_-4px_rgba(11,37,69,0.06)] border border-white/80">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">notifications_active</span>
              </div>
              <div>
                <h3 className="font-title-sm text-sm text-on-surface font-bold">Jejak Aktiviti &amp; Notifikasi Automatik</h3>
                <p className="font-body-sm text-xs text-on-surface-variant">Log sistem masa nyata mengikut PRD Seksyen 24 &amp; 29</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('jejak-audit')}
              className="font-label-sm text-xs text-primary hover:underline font-semibold cursor-pointer"
              type="button"
            >
              Jejak Audit Penuh →
            </button>
          </div>

          <div className="space-y-2 mt-1">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low/50">
              <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">mark_email_read</span>
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-on-surface truncate">Notifikasi Automatik Dihantar kepada Pemohon</span>
                  <span className="text-on-surface-variant whitespace-nowrap ml-2">2 minit lepas</span>
                </div>
                <p className="text-on-surface-variant mt-0.5 leading-relaxed">
                  Status permohonan <strong className="text-on-surface font-medium">SPPKPP/2026/000135</strong> telah dimuat naik dan diterbitkan secara langsung di portal rasmi. Notifikasi e-mel MyGovUC dihantar ke pemohon.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low/50">
              <div className="w-7 h-7 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-on-surface truncate">Pindaan Maklumat Diminta</span>
                  <span className="text-on-surface-variant whitespace-nowrap ml-2">18 minit lepas</span>
                </div>
                <p className="text-on-surface-variant mt-0.5 leading-relaxed">
                  Pegawai Penilai (En. Rahim BTM) telah menukar status <strong className="text-on-surface font-medium">SPPKPP/2026/000139</strong> kepada <em>Perlu Maklumat Tambahan</em> berikutan resolusi gambar rasmi tidak mematuhi piawaian web.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low/50">
              <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-secondary shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">person_add</span>
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-on-surface truncate">Agihan Tugas Baharu Diserahkan</span>
                  <span className="text-on-surface-variant whitespace-nowrap ml-2">1 jam lepas</span>
                </div>
                <p className="text-on-surface-variant mt-0.5 leading-relaxed">
                  Ketua Seksyen Portal telah memperuntukkan tiket <strong className="text-on-surface font-medium">SPPKPP/2026/000141</strong> kepada Ts. Mohd Faiz untuk tindakan muat naik tender segera.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Petugas Seksyen Portal & Quick Contacts (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white/85 backdrop-blur-xl shadow-[0_8px_24px_-4px_rgba(11,37,69,0.06)] border border-white/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">badge</span>
                </div>
                <div>
                  <h3 className="font-title-sm text-sm text-on-surface font-bold">Petugas Portal Bertugas</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">Sesi Kerja Hari Ini (Giliran BTM)</p>
                </div>
              </div>
              <span className="font-label-sm text-xs px-2 py-0.5 rounded bg-primary-fixed text-primary font-bold">
                3 Aktif
              </span>
            </div>

            <div className="space-y-2 mt-1">
              {/* Faiz */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low/60 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnKOSlKs8Jr7lao_uucyY5HGy91obzupKrUxHNOLATttpc5TzhQ3PoH0a6hqU4d_GnuFrBM0yY-Pxv3mr7spjSVw8BZs74RCVnAjWWSwZL-Rg0d64quhuV9hz3NpGbzbskCMXBOx0ERv4HbJfi5hxecrdC6WN1Zr6yTN8zXpgwM25Wp776AtbWal-xvDvUULD4uyyANHbt6qkT_pWrupcJtZRw6YHR-JQ3zUMUpH_EVxFFwxn6Db1q8A"
                      alt="Ts Mohd Faiz"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-white"></span>
                  </div>
                  <div>
                    <span className="font-label-md text-xs text-on-surface block font-semibold">Ts. Mohd Faiz (Anda)</span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">Pegawai Portal • 8 Tugasan</span>
                  </div>
                </div>
                <span className="font-label-sm text-[11px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                  Bertugas
                </span>
              </div>

              {/* Rahim */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low/60 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-secondary-container text-secondary flex items-center justify-center font-bold text-xs">
                      AR
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-white"></span>
                  </div>
                  <div>
                    <span className="font-label-md text-xs text-on-surface block font-semibold">En. Abdul Rahim</span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">Penolong Pegawai • 6 Tugasan</span>
                  </div>
                </div>
                <span className="font-label-sm text-[11px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                  Bertugas
                </span>
              </div>

              {/* Syuhada */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low/60 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center font-bold text-xs">
                      NS
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-tertiary ring-2 ring-white"></span>
                  </div>
                  <div>
                    <span className="font-label-md text-xs text-on-surface block font-semibold">Pn. Nurul Syuhada</span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">Pereka Grafik Web • 4 Tugasan</span>
                  </div>
                </div>
                <span className="font-label-sm text-[11px] px-2 py-0.5 rounded bg-tertiary-fixed/60 text-on-tertiary-fixed-variant font-medium">
                  Sibuk
                </span>
              </div>
            </div>
          </div>

          {/* Quick Emergency Hotline */}
          <div className="mt-3 p-3 rounded-xl bg-surface-container flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-tertiary">support_agent</span>
              <span className="font-label-sm text-on-surface font-semibold">Meja Bantuan ICT: Ext. 4412</span>
            </div>
            <span className="font-label-sm text-primary font-bold">BTM Aras 3</span>
          </div>
        </div>
      </div>
    </div>
  );
};
