/**
 * auth-pages.controller.ts — Auth HTML Pages Controller
 *
 * Melayani halaman-halaman auth sebagai HTML langsung dari server.
 * Semua route bertanda @Public() — tidak memerlukan JWT.
 *
 * Routes:
 *   GET /auth/login             → form login
 *   GET /auth/register          → form pendaftaran
 *   GET /auth/forgot-password   → form lupa kata sandi
 *   GET /auth/update-password   → form set kata sandi baru (dari link email)
 *   GET /auth/verify-email      → form kirim ulang konfirmasi email
 *   GET /auth/email-confirmed   → halaman konfirmasi berhasil
 *
 * Ref: identity-html pages di ../html/
 */
import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '../../../core/auth/public.decorator';
import { renderLoginPage } from '../html/login';
import { renderRegisterPage } from '../html/register';
import { renderForgotPasswordPage } from '../html/forgot-password';
import { renderUpdatePasswordPage } from '../html/update-password';
import { renderVerifyEmailPage } from '../html/verify-email';
import { renderEmailConfirmedPage } from '../html/email-confirmed';

@Controller('auth')
export class AuthPagesController {
  @Public()
  @Get('login')
  @Header('Content-Type', 'text/html')
  renderLogin(): string { return renderLoginPage(); }

  @Public()
  @Get('register')
  @Header('Content-Type', 'text/html')
  renderRegister(): string { return renderRegisterPage(); }

  @Public()
  @Get('forgot-password')
  @Header('Content-Type', 'text/html')
  renderForgotPassword(): string { return renderForgotPasswordPage(); }

  @Public()
  @Get('update-password')
  @Header('Content-Type', 'text/html')
  renderUpdatePassword(): string { return renderUpdatePasswordPage(); }

  @Public()
  @Get('verify-email')
  @Header('Content-Type', 'text/html')
  renderVerifyEmail(): string { return renderVerifyEmailPage(); }

  @Public()
  @Get('email-confirmed')
  @Header('Content-Type', 'text/html')
  renderEmailConfirmed(): string { return renderEmailConfirmedPage(); }
}
