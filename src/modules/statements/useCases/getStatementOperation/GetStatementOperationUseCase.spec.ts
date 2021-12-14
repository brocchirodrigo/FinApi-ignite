import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';

import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';

import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';

import { AppError } from '../../../../shared/errors/AppError';

import { User } from '@modules/users/entities/User';

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe('Create statement.', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepository, inMemoryStatementsRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, inMemoryStatementsRepository);
  });

  async function createUser( name: string, email: string, password: string ): Promise<User> {
    const user = await createUserUseCase.execute({
      name,
      email,
      password
    });

    return user;
  };

  it('Should be able to show itens in balance and result.', async () => {
    const user = await createUser('User test', 'teste@teste.com', 'passTest');

    const { id } = user;

    const statement = await createStatementUseCase.execute({
      user_id: id as string,
      type: 'deposit' as any,
      amount: 10,
      description: 'test deposit',
    });

    const getStatement = await getStatementOperationUseCase.execute({
      user_id: id as string,
      statement_id: statement.id as string,
    })

    expect(getStatement).toHaveProperty('id');
    expect(getStatement.type).toBe('deposit');
    expect(getStatement.amount).toBe(10);

  });

  it('Should not be able to show not exists statement or user.', async () => {
    const user = await createUser('User test', 'teste@teste.com', 'passTest');

    const { id } = user;

    const statement = await createStatementUseCase.execute({
      user_id: id as string,
      type: 'deposit' as any,
      amount: 10,
      description: 'test deposit',
    });

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: 'id' as string,
        statement_id: 'id' as string,
      });
    }).rejects.toBeInstanceOf(AppError);

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: id as string,
        statement_id: 'id' as string,
      });
    }).rejects.toBeInstanceOf(AppError);

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: 'id' as string,
        statement_id: statement.id as string,
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
