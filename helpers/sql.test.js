const { sqlForPartialUpdate } = require("./sql");

describe("use sqlForPartialUpdate", function () {
    test("returns proper data", function () {
      
    let data = {
        firstName: 'James',
        lastName: 'Franky'
      }
      const result = sqlForPartialUpdate(
        data, {
            firstName: "first_name",
            lastName: "last_name",
            isAdmin: "is_admin",
        });
    
    expect(result).toEqual({
      setCols: `"first_name"=$1, "last_name"=$2`,
      values: ["James", "Franky"],
    });
  });

});