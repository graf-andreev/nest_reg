import { Prisma } from '@app/prisma/generated/prisma/client';

export type PublicUser = Prisma.UserGetPayload<{
  omit: {
    deletedAt: true;
    password: true;
    session: true;
    balance: true;
  };
}>;
