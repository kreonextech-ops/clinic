import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users, staff } from '@/lib/db/schema';
import { eq, ilike } from 'drizzle-orm';
import { parsePermissions } from '@/lib/auth/permissions';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'c4a37ee3fbac7b5a2fd29053fe4364f6fb31fff7615fa32b665ff2425480b89dfea41fed5036b21b',
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const inputUsername = credentials.username.trim();

        try {
          // 1. Check owner account first (case-insensitive)
          const [owner] = await db
            .select()
            .from(users)
            .where(ilike(users.username, inputUsername))
            .limit(1);

          if (owner) {
            const valid = await bcrypt.compare(credentials.password, owner.passwordHash);
            if (!valid) return null;
            return {
              id: `owner-${owner.id}`,
              userId: owner.id,
              name: owner.doctorName,
              email: owner.email ?? undefined,
              username: owner.username,
              clinicName: owner.clinicName,
              doctorName: owner.doctorName,
              logoUrl: owner.logoUrl || null,
              role: 'owner',
              permissions: {},
              staffId: null,
            };
          }

          // 2. Check staff accounts
          const [member] = await db
            .select()
            .from(staff)
            .where(ilike(staff.username, inputUsername))
            .limit(1);

          if (!member || !member.isActive) return null;

          const valid = await bcrypt.compare(credentials.password, member.passwordHash);
          if (!valid) return null;

          // Get clinic info from owner record
          const [ownerRecord] = member.userId
            ? await db.select({ id: users.id, clinicName: users.clinicName, logoUrl: users.logoUrl })
                .from(users).where(eq(users.id, member.userId)).limit(1)
            : await db.select({ id: users.id, clinicName: users.clinicName, logoUrl: users.logoUrl })
                .from(users).limit(1);

          return {
            id: `staff-${member.id}`,
            userId: ownerRecord?.id || 1,
            name: member.displayName,
            email: undefined,
            username: member.username,
            clinicName: ownerRecord?.clinicName || 'Dental Clinic',
            doctorName: member.displayName,
            logoUrl: ownerRecord?.logoUrl || null,
            role: member.role,
            permissions: parsePermissions(member.permissions),
            staffId: member.id,
          };
        } catch (err: any) {
          console.error('Auth authorize error:', err?.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.userId = (user as any).userId;
        token.username = (user as any).username;
        token.clinicName = (user as any).clinicName;
        token.doctorName = (user as any).doctorName;
        token.logoUrl = (user as any).logoUrl;
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
        token.staffId = (user as any).staffId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).userId = token.userId;
        (session.user as any).username = token.username;
        (session.user as any).clinicName = token.clinicName;
        (session.user as any).doctorName = token.doctorName;
        (session.user as any).logoUrl = token.logoUrl;
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
        (session.user as any).staffId = token.staffId;
      }
      return session;
    },
  },
};
