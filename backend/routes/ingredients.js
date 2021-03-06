const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const Ingredient = require('../models/ingredient');

router.get('/', async(req, res) => {

    try {
        const ingredients = await Ingredient.readAll();

        return res.json(ingredients);
    } catch (err) {
        return res.status(err.code).json(err);
    }

});

router.get('/:id', async(req, res) => {
    const schema = Joi.object().keys({
         "id": Joi.number().integer().min(1).required()
    });
    const { error } = schema.validate(req.params);
    if (error) return res.status(400).json({ code: 400, message: `Bad request. ${JSON.stringify(error.details)}` });

    try {
        const ingredient = await Ingredient.readById(req.params.id);

        return res.json(ingredient);
    } catch (err) {
        return res.status(err.code).json(err);
    }

});

router.get('/byRecipe/:id', async(req, res) => {
    const schema = Joi.object().keys({
        "id": Joi.number().integer().min(1).required()
    });
    const { error } = schema.validate(req.params);
    if (error) return res.status(400).json({ code: 400, message: `Bad request. ${JSON.stringify(error.details)}` });
    
    try {
        const recipeIngredient = await Ingredient.readAllByRecipe(req.params.id);

        return res.json(recipeIngredient);
    } catch (err) {
        return res.status(err.code).json(err);
    }
});

router.post('/', async(req, res) => {
    const { error } = Ingredient.validate(req.body);
    if (error) return res.status(400).json({ code: 400, message: `Bad request. ${JSON.stringify(error.details)}` });

    try {
        const newIngredient = await new Ingredient(req.body).create();
        return res.json(newIngredient);
    } catch (err) {
        return res.status(err.code).json(err);
    }
});

module.exports = router;