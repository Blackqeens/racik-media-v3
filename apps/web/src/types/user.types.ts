/**
 * user.types.ts — User entity types shared in the frontend.
 * Ref: data-models.md §identity, permission-matrix.md
 */

export type UserStatus = 'active' | 'suspended' | 'restricted' | 'deleted';
export type KycTier = 0 | 1 | 2 | 3;
export type RoleType =
  | 'member'
  | 'author'
  | 'seller'
  | 'distributor'
  | 'service_provider'
  | 'moderator'
  | 'admin';
export type RoleStatus = 'active' | 'suspended' | 'pending';

export interface User {
  id: string;
  email: string;
  status?: UserStatus;
  kyc_tier?: KycTier;
  mfa_enabled?: boolean;
  created_at?: string;
  profile?: IndividualProfile;
  roles?: UserRole[];
}

export interface IndividualProfile {
  full_name: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  province?: string;
  city?: string;
}

export interface UserRole {
  id: string;
  role_type: RoleType;
  status: RoleStatus;
  granted_at: string;
}
