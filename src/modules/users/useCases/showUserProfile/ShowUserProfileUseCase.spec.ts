import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';
import { AppError } from '../../../../shared/errors/AppError';

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Show profile user.', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  })

  it('Should be able to show user profile.', async () => {
    const user = await createUserUseCase.execute({
      name: 'User test',
      email: 'teste@test.com',
      password: 'passTest'
    });

    const { id } = user;

    const showProfileResponse = await showUserProfileUseCase.execute( id as string );

    expect(showProfileResponse.name).toBe('User test');
  });

  it('Should not be able to show profile on not recognized id.', async () => {
    expect(async () => {
      await showUserProfileUseCase.execute( '' )
    }).rejects.toBeInstanceOf(AppError);
  });
})
