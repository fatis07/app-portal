import React, { useState } from 'react';
import { User, NotificationItem } from '../lib/api.ts';

interface HeaderProps {
  currentUser: User | null;
  notifications: NotificationItem[];
  onSearch: (query: string) => void;
  onLogout: () => void;
  onSwitchUser: (userId: string) => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  notifications,
  onSearch,
  onLogout,
  onSwitchUser,
  onOpenNotifications,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.dibaca).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const demoAccounts = [
    { id: 'usr-faiz', name: 'Ts. Mohd Faiz (Pegawai Portal Kanan)', role: 'pegawai_portal' },
    { id: 'usr-rahim', name: 'En. Abdul Rahim (Penolong Pegawai IT)', role: 'pegawai_portal' },
    { id: 'usr-syuhada', name: 'Pn. Nurul Syuhada (Pereka Grafik & Web)', role: 'pegawai_portal' },
    { id: 'usr-salmiah', name: 'Pn. Siti Salmiah (Ketua Pasukan Portal)', role: 'ketua_seksyen' },
    { id: 'usr-salmah', name: 'Puan Salmah (Pemohon - BKP SUK)', role: 'pemohon' },
    { id: 'usr-sitinurhaliza', name: 'Puan Siti Nurhaliza (Pemohon - BPEN)', role: 'pemohon' },
    { id: 'usr-zainal', name: 'Tuan Zainal (Ketua BTM - Pengurusan)', role: 'pengurusan' },
    { id: 'usr-audit', name: 'Juruaudit Kanan ICT Negeri', role: 'juruaudit' },
    { id: 'usr-admin', name: 'Pentadbir Sistem BTM SUK', role: 'pentadbir_sistem' },
  ];

  return (
    <header className="fixed top-0 left-72 right-0 h-20 bg-white/85 backdrop-blur-xl z-40 px-6 flex items-center justify-between shadow-[0_4px_20px_-2px_rgba(11,37,69,0.04)] border-b border-white/60">
      {/* Global Search Bar */}
      <div className="flex-1 max-w-xl mr-6">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-[20px] text-outline">search</span>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Cari No. Rujukan (Cth: SPPKPP/2026/000123) atau Tajuk..."
            className="w-full pl-10 pr-24 py-2 bg-surface-container-low/80 rounded-lg font-body-md text-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-white transition-all shadow-inner border border-outline-variant/30"
          />
          <div className="absolute right-2 px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-[11px] font-mono">
            Ctrl + K
          </div>
        </form>
      </div>

      {/* Right Controls Cluster */}
      <div className="flex items-center gap-4">
        {/* ICT Online Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container/60 border border-surface-container-high/40">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="font-label-sm text-on-surface text-xs font-medium">ICT Pahang Online</span>
        </div>

        {/* Quick Help & Notification Icons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            title="Bantuan & Panduan"
            onClick={() => alert('Sistem Pengurusan Permohonan Kemaskini Portal Pahang (SPPKPP)\nMeja Bantuan BTM: ext. 4412 / 1244\nE-mel: portal@pahang.gov.my')}
          >
            <span className="material-symbols-outlined text-[22px]">help_outline</span>
          </button>

          {/* Notification Button & Flyout */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors relative"
              title="Notifikasi"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-error text-on-error font-label-sm text-[0.625rem] flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/80 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                  <span className="font-title-sm text-sm text-on-surface font-bold">Notifikasi Terkini</span>
                  <span className="font-label-sm text-xs text-primary">{notifications.length} Jumlah</span>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto mt-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2 rounded-lg bg-surface-container-low/70 text-xs space-y-1">
                      <div className="flex justify-between font-semibold text-on-surface">
                        <span>{n.tajuk}</span>
                        {!n.dibaca && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1"></span>}
                      </div>
                      <p className="text-on-surface-variant leading-relaxed">{n.mesej}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-8 w-px bg-outline-variant/40 mx-1"></div>

        {/* User Identity and Quick Switcher */}
        <div className="relative">
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 pl-1 cursor-pointer p-1.5 rounded-xl hover:bg-surface-container-low transition-colors"
          >
            <div className="relative">
              <img
                src={
                  currentUser?.avatar_url ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuAnKOSlKs8Jr7lao_uucyY5HGy91obzupKrUxHNOLATttpc5TzhQ3PoH0a6hqU4d_GnuFrBM0yY-Pxv3mr7spjSVw8BZs74RCVnAjWWSwZL-Rg0d64quhuV9hz3NpGbzbskCMXBOx0ERv4HbJfi5hxecrdC6WN1Zr6yTN8zXpgwM25Wp776AtbWal-xvDvUULD4uyyANHbt6qkT_pWrupcJtZRw6YHR-JQ3zUMUpH_EVxFFwxn6Db1q8A'
                }
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-primary ring-1 ring-white"></span>
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="font-label-md text-sm text-on-surface leading-snug font-semibold flex items-center gap-1">
                {currentUser?.nama_penuh || 'Ts. Mohd Faiz bin Azmi'}
                <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
              </span>
              <span className="font-label-sm text-xs text-on-surface-variant leading-none">
                {currentUser?.jawatan || 'Pegawai Portal • BTM SUK'}
              </span>
            </div>
          </div>

          {/* Quick Role Switcher Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/80 p-2 z-50">
              <div className="px-3 py-2 border-b border-surface-container">
                <span className="font-label-sm text-[10px] uppercase text-outline tracking-wider font-bold block">
                  Tukar Peranan Pengguna (Demo)
                </span>
                <span className="text-xs text-on-surface-variant font-medium">
                  Uji akses aliran mengikut peranan PRD
                </span>
              </div>
              <div className="space-y-1 mt-1 max-h-64 overflow-y-auto">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      onSwitchUser(acc.id);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex flex-col transition-colors ${
                      currentUser?.id === acc.id
                        ? 'bg-primary-container text-on-primary font-semibold'
                        : 'hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    <span>{acc.name}</span>
                    <span className="text-[10px] opacity-80 uppercase">{acc.role}</span>
                  </button>
                ))}
              </div>
              <div className="pt-2 mt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-error hover:bg-error-container/40 transition-colors font-semibold"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Log Keluar dari Sistem</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Standalone Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors"
          title="Log Keluar"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>
    </header>
  );
};
