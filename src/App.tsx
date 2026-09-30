/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api, User, ApplicationItem, NotificationItem } from './lib/api.ts';
import { LoginView } from './components/LoginView.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { DashboardKerjaView } from './components/DashboardKerjaView.tsx';
import { PermohonanBaharuView } from './components/PermohonanBaharuView.tsx';
import { PermohonanSayaView } from './components/PermohonanSayaView.tsx';
import { DaftarSaluranLuarView } from './components/DaftarSaluranLuarView.tsx';
import { SemakanPermohonanView } from './components/SemakanPermohonanView.tsx';
import { RuangKerjaPegawaiView } from './components/RuangKerjaPegawaiView.tsx';
import { AuditTrailView } from './components/AuditTrailView.tsx';
import { KonfigurasiSistemView } from './components/KonfigurasiSistemView.tsx';
import { LaporanStatistikView } from './components/LaporanStatistikView.tsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('dashboard-kerja');
  const [activeWorkspaceApp, setActiveWorkspaceApp] = useState<ApplicationItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Initial authentication check & data preload
  const refreshData = async () => {
    try {
      const userRes = await api.getCurrentUser().catch(() => null);
      if (userRes && userRes.user) {
        setCurrentUser(userRes.user);
      }

      const [appsRes, notifRes] = await Promise.all([
        api.getPermohonanList().catch(() => ({ items: [] })),
        api.getNotifications().catch(() => ({ notifikasi: [] })),
      ]);

      setApplications(appsRes.items || []);
      setNotifications(notifRes.notifikasi || []);

      // If active workspace item is set, update it from fresh data
      if (activeWorkspaceApp && appsRes.items) {
        const found = appsRes.items.find((a: ApplicationItem) => a.id === activeWorkspaceApp.id);
        if (found) setActiveWorkspaceApp(found);
      }
    } catch (err) {
      console.error('Error refreshing app data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    // Role-based initial landing
    if (user.peranan === 'pemohon') {
      setCurrentPath('permohonan-saya');
    } else {
      setCurrentPath('dashboard-kerja');
    }
    refreshData();
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setActiveWorkspaceApp(null);
    setCurrentPath('dashboard-kerja');
  };

  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await api.switchUser(userId);
      setCurrentUser(res.user);
      const isOfficerOrAdmin =
        res.user.peranan === 'pegawai_portal' ||
        res.user.peranan === 'pentadbir_sistem';

      const restrictedPaths = [
        'queue-permohonan',
        'agihan-tugas',
        'daftar-saluran-luar',
        'laporan-dan-sla',
        'jejak-audit',
        'konfigurasi-sistem',
      ];

      if (!isOfficerOrAdmin && restrictedPaths.includes(currentPath)) {
        setCurrentPath(res.user.peranan === 'pemohon' ? 'permohonan-saya' : 'dashboard-kerja');
      }
      await refreshData();
    } catch (err) {
      console.error('Failed to switch user:', err);
    }
  };

  const handleOpenWorkspace = (app: ApplicationItem) => {
    setActiveWorkspaceApp(app);
    setCurrentPath('ruang-kerja');
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20 animate-pulse">
            <span className="material-symbols-outlined text-[28px]">account_balance</span>
          </div>
          <div className="text-center">
            <div className="font-title-sm font-bold text-on-surface text-base">SPPKPP SUK PAHANG</div>
            <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-1.5 justify-center">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              Memuatkan pangkalan data &amp; sesi pengguna...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Login View
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const isOfficerOrAdmin =
    currentUser.peranan === 'pegawai_portal' ||
    currentUser.peranan === 'pentadbir_sistem';

  return (
    <div className="min-h-screen bg-[#f4f7f9] text-[#191c1d] flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      {/* Fixed Sidebar */}
      <Sidebar
        currentPath={currentPath}
        currentUser={currentUser}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-72 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          notifications={notifications}
          onSearch={(q) => {
            setSearchQuery(q);
            setSearchModalOpen(true);
          }}
          onLogout={handleLogout}
          onSwitchUser={handleSwitchUser}
          onOpenNotifications={() => {
            // Can open notifications drawer or route
          }}
        />

        {/* View Content Container */}
        <main className="flex-1 pt-24 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {/* Helper Access Restricted Component for Non-Portal / Non-Admin Users */}
          {(!isOfficerOrAdmin && [
            'queue-permohonan',
            'agihan-tugas',
            'daftar-saluran-luar',
            'laporan-dan-sla',
            'jejak-audit',
            'konfigurasi-sistem',
          ].includes(currentPath)) ? (
            <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-white/60 shadow-sm space-y-4 max-w-xl mx-auto mt-6 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto border border-amber-500/20">
                <span className="material-symbols-outlined text-[34px]">lock</span>
              </div>
              <div>
                <h2 className="font-title-sm text-xl font-bold text-on-surface">
                  Akses Terhad (Khas Pegawai Portal &amp; Pentadbir BTM Sahaja)
                </h2>
                <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed mt-2">
                  Menu <strong>Pengurusan Portal</strong>, <strong>Analisis &amp; Audit</strong>, dan <strong>Pentadbiran</strong> hanya boleh diakses oleh Pegawai Portal dan Pentadbir Sistem BTM mengikut dasar kawalan capaian keselamatan SPPKPP.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setCurrentPath(currentUser?.peranan === 'pemohon' ? 'permohonan-saya' : 'dashboard-kerja')}
                  className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
                >
                  Kembali ke {currentUser?.peranan === 'pemohon' ? 'Permohonan Saya' : 'Dashboard Kerja'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {currentPath === 'dashboard-kerja' && (
                <DashboardKerjaView
                  applications={applications}
                  onNavigate={handleNavigate}
                  onOpenWorkspace={handleOpenWorkspace}
                  onRefresh={refreshData}
                />
              )}

              {currentPath === 'permohonan-saya' && (
                <PermohonanSayaView
                  applications={applications.filter(
                    (a) => currentUser?.peranan === 'pemohon' ? a.pemohon_uid === currentUser.id : true
                  )}
                  onNavigate={handleNavigate}
                  onOpenWorkspace={handleOpenWorkspace}
                />
              )}

              {currentPath === 'permohonan-baharu' && (
                <PermohonanBaharuView
                  onSuccess={(newApp) => {
                    refreshData();
                    handleOpenWorkspace(newApp);
                  }}
                  onNavigate={handleNavigate}
                />
              )}

              {(currentPath === 'queue-permohonan' || currentPath === 'agihan-tugas') && (
                <SemakanPermohonanView
                  applications={applications}
                  currentUser={currentUser}
                  onRefresh={refreshData}
                  onOpenWorkspace={handleOpenWorkspace}
                  onNavigate={handleNavigate}
                />
              )}

              {currentPath === 'daftar-saluran-luar' && (
                <DaftarSaluranLuarView
                  onSuccess={(newItem) => {
                    refreshData();
                    handleOpenWorkspace(newItem);
                  }}
                  onNavigate={handleNavigate}
                />
              )}

              {currentPath === 'ruang-kerja' && activeWorkspaceApp && (
                <RuangKerjaPegawaiView
                  application={activeWorkspaceApp}
                  currentUser={currentUser}
                  onBack={() => handleNavigate('dashboard-kerja')}
                  onRefresh={refreshData}
                />
              )}

              {currentPath === 'ruang-kerja' && !activeWorkspaceApp && (
                <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-white/60 shadow-sm space-y-3">
                  <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 block">
                    content_paste_search
                  </span>
                  <h2 className="font-title-sm text-lg font-bold text-on-surface">
                    Tiada Permohonan Dipilih
                  </h2>
                  <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                    Sila pilih permohonan daripada Dashboard Kerja atau Queue Semakan untuk memulakan tindakan di Ruang Kerja Pegawai.
                  </p>
                  <button
                    onClick={() => handleNavigate('dashboard-kerja')}
                    className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
                  >
                    Kembali ke Dashboard
                  </button>
                </div>
              )}

              {currentPath === 'laporan-dan-sla' && (
                <LaporanStatistikView applications={applications} />
              )}

              {currentPath === 'jejak-audit' && (
                <AuditTrailView />
              )}

              {currentPath === 'konfigurasi-sistem' && (
                <KonfigurasiSistemView />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Search Dialog Modal (Ctrl+K) */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-4 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95">
            <div className="relative mb-3">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-[20px]">
                search
              </span>
              <input
                autoFocus
                type="text"
                placeholder="Cari no rujukan, tajuk, agensi, atau pegawai..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Search results list */}
            <div className="max-h-72 overflow-y-auto space-y-1 divide-y divide-surface-container-high/40">
              {applications
                .filter((app) => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    app.no_rujukan.toLowerCase().includes(q) ||
                    app.tajuk.toLowerCase().includes(q) ||
                    app.org_nama.toLowerCase().includes(q) ||
                    (app.pegawai_nama && app.pegawai_nama.toLowerCase().includes(q))
                  );
                })
                .slice(0, 8)
                .map((app) => (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSearchModalOpen(false);
                      handleOpenWorkspace(app);
                    }}
                    className="p-3 hover:bg-surface-container-low rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">{app.no_rujukan}</span>
                        <span className="capitalize px-1.5 py-0.2 rounded text-[10px] font-semibold bg-surface-container-high">
                          {app.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="font-semibold text-on-surface truncate mt-0.5">{app.tajuk}</div>
                      <div className="text-[10px] text-on-surface-variant truncate">{app.org_nama}</div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant text-[16px]">
                      chevron_right
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
