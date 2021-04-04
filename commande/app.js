
const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const local_port = process.env.LOCAL_PORT;
const dist_port = process.env.DIST_PORT;
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');
const moment = require('moment');
const axios = require('axios');
const crypto = require('crypto');
const jsonparser = bodyparser.json();
const cors = require('cors');

axios.defaults.headers.post['Content-Type'] ='application/json;charset=utf-8';
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

const dbclient = require('./utils/DBClient');
const handler404 = require('./utils/handler404.js');
const handler405 = require('./utils/handler405.js');

app.use(cors());
app.use(function(req, res, next) {
    console.log(req.header('Origin'));
    next();
});

app.get('/', (req, res) => {
  res.send('Welcome to the LBS Commande API')
});

app.get('/commandes', async(req,res,next)=>{
    let token = '';
    if (req.query.token)
        token = req.query.token;
    else if (req.header('X-lbs-token'))
        token = req.header('X-lbs-token');
    try {
        const commandes = await dbclient.all("SELECT id, created_at, mail, montant FROM commande WHERE token = '"+token+"'");
        return res.json({
            type : "collection",
            count : commandes.length,
            commandes: commandes.map((c) => {
                return {
                    id: c.id,
                    mail_client: c.mail,
                    date_commande : c.created_at,
                    montant: c.montant
                }
            })
        });
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }

});



app.route('/commandes/:id').get(async (req, res) => {
    let token = '';
    if (req.query.token){
        token = req.query.token;
    }
    else if (req.header('X-lbs-token')){
        token = req.header('X-lbs-token');
    }else{
        return res.json({
            "error" : "pas de token"
        })
    }

    const commande = await dbclient.one("SELECT id, mail, nom, created_at, livraison, montant FROM commande WHERE id ="+"'"+req.params.id+"' AND token = '"+token+"'");
    if(commande){
        return res.json({
            type: "resource",
            commande: {
                if: commande.id,
                mail_client : commande.mail_client,
                nom_client: commande.nom_client,
                date_commande: commande.created_at,
                date_livraison: commande.livraison,
                montant: commande.montant
            }
        });
    }
});


app.post('/commandes', jsonparser, async (req, res, next) => {
    try {
        if (req.body.nom_client && req.body.mail_client && validator.isEmail(req.body.mail_client) && validator.isAscii(req.body.nom_client) && req.body.date_livraison && moment(req.body.date_livraison, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
            let newid = uuidv4();
            await dbclient.query("INSERT INTO commande (id, created_at, livraison, nom, mail) VALUES ('"+newid+"', '"+moment().format('YYYY-MM-DD HH:mm:ss')+"', '"+req.body.date_livraison+"', '"+validator.escape(req.body.nom_client)+"', '"+req.body.mail_client+"')");
            const commande = await dbclient.one("SELECT id, created_at, livraison, nom, mail, montant FROM commande WHERE id = '"+newid+"'");
            console.log(commande)
            if (commande) {
                res.set('Location', '/commandes/'+newid);
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
        }
    } catch(err) {
        next(500);
    }
}).all(handler405);



app.post('/commandes/td6', jsonparser, async (req, res, next) => {
    if (req.body.nom && validator.isAscii(req.body.nom) && req.body.mail && validator.isEmail(req.body.mail) && req.body.livraison.date && req.body.livraison.heure && moment(req.body.livraison.date+' '+req.body.livraison.heure, 'D-MM-YYYY HH:mm', true).isValid() && req.body.items) {
        let newid = uuidv4();
        let token = crypto.randomBytes(32).toString('hex');
        let montant = 0;
        await Promise.all(req.body.items.map(async (item) => {
            let uri = item.uri;
            console.log(uri)

            let response = await axios.get("http://172.19.0.1:19180" + item.uri);
            let quant = item.q;
            let nom = response.data.sandwich.nom;
            console.log(nom)
            let prix = response.data.sandwich.prix;
            montant = montant + response.data.sandwich.prix * item.q;
            console.log(montant)
            await dbclient.query("INSERT INTO item (uri, libelle, tarif, quantite, command_id) VALUES ('" + uri + "', '" + nom + "', '" + prix + "', " + quant + ", '" + newid + "')");


        }))
        console.log("m: " + montant)
        await dbclient.query("INSERT INTO commande (id, created_at, livraison, nom, mail, montant, token) VALUES ('" + newid + "', '" + moment().format('YYYY-MM-DD HH:mm:ss') + "', '" + moment(req.body.livraison.date + ' ' + req.body.livraison.heure, 'D-MM-YYYY HH:mm', true).format('YYYY-MM-DD HH:mm:ss') + "', '" + validator.escape(req.body.nom) + "', '" + req.body.mail + "', " + montant + ", '" + token + "')");
        const items = await dbclient.all("SELECT uri, libelle, tarif, quantite FROM item WHERE command_id = '" + newid + "'");
        const commande = await dbclient.one("SELECT id, created_at, livraison, nom, mail, montant, token, status FROM commande WHERE id = '" + newid + "'");
        let itemResult = []
        items.forEach((i) => {
            itemResult.push({
                item: {
                    uri: i.uri,
                    nom: i.libelle,
                    prix: parseFloat(i.tarif),
                    quantite: i.quantite
                }
            })
        })
        console.log(items)
        if (items && commande) {
            res.set('Location', '/commandes/' + newid);
            return res.status(201).json({
                type: 'resource',
                links: {
                    self: '/commandes/' + newid,
                    items: '/commandes/' + newid + '/items',
                },
                commande: {
                    id: commande.id,
                    livraison: moment(commande.livraison, 'YYYY-MM-DD HH:mm:ss', true).format('DD-MM-YYYY HH:mm:ss'),
                    nom: commande.nom,
                    mail: commande.mail,
                    status: commande.status,
                    montant: montant,
                    token: commande.token,
                    items: itemResult
                }
            });
        }
    }else{
        return next(500)
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

