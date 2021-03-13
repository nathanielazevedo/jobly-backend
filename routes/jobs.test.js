"use strict";

const request = require("supertest");


const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  testJobIds,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);



/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "j99",
    salary: "1000",
    equity: "0.1",
    company_handle: "c1",
  };

  test("ok for admin", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual(
            {
                "job": {
                    title: "j99",
                    salary: 1000,
                    equity: "0.1",
                    companyHandle: "c1",
                    id: expect.any(Number)
                }
            });
    });

    test("ok for admin", async function () {
      const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u2Token}`);
      expect(resp.statusCode).toEqual(401);
    });
    
    test("bad request with missing data", async function () {
        const resp = await request(app)
        .post("/jobs")
        .send({
            salary: "new",
            equity: 0.5,
        })
        .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
            salary: 1000,
            equity: 'dogs',
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
    });
  
    test("bad request non admin", async function () {
      const resp = await request(app).post("/jobs").send(newJob);
      expect(resp.statusCode).toEqual(401);
    });
  
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "j1",
          salary: 50,
          equity: "0.1",
          companyHandle: "c1",
          id: testJobIds[0],
        },
        {
          title: "j2",
          salary: 100,
          equity: "0.5",
          companyHandle: "c3",
          id: testJobIds[1],
        },
        {
          title: "j3",
          salary: 200,
          equity: "0",
          companyHandle: "c3",
          id: testJobIds[2],
        },
      ],
    });
  });

  test("filter by title", async function () {
    const resp = await request(app).get("/jobs").query({title: 'j1'});
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "j1",
          salary: 50,
          equity: "0.1",
          companyHandle: "c1",
          id: testJobIds[0],
        },
      ],
    });
  });

  test("filter by minSalary", async function () {
    const resp = await request(app).get("/jobs").query({minSalary: 150});
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "j3",
          salary: 200,
          equity: "0",
          companyHandle: "c3",
          id: testJobIds[2],
        },
      ],
    });
  });


  test("filter by equity", async function () {
    const resp = await request(app).get("/jobs").query({equity: 'true'});
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "j1",
          salary: 50,
          equity: "0.1",
          companyHandle: "c1",
          id: testJobIds[0],
        },
        {
          title: "j2",
          salary: 100,
          equity: "0.5",
          companyHandle: "c3",
          id: testJobIds[1],
        },
      ],
    });
  });

  test("filter by all", async function () {
    const resp = await request(app).get("/jobs").query({equity: 'true', minSalary: 100, title: 'j2'});
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "j2",
          salary: 100,
          equity: "0.5",
          companyHandle: "c3",
          id: testJobIds[1],
        },
      ],
    });
  });

  test("filter with bad data", async function () {
    const resp = await request(app).get("/jobs").query({equity: 'dog'});
    expect(resp.statusCode).toEqual(400);
  });

});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
    expect(resp.body).toEqual({
      job: {
        title: "j1",
        salary: 50,
        equity: "0.1",
        company: {
          handle: "c1",
          logoUrl: "http://c1.img",
          name: "C1",
          numEmployees: 1,
          description: "Desc1",
        },
      }});
  });


  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/jobs/9999999`);
    expect(resp.statusCode).toEqual(401);
  });


  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/999999`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for users", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          salary: 2000,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobIds[0],
        title: "j1",
        salary: 2000,
        equity: "0.1",
        companyHandle: 'c1'
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          salary: 1000,
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/55555`)
        .send({
          salary: 1000,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on salary change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          salary: "dog",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid equity data", async function () {
    const resp = await request(app)
      .patch(`/jobs/${testJobIds[0]}`)
      .send({
        equity: 999,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

    test("bad request non admin", async function () {
      const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({ salary: "dog" });
      expect(resp.statusCode).toEqual(401);
    });

});