const db = require("./DBConnection");

class DBClient {

    static async all(query) {
        return new Promise((resolve, reject) => {
            db.query(query, (err, result, next) => {
                if (err) {
                    reject(err.message);
                } else {
                    resolve(result);
                }
            })
        });
    }

    static async one(query) {
        return new Promise((resolve, reject) => {
            db.query(query, (err, result, next) => {
                if (err) {
                    reject(err.message);
                } else {
                    resolve(result[0]);
                }
            })
        });
    }

    static async query(query) {
        return new Promise((resolve, reject) => {
            db.query(query, (err, result, next) => {
                if (err) {
                    reject(err.message);
                } else {
                    resolve(result);
                }
            })
        });
    }

}

module.exports = DBClient;