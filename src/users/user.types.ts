import { Prisma } from '../generated/prisma/client';

export type PublicUser = Prisma.UserGetPayload<{
  omit: {
    deletedAt: true;
    password: true;
    session: true;
    balance: true;
  };
}>;
