/**
 * Fungsi Komponen untuk Merender Halaman Login / Masuk Akun
 */

function getNavbar(): string {
  return `
<header class="w-full border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
  <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
    <a href="/" class="font-serif text-lg font-bold text-slate-900 tracking-tight">Racik Media Nusantara</a>
    <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
      <a href="/beranda" class="hover:text-emerald-700 transition-colors">Beranda</a>
      <a href="/marketplace" class="hover:text-emerald-700 transition-colors">Marketplace</a>
      <a href="/artikel" class="hover:text-emerald-700 transition-colors">Artikel</a>
    </nav>
    <a href="/auth/register" class="text-sm font-semibold text-emerald-800 border border-emerald-700 rounded-full px-4 py-1.5 hover:bg-emerald-50 transition-colors">Daftar</a>
  </div>
</header>`;
}

function getFooter(): string {
  return `
<footer class="w-full border-t border-slate-200 bg-white mt-auto">
  <div class="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
    <span>© ${new Date().getFullYear()} Racik Media Nusantara. Hak cipta dilindungi undang-undang.</span>
    <nav class="flex items-center gap-4">
      <a href="/kebijakan-privasi" class="hover:text-emerald-700 transition-colors">Kebijakan Privasi</a>
      <a href="/syarat-ketentuan" class="hover:text-emerald-700 transition-colors">Syarat &amp; Ketentuan</a>
      <a href="/bantuan" class="hover:text-emerald-700 transition-colors">Bantuan</a>
    </nav>
  </div>
</footer>`;
}

export function renderLoginPage(): string {
  const navbar = getNavbar();
  const footer = getFooter();

  return `
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login / Daftar Member — BOB</title>
  <script src="https://tailwindcss.com"></script>
  <link rel="preconnect" href="https://googleapis.com" />
  <link rel="preconnect" href="https://gstatic.com" crossorigin />
  <link href="https://googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  
  <style>
    h1, h2, .font-serif { font-family: 'Lora', Georgia, serif; }
    .gradient-bg { background: linear-gradient(135deg, #ecfdf5 0%, #e0f2fe 50%, #f0fdf4 100%); min-height: 100vh; }
    .card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 20px; box-shadow: 0 8px 40px rgba(0,0,0,0.08); }
    .input-field { width: 100%; padding: 11px 16px; border: 1.5px solid #e5e7eb; border-radius: 99px; font-size: 14px; outline: none; transition: border-color .2s, box-shadow .2s; background: #fafafa; }
    .input-field:focus { border-color: #34d399; box-shadow: 0 0 0 3px rgba(52,211,153,.15); background: #fff; }
    .btn-primary { width: 100%; padding: 12px 20px; border-radius: 99px; background: linear-gradient(135deg, #34d399 0%, #38bdf8 100%); color: #064e3b; font-size: 14px; font-weight: 700; border: none; cursor: pointer; text-align: center; }
    .tab-btn { flex: 1; padding: 8px; border-radius: 99px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; background: transparent; color: #6b7280; }
    .tab-btn.active { background: linear-gradient(135deg, #34d399 0%, #38bdf8 100%); color: #064e3b; }
    .error-msg { color: #dc2626; font-size: 13px; text-align: center; margin-top: 4px; display: none; }
  </style>
</head>
<body class="gradient-bg flex flex-col items-center justify-between min-h-screen">

  <!-- ── 1. NAVBAR MODULAR ── -->
  ${navbar}

  <!-- ── 2. FORM KONTEN LOGIN LAMA ANDA ── -->
  <main class="w-full max-w-md flex flex-col gap-6 p-4 my-auto">
    <div class="text-center">
      <a href="/" class="font-serif text-3xl font-bold text-gray-900">Racik Media Nusantara</a>
      <p class="text-sm text-gray-500 mt-1">Platform Editorial & Commerce Lokal Indonesia</p>
    </div>

    <div class="card p-8 flex flex-col gap-6">
      <div class="flex items-center gap-1 bg-gray-100 rounded-full p-1">
        <button id="tab-login" class="tab-btn active">Masuk</button>
        <button id="tab-register" class="tab-btn">Daftar Member</button>
      </div>

      <div id="panel-login" class="flex flex-col gap-5">
        <div>
          <h2 class="font-serif text-xl font-bold text-gray-900">Selamat datang kembali 👋</h2>
          <p class="text-sm text-gray-500 mt-1">Masuk untuk melanjutkan pengalaman Anda di Racik media.</p>
        </div>

        <form onsubmit="return handleEmailLogin(event)" class="flex flex-col gap-3">
          <input type="email" id="login-email" placeholder="Alamat email" class="input-field" required />
          <input type="password" id="login-password" placeholder="Kata sandi" class="input-field" required />
          <a href="forgot-password" class="self-end text-xs font-semibold text-emerald-800 hover:underline">Lupa kata sandi?</a>
          <div id="login-error" class="error-msg"></div>
          <button type="submit" class="btn-primary mt-2">Masuk ke Akun</button>
        </form>

        <button type="button" onclick="handleGoogleLogin()" class="w-full rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Lanjutkan dengan Google
        </button>

        <p class="text-center text-xs text-slate-500">Belum punya akun? <a href="register" class="font-semibold text-emerald-800 hover:underline">Daftar</a></p>
      </div>
    </div>
  </main>

  <!-- ── 3. FOOTER MODULAR ── -->
  ${footer}

  <!-- ── 4. SCRIPT LOGIKA KLIEN ── -->
  <script>
    function showLoginError(message) {
      const errorDiv = document.getElementById('login-error');
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }

    async function handleEmailLogin(event) {
      event.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const errorDiv = document.getElementById('login-error');
      errorDiv.style.display = 'none';

      if (typeof BobAuth !== 'undefined') {
        const hasil = await BobAuth.login(email, password);
        if (!hasil.success) showLoginError(hasil.error);
      } else {
        console.log('Form disubmit:', { email, password });
      }
      return false;
    }
  </script>
</body>
</html>
  `;
}
