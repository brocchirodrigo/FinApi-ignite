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

  it('Should be able to authenticate user.', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: "teste@teste.com",
      password: "passTest"
    });

    const { token } = response.body;

    const profile = await request(app).get('/api/v1/profile').set({
      Authorization: `Bearer ${token}`,
    })

    expect(profile.body).toHaveProperty('id');
    expect(profile.statusCode).toBe(200);
  });

  it('Should not be able to show profile in not recognized user .', async () => {
    const profile = await request(app).get('/api/v1/profile').set({
      Authorization: `Bearer ${'token'}`,
    })

    expect(profile.statusCode).toBe(401);
    expect(profile.body).toMatchObject({
      message: "JWT invalid token!"
    });
  });
});
