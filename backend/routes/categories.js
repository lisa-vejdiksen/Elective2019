const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const Joi = require('@hapi/joi');

router.get('/', async(req, res) => {
    try {
        const categories = await Category.readAll();
        return res.json(categories);
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
        const category = await Category.readById(req.params.id);
        return res.json(category);
    } catch (err) {
        return res.status(err.code).json(err);
    }
});


router.get('/byrecipe/:id', async(req, res) => {
    const schema = Joi.object().keys({
        "id": Joi.number().integer().min(1).required()
    });
    const { error } = schema.validate(req.params);
    if (error) return res.status(400).json({ code: 400, message: `Bad request. ${JSON.stringify(error.details)}` });

    try {
        const category = await Category.readAllByRecipeId(req.params.id);
        return res.json(category);
    } catch (err) {

        return res.status(err.code).json(err);
    }
});

module.exports = router;