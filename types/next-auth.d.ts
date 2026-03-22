/**
 * NextAuth Type Extensions
 */

import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      // DEPRECATED: Legacy fields (kept for backward compatibility)
      role?: string;
      institutionId?: string | null;
      // NEW: Multi-tenant support
      activeOrganizationId?: string | null;
      emailVerified?: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    emailVerified?: boolean;
    // DEPRECATED: Legacy fields (kept for backward compatibility)
    role?: string;
    institutionId?: string | null;
    // NEW: Multi-tenant support
    activeOrganizationId?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email?: string;
    emailVerified?: boolean;
    // DEPRECATED: Legacy fields (kept for backward compatibility)
    role?: string;
    institutionId?: string | null;
    // NEW: Multi-tenant support
    activeOrganizationId?: string | null;
  }
}
