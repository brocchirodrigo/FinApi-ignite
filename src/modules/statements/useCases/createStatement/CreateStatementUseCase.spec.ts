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

  it('Should be able to create withdraw in statement to user with positive balance.', async () => {
    const user = await createUser('User test', 'teste@teste.com', 'passTest');

    const { id } = user;

    await createStatementUseCase.execute({
      user_id: id as string,
      type: 'deposit' as any,
      amount: 10,
      description: 'test',
    });

    const withdrawStatement = await createStatementUseCase.execute({
      user_id: id as string,
      type: 'withdraw' as any,
      amount: 5,
      description: 'test',
    });

    expect(withdrawStatement).toHaveProperty('id');
  });

  it('Should not be able to create withdraw in statement with not positive balance.', async () => {
    const user1 = await createUser('User test', 'teste@teste.com', 'passTest');
    const user2 = await createUser('User test 1', 'teste1@teste.com', 'passTest');

    const { id: id1 } = user1;
    const { id: id2 } = user2;

    await createStatementUseCase.execute({
      user_id: id2 as string,
      type: 'deposit' as any,
      amount: 10,
      description: 'test',
    });

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: id1 as string,
        type: 'withdraw' as any,
        amount: 10,
        description: 'test',
      });
    }).rejects.toBeInstanceOf(AppError);

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: id2 as string,
        type: 'withdraw' as any,
        amount: 11,
        description: 'test',
      });
    }).rejects.toBeInstanceOf(AppError);
  });
})
