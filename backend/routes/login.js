const express = require('express');
const router = express.Router();
const config = require('config');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const DEBUG = config.get('DEBUG');

router.post('/', async (req, res) => {
     try {
        if (DEBUG) console.log(`routes/login: POST /api/login ... calling User.readByuserName(req.body.name)`);
        const user = await User.readByuserName(req.body.name); 
        if (DEBUG) console.log(`routes/login: POST /api/login ... credentials verified`);

        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) throw {code: 401, message: `Uauthorised. Invalid user name or password` }
        
        const tokenPayload = { 
            id: user.id, 
        };
        const token = jwt.sign(tokenPayload, config.get('jwtPrivateKey'));

        res.set({
            "x-auth-token": token
        });

        return res.json(user);

     } catch (err) {
         return res.status(err.code).json(err);
     }
 });

 module.exports = router;