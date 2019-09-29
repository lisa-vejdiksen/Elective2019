const express = require('express');
const router = express.Router();
const config = require('config');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const DEBUG = config.get('DEBUG');

router.post('/', async (req, res) => {
    if (DEBUG) console.log(`routes/login: POST /api/login ... started`);
    const { error } = User.validate(req.body);
    if (error) return res.status(400).json({ code: 400, message: `Bad request. ${JSON.stringify(error.details)}` });

    if (DEBUG) console.log(`routes/login: POST /api/login ... payload validated`);
    try {
        if (DEBUG) console.log(`routes/login: POST /api/login ... calling User.login(credentials)`);
        const activeUser = await User.login(req.body);
        if (DEBUG) console.log(`routes/login: POST /api/login ... credentials verified`);

        const tokenPayload = { id: activeUser.id };
        const token = jwt.sign(tokenPayload, config.get('jwtPrivatKey'));

        res.set({
            "x-auth-token": token
        });

        return res.json(activeUser);

    } catch (err) {
        if (DEBUG) console.log(`routes/login: POST /api/login ... ERROR: ${JSON.stringify(err)}`);
        return res.status(err.code).json(err);
    }
});

module.exports = router;