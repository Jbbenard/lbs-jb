
const express = require('express');
const app = express();
const cors = require('cors');

const local_port = process.env.LOCAL_PORT;
const dist_port = process.env.DIST_PORT;

const MongoDBConnection = require("./utils/MongoDBConnection");//connexion à la bdd
const index_routes = require("./routes/index_routes");
const sandwichs_routes = require("./routes/sandwichs_routes");
const categories_routes = require("./routes/categories_routes");

app.use(cors());
app.use(function(req, res, next) {
    console.log(req.header('Origin'));
    next();
});
app.use("/", index_routes);
app.use("/sandwichs", sandwichs_routes);
app.use("/categories", categories_routes);

app.listen(local_port, () => {
    console.log(`LBS Catalogue API listening at http://localhost:${local_port} (Dist port : ${dist_port})`)
});

