const sql = require('mssql');
const config = require('config');
const con = config.get('connectionString');
const Joi = require('@hapi/joi');

const DEBUG = config.get('DEBUG');

class User {
    constructor(obj) {
        this.id = obj.id;
        this.name = obj.id;
        this.password = obj.id;
    }

    static validate(obj) {
        let schema = Joi.object().keys({
            email: Joi.string().email().required(),
            password: Joi.string().min(1).max(255).required()
        });
        if (obj.id) {
            schema = schema.append({
                id: Joi.number().integer().min(1).required()
            });
        }

        return schema.validate(obj);
    }

    static readByEmail(email) {

    }
}

module.exports = User;