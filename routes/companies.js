const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const slug = require('slugify');

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`)
        return res.json( {companies:results.rows} );
    } catch (err) {
        return next(err);
    }
})

router.get('/:code', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies WHERE code=$1`, [req.params.code]);
        if (results.rows.length === 0){
            return next();
        }
        return res.json( {company:results.rows} );
    } catch (err) {
        return next(err);
    }
})

router.post('/', async (req, res, next) => {
    try {
        if (!req.body.name || !req.body.description){
            throw new ExpressError("Name, and description are required.", 400)
        }
        const { name, description } = req.body;
        const results = await db.query(`INSERT INTO companies (code, name, description) 
        VALUES ($1, $2, $3) RETURNING code, name, description`, [slug(name, {lower: true}), name, description]);
        return res.status(201).json( {company:results.rows[0]} );
    } catch (err) {
        return next(err);
    }
})

router.put('/:code', async (req, res, next) => {
    try {
        if (!req.body.name || !req.body.description){
            throw new ExpressError("Name and description are required.", 400)
        }
        const { name, description } = req.body;
        const results = await db.query(`UPDATE companies SET name=$2, description=$3 
        WHERE code=$1 RETURNING code, name, description`, [req.params.code, name, description]);
        if (results.rows.length === 0){
            return next();
        }
        return res.json( {company:results.rows[0]} );
    } catch (err) {
        return next(err);
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
        const results = await db.query(`DELETE FROM companies WHERE code=$1 
        RETURNING code, name, description`, [req.params.code]);
        if (results.rows.length === 0){
            return next();
        }
        return res.json( {status: "deleted"} );
    } catch (err) {
        return next(err);
    }
})

module.exports = router;