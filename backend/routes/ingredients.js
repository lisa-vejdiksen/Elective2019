const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const Ingredient = require('../models/ingredient');

router.get('/', (req, res) => {
    Ingredient.readAll()
        .then((ingredients) => {
            return res.json(ingredient);
        })
        .catch((error) => {
            if (DEBUG) { console.log(`model/ingredients: routes.... GET: ${err}`) }
            return res.status(error.code).json(error);

        });
});

router.post('/', (req, res) => {
    const { error } = Ingredient.validate(req.body);
    if (DEBUG) { console.log(`model/ingredients: Routes... Validate: ${err}`) }
    if (error) return res.status(400).json(error)
    else {
        new Ingredient(req.body).create()
            .then((ingredient) => {
                return res.json(ingredient);
            })
            .catch((error) => {
                return res.status(error.code).json(error);
            });
    }
});

module.exports = router;