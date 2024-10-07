import { Role } from "@prisma/client";

type BaseUserInput = {
    username: string;
    password: string;
    role: Role;
  };
  
type FullUserInput = BaseUserInput & {
    name: string;
    last_name: string;
    phone_number: string;
  };
  
export type CreateUserInput = BaseUserInput | FullUserInput;