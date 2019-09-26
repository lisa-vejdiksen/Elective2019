const sql = require('mssql');
const config = require('config');
const con = config.get('connectionString');
const Joi = require('@hapi/joi');
const DEBUG = config.get('DEBUG');

class Ingredient {
    constructor(ingredient) {
        this.id = ingredient.id;
        this.name = ingredient.name;
    }

    static validate(ingredient) {
        let schema = Joi.object().keys({
            name: Joi.string().min(1).max(255).required()
        });
        if (ingredient.id) {
            schema = schema.append({
                id: Joi.number().integer().min(1).required()
            });
        }
        return schema.validate(obj);
    }

    static readAll() {
        return new Promise((resolve, reject) => {
            if (DEBUG) { console.log('model/ingredient: readAll .. started') }
            (async() => {
                try {
                    const pool = await sql.connect(con);
                    if (DEBUG) { console.log('model/ingredient: readAll .. pool successful') }
                    if (!pool) throw { "code": 500, "message": 'Failed to connect ingredient.realAll.' }

                    const result = await pool.request()
                        .query('SELCET * FROM ingredient');
                    if (DEBUG) { console.log('model/ingredient: readAll .. query successful') }

                    let ingredients = [];
                    let ingredient = {};
                    for (let i = 0; i < result.recordset.length; i++) {
                        ingredient = {
                            id: result.recordset[i].ingredientID,
                            name: result.recordset[i].ingredientName
                        }
                        const { error } = Ingredient.validate(ingredient);
                        if (error) throw { code: 400, message: `Validation error in id at ingredient.readAll: ${ingredient.id}.\n${JSON.stringify(error)}` }
                        if (DEBUG) { console.log(`model/ingredient: readAll .. Product ${ingredient.id} OK`) }

                        ingredients.push(new Ingredient(ingredient));
                    }
                    if (DEBUG) { console.log('model/ingredient: readAll .. products OK') }

                    resolve(ingredients);

                } catch (err) {
                    if (DEBUG) { console.log(`model/ingredient: readAll .. ERROR: ${err}`) }
                    reject(err);
                }
                sql.close();
            })();
        });
    }


    create() {
        const obj = this;
        return new Promise((resolve, reject) => {

            (async() => {
                try {
                    const pool = await sql.connect(con);
                    if (!pool) throw { code: 500, messange: 'Internal server error at ingredient.Create()' };

                    const ingredientExists = await pool.request()
                        .input('name', sql.NVarChar(255), obj.name)
                        .query('SELECT * FROM ingredient WHERE ingredientName = @name');
                    if (ingredientExists.recordset[0]) throw { code: 409, message: 'Conflict. Ingredient already exists' }


                    const result = await pool.request()
                        .input('name', sql.NVarChar(255), obj.name)
                        .query('INSERT INTO ingredient (ingredientName) VALUES (@name); SELECT * FROM ingredient WHERE ingredientID = SCOPE_IDENTITY()');
                    if (!result.recordset[0]) throw { code: 503, message: 'Service temporary unavailable at ingredient.Create()' };

                    const ingredient = {
                        id: result.recordset[0].ingredientID,
                        name: result.recordset[0].ingredientName
                    }

                    const { error } = Ingredient.validate(ingredient);
                    if (error) throw { code: 400, message: `Validation error in id at ingredient.Create(): ${ingredient.id}.\n${JSON.stringify(error)}` }

                    resolve(new Ingredient(ingredient));

                } catch (err) {
                    console.log(err);
                    reject(err);
                }
                sql.close();
            })();
        });
    }

}
module.exports = Ingredient;