/**
 * register.ts — Render halaman pendaftaran akun baru
 */
export function renderRegisterPage(): string {
  return `<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Daftar Akun Baru — BOB Racik Media Nusantara</title>
  <script src="../../api/auth.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="../../assets/css/shared.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    h1, h2, .font-serif { font-family: 'Lora', Georgia, serif; }
    .gradient-bg { background: linear-gradient(135deg, #ecfdf5 0%, #e0f2fe 50%, #f0fdf4 100%); min-height: 100vh; }
    .card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.06); }
    .social-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 12px 20px; border-radius: 99px; font-size: 14px; font-weight: 600; border: 1.5px solid #e5e7eb; background: #fff; color: #374151; cursor: pointer; transition: all .2s; }
    .social-btn.google:hover { border-color: #4285F4; background: #eff6ff; box-shadow: 0 4px 12px rgba(66,133,244,.15); }
    .input-field { width: 100%; padding: 11px 16px; border: 1.5px solid #e5e7eb; border-radius: 12px; font-size: 14px; outline: none; transition: all .2s; background: #fafafa; }
    .input-field:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,.15); background: #fff; }
    .btn-primary { width: 100%; padding: 13px 20px; border-radius: 99px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; font-size: 14px; font-weight: 700; border: none; cursor: pointer; transition: opacity .2s, transform .1s; }
    .btn-primary:hover { opacity: .95; transform: translateY(-1px); }
    .role-card { border: 2px solid #e5e7eb; border-radius: 14px; padding: 12px; cursor: pointer; transition: all .2s; }
    .role-card:hover { border-color: #10b981; background: #f0fdf4; }
    .role-card.selected { border-color: #059669; background: #ecfdf5; }
  </style>
  <link rel="stylesheet" href="/assets/css/public-layout.css" />
</head>
<body class="gradient-bg flex items-center justify-center p-4 min-h-screen">
  <div id="rm-navbar-root"></div>
  <div class="w-full max-w-lg card p-8 sm:p-10 my-8">
    <div class="text-center mb-6">
      <a href="../../index.html" class="font-serif text-3xl font-bold tracking-tight text-slate-900 inline-block">Racik Media Nusantara</a>
      <h1 class="text-xl font-bold text-slate-800 mt-4">Bergabung Bersama Komunitas</h1>
      <p class="text-xs text-slate-500 mt-1">Satu akun untuk membaca karya, belanja produk otentik, menjual barang &amp; jasa.</p>
    </div>
    <button type="button" onclick="handleGoogleSignUp()" class="social-btn google mb-6">Daftar Cepat dengan Akun Google</button>
    <div class="flex items-center gap-3 mb-6">
      <div class="flex-1 border-t border-slate-200"></div>
      <span class="text-xs text-slate-400 font-medium uppercase">atau isi formulir</span>
      <div class="flex-1 border-t border-slate-200"></div>
    </div>
    <form onsubmit="handleManualSignUp(event)" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-2">Pilih minat / jenis akun yang diajukan:</label>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="role-card selected" onclick="selectRole(this, 'member')"><p class="font-bold text-slate-800">🛍️ Pembeli &amp; Pembaca</p></div>
          <div class="role-card" onclick="selectRole(this, 'seller')"><p class="font-bold text-slate-800">🏪 Mitra Penjual Produk</p></div>
          <div class="role-card" onclick="selectRole(this, 'writer')"><p class="font-bold text-slate-800">✍️ Penulis Cerita</p></div>
          <div class="role-card" onclick="selectRole(this, 'penyedia_jasa')"><p class="font-bold text-slate-800">🔧 Penyedia Jasa</p></div>
        </div>
        <input type="hidden" id="selected-role" value="member" />
      </div>
      <div><label class="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label><input type="text" id="reg-name" required placeholder="Nama Anda" class="input-field" /></div>
      <div><label class="block text-xs font-semibold text-slate-700 mb-1">Alamat Email Aktif</label><input type="email" id="reg-email" required placeholder="nama@email.com" class="input-field" /></div>
      <div><label class="block text-xs font-semibold text-slate-700 mb-1">Kota / Domisili</label><input type="text" id="reg-city" required placeholder="Contoh: Bandung, Jawa Barat" class="input-field" /></div>
      <div><label class="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi (Password)</label><input type="password" id="reg-pass" required minlength="8" placeholder="Minimal 8 karakter" class="input-field" /></div>
      <div class="pt-2"><button type="submit" class="btn-primary">Daftar Sekarang →</button></div>
    </form>
    <p class="text-center text-xs text-slate-500 mt-6">Sudah punya akun? <a id="login-link" href="login" class="text-emerald-700 font-bold hover:underline">Masuk di sini</a></p>
  </div>
  <script>
    function selectRole(el, role) {
      document.querySelectorAll('.role-card').forEach(function(c) { c.classList.remove('selected'); });
      el.classList.add('selected');
      document.getElementById('selected-role').value = role;
    }
    function handleGoogleSignUp() {
      BobAuth.loginSocial('google').then(function (result) {
        if (!result.success) alert(result.error);
      });
    }
    async function handleManualSignUp(e) {
      e.preventDefault();
      var form = e.currentTarget;
      var name = document.getElementById('reg-name').value.trim();
      var email = document.getElementById('reg-email').value.trim();
      var city = document.getElementById('reg-city').value.trim();
      var requestedRole = document.getElementById('selected-role').value;
      var password = document.getElementById('reg-pass').value;
      var button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      button.textContent = 'Mendaftarkan…';
      var result = await BobAuth.register(name, email, password, city, requestedRole);
      if (!result.success) {
        alert(result.error);
        button.disabled = false;
        button.textContent = 'Daftar Sekarang →';
      }
    }
  </script>
  <script src="../../assets/js/lang.js"></script>
  <script src="/assets/js/layout.js"></script>
  <script src="/assets/js/public-layout.js"></script>
</body>
</html>`;
}
