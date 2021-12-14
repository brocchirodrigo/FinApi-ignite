import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';

import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from './CreateStatementUseCase';

import { AppError } from '../../../../shared/errors/AppError';

import { User } from '@modules/users/entities/User';

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe('Create statement.', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createStatementUseCase = new CreateStatementUseCase(usersRepository, inMemoryStatementsRepository)
  });

  async function createUser( name: string, email: string, password: string ): Promise<User> {
    const user = await createUserUseCase.execute({
      name,
      email,
      password
    });

    return user;
  }

  it('Should be able to create deposit statement to user.', async () => {
    const user = await createUser('User test', 'teste@teste.com', 'passTest');

    const { id } = user;

    const depositStatement = await createStatementUseCase.execute({
      user_id: id as string,
      type: 'deposit' as any,
      amount: 10,
      description: 'test',
    });

    expect(depositStatement).toHaveProperty('id');
  });

  it('Should not be able to create deposit statement to user not exists.', async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: 'id' as string,
        type: 'deposit' as any,
        amount: 10,
        description: 'test',
      });
    }).rejects.toBeInstanceOf(AppError);
  });
})
