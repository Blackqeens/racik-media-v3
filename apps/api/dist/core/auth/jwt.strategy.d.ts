import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
export interface JwtPayload {
    sub: string;
    email: string;
    tenant_id: string;
    role: string;
    aud: string;
    iat: number;
    exp: number;
}
export interface AuthUser {
    userId: string;
    user_id: string;
    id: string;
    email: string;
    tenant_id: string;
    role: string;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(config: ConfigService);
    validate(payload: any): AuthUser;
}
export {};
