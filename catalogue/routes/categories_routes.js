const express = require('express');
const router = express.Router();

const Category = require("../models/Category");
const Sandwich = require("../models/Sandwich");
const handler404 = require("../utils/handler404");
const handler405 = require("../utils/handler405");


router.get('/:id', async (req, res, next) => {

    let cat = [];

    try {

        cat = await Category.findOne({
            id:req.params.id
        });

        if(cat){
            return res.json({
                type:"resource",
                date:new Date().toLocaleDateString("fr"),
                categorie:{
                    id: cat.id,
                    nom: cat.nom,
                    description: cat.description
                },
                links:{
                    self:{
                        href: "/categories/"+req.params.id
                    },
                    sandwichs:{
                        href: "/categories/"+req.params.id+"/sandwichs"
                    }

                }
            })


        }
        return handler404(res);

    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}).all(handler405);


router.get("/:id/sandwichs", async(req, res, next) => {

    let cat = [];

    try{
        cat = await Category.findOne({
            id:req.params.id
        })
        if(cat){
            sand = await Sandwich.find({
                categories: cat.nom
            })
            if(sand){
                let sandRes=[]
                sand.forEach((s) => {
                    sandRes.push({
                        sandwich:{
                            ref: s.ref,
                            nom: s.nom,
                            type_pain: s.type_pain,
                            prix: parseFloat(s.prix)
                        },
                        links: {
                            self: {href: "/sandwichs/"+s.ref},
                            categories: {href: "/sandwichs/"+s.ref+"/categories"}
                        }
                    });
                })

                return res.json({
                    type: "collection",
                    count: sandRes.length,
                    date: new Date().toLocaleDateString("fr"),
                    sandwichs: sandRes,

                })
            }
        }
        return handler404(res);
    }catch (error) {
        console.error(error);
        throw new Error(error);
        
    }
}).all(handler405);

module.exports = router;