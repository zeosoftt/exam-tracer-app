/**
 * Permission Seed Data
 * 
 * Creates default permissions, roles, and role-permission mappings
 * Run this after initial migration
 */
/* eslint-disable no-console */

import { prisma } from '@/lib/db/prisma';

// ============================================================================
// PERMISSIONS
// ============================================================================

const PERMISSIONS = [
  // User Management
  { code: 'USER_VIEW', name: 'View Users', category: 'USER' },
  { code: 'USER_CREATE', name: 'Create Users', category: 'USER' },
  { code: 'USER_UPDATE', name: 'Update Users', category: 'USER' },
  { code: 'USER_DELETE', name: 'Delete Users', category: 'USER' },
  { code: 'USER_ASSIGN_ROLE', name: 'Assign Roles to Users', category: 'USER' },

  // Exam Management
  { code: 'EXAM_VIEW', name: 'View Exams', category: 'EXAM' },
  { code: 'EXAM_CREATE', name: 'Create Exams', category: 'EXAM' },
  { code: 'EXAM_UPDATE', name: 'Update Exams', category: 'EXAM' },
  { code: 'EXAM_DELETE', name: 'Delete Exams', category: 'EXAM' },
  { code: 'EXAM_ASSIGN', name: 'Assign Exams', category: 'EXAM' },
  { code: 'EXAM_PUBLISH', name: 'Publish Exams', category: 'EXAM' },

  // Student Management
  { code: 'STUDENT_VIEW', name: 'View Students', category: 'STUDENT' },
  { code: 'STUDENT_CREATE', name: 'Create Students', category: 'STUDENT' },
  { code: 'STUDENT_UPDATE', name: 'Update Students', category: 'STUDENT' },
  { code: 'STUDENT_DELETE', name: 'Delete Students', category: 'STUDENT' },
  { code: 'STUDENT_ASSIGN_EXAM', name: 'Assign Exams to Students', category: 'STUDENT' },

  // Progress & Reports
  { code: 'PROGRESS_VIEW', name: 'View Progress', category: 'REPORT' },
  { code: 'PROGRESS_UPDATE', name: 'Update Progress', category: 'REPORT' },
  { code: 'REPORT_VIEW', name: 'View Reports', category: 'REPORT' },
  { code: 'REPORT_EXPORT', name: 'Export Reports', category: 'REPORT' },
  { code: 'ANALYTICS_VIEW', name: 'View Analytics', category: 'REPORT' },

  // Organization Management
  { code: 'ORG_VIEW', name: 'View Organization', category: 'ORGANIZATION' },
  { code: 'ORG_UPDATE', name: 'Update Organization', category: 'ORGANIZATION' },
  { code: 'ORG_DELETE', name: 'Delete Organization', category: 'ORGANIZATION' },
  { code: 'ORG_MANAGE_MEMBERS', name: 'Manage Members', category: 'ORGANIZATION' },
  { code: 'ORG_MANAGE_ROLES', name: 'Manage Roles', category: 'ORGANIZATION' },

  // Billing
  { code: 'BILLING_VIEW', name: 'View Billing', category: 'BILLING' },
  { code: 'BILLING_MANAGE', name: 'Manage Billing', category: 'BILLING' },
  { code: 'BILLING_UPDATE_PLAN', name: 'Update Subscription Plan', category: 'BILLING' },

  // Settings
  { code: 'SETTINGS_VIEW', name: 'View Settings', category: 'SETTINGS' },
  { code: 'SETTINGS_UPDATE', name: 'Update Settings', category: 'SETTINGS' },
];

// ============================================================================
// ROLES
// ============================================================================

