import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import JwtAccessGuard from '../guards/jwt-access.guard';
import IsAdminGuard from '../guards/is-admin.guard';
import { UserController } from './user.controller';
import { UserService } from './user.service';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

const requestWithUser = (sub: number) =>
  ({ user: { sub, email: 'ann@mail.com' } }) as unknown as Request;

describe('UserController', () => {
  let controller: UserController;
  const userService = {
    getAllUsers: jest.fn(),
    getUser: jest.fn(),
    deleteUser: jest.fn(),
    updateUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userService }],
    })
      .overrideGuard(JwtAccessGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(IsAdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(UserController);
  });

  it('passes query to getAllUsers', async () => {
    const query = { page: 1, limit: 10, search: 'ann' };
    userService.getAllUsers.mockResolvedValue([]);

    await expect(controller.getAll(query)).resolves.toEqual([]);
    expect(userService.getAllUsers).toHaveBeenCalledWith(query);
  });

  it('reads sub from the request on my-info', async () => {
    const user = { id: 4, login: 'ann' };
    userService.getUser.mockResolvedValue(user);

    await expect(controller.getMyInfo(requestWithUser(4))).resolves.toEqual(
      user,
    );
    expect(userService.getUser).toHaveBeenCalledWith(4);
  });

  it('reads sub from the request on delete', async () => {
    userService.deleteUser.mockResolvedValue({ success: true });

    await expect(controller.deleteMyAcc(requestWithUser(4))).resolves.toEqual({
      success: true,
    });
    expect(userService.deleteUser).toHaveBeenCalledWith(4);
  });

  it('reads sub and body on update', async () => {
    const dto = { age: 21 };
    const updated = { id: 4, age: 21 };
    userService.updateUser.mockResolvedValue(updated);

    await expect(
      controller.updateMyAcc(requestWithUser(4), dto),
    ).resolves.toEqual(updated);
    expect(userService.updateUser).toHaveBeenCalledWith(4, dto);
  });
});
