import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Integration - Get user balance.', () => {
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

  it('Should be able to get balance user.', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: "teste@teste.com",
      password: "passTest"
    });

    const { token } = response.body;

    await request(app)
      .post('/api/v1/statements/deposit')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 10,
	      description: "teste deposit"
      });

    await request(app)
      .post('/api/v1/statements/withdraw')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 5,
	      description: "teste withdraw"
      });

    const balance = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(balance.body).toHaveProperty('statement');
    expect(balance.body.balance).toBe(5);
    expect(balance.body.statement.length).toBe(2);
    expect(balance.statusCode).toBe(200);
  });

  it('Should not be able to request balance with not registered user .', async () => {
    const balance = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${'token'}`,
      });

    expect(balance.statusCode).toBe(401);
    expect(balance.body).toMatchObject({
      message: "JWT invalid token!"
    });
  });
});
