const express = require('express');
const router = express.Router();

const Sandwich = require('../models/Sandwich');
const Category = require('../models/Category');

const handler404 = require("../utils/handler404");
const handler405 = require("../utils/handler405");

router.get('/', async (req, res, next) => {

    try {
        let sand = await Sandwich.find({})
        let sandRes = []
        sand.forEach((s)=>{
            if(req.query.t){
                if(s.type_pain.includes(req.query.t)){
                    sandRes.push({
                        sandwich: {
                            ref:s.ref,
                            nom:s.nom,
                            type_pain:s.type_pain,
                            prix: parseFloat(s.prix)
                        },
                        links:{
                            self:{
                                href: "/sandwichs/" + s.ref
                            }
                        }
                    })
                }
            }else{
                sandRes.push({
                    sandwich: {
                        ref:s.ref,
                        nom:s.nom,
                        type_pain:s.type_pain,
                        prix: parseFloat(s.prix)
                    },
                    links:{
                        self:{
                            href: "/sandwichs/" + s.ref
                        }
                    }
                })
            }
        })

        let nb = 10
        if(req.query.size){
            nb = req.query.size
        }
        let sandPage= []
        let page = 1
        if(req.query.page){
            if(req.query.page<1){
                page=1
            }else{
                page=req.query.page
            }
            let compteurDeb = (page*nb)-(nb-1)
            console.log(compteurDeb)
            let compteurFin = page*nb+1
            console.log(compteurFin)
            for(let i = compteurDeb; i<compteurFin ; i++){
                sandPage.push(sandRes[i])
            }

            let prec
            let suiv
            if(page==1){
                prec=1
            }else{
                prec= parseInt(page-1)
            }
            if(page< Math.ceil(sandRes.length/nb)){
                suiv = Number(page)+1
            }

            return res.json({
                type: 'collection',
                count: sandRes.length,
                size: sandPage.length,
                links: {
                    next: {
                        href: '/sandwichs?page=' + suiv  + '&size=' + nb
                    },
                    prev: {
                        href: '/sandwichs?page=' + prec + '&size=' + nb
                    },
                    last: {
                        href: '/sandwichs?page=' + Math.ceil(sandRes.length/nb) + '&size=' + nb
                    },
                    first: {
                        href: '/sandwichs?page=1&size=' + nb
                    }
                },
                date: new Date().toLocaleDateString("fr"),
                sandwichs: sandPage
            });

        }else{
            return res.json({
                type:"collection",
                count: sandRes.length,
                date: new Date().toLocaleDateString("fr"),
                sandwichs: sandRes
            })

        }
        return handler404(res);

    } catch (error) {
        console.error(error);
        throw new Error(error);
    }

}).all(handler405);


router.get("/:id", async (req, res, next) => {

    try{

        let sand = await Sandwich.findOne({
            ref: req.params.id
        })

        if(sand){
            let cat = await Category.find({
                nom: sand.categories
            })
            if(cat){
                return res.json({
                    type: "resource",
                    links:{
                        self: {
                            href:"/sandwichs/"+sand.ref
                        },
                        categories: {
                            href: "/sandwichs/"+sand.ref+"/categories"
                        }
                    },
                    sandwich: {
                        ref: sand.ref,
                        nom: sand.nom,
                        description : sand.description,
                        type_pain: sand.type_pain,
                        prix: parseFloat(sand.prix),
                        categories: cat.map((c)=>{
                            return {
                                category: {
                                    id: c.id,
                                    nom: c.nom,
                                    description: c.description
                                },
                                links: {
                                    self: {href: "/categories/"+c.id}
                                }
                            };
                        })
                    },

                });

            }
        }
        return handler404(res);
    }catch (error) {
        console.error(error);
        throw new Error(error);
    }
}).all(handler405)

module.exports = router;