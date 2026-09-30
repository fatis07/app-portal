import React from 'react';
import { User } from '../lib/api.ts';

interface SidebarProps {
  currentPath: string;
  currentUser: User | null;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, currentUser, onNavigate, onLogout }) => {
  // Hanya Pegawai Portal dan Pentadbir Sistem BTM dibenarkan melihat menu Pengurusan Portal, Analisis & Audit, dan Pentadbiran
  const isPegawaiPortalOrAdmin =
    currentUser?.peranan === 'pegawai_portal' ||
    currentUser?.peranan === 'pentadbir_sistem';

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white/85 backdrop-blur-xl z-50 flex flex-col justify-between shadow-[0_8px_32px_rgba(15,61,94,0.06)] border-r border-white/60">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Emblem */}
        <div className="h-20 px-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shadow-sm border border-primary/20">
            <span className="material-symbols-outlined text-primary text-[24px]">account_balance</span>
          </div>
          <div className="flex flex-col">
            <span className="font-title-sm text-primary font-bold tracking-tight leading-tight">SPPKPP</span>
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">BTM SUK PAHANG</span>
          </div>
        </div>

        {/* System Operational Badge */}
        <div className="px-4 py-2">
          <div className="p-2.5 rounded-lg bg-surface-container/60 backdrop-blur-md flex items-center justify-between border border-surface-container-high/60">
            <span className="font-label-sm text-on-surface-variant flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Sistem Beroperasi
            </span>
            <span className="font-label-sm text-primary font-bold px-1.5 py-0.5 rounded bg-primary-fixed/60 text-[11px]">
              v1.0
            </span>
          </div>
        </div>

        {/* Main Navigation Links */}
        <nav className="flex-1 px-3 space-y-4 mt-2">
          {/* Section: Utama */}
          <div className="space-y-1">
            <div className="px-3 py-1 font-label-sm text-on-surface-variant tracking-wider uppercase font-semibold text-[10px]">
              Utama
            </div>
            <button
              onClick={() => onNavigate('dashboard-kerja')}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-all gap-3 text-left ${
                currentPath === 'dashboard-kerja'
                  ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                  : 'font-body-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span>Dashboard Kerja</span>
            </button>
            <button
              onClick={() => onNavigate('permohonan-saya')}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-all gap-3 text-left ${
                currentPath === 'permohonan-saya'
                  ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                  : 'font-body-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
              <span>Permohonan Saya</span>
            </button>
            <button
              onClick={() => onNavigate('permohonan-baharu')}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-all gap-3 text-left ${
                currentPath === 'permohonan-baharu'
                  ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                  : 'font-body-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">add_task</span>
              <span>Permohonan Baharu</span>
            </button>
          </div>

          {/* Section: Pengurusan Portal (Hanya untuk Pegawai Portal & Pentadbir Sistem) */}
          {isPegawaiPortalOrAdmin && (
            <div className="space-y-1 animate-in fade-in duration-200">
              <div className="px-3 py-1 font-label-sm text-on-surface-variant tracking-wider uppercase font-semibold text-[10px] flex items-center justify-between">
                <span>Pengurusan Portal</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-mono font-bold">BTM</span>
              </div>
              <button
                onClick={() => onNavigate('queue-permohonan')}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-all gap-3 text-left ${
                  currentPath === 'queue-permohonan'
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'font-body-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
                <span>Queue Permohonan</span>
              </button>
              <button
                onClick={() => onNavigate('daftar-saluran-luar')}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-all gap-3 text-left ${
                  currentPath === 'daftar-saluran-luar'
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'font-body-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">input</span>
                <span>Daftar Saluran Luar</span>
              </button>
              <button
                onClick={() => onNavigate('agihan-tugas')}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-all gap-3 text-left ${
                  currentPath === 'agihan-tugas'
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'font-body-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">supervised_user_circle</span>
                <span>Agihan Tugas</span>
              </button>
            </div>
          )}

          {/* Section: Analisis & Audit (Hanya untuk Pegawai Portal & Pentadbir Sistem) */}
          {isPegawaiPortalOrAdmin && (
            <div className="space-y-1 animate-in fade-in duration-200">
              <div className="px-3 py-1 font-label-sm text-on-surface-variant tracking-wider uppercase font-semibold text-[10px] flex items-center justify-between">
                <span>Analisis &amp; Audit</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-mono font-bold">BTM</span>
              </div>
              <button
                onClick={() => onNavigate('laporan-dan-sla')}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-all gap-3 text-left ${
                  currentPath === 'laporan-dan-sla'
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'font-body-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">monitoring</span>
                <span>Laporan &amp; SLA</span>
              </button>
              <button
                onClick={() => onNavigate('jejak-audit')}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-all gap-3 text-left ${
                  currentPath === 'jejak-audit'
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'font-body-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">history_edu</span>
                <span>Jejak Audit</span>
              </button>
            </div>
          )}

          {/* Section: Pentadbiran (Hanya untuk Pegawai Portal & Pentadbir Sistem) */}
          {isPegawaiPortalOrAdmin && (
            <div className="space-y-1 animate-in fade-in duration-200">
              <div className="px-3 py-1 font-label-sm text-on-surface-variant tracking-wider uppercase font-semibold text-[10px] flex items-center justify-between">
                <span>Pentadbiran</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-mono font-bold">BTM</span>
              </div>
              <button
                onClick={() => onNavigate('konfigurasi-sistem')}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-all gap-3 text-left ${
                  currentPath === 'konfigurasi-sistem'
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'font-body-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
                <span>Konfigurasi Sistem</span>
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* Footer Badge */}
      <div className="p-4">
        <div className="p-3 rounded-xl bg-surface-container-low/80 flex items-center justify-between gap-2 border border-surface-container-high/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-tertiary">shield_lock</span>
            <span className="font-label-sm text-on-surface font-semibold text-xs">SUK PAHANG INTRANET</span>
          </div>
          <span className="font-label-sm text-on-surface-variant text-xs">v1.0</span>
        </div>
      </div>
    </aside>
  );
};
