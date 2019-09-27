const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');

router.get('/', [auth], async (req, res) => {
    try { 
        const userAll = await User.readAll();
            return res.json(userAll);
    } catch (err) {
        return res.status(err.code).json(err);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.readById(req.params.id);
        return res.json(user);
    } catch (err) {
        return res.status(err.code).json(err);
    }
});

router.post('/', async (req, res) => {
    try {
        const newUser = await new User(req.body).create();
        return res.json(newUser);

    } catch (err) {
        return res.status(err.code).json(err);
    }
});

router.put('/:id', (req, res) => {
    const schema = Joi.object().keys({
        "id": Joi.number().integer().min(1).required()
    });

    const { error } = schema.validate(req.params);
    if (error) return res.status(400).json(error) 
    else {
        const { error } = User.validate(req.body);
        if (error) return res.status(400).json(error)
        else
            User.readById(req.params.id)
                .then((userToUpdate) => {
                    userToUpdate.name = req.body.name;
                    return new User(userToUpdate).update()
                })
                .then((user) => {
                    return res.json(user);
                })
                .catch((error) => {
                    return res.status(error.code).json(error);
                });
            }
});

module.exports = router;