const ROLES = [
  {
    code: 'SYSTEM_ROLE_SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Platform owner with full system access',
    isSystem: true,
    permissions: ['*'], // All permissions
  },
  {
    code: 'SYSTEM_ROLE_ORG_ADMIN',
    name: 'Organization Admin',
    description: 'Full access within organization',
    isSystem: true,
    permissions: [
      'USER_VIEW',
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'USER_ASSIGN_ROLE',
      'EXAM_VIEW',
      'EXAM_CREATE',
      'EXAM_UPDATE',
      'EXAM_DELETE',
      'EXAM_ASSIGN',
      'EXAM_PUBLISH',
      'STUDENT_VIEW',
      'STUDENT_CREATE',
      'STUDENT_UPDATE',
      'STUDENT_DELETE',
      'STUDENT_ASSIGN_EXAM',
      'PROGRESS_VIEW',
      'PROGRESS_UPDATE',
      'REPORT_VIEW',
      'REPORT_EXPORT',
      'ANALYTICS_VIEW',
      'ORG_VIEW',
      'ORG_UPDATE',
      'ORG_MANAGE_MEMBERS',
      'ORG_MANAGE_ROLES',
      'BILLING_VIEW',
      'BILLING_MANAGE',
      'BILLING_UPDATE_PLAN',
      'SETTINGS_VIEW',
      'SETTINGS_UPDATE',
    ],
  },
  {
    code: 'SYSTEM_ROLE_TEACHER',
    name: 'Teacher',
    description: 'Can create exams and manage students',
    isSystem: true,
    isDefault: true,
    permissions: [
      'EXAM_VIEW',
      'EXAM_CREATE',
      'EXAM_UPDATE',
      'EXAM_ASSIGN',
      'EXAM_PUBLISH',
      'STUDENT_VIEW',
      'STUDENT_ASSIGN_EXAM',
      'PROGRESS_VIEW',
      'PROGRESS_UPDATE',
      'REPORT_VIEW',
      'ANALYTICS_VIEW',
      'SETTINGS_VIEW',
    ],
  },
  {
    code: 'SYSTEM_ROLE_STUDENT',
    name: 'Student',
    description: 'Can view assigned exams and own progress',
    isSystem: true,
    isDefault: true,
    permissions: [
      'EXAM_VIEW',
      'PROGRESS_VIEW',
      'PROGRESS_UPDATE', // Can update own progress
    ],
  },
  {
    code: 'SYSTEM_ROLE_PARENT',
    name: 'Parent',
    description: 'Can view child progress and reports',
    isSystem: true,
    permissions: [
      'STUDENT_VIEW',
      'PROGRESS_VIEW',
      'REPORT_VIEW',
    ],
  },
];

// ============================================================================
// FEATURES
// ============================================================================

const FEATURES = [
  // Freemium: sadece temel takip (dashboard, ilerleme) — ek feature kodu yok, varsayılan erişim
  { code: 'ADVANCED_ANALYTICS', name: 'Gelişmiş Analitik', category: 'ANALYTICS' },
  { code: 'API_ACCESS', name: 'API Erişimi', category: 'API' },
  { code: 'EXPORT_CSV', name: 'CSV Dışa Aktarma', category: 'EXPORT' },
  { code: 'EXPORT_PDF', name: 'PDF Dışa Aktarma', category: 'EXPORT' },
  { code: 'CUSTOM_BRANDING', name: 'Özel Marka', category: 'BRANDING' },
  { code: 'PRIORITY_SUPPORT', name: 'Öncelikli Destek', category: 'SUPPORT' },
  { code: 'WHITE_LABEL', name: 'White Label', category: 'BRANDING' },
];

// ============================================================================
// PLANS — Freemium (FREE) vs Premium (PRO/ENTERPRISE)
// ============================================================================
// FREE = Sadece temel takip (sınav listesi, konu ilerlemesi, basit dashboard)
// PRO  = Temel takip + raporlar, dışa aktarma, gelişmiş analitik (ödeme gerekli)
// ============================================================================

const PLANS = [
  {
    code: 'FREE',
    name: 'Ücretsiz (Freemium)',
    description: 'Sadece temel takip: sınav listesi, konu ilerlemesi ve basit dashboard.',
    type: 'FREE' as const,
    price: null,
    maxUsers: 1,
    maxExams: 3,
    maxStudents: 10,
    maxStorage: 100, // MB
    trialDays: 0,
    features: [], // Premium özellik yok — sadece temel takip
  },
  {
    code: 'PRO',
    name: 'Premium',
    description: 'Temel takip + raporlar, CSV/PDF dışa aktarma ve gelişmiş analitik.',
    type: 'PRO' as const,
    price: 29.99,
    maxUsers: 1,
    maxExams: 50,
    maxStudents: 100,
    maxStorage: 1000, // MB
    trialDays: 14,
    features: ['ADVANCED_ANALYTICS', 'EXPORT_CSV', 'EXPORT_PDF'],
  },
  {
    code: 'ENTERPRISE',
    name: 'Kurumsal',
    description: 'Tüm özellikler: API, özel marka, öncelikli destek.',
    type: 'ENTERPRISE' as const,
    price: 99.99,
    maxUsers: 100,
    maxExams: 1000,
    maxStudents: 10000,
    maxStorage: null, // Unlimited
    trialDays: 30,
    features: [
      'ADVANCED_ANALYTICS',
      'API_ACCESS',
      'EXPORT_CSV',
      'EXPORT_PDF',
      'CUSTOM_BRANDING',
      'PRIORITY_SUPPORT',
      'WHITE_LABEL',
    ],
  },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

export async function seedPermissions() {
  console.log('🌱 Seeding permissions...');

  // Create permissions
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {
        name: perm.name,
        category: perm.category,
        isSystem: true,
      },
      create: {
        code: perm.code,
        name: perm.name,
        category: perm.category,
        isSystem: true,
      },
    });
  }

  console.log(`✅ Created ${PERMISSIONS.length} permissions`);
}

export async function seedRoles() {
  console.log('🌱 Seeding roles...');

  // Create roles
  for (const roleData of ROLES) {
    const role = await prisma.role.upsert({
      where: { code: roleData.code },
      update: {
        name: roleData.name,
        description: roleData.description,
        isSystem: roleData.isSystem,
        isDefault: roleData.isDefault ?? false,
      },
      create: {
        code: roleData.code,
        name: roleData.name,
        description: roleData.description,
        isSystem: roleData.isSystem,
        isDefault: roleData.isDefault ?? false,
        organizationId: null, // System roles
      },
    });

    // Assign permissions to role
    if (roleData.permissions.includes('*')) {
      // Super admin gets all permissions
      const allPermissions = await prisma.permission.findMany({
        where: { deletedAt: null },
      });
      for (const perm of allPermissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: perm.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: perm.id,
          },
        });
      }
    } else {
      // Assign specific permissions
      for (const permCode of roleData.permissions) {
        const permission = await prisma.permission.findUnique({
          where: { code: permCode },
        });
        if (permission) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id,
              },
            },
            update: {},
            create: {
              roleId: role.id,
              permissionId: permission.id,
            },
          });
        }
      }
    }
  }

  console.log(`✅ Created ${ROLES.length} roles with permissions`);
}

export async function seedFeatures() {
  console.log('🌱 Seeding features...');

  for (const feature of FEATURES) {
    await prisma.feature.upsert({
      where: { code: feature.code },
      update: {
        name: feature.name,
        category: feature.category,
        isSystem: true,
      },
      create: {
        code: feature.code,
        name: feature.name,
        category: feature.category,
        isSystem: true,
      },
    });
  }

  console.log(`✅ Created ${FEATURES.length} features`);
}

export async function seedPlans() {
  console.log('🌱 Seeding plans...');

  for (const planData of PLANS) {
    const plan = await prisma.plan.upsert({
      where: { code: planData.code },
      update: {
        name: planData.name,
        description: planData.description,
        type: planData.type,
        price: planData.price,
        maxUsers: planData.maxUsers,
        maxExams: planData.maxExams,
        maxStudents: planData.maxStudents,
        maxStorage: planData.maxStorage,
        trialDays: planData.trialDays,
      },
      create: {
        code: planData.code,
        name: planData.name,
        description: planData.description,
        type: planData.type,
        price: planData.price,
        maxUsers: planData.maxUsers,
        maxExams: planData.maxExams,
        maxStudents: planData.maxStudents,
        maxStorage: planData.maxStorage,
        trialDays: planData.trialDays,
      },
    });

    // Assign features to plan
    for (const featureCode of planData.features) {
      const feature = await prisma.feature.findUnique({
        where: { code: featureCode },
      });
      if (feature) {
        await prisma.planFeature.upsert({
          where: {
            planId_featureId: {
              planId: plan.id,
              featureId: feature.id,
            },
          },
          update: {},
          create: {
            planId: plan.id,
            featureId: feature.id,
          },
        });
      }
    }
  }

  console.log(`✅ Created ${PLANS.length} plans with features`);
}

/**
 * Run all seed functions
 */
export async function seedAll() {
  try {
    await seedPermissions();
    await seedRoles();
    await seedFeatures();
    await seedPlans();
    console.log('✅ All authorization data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding authorization data:', error);
    throw error;
  }
}
