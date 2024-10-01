import { getUser } from '@/app/lib/data/user';
import bcrypt from 'bcrypt';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { authConfig } from './auth.config';

export const authOptions = {
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        console.log('credentials------------------------------------------------------------------------------------------------');
        
        // Validate the credentials
        const parsedCredentials = z
          .object({ username: z.string(), password: z.string().min(6) })
          .safeParse(credentials);
        if (!parsedCredentials.success) return null;

        // Get the user from the database and check the password
        const { username, password } = parsedCredentials.data;
        const user = await getUser(username);

        if (!user) return null;
        
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) return user;

        return null;
      },
    }),
  ],
};