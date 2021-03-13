const { BadRequestError } = require("../expressError");


// Function that creates SQL SET command and VALUES. 
// Transforms data from JS camel case to SQL form.
// 
// accepts dataToUpdate , jsToSQL
//
// dataToUpdate { firstName: 'Aliya', age: 32 }
//
// jsToSQL { firstName: first_name }
//
// RETURNS object { setCols : SET SQL command, 
//                  values: array of values for SET command } .
//
// @example {firstName: 'Aliya', age: 32} =>
//    { setCols: '"first_name"=$1, "age"=$2',
//      values: ['Aliya', 32] }
// 

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
