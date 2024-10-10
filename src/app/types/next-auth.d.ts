import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    username: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      username: string;
      role: string;
    };
  }

  interface JWT {
    id: string;
    name: string;
    username: string;
    role: string;
  }
}