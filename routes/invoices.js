const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`)
        return res.json( {invoices:results.rows} );
    } catch (err) {
        return next(err);
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT id, amt, paid, add_date, paid_date, code, name, description FROM invoices JOIN companies ON invoices.comp_code=companies.code WHERE id=$1`, [req.params.id]);
        if (results.rows.length === 0){
            return next();
        }
        const data = results.rows[0];
        const invoice = {
            id: data.id,
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date,
            company: {
                code: data.code,
                name: data.name,
                description: data.description
            }
        }
        return res.json( {invoice: invoice} );
    } catch (err) {
        return next(err);
    }
})

router.post('/', async (req, res, next) => {
    try {
        if (!req.body.comp_code || !req.body.amt){
            throw new ExpressError("comp_code and amt are required.", 400)
        }
        const { comp_code, amt } = req.body;
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) 
        VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);
        return res.status(201).json( {invoice: results.rows[0]} );
    } catch (err) {
        return next(err);
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        if (!req.body.amt){
            throw new ExpressError("amt is required.", 400)
        }
        const { amt } = req.body;
        const results = await db.query(`UPDATE invoices SET amt=$2 WHERE id=$1 
        RETURNING id, comp_code, amt, paid, add_date, paid_date`, [req.params.id, amt]);
        if (results.rows.length === 0){
            return next();
        }
        return res.json( {invoice: results.rows[0]} );
    } catch (err) {
        return next(err);
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const results = await db.query(`DELETE FROM invoices WHERE id=$1`, [req.params.id]);
        if (results.rows.length === 0){
            return next();
        }
        return res.json( {status: "deleted"} );
    } catch (err) {
        return next(err);
    }
})

module.exports = router;