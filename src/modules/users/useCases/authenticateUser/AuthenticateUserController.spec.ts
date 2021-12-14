import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Integration - Authenticate user.', () => {
  async function createUser(
    name: string = 'User test',
    email: string = 'teste@teste.com',
    password: string = 'passTest'
  ): Promise<void> {
     await request(app).post('/api/v1/users').send({
      name,
      email,
      password,
    });
  };

  beforeAll(async () => {
    connection = await createConnection('localhost');
    await connection.runMigrations();
    await createUser();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to authenticate user.', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: "teste@teste.com",
      password: "passTest"
    });

    expect(response.body).toHaveProperty('token');
  });


  it('Should not be able to authenticate user with login error.', async () => {
    const responseError = await request(app).post('/api/v1/sessions').send({
      email: "error@teste.com",
      password: "errorPass"
    });

    expect(responseError.statusCode).toBe(401);
    expect(responseError.body).toMatchObject({
      message: "Incorrect email or password"
    });
  });
});
