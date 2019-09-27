const express = require('express');
const Joi = require('@hapi/joi');
const router = express.Router();
const Recipe = require('../models/recipe');
//const Ingredient
const config = require('config');

const DEBUG = config.get('DEBUG');

router.get('/', async (req, res) => {
    if (DEBUG) console.log(`routes/recipes: GET /api/recipes ... started`);
    try {
        if (DEBUG) console.log(`routes/recipes: GET /api/recipes ... calling Recipe.readAll()`);
        const recipes = await Recipe.readAll();
        if (DEBUG) console.log(`routes/recipes: GET /api/recipes ... Recipe.readAll() successful`);

        return res.json(recipes);
        
    } catch (err) {
        if (DEBUG) console.log(`routes/recipes: GET /api/recipes ... ERROR: ${JSON.stringify(err)}`);
        return res.status(err.code).json(err);
    }
}); 

router.get('/:id', async (req, res) => {
    // const schema = Joi.object().key({
    //      "id": Joi.number().integer().min(1).required()
    // });
    // const { error } = schema.validate(req.params);
    // if (error) return res.status(400).json({ code: 400, message: `Bad request. ${JSON.stringify(error.details)}` });

    try {
        const recipe = await Recipe.readById(req.params.id);

        // const ingerdients = await Ingerdient.r

        // const categories = await 

        //recipe.ingredients = ingredients;
        //recipe.categories = categories;

        return res.json(recipe);
    } catch (err) {
        return res.status(err.code).json(err);
    }
});

router.get('/byCategory/:id', async(req, res) => {
    try {
        const categoryRecipe = await Recipe.readAllByCategory(req.params.id);

        return res.json(categoryRecipe);
    } catch (err) {
        return res.status(err.code).json(err)    
    }
});

router.post('/', async (req, res) => {
    // const { error } = User.validate(req.body);
    // if (error) return res.status(400).json({ code: 400, message: `Bad request. ${JSON.stringify(error.details)}` });

    try {
        const newRecipe = await new Recipe(req.body).create();
        return res.json(newRecipe);
    } catch (err) {
        return res.status(err.code).json(err);
    }
});

module.exports = router;