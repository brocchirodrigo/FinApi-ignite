import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Integration - Show profile user.', () => {
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

  it('Should be able create deposito to registered user.', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: "teste@teste.com",
      password: "passTest"
    });

    const { token } = response.body;

    const profile = await request(app)
      .post('/api/v1/statements/deposit')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 10,
	      description: "teste deposit"
      });

    expect(profile.body).toHaveProperty('id');
    expect(profile.body.amount).toBe(10);
    expect(profile.statusCode).toBe(201);
  });

  it('Should not be able to create statement with not registered user .', async () => {
    const profile = await request(app)
    .post('/api/v1/statements/deposit')
    .set({
      Authorization: `Bearer ${'token'}`,
    })
    .send({
      amount: 10,
      description: "teste deposit"
    });

    expect(profile.statusCode).toBe(401);
    expect(profile.body).toMatchObject({
      message: "JWT invalid token!"
    });
  });


  it('Should be able to create withdraw to registered user with positive balance.', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: "teste@teste.com",
      password: "passTest"
    });

    const { token } = response.body;

    const profile = await request(app)
      .post('/api/v1/statements/withdraw')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 5,
	      description: "teste deposit"
      });

    expect(profile.body).toHaveProperty('id');
    expect(profile.body.amount).toBe(5);
    expect(profile.statusCode).toBe(201);
  });

  it('Should not be able to create withdraw to registered user with balance smaller than the statement.', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: "teste@teste.com",
      password: "passTest"
    });

    const { token } = response.body;

    const profile = await request(app)
      .post('/api/v1/statements/withdraw')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 10,
	      description: "teste deposit"
      });

    expect(profile.statusCode).toBe(400);
    expect(profile.body).toMatchObject({
      message: "Insufficient funds"
    });
  });

  it('Should not be able to create withdraw to registered user with no funds in the statement.', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: "teste@teste.com",
      password: "passTest"
    });

    const { token } = response.body;

    const profile = await request(app)
      .post('/api/v1/statements/withdraw')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 10,
	      description: "teste deposit"
      });

    expect(profile.statusCode).toBe(400);
    expect(profile.body).toMatchObject({
      message: "Insufficient funds"
    });
  });
});
