const mongoose = require('mongoose');

const Categorie = require('./Category');

const schema = new mongoose.Schema({
    ref: { type: String, index: true, unique: true, required: true },
    nom: { type: String, required: true },
    description: { type: String, text: true },
    type_pain: { type: String, text: true },
    image: new mongoose.Schema({
        titre: { type: String, required: true },
        type: { type: String, required: true },
        def_x: { type: Number, required: true },
        def_y: { type: Number, required: true },
        taille: { type: Number, required: true },
        filename: { type: String, required: true }
    }),
    categories: [{ type: String, ref: 'Categorie', required: true, default: [] }],
    prix: { type: mongoose.Schema.Types.Decimal128, required: true }
});

module.exports = mongoose.model('Sandwich', schema, 'sandwichs');
