import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      userId: number;
      username: string;
      clinicName: string;
      doctorName: string;
      logoUrl: string | null;
      role: string;
      permissions: any;
      staffId?: number | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    userId: number;
    username: string;
    clinicName: string;
    doctorName: string;
    logoUrl: string | null;
    role: string;
    permissions: any;
    staffId?: number | null;
  }
}
