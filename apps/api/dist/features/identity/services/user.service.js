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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let UserService = class UserService {
    constructor(configService) {
        this.configService = configService;
        const supabaseUrl = this.configService.get('SUPABASE_URL');
        const supabaseServiceKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY');
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
    }
    async getProfileById(userId) {
        const { data: user, error: userError } = await this.supabase
            .from('users')
            .select('id, status, kyc_tier, created_at')
            .eq('id', userId)
            .maybeSingle();
        if (userError) {
            throw new common_1.InternalServerErrorException(`Gagal mengambil data user: ${userError.message}`);
        }
        const { data: profile, error: profileError } = await this.supabase
            .from('individual_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
        if (profileError) {
            throw new common_1.InternalServerErrorException(`Gagal mengambil profil: ${profileError.message}`);
        }
        let resolvedProfile = profile;
        if (!resolvedProfile) {
            const { data: newProfile, error: insertError } = await this.supabase
                .from('individual_profiles')
                .insert([
                {
                    user_id: userId,
                    full_name: 'Pengguna Racik Media',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ])
                .select()
                .single();
            if (insertError) {
                throw new common_1.InternalServerErrorException(`Gagal inisialisasi profil: ${insertError.message}`);
            }
            resolvedProfile = newProfile;
        }
        return {
            id: user?.id ?? userId,
            status: user?.status ?? 'active',
            kyc_tier: user?.kyc_tier ?? 'basic',
            created_at: user?.created_at,
            individual_profiles: resolvedProfile,
        };
    }
    async updateProfile(userId, dto) {
        const updatePayload = {
            updated_at: new Date().toISOString(),
        };
        const fullName = dto.fullName ?? dto.full_name;
        const phone = dto.phone ?? dto.phone;
        const avatarUrl = dto.avatarUrl ?? dto.avatar_url;
        const bio = dto.bio ?? dto.bio;
        const city = dto.city ?? dto.city;
        const province = dto.province;
        if (fullName !== undefined)
            updatePayload.full_name = fullName;
        if (phone !== undefined)
            updatePayload.phone = phone;
        if (avatarUrl !== undefined)
            updatePayload.avatar_url = avatarUrl;
        if (bio !== undefined)
            updatePayload.bio = bio;
        if (city !== undefined)
            updatePayload.city = city;
        if (province !== undefined)
            updatePayload.province = province;
        const { data: updated, error } = await this.supabase
            .from('individual_profiles')
            .update(updatePayload)
            .eq('user_id', userId)
            .select()
            .single();
        if (error) {
            throw new common_1.InternalServerErrorException(`Gagal memperbarui profil: ${error.message}`);
        }
        return {
            id: userId,
            status: 'active',
            kyc_tier: 'basic',
            individual_profiles: updated,
        };
    }
    async getUserRoles(userId) {
        const { data: profile, error } = await this.supabase
            .from('individual_profiles')
            .select('user_role, kyc_tier, is_verified')
            .eq('user_id', userId)
            .maybeSingle();
        const roleList = ['buyer'];
        if (error || !profile) {
            return roleList;
        }
        if (profile.user_role === 'expert') {
            roleList.push('expert');
        }
        else if (profile.user_role === 'seller') {
            roleList.push('seller');
        }
        else if (profile.user_role === 'admin') {
            roleList.push('admin');
        }
        return roleList;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UserService);
//# sourceMappingURL=user.service.js.map