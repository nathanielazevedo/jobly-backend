"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./jobs.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);
console.log(testJobIds)

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "j9",
    salary: 1000,
    equity: "0.1",
    company_handle: 'c1',
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      companyHandle: "c1",
      equity: "0.1",
      salary: 1000,
        title: "j9",
      id: expect.any(Number)
    });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'j9'`);
    expect(result.rows).toEqual([
      {
        company_handle: "c1",
        equity: "0.1",
        salary: 1000,
        title: "j9",
      },
    ]);
  });
    
    test("bad request with dupe", async function () {
    try {
        await Job.create(newJob);
        await Job.create(newJob);
        
    } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
    }
    });

});


/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
      let jobs = await Job.findAll();
    
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        companyHandle: "c1",
        equity: "0.1",
        salary: 100,
        title: "j1",
      },
      {
        id: testJobIds[1],
        companyHandle: "c1",
        equity: "0.2",
        salary: 200,
        title: "j2",
      },
      {
        id: testJobIds[2],
        companyHandle: "c1",
        equity: "0",
        salary: null,
        title: "j3",
      },
    ]);
  });

  test("works: filter by title", async function () {
    const filter = {
      title: 'j1'
    }

    let jobs = await Job.findAll(filter);
    
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        companyHandle: "c1",
        equity: "0.1",
        salary: 100,
        title: "j1",
      },
    ]);
  });

  test("works: filter by minSalary", async function () {
    const filter = {
      minSalary: 150
    }

    let jobs = await Job.findAll(filter);
    
    expect(jobs).toEqual([
      {
        id: testJobIds[1],
        companyHandle: "c1",
        equity: "0.2",
        salary: 200,
        title: "j2",
      },
    ]);
  });

  test("works: filter by equity", async function () {
    const filter = {
      equity: 'true'
    }

    let jobs = await Job.findAll(filter);
    
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        companyHandle: "c1",
        equity: "0.1",
        salary: 100,
        title: "j1",
      },
      {
        id: testJobIds[1],
        companyHandle: "c1",
        equity: "0.2",
        salary: 200,
        title: "j2",
      },
    ]);
  });


  test("works: filter by all", async function () {
    const filter = {
      equity: 'true',
      minSalary: 100,
      title: 'j2'
    }

    let jobs = await Job.findAll(filter);
    
    expect(jobs).toEqual([
      {
        id: testJobIds[1],
        companyHandle: "c1",
        equity: "0.2",
        salary: 200,
        title: "j2",
      },
    ]);
  });

});


/************************************** get */


describe("get", function () {
  test("works", async function () {
    let job = await Job.get(testJobIds[0]);
    expect(job).toEqual({
      
        title: "j1",
        salary: 100,
        equity: "0.1",
        company: {
          handle: "c1",
          logoUrl: "http://c1.img",
          name: "C1",
          numEmployees: 1,
          description: "Desc1",
        },
      
    });
  });

  test("not found if no such company", async function () {
    try {
      await Job.get(99999);
      
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  
  const updateData = {
    title: "Accountant",
    equity: "0.3",
    salary: 10
  };

  test("works", async function () {
      
    let job = await Job.update(testJobIds[0], updateData);
    expect(job).toEqual({
        companyHandle: "c1",
        id: testJobIds[0],
      ...updateData,
    });

    const result = await db.query(
          `SELECT id, title, equity, salary, company_handle
           FROM jobs
           WHERE id = ${testJobIds[0]}`);
    expect(result.rows).toEqual([{
      title: "Accountant",
      equity: "0.3",
      salary: 10,
      company_handle: "c1",
      id: testJobIds[0]
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(55, {
        salary: 1000,
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

});


/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(testJobIds[0]);
    const res = await db.query(
        `SELECT title FROM jobs WHERE id=${testJobIds[0]}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(999999999);
      
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});