const mysql = require("mysql");
const config = require("../config/dbconfig");
const query = require("../config/query");

const db = mysql.createConnection(config);

let findUser = async (id) => {
  try {
    let results = await query.dbQuery('SELECT * FROM users WHERE id = ?',[id])
    return results;  
  } catch (err) {
    console.log(err)
  }
};

let confirmUser = async (email) => {
  console.log(email);
  try {
    let results = await query.dbQuery('UPDATE users set confirmed = ? WHERE email = ?',[1,email])
    return results;  
  } catch (err) {
    console.log(err)
  }
};


module.exports = {findUser, confirmUser}