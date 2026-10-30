"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthPagesController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../../../core/auth/public.decorator");
const login_1 = require("../html/login");
const register_1 = require("../html/register");
const forgot_password_1 = require("../html/forgot-password");
const update_password_1 = require("../html/update-password");
const verify_email_1 = require("../html/verify-email");
const email_confirmed_1 = require("../html/email-confirmed");
let AuthPagesController = class AuthPagesController {
    renderLogin() { return (0, login_1.renderLoginPage)(); }
    renderRegister() { return (0, register_1.renderRegisterPage)(); }
    renderForgotPassword() { return (0, forgot_password_1.renderForgotPasswordPage)(); }
    renderUpdatePassword() { return (0, update_password_1.renderUpdatePasswordPage)(); }
    renderVerifyEmail() { return (0, verify_email_1.renderVerifyEmailPage)(); }
    renderEmailConfirmed() { return (0, email_confirmed_1.renderEmailConfirmedPage)(); }
};
exports.AuthPagesController = AuthPagesController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('login'),
    (0, common_1.Header)('Content-Type', 'text/html'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AuthPagesController.prototype, "renderLogin", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('register'),
    (0, common_1.Header)('Content-Type', 'text/html'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AuthPagesController.prototype, "renderRegister", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('forgot-password'),
    (0, common_1.Header)('Content-Type', 'text/html'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AuthPagesController.prototype, "renderForgotPassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('update-password'),
    (0, common_1.Header)('Content-Type', 'text/html'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AuthPagesController.prototype, "renderUpdatePassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('verify-email'),
    (0, common_1.Header)('Content-Type', 'text/html'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AuthPagesController.prototype, "renderVerifyEmail", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('email-confirmed'),
    (0, common_1.Header)('Content-Type', 'text/html'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AuthPagesController.prototype, "renderEmailConfirmed", null);
exports.AuthPagesController = AuthPagesController = __decorate([
    (0, common_1.Controller)('auth')
], AuthPagesController);
//# sourceMappingURL=auth-pages.controller.js.map