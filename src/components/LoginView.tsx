import React, { useState } from 'react';
import { api, User } from '../lib/api.ts';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('faiz.azmi@pahang.gov.my');
  const [password, setPassword] = useState('Password123!@#');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Register Modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regJawatan, setRegJawatan] = useState('');
  const [regAgency, setRegAgency] = useState('Bahagian Perancang Ekonomi Negeri (BPEN) Pahang');
  const [regPassword, setRegPassword] = useState('Password123!@#');
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  const handleOfficialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.login(email, password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal log masuk. Sila semak emel dan kata laluan anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setGoogleLoading(true);
    setErrorMsg('');
    setTimeout(async () => {
      try {
        const res = await api.login('faiz.azmi@pahang.gov.my');
        onLoginSuccess(res.user);
      } catch (err: any) {
        setErrorMsg('Pengesahan SSO Google Pahang gagal.');
      } finally {
        setGoogleLoading(false);
      }
    }, 900);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    try {
      const res = await api.register({
        nama_penuh: regName,
        emel: regEmail,
        no_telefon: regPhone,
        jawatan: regJawatan,
        agensi: regAgency,
        password: regPassword,
      });
      setRegSuccessMsg('Pendaftaran berjaya! Anda sedang dialirkan ke dalam sistem...');
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Pendaftaran akaun gagal.');
    } finally {
      setRegLoading(false);
    }
  };

  const quickUsers = [
    { label: 'Ts. Mohd Faiz (Pegawai Portal)', email: 'faiz.azmi@pahang.gov.my' },
    { label: 'Pn. Siti Salmiah (Ketua Seksyen)', email: 'siti.salmiah@pahang.gov.my' },
    { label: 'Puan Salmah (Pemohon BKP)', email: 'salmah.yahya@pahang.gov.my' },
    { label: 'En. Abdul Rahim (Penolong IT)', email: 'abdul.rahim@pahang.gov.my' },
    { label: 'Pentadbir Sistem BTM', email: 'admin.portal@pahang.gov.my' },
  ];

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-[#f4faff] font-body-md text-on-surface antialiased bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(15,110,140,0.15),rgba(244,250,255,0))]">
      <div className="flex flex-col w-full items-center justify-center relative overflow-hidden py-10">
        {/* Ambient Pahang Royal & BTM Tint Mesh Background Elements */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/15 blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-tertiary-container/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-secondary-container/40 blur-3xl pointer-events-none"></div>

        {/* Main Security Restricted Login Card */}
        <div className="relative w-full max-w-[480px] mx-auto rounded-[24px] bg-white/85 backdrop-blur-xl p-6 sm:p-9 shadow-2xl shadow-primary-container/20 border border-white/90">
          {/* Top Decorative Line (Pahang Royal Gold & Deep Cyan) */}
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-tertiary-container to-transparent rounded-full opacity-70"></div>

          {/* Official Brand Emblem Header */}
          <div className="flex flex-col items-center text-center mt-1">
            <div className="w-full flex items-center justify-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-white flex items-center justify-center shadow-md border-2 border-white">
                <span className="material-symbols-outlined text-[32px]">account_balance</span>
              </div>
            </div>
            <h1 className="font-headline-md text-xl text-on-surface mt-2 font-bold tracking-tight">
              Selamat Datang ke SPPKPP
            </h1>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1 max-w-xs leading-relaxed">
              Sistem Pengurusan Permohonan Kemaskini Portal Pahang
            </p>
            <div className="inline-flex items-center gap-1.5 mt-1 font-label-sm text-xs text-primary font-semibold">
              <span className="material-symbols-outlined text-sm">account_balance</span>
              <span>Pejabat Setiausaha Kerajaan Negeri Pahang</span>
            </div>
          </div>

          {/* Security Warning & Restricted Access Notice */}
          <div className="mt-4 p-3 rounded-xl bg-surface-container-high/60 backdrop-blur-md border border-surface-container-highest/60">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-error text-on-error font-label-sm text-[0.625rem] tracking-wider uppercase font-bold">
                SISTEM TERHAD &amp; TERKAWAL
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
              </span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1.5 leading-snug">
              Akses hanya dibenarkan untuk kakitangan berdaftar SUK Pahang, Jabatan &amp; Agensi Negeri sahaja. Sila sahkan kelayakan identiti anda untuk membuka akses rekod dan aliran kerja.
            </p>
          </div>

          {errorMsg && (
            <div className="mt-3 p-3 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Authentication Option */}
          <div className="mt-4">
            <button
              onClick={handleGoogleAuth}
              disabled={googleLoading}
              className="group w-full py-3 px-4 rounded-xl bg-white hover:bg-surface-container-lowest shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-between text-left active:scale-[0.99] border border-slate-100"
              type="button"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
                </svg>
                <div className="flex flex-col">
                  <span className="font-title-sm text-sm text-on-surface font-semibold group-hover:text-primary transition-colors">
                    {googleLoading ? 'Menyambung ke SSO Google Pahang...' : 'Log Masuk dengan Google'}
                  </span>
                  <span className="font-body-sm text-[0.7rem] text-outline">
                    Akaun Rasmi @pahang.gov.my
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>
          </div>

          {/* Modern Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full h-px bg-outline-variant/50"></div>
            <span className="absolute px-3 bg-white/95 text-outline text-[0.7rem] font-medium tracking-tight">
              atau log masuk menggunakan E-mel Rasmi &amp; Kata Laluan
            </span>
          </div>

          {/* Official Login Form */}
          <form className="space-y-3.5" onSubmit={handleOfficialLogin}>
            {/* Email Field */}
            <div>
              <label className="block font-label-md text-xs text-on-surface mb-1 font-semibold" htmlFor="emailInput">
                E-mel Rasmi Kerajaan
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline pointer-events-none text-xl">
                  alternate_email
                </span>
                <input
                  id="emailInput"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama.pengguna@pahang.gov.my"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-white text-on-surface font-body-md text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/20 border border-slate-200 transition-all placeholder:text-outline-variant"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-label-md text-xs text-on-surface font-semibold" htmlFor="passwordInput">
                  Kata Laluan
                </label>
                <button
                  type="button"
                  onClick={() => alert('Sila hubungi Meja Bantuan ICT BTM SUK di talian sambungan 4412 untuk bantuan set semula kata laluan anda.')}
                  className="font-label-sm text-xs text-primary hover:text-primary-container transition-colors"
                >
                  Lupa Kata Laluan?
                </button>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline pointer-events-none text-xl">
                  lock
                </span>
                <input
                  id="passwordInput"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white text-on-surface font-body-md text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/20 border border-slate-200 transition-all placeholder:text-outline-variant"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Tunjuk kata laluan"
                  className="absolute right-2.5 p-1 text-outline hover:text-on-surface transition-colors flex items-center justify-center rounded"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me & MFA Status */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded text-primary bg-white focus:ring-primary/30 accent-primary cursor-pointer"
                />
                <span className="font-body-sm text-xs text-on-surface-variant">
                  Ingat saya selama 30 hari
                </span>
              </label>
              <span className="inline-flex items-center gap-1 font-label-sm text-[0.6875rem] text-tertiary font-bold">
                <span className="material-symbols-outlined text-xs">verified_user</span>
                MFA Diperlukan
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-primary-container text-white font-label-md text-sm tracking-wide shadow-md hover:shadow-lg hover:bg-primary transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] relative overflow-hidden group cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">login</span>
                <span>{loading ? 'Mengesahkan Kredensial...' : 'Log Masuk ke Sistem'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="w-full py-2.5 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                <span>Daftar Akaun Pemohon Baharu</span>
              </button>
            </div>
          </form>

          {/* Quick Demo Switcher Section */}
          <div className="mt-4 pt-3 border-t border-outline-variant/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-2">
              Pilihan Pantas Akaun Contoh:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickUsers.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => {
                    setEmail(u.email);
                    setPassword('Password123!@#');
                  }}
                  className="px-2 py-1 rounded bg-surface-container-high/60 hover:bg-surface-container text-[11px] text-on-surface-variant transition-colors"
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audit / Legal Footnote */}
          <div className="mt-6 pt-3 border-t border-outline-variant/30 text-center">
            <div className="flex items-center justify-center gap-1.5 text-outline text-[0.65rem] font-medium leading-tight">
              <span className="material-symbols-outlined text-xs text-primary">security</span>
              <span>Pematuhan Keselamatan ICT BTM SUK Pahang • Standard TLS 1.3 &amp; MFA Aktif</span>
            </div>
            <div className="mt-1 flex items-center justify-center gap-2 text-outline-variant text-[0.6rem]">
              <span>Hak Cipta Terpelihara © Kerajaan Negeri Pahang</span>
              <span>•</span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono">
                v1.0.0 (Produksi Terkawal)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal Dialog */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">person_add</span>
                <h3 className="font-title-sm text-base font-bold text-on-surface">Daftar Akaun Pemohon Baharu</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {regSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 border border-emerald-200">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>{regSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Penuh Pegawai</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Cth: Puan Siti Aishah binti Ahmad"
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">E-mel Rasmi (.gov.my)</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="nama.pengguna@pahang.gov.my"
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. Telefon Pejabat</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="09-5126600"
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jawatan & Gred</label>
                  <input
                    type="text"
                    value={regJawatan}
                    onChange={(e) => setRegJawatan(e.target.value)}
                    placeholder="Cth: Pegawai Tadbir N41"
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan / Agensi Asal</label>
                <input
                  type="text"
                  value={regAgency}
                  onChange={(e) => setRegAgency(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Laluan</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary-container shadow-md"
                >
                  {regLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
