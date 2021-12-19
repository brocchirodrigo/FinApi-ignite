import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Integration - Get statement by id.', () => {
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

  it('Should be able to get statement by user.', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: "teste@teste.com",
      password: "passTest"
    });

    const { token } = response.body;

    const statement = await request(app)
      .post('/api/v1/statements/deposit')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 10,
	      description: "teste deposit"
      });

      const { id } = statement.body;

    const getStatement = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(getStatement.body).toHaveProperty('id');
    expect(getStatement.body.amount).toBe('10.00');
    expect(getStatement.statusCode).toBe(200);
  });

  it('Should not be able to request statement with not exists user id.', async () => {
    const statement = await request(app)
      .get(`/api/v1/statements/testeIdError`)
      .set({
        Authorization: `Bearer ${'token'}`,
      });

    expect(statement.statusCode).toBe(401);
    expect(statement.body).toMatchObject({
      message: "JWT invalid token!"
    });
  });

  it('Should not be able to request statement with not exists statement id.', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: "teste@teste.com",
      password: "passTest"
    });

    const { token } = response.body;

    const balance = await request(app)
      .get(`/api/v1/statements/testeIdError`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(balance.statusCode).toBe(500);
    expect(balance.body.status).toBe('error');
  });
});
