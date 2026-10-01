import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from './user.service';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

describe('UserService', () => {
  let service: UserService;
  const prisma = {
    user: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(UserService);
  });

  describe('getAllUsers', () => {
    it('uses default page and limit and skips deleted users', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      await service.getAllUsers({});

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        skip: 0,
        take: 10,
        omit: { deletedAt: true, password: true, session: true },
      });
    });

    it('applies skip and take from page and limit', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      await service.getAllUsers({ page: 2, limit: 5 });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
    });

    it('filters by login when search is set', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      await service.getAllUsers({ search: 'ann' });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            deletedAt: null,
            OR: [
              {
                login: {
                  contains: 'ann',
                  mode: 'insensitive',
                },
              },
            ],
          },
        }),
      );
    });
  });

  describe('getUser', () => {
    it('loads a non-deleted user without password and session', async () => {
      const user = { id: 1, login: 'ann' };
      prisma.user.findFirst.mockResolvedValue(user);

      await expect(service.getUser(1)).resolves.toEqual(user);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 1, deletedAt: null },
        omit: { password: true, session: true },
      });
    });
  });

  describe('deleteUser', () => {
    it('soft-deletes and clears session', async () => {
      prisma.user.update.mockResolvedValue({});

      await expect(service.deleteUser(9)).resolves.toEqual({ success: true });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 9 },
        data: {
          deletedAt: expect.any(Date),
          session: null,
        },
      });
    });
  });

  describe('updateUser', () => {
    it('patches only provided fields', async () => {
      const dto = { about: 'hello' };
      const updated = { id: 3, about: 'hello' };
      prisma.user.update.mockResolvedValue(updated);

      await expect(service.updateUser(3, dto)).resolves.toEqual(updated);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: dto,
        omit: { password: true, session: true },
      });
    });
  });

  describe('create', () => {
    it('hashes the password before insert', async () => {
      const dto = {
        login: 'ann',
        email: 'ann@mail.com',
        password: 'secret123',
        age: 21,
        about: 'hi',
      };
      prisma.user.create.mockResolvedValue({ id: 1, ...dto });

      await service.create(dto);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          login: 'ann',
          email: 'ann@mail.com',
          password: expect.not.stringMatching('secret123'),
          age: 21,
          about: 'hi',
        },
      });
      const savedPassword = prisma.user.create.mock.calls[0][0].data.password;
      expect(savedPassword).not.toBe(dto.password);
      expect(savedPassword.startsWith('$2')).toBe(true);
    });
  });
});
