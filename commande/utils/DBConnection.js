const mysql = require('mysql');

const ENV = process.env.ENV;

const DB_HOST = process.env.MYSQL_HOST;
const DB_USER = process.env.MYSQL_USER;
const DB_PWD = process.env.MYSQL_PASSWORD;
const DB_NAME = process.env.MYSQL_DATABASE;


const db = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PWD,
    database: DB_NAME
});

db.connect(function (err) {

    if (err) throw err;

    console.log(`Connection to DB "${DB_NAME}"`);

});


module.exports = db;