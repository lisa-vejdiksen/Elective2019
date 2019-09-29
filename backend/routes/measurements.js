const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const Measurement = require('../models/measurement');

router.get('/', async (req, res) => {
    try {
        const measurements = await Measurement.readAll();

        return res.json(measurements);
    } catch (err) {
        return res.status(err.code).json(err);
    }
});

    
router.get('/:id', async (req, res) => {
    const schema = Joi.object().keys({
         "id": Joi.number().integer().min(1).required()
    });
    const { error } = schema.validate(req.params);
    if (error) return res.status(400).json({ code: 400, message: `Bad request. ${JSON.stringify(error.details)}` });

    try {
        const measurement = await Measurement.readById(req.params.id);
        return res.json(measurement);
    } catch (err) {
        return res.status(err.code).json(err);
    }
});

module.exports = router;