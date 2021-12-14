import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Integration - Create User.', () => {
  beforeAll(async () => {
    connection = await createConnection('localhost');
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to create user.', async () => {
    const response = await request(app).post('/api/v1/users').send({
      name: "Rodrigo",
      email: "rodrigo.brocchi@gmail.com",
      password: "admin"
    });

    expect(response.statusCode).toBe(201);
  });


  it('Should not be able to create user with same email.', async () => {
    await request(app).post('/api/v1/users').send({
      name: "Rodrigo",
      email: "rodrigo.brocchi@gmail.com",
      password: "admin"
    });

    const responseError = await request(app).post('/api/v1/users').send({
      name: "Rodrigo",
      email: "rodrigo.brocchi@gmail.com",
      password: "admin"
    });

    expect(responseError.statusCode).toBe(400);
    expect(responseError.body).toMatchObject({
      message: "User already exists"
    });
  });
});
