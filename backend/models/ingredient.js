const sql = require('mssql');
const config = require('config');
const con = config.get('connectionString');
const Joi = require('@hapi/joi');
const DEBUG = config.get('DEBUG');

class Ingredient {
    constructor(obj) {
        this.id = obj.id;
        this.name = obj.name;
    }

    static validate(obj) {
        let schema = Joi.object().keys({
            name: Joi.string().min(1).max(255).required()
        });
        if (obj.id) {
            schema = schema.append({
                id: Joi.number().integer().min(1).required()
            });
        }
        return schema.validate(obj);
    }


    static readById(id) {
        return new Promise(async(resolve, reject) => {
            if (DEBUG) { console.log('model/ingredient: readById.... started') }
            try {
                const pool = await sql.connect(con);
                if (DEBUG) { console.log('model/ingredient: readById .. pool successfull') }

                const result = await pool.request()
                    .input('id', sql.Int, id)
                    .query('SELECT * FROM vuINGREDIENT WHERE ingredientID = @id');

                if (!result.recordset[0]) throw { code: 404, message: 'ID not found' }
                if (DEBUG) { console.log('model/ingredient: readById .. query successfull') }

                const ingredient = {
                    id: result.recordset[0].ingredientID,
                    name: result.recordset[0].ingredientName
                }

                const { error } = Ingredient.validate(ingredient);
                if (error) throw { code: 500, message: 'Internal server error: data from DB does not validate.' };
                if (DEBUG) { console.log('model/ingredient: readById .. ingredient') }

                resolve(new Ingredient(ingredient));

            } catch (err) {
                if (DEBUG) { console.log(`model/ingredient: readById .. ERROR: ${err.message}`) }
                const errSchema = Joi.object().keys({
                    code: Joi.number().integer().min(400).max(600).required(),
                    message: Joi.any()
                });
                let errorObj = {
                    code: err.code,
                    message: err.message
                }
                const { error } = errSchema.validate(errorObj, errSchema);
                if (error) {
                    errorObj.code = 500;
                    errorObj.message = `Internal server error: ${err.message}`;
                }

                reject(errorObj);
            }
            sql.close();
        });
    }

    static readAll() {
        return new Promise(async(resolve, reject) => {
            if (DEBUG) { console.log('model/ingredient: readAll .. started') }
            try {
                const pool = await sql.connect(con);
                if (!pool) throw { "code": 500, "message": 'Failed to connect ingredient.readAll' }
                if (DEBUG) { console.log('model/ingredient: readAll .. pool successful') }

                const result = await pool.request()
                    .query('SELECT * FROM vuINGREDIENT');
                if (DEBUG) { console.log('model/ingredient: readAll .. query successful') }

                let ingredients = [];
                for (let i = 0; i < result.recordset.length; i++) {
                    const ingredient = {
                        id: result.recordset[i].ingredientID,
                        name: result.recordset[i].ingredientName,
                    }

                    const { error } = Ingredient.validate(ingredient);
                    if (error) throw { code: 500, message: `Internal server error. Product ${ingredient.id} does not validate from DB` }
                    if (DEBUG) { console.log(`model/product: readAll .. Product ${ingredient.id} OK`) }

                    ingredients.push(new Ingredient(ingredient));
                }
                if (DEBUG) { console.log('model/ingredient: readAll .. products OK') }

                resolve(ingredients);

            } catch (err) {
                if (DEBUG) { console.log(`model/ingredient: readAll .. ERROR: ${err.message}`) }
                const errSchema = Joi.object().keys({
                    code: Joi.number().integer().min(400).max(600).required(),
                    message: Joi.any()
                });
                let errorObj = {
                    code: err.code,
                    message: err.message
                }
                const { error } = errSchema.validate(errorObj, errSchema);
                if (error) {
                    errorObj.code = 500;
                    errorObj.message = `Internal server error: ${err.message}`;
                }

                reject(errorObj);
            }
            sql.close();
        });
    }

    create() {
        const obj = this;
        return new Promise(async(resolve, reject) => {
            if (DEBUG) { console.log('model/ingredient: create .. new promise') }

            try {
                const pool = await sql.connect(con);
                if (DEBUG) { console.log('model/ingredient: create .. pool') }
                const ingredientExists = await pool.request()
                    .input('name', sql.NVarChar(255), obj.name)
                    .query('SELECT * FROM vuINGREDIENT WHERE ingredientName = @name');
                if (DEBUG) { console.log('model/ingredient: create .. query') }
                if (ingredientExists.recordset[0]) throw { code: 409, message: 'Conflict. Ingredient already exists.' }


                const result = await pool.request()
                    .input('name', sql.NVarChar(255), obj.name)
                    .query('INSERT INTO vuINGREDIENT (ingredientName) VALUES (@name); SELECT * FROM vuINGREDIENT WHERE ingredientID = SCOPE_IDENTITY()');
                if (DEBUG) { console.log('model/ingredient: create .. result') }
                if (!result.recordset[0]) throw { code: 503, message: 'Service temporary unavailable, please try later.' };

                const ingredient = {
                    id: result.recordset[0].ingredientID,
                    name: result.recordset[0].ingredientName
                }

                const { error } = Ingredient.validate(ingredient);
                if (error) throw { code: 500, message: 'Internal server error: data from DB does not validate.' };

                resolve(new Ingredient(ingredient));

            } catch (err) {
                if (DEBUG) { console.log(`model/ingredient: create .. ERROR: ${err.message}`) }
                const errSchema = Joi.object().keys({
                    code: Joi.number().integer().min(400).max(600).required(),
                    message: Joi.any()
                });
                let errorObj = {
                    code: err.code,
                    message: err.message
                }
                const { error } = errSchema.validate(errorObj, errSchema);
                if (error) {
                    errorObj.code = 500;
                    errorObj.message = `Internal server error: ${err.message}`;
                }

                reject(errorObj);
            }
            sql.close();
        });
    }
}

module.exports = Ingredient;