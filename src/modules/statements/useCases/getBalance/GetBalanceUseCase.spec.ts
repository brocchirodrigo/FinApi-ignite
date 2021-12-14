import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';

import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';

import { GetBalanceUseCase } from './GetBalanceUseCase';

import { AppError } from '../../../../shared/errors/AppError';

import { User } from '@modules/users/entities/User';

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe('Create statement.', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepository, inMemoryStatementsRepository);
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, usersRepository);
  });

  async function createUser( name: string, email: string, password: string ): Promise<User> {
    const user = await createUserUseCase.execute({
      name,
      email,
      password
    });

    return user;
  }

  it('Should be able to show itens in balance and result.', async () => {
    const user = await createUser('User test', 'teste@teste.com', 'passTest');

    const { id } = user;

    await createStatementUseCase.execute({
      user_id: id as string,
      type: 'deposit' as any,
      amount: 10,
      description: 'test deposit',
    });

    await createStatementUseCase.execute({
      user_id: id as string,
      type: 'withdraw' as any,
      amount: 5,
      description: 'test withdraw',
    });

    const balance = await getBalanceUseCase.execute({user_id: id as string})

    expect(balance).toHaveProperty('statement');
    expect(balance).toHaveProperty('balance');
    expect(balance.statement.length).toBe(2);
    expect(balance.balance).toBe(5);

  });

  it('Should not be able to show balance with user not exists.', async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: 'id' as string,
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
