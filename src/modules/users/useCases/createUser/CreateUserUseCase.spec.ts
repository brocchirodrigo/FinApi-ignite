import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { CreateUserUseCase } from './CreateUserUseCase';
import { AppError } from '../../../../shared/errors/AppError';

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create new user.', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  })

  it('Should be able to create new user', async () => {
    const newUser = await createUserUseCase.execute({
      name: 'User test',
      email: 'teste@test.com',
      password: 'passTest'
    });

    expect(newUser).toHaveProperty('id');
  });

  it('Should not be able to create new user with same email', async () => {
    await createUserUseCase.execute({
      name: 'User test',
      email: 'teste@test.com',
      password: 'passTest'
    });

    expect(async () => {
      await createUserUseCase.execute({
        name: 'User test',
        email: 'teste@test.com',
        password: 'passTest'
      });
    }).rejects.toBeInstanceOf(AppError);
  });
})
