const request = require('supertest');
const app = require('../app');
const db = require('../db');

process.env.NODE_ENV = 'test';

let testUser;

beforeEach(async function(){
    // console.log('inserting data');
    const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) 
    RETURNING code, name, description`, ['OYBP', 'OliveYouByPearl', 'handmade craft goods']);
    testUser = results.rows[0];
    // console.log('completed data entry');
})

afterEach(async function(){
    // console.log('deleting data');
    await db.query(`DELETE FROM companies`);
    // console.log('completed data removal');
})

afterAll(async function(){
    // console.log('ending db connection')
    await db.end();
})

describe('GET routes', function(){
    test('should return all companies', async function(){
        console.log('starting test');
        const results = await request(app).get('/companies');
        expect(results.statusCode).toBe(200);
        expect(results.body).toEqual({companies: [testUser]});
    });
});

