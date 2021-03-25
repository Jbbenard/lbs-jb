
const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const jsonparser = bodyparser.json();
const local_port = process.env.LOCAL_PORT;
const dist_port = process.env.DIST_PORT;
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');
const moment = require('moment');
const crypto = require('crypto');
const axios = require('axios');

const dbclient = require('./utils/DBClient');
const handler404 = require('./utils/handler404.js');
const handler405 = require('./utils/handler405.js');

app.get('/', (req, res) => {
  res.send('Welcome to the LBS Commande API')
});

app.get('/commandes', async(req,res,next)=>{

    const query = `SELECT id, mail, created_at, montant  FROM commande LIMIT 3`;

    try {
        const commandes = await dbclient.all(query);
        return res.json({
            type : "collection",
            count : "3",
            commandes: commandes
        });
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }

});

app.route('/commandes/:id').get(async (req, res) => {
    const commande = await dbclient.one("SELECT id, mail, nom, created_at, livraison, montant FROM commande WHERE id ="+"'"+req.params.id+"'");
    if(commande){
        return res.json({
            type: "resource",
            commande: commande
        });
    }
});


app.post('/commandes', jsonparser, async (req, res, next) => {
    try {
        // Création simpliste (cf TD3)
        if (req.body.nom_client && validator.isAscii(req.body.nom_client) && req.body.mail_client && validator.isEmail(req.body.mail_client) && req.body.date_livraison && moment(req.body.date_livraison, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
            let nouveauid = uuidv4();

            await dbclient.query("INSERT INTO commande (id, created_at, livraison, nom, mail) VALUES ('"+nouveauid+"', '"+moment().format('YYYY-MM-DD HH:mm:ss')+"', '"+req.body.date_livraison+"', '"+validator.escape(req.body.nom_client)+"', '"+req.body.mail_client+"')");
            const commande = await dbclient.one("SELECT id, created_at, livraison, nom, mail, montant FROM commande WHERE id = '"+nouveauid+"'");
            console.log(commande)
            if (commande) {
                res.set('Location', '/commandes/'+nouveauid);
                return res.status(201).json({
                    type: 'resource',
                    commande: {
                        id: commande.id,
                        mail_client: commande.mail,
                        nom_client: commande.nom,
                        date_commande: commande.created_at,
                        date_livraison: commande.livraison,
                        montant: commande.montant
                    }
                });
            }
            return handler404(res);
            // Méthode de création finale (TD6)
        }
    } catch(err) {
        next(500);
    }
}).all(handler405);




app.use(function(req, res){
    res.status(400).json({
        type: "error",
        error: 400,
        message: "Bad Request"
    });
});

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500).json({
        type: "error",
        error: 500,
        message: "Internal Server Error"
    });
});


app.listen(local_port, () => {
  console.log(`LBS Commande API listening at http://localhost:${local_port} (Dist port : ${dist_port})`)
});

