"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/jobs");

const jobNewSchema = require("../schemas/jobsNew.json");
const jobFilter = require("../schemas/jobFilter.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();




/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id , title, salary, equity, companyHandle }
 *
 * Authorization required: login
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});


/** GET /  =>
 *   { job: [ { id, title, salary, equity, companyHandle }, ...] }
 *
 * Can filter on provided search filters:
 * - equity (true or false)
 * - minSalary
 * - title (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */


router.get("/", async function (req, res, next) {
  try {
    let filters = req.query;

    if (filters.minSalary !== undefined) filters.minSalary = Number(filters.minSalary);
    if (filters.equity === 'true') filters.equity = true;
    if (filters.equity === 'false') filters.equity = false;
    
    
    const validator = jsonschema.validate(filters, jobFilter);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const jobs = await Job.findAll(filters);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});


/** GET /[id]  =>  { job }
 *
 *  Job is { id, title, salary, equity }
 *   where company is [{ handle, name, desc, numEmployees, logoURL }, ...]
 *
 * Authorization required: none
 */



router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});



/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { salary, equity, title }
 *
 * Returns { title, salary, equity, id, company }
 *
 * Authorization required: login
 */


router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {

    if (req.body.salary !== undefined)req.body.salary = Number(req.body.salary);

    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: Admin
 */



router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;