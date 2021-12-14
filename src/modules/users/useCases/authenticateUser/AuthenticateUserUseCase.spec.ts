import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';
import { AppError } from '../../../../shared/errors/AppError';

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('Authenticate user.', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  })

  it('Should be able to authenticate user.', async () => {
    await createUserUseCase.execute({
      name: 'User test',
      email: 'teste@test.com',
      password: 'passTest'
    });

    const authResponse = await authenticateUserUseCase.execute({
      email: 'teste@test.com',
      password: 'passTest'
    });

    expect(authResponse).toHaveProperty('token')
  });

  it('Should not be able to open session to user with incorrect password.', async () => {
    await createUserUseCase.execute({
      name: 'User test',
      email: 'teste@test.com',
      password: 'passTest'
    });

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'teste@test.com',
        password: 'passTestError'
      });
    }).rejects.toBeInstanceOf(AppError);
  });
})
