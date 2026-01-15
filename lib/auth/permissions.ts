/**
 * Role-Based Access Control (RBAC)
 * Permission checking utilities
 */

import { USER_ROLES } from '@/config/constants';

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export interface UserPermissions {
  role: UserRole;
  institutionId?: string | null;
  userId: string;
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Check if user is admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === USER_ROLES.ADMIN;
}

/**
 * Check if user is institution admin
 */
export function isInstitutionAdmin(role: UserRole): boolean {
  return role === USER_ROLES.INSTITUTION_ADMIN;
}

/**
 * Check if user can manage institution
 */
export function canManageInstitution(
  userPermissions: UserPermissions,
  targetInstitutionId?: string | null
): boolean {
  // Admin can manage all institutions
  if (isAdmin(userPermissions.role)) {
    return true;
  }

  // Institution admin can only manage their own institution
  if (isInstitutionAdmin(userPermissions.role)) {
    return userPermissions.institutionId === targetInstitutionId;
  }

  return false;
}

/**
 * Check if user can manage user
 */
export function canManageUser(
  userPermissions: UserPermissions,
  targetUserId: string,
  targetInstitutionId?: string | null
): boolean {
  // Admin can manage all users
  if (isAdmin(userPermissions.role)) {
    return true;
  }

  // Users can manage themselves
  if (userPermissions.userId === targetUserId) {
    return true;
  }

  // Institution admin can manage users in their institution
  if (isInstitutionAdmin(userPermissions.role)) {
    return userPermissions.institutionId === targetInstitutionId;
  }

  return false;
}

/**
 * Check if user can view exam
 */
export function canViewExam(
  userPermissions: UserPermissions,
  examInstitutionId?: string | null
): boolean {
  // Admin can view all exams
  if (isAdmin(userPermissions.role)) {
    return true;
  }

  // Institution admin can view exams assigned to their institution
  if (isInstitutionAdmin(userPermissions.role)) {
    return userPermissions.institutionId === examInstitutionId;
  }

  // Individual users can view their assigned exams
  return true;
}

/**
 * Check if user can create exam
 */
export function canCreateExam(userPermissions: UserPermissions): boolean {
  return isAdmin(userPermissions.role) || isInstitutionAdmin(userPermissions.role);
}

/**
 * Check if user can update exam
 */
export function canUpdateExam(
  userPermissions: UserPermissions,
  examInstitutionId?: string | null
): boolean {
  return canCreateExam(userPermissions) && canViewExam(userPermissions, examInstitutionId);
}
