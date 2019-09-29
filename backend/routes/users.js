const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const User = require('../models/user');
const auth = require('../middleware/auth');
const config = require('config');

const DEBUG = config.get('DEBUG');

router.get('/', [auth], async (req, res) => {
    if (DEBUG) console.log(`routes/users: GET /api/users ... started`);
    try {
        if (DEBUG) console.log(`routes/users: GET /api/users ... calling User.readAll()`);
        const userAll = await User.readAll();
        if (DEBUG) console.log(`routes/users: GET /api/users ... User.readAll() successful`);

        return res.json(userAll);
    } catch (err) {
        if (DEBUG) console.log(`routes/users: GET /api/users ... ERROR: ${JSON.stringify(err)}`);
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
    if (DEBUG) console.log(`routes/users: POST /api/users ... started`);
    const { error } = User.validate(req.body);
    if (error) return res.status(400).json({ code: 400, message: `Bad request. ${JSON.stringify(error.details)}` });

    try {
        if (DEBUG) console.log(`routes/users: POST /api/users ... calling new User(obj).create()`);
        const newUser = await new User(req.body).create();
        if (DEBUG) console.log(`routes/users: POST /api/users ... new user created`);

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

router.delete('/:id', (req, res) => {
    const schema = Joi.object().keys({ 
        "id": Joi.number().integer().min(1).required()
    });

    const { error } = schema.validate(req.params);
    if (error) return res.status(400).json(error)
    else
        User.readById(req.params.id)
            .then((userToDelete) => new User(userToDelete).delete())
            .then((user) => {
                return res.json(user);
            })
            .catch((error) => {
                return res.status(error.code).json(error);
            });
});

module.exports = router;
