const sql = require('mssql');
const config = require('config');
const con = config.get('connectionString');
const Joi = require('@hapi/joi');
const DEBUG = config.get('DEBUG');

class Category {
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
            if (DEBUG) { console.log('model/category: readById.... started') }
            try {
                const pool = await sql.connect(con);
                if (DEBUG) { console.log('model/category: readById .. pool successfull') }

                const result = await pool.request()
                    .input('id', sql.Int, id)
                    .query('SELECT * FROM vuCATEGORY WHERE categoryID = @id');

                if (!result.recordset[0]) throw { code: 404, message: 'Category ID not found' }
                if (DEBUG) { console.log('model/category: readById .. query successfull') }

                const category = {
                    id: result.recordset[0].categoryID,
                    name: result.recordset[0].categoryName
                }

                const { error } = Category.validate(category);
                if (error) throw { code: 500, message: 'Internal server error: data from DB does not validate.' };
                if (DEBUG) { console.log('model/category: readById .. validate category') }

                resolve(new Category(category));

            } catch (err) {
                if (DEBUG) { console.log(`model/category: readById .. ERROR: ${err.message}`) }
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
            if (DEBUG) { console.log('model/category: readAll .. started') }
            try {
                const pool = await sql.connect(con);
                if (!pool) throw { "code": 500, "message": 'Failed to connect category.readAll' }
                if (DEBUG) { console.log('model/category: readAll .. pool successful') }

                const result = await pool.request()
                    .query('SELECT * FROM vuCATEGORY');
                if (DEBUG) { console.log('model/category: readAll .. query successful') }

                let categories = [];
                for (let i = 0; i < result.recordset.length; i++) {
                    const category = {
                        id: result.recordset[i].categoryID,
                        name: result.recordset[i].categoryName,
                    }


                    const { error } = Category.validate(category);
                    if (error) throw { code: 500, message: `Internal server error. Category ${category.id} does not validate from DB` }
                    if (DEBUG) { console.log(`model/category: readAll .. Category ${category.id} OK`) }

                    categories.push(new Category(category));
                }
                if (DEBUG) { console.log('model/category: readAll .. categories OK') }

                resolve(categories);

            } catch (err) {
                if (DEBUG) { console.log(`model/category: readAll .. ERROR: ${err.message}`) }
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


    static readAllByRecipeId(recipeID) {
        return new Promise(async(resolve, reject) => {
            if (DEBUG) { console.log('model/category: readAllByRecipeId .. started') }
            try {
                const pool = await sql.connect(con);
                if (!pool) throw { "code": 500, "message": 'Failed to connect category.readAll' }
                if (DEBUG) { console.log('model/category: readAllByRecipeId .. pool successful') }

                const result = await pool.request()
                    .input('id', sql.Int, recipeID)
                    .query('SELECT * FROM vuCATEGORY JOIN vuRECIPECATEGORY ON vuRECIPECATEGORY.FK_categoryID = vuCATEGORY.categoryID JOIN vuRECIPE ON vuRECIPE.recipeID = vuRECIPECATEGORY.FK_recipeID WHERE vuRECIPE.recipeID = @id');
                if (DEBUG) { console.log('model/category: readAllByRecipeId .. query successful') }


                let categories = [];
                for (let i = 0; i < result.recordset.length; i++) {

                    const category = {
                        id: result.recordset[i].categoryID,
                        name: result.recordset[i].categoryName,
                    }


                    const { error } = Category.validate(category);
                    if (error) throw { code: 500, message: `Internal server error. Category ${category.id} does not validate from DB` }


                    categories.push(new Category(category));
                }
                if (DEBUG) { console.log('model/category: readAllByRecipeId .. categories OK') }

                resolve(categories);

            } catch (err) {
                if (DEBUG) { console.log(`model/category: readAllByRecipeId .. ERROR: ${err.message}`) }
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

module.exports = Category;