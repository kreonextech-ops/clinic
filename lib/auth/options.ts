import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase/client';
import { parsePermissions } from '@/lib/auth/permissions';

export const authOptions: NextAuthOptions = {
  secret:
    process.env.NEXTAUTH_SECRET ||
    'c4a37ee3fbac7b5a2fd29053fe4364f6fb31fff7615fa32b665ff2425480b89dfea41fed5036b21b',
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
          // 1. Check owner account first via Supabase HTTPS REST API
          const { data: owner, error: ownerErr } = await supabase
            .from('users')
            .select('*')
            .ilike('username', inputUsername)
            .maybeSingle();

          if (ownerErr) {
            console.error('Supabase auth user query error:', ownerErr);
          }

          if (owner) {
            const valid = await bcrypt.compare(credentials.password, owner.password_hash);
            if (!valid) return null;

            return {
              id: `owner-${owner.id}`,
              userId: owner.id,
              name: owner.doctor_name,
              email: owner.email ?? undefined,
              username: owner.username,
              clinicName: owner.clinic_name,
              doctorName: owner.doctor_name,
              logoUrl: owner.logo_url || null,
              role: 'owner',
              permissions: {},
              staffId: null,
            };
          }

          // 2. Check staff accounts
          const { data: member, error: staffErr } = await supabase
            .from('staff')
            .select('*')
            .ilike('username', inputUsername)
            .maybeSingle();

          if (staffErr) {
            console.error('Supabase auth staff query error:', staffErr);
          }

          if (!member || !member.is_active) return null;

          const valid = await bcrypt.compare(credentials.password, member.password_hash);
          if (!valid) return null;

          // Get clinic info from owner record
          let ownerRecord: any = null;
          if (member.user_id) {
            const { data } = await supabase
              .from('users')
              .select('id, clinic_name, logo_url')
              .eq('id', member.user_id)
              .maybeSingle();
            ownerRecord = data;
          }

          return {
            id: `staff-${member.id}`,
            userId: ownerRecord?.id || 1,
            name: member.display_name,
            email: undefined,
            username: member.username,
            clinicName: ownerRecord?.clinic_name || 'Dental Clinic',
            doctorName: member.display_name,
            logoUrl: ownerRecord?.logo_url || null,
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
