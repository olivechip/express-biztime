const request = require('supertest');
const app = require('../app');
const db = require('../db');

process.env.NODE_ENV = 'test';

let testCompany;

beforeEach(async function(){
    const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) 
    RETURNING code, name, description`, ['OYBP', 'OliveYouByPearl', 'handmade craft goods']);
    testCompany = results.rows[0];
});

afterEach(async function(){
    await db.query(`DELETE FROM companies`);
});

afterAll(async function(){
    await db.end();
});

describe('GET routes', function(){
    test('Should return all companies', async function(){
        const results = await request(app).get('/companies');
        expect(results.statusCode).toBe(200);
        expect(results.body).toEqual({companies: [testCompany]});
        expect(results.body.companies).toHaveLength(1);
    });
    test('Should return 1 company', async function(){
        const results = await request(app).get(`/companies/${testCompany.code}`);
        expect(results.statusCode).toBe(200);
        expect(results.body).toEqual({company: [testCompany]});
    });
    test(`Should return 404 on nonexistent company`, async function(){
        const results = await request(app).get(`/companies/fail`);
        expect(results.statusCode).toBe(404);
    });
});

describe('POST routes', function(){
    test('Should return new company object', async function(){
        const results = await request(app).post('/companies').send({
            code: 'PETS', 
            name: 'The Pet Store', 
            description: 'Store that sells pets of all species'
        });
        expect(results.statusCode).toBe(201);
        expect(results.body.company.code).toEqual('PETS');
        expect((await request(app).get('/companies')).body.companies).toHaveLength(2);
    });
    test('Should return error if missing data', async function(){
        const results = await request(app).post('/companies').send({});
        expect(results.statusCode).toBe(400);
    });
});

describe('PUT routes', function(){
    test('Should return updated company object', async function(){
        const results = await request(app).put(`/companies/${testCompany.code}`).send({
            name: 'The Pet Store', 
            description: 'Store that sells pets of all species'
        });
        expect(results.statusCode).toBe(200);
        expect(results.body.company).toEqual({
            code: 'OYBP',
            name: 'The Pet Store', 
            description: 'Store that sells pets of all species'
        });
    });
    test(`Should return 404 on nonexistent company`, async function(){
        const results = await request(app).put(`/companies/fail`);
        expect(results.statusCode).toBe(400);
    });
    test('Should return error if missing data', async function(){
        const results = await request(app).put(`/companies/${testCompany.code}`).send({});
        expect(results.statusCode).toBe(400);
    });
});

describe('DELETE routes', function(){
    test('Should delete a company', async function(){
        const results = await request(app).delete(`/companies/${testCompany.code}`);
        expect(results.statusCode).toBe(200);
        expect(results.body.status).toEqual('deleted');
    });
});
