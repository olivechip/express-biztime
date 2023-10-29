const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    const results = await db.query(`SELECT * FROM invoices`);
    console.log(results);
})

module.exports = router;