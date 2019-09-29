const sql = require('mssql');
const config = require('config');
const con = config.get('connectionString');
const Joi = require('@hapi/joi');
const DEBUG = config.get('DEBUG');

class Recipe {
    constructor(obj) {
        this.id = obj.id;
        this.name = obj.name;
        this.prep = obj.prep;
        this.cook = obj.cook;
        this.image = obj.image;
        this.userid = obj.userid;
        this.prepSteps = obj.prepSteps;
        this.ingredients = obj.ingredients;
        this.categories = obj.categories;
    }

    static validate(obj) {
        let schema = Joi.object().keys({
            name: Joi.string().min(3).max(255).required(),
            prep: Joi.number().integer().required(),
            cook: Joi.number().integer().required(),
            image: Joi.string().min(3).max(255).required(),
            userid: Joi.number().integer().min(1).required(),
            prepSteps: Joi.array(),
            ingredients: Joi.array(),
            categories: Joi.array()
        });
        if (obj.id) {
            schema = schema.append({
                id: Joi.number().integer().min(1).required()
            });
        }

        return schema.validate(obj);
    }

    static validatePrepStep(obj) {
        let schema = Joi.object().keys({
            prepStepNumber: Joi.number().integer().min(1).required(),
            prepStep: Joi.string().min(1).required()
        });
        return schema.validate(obj);
    }

    static validateIngredient(obj) {
        let schema = Joi.object().keys({
            riAmount: Joi.number().precision(2).min(0).max(999999).required(),
            measurementName: Joi.string().min(1).max(255).required(),
            ingredientName: Joi.string().min(1).max(255).required()
        });
        return schema.validate(obj);
    }

    static validateCategory(obj) {
        let schema = Joi.object().keys({
            categoryName: Joi.string().min(1).max(255).required()
        });
        return schema.validate(obj);
    }

    static readAll() {
        return new Promise(async (resolve, reject) => {
            if (DEBUG) { console.log('models/recipe: readAll .. started') }
            try {
                const pool = await sql.connect(con);
                if (!pool) throw {"code": 500, "message": 'Failed to connect recipe.readAll'}
                if (DEBUG) { console.log('models/recipe: readAll .. pool successful') }

                const foundRecipes = await pool.request()
                    .query('SELECT * FROM vuRECIPE');
                if (DEBUG) { console.log('models/recipe: readAll .. query successful') }

                let recipes = [];
                for (let i = 0; i < foundRecipes.recordset.length; i++) {
                    const recipe = {
                        id: foundRecipes.recordset[i].recipeID,
                        name: foundRecipes.recordset[i].recipeName,
                        prep: foundRecipes.recordset[i].recipePrepTime,
                        cook: foundRecipes.recordset[i].recipeCookTime,
                        image: foundRecipes.recordset[i].recipePicture,
                        userid: foundRecipes.recordset[i].FK_userID
                    }
                    const { error } = Recipe.validate(recipe);

                    if (error) throw { code: 500, message: `Internal server error. Recipe ${recipe.id} does not validate from DB` }
                    if (DEBUG) { console.log(`models/recipe: readAll .. Recipe ${recipe.id} OK`) }

                    recipes.push(new Recipe(recipe));
                }

                if (DEBUG) { console.log('models/recipe: readAll .. recipes OK') }
                resolve(recipes);

            } catch (err) {
                if (DEBUG) { console.log(`models/recipe: readAll .. ERROR: ${err.code + ": " + err.message}`) }
                const errSchema = Joi.object().keys({
                    code: Joi.number().integer().min(400).max(600).required(),
                    message: Joi.any()
                });
                let errorObj = {
                    code: err.code,
                    message: err.message
                }
                const { error } = errSchema.validate(err);
                if (error) {
                    errorObj.code = 500;
                    errorObj.message = `Internal server error: ${err.message}`;
                }

                reject(errorObj);
            }
            sql.close();
        });
    }

    static readById(id) {
        return new Promise(async (resolve, reject) => {
            if (DEBUG) { console.log('models/recipe: readById .. started') }
            try {
                const pool = await sql.connect(con);
                if (DEBUG) { console.log('models/recipe: readById .. pool successful') }
                const recipe_result = await pool.request()
                    .input('id', sql.Int, id)
                    .query('SELECT * FROM vuRECIPE WHERE recipeID = @id');
                if (DEBUG) { console.log('models/recipe: readById .. recipe query successful') }
                if (!recipe_result.recordset[0]) throw { code: 404, message: 'Recipe not found' }

                const prep_result = await pool.request()
                    .input('id', sql.Int, id)
                    .query('SELECT * FROM vuRECIPE INNER JOIN vuPREPARATION ON vuRECIPE.recipeID = vuPREPARATION.FK_recipeID WHERE vuRECIPE.recipeID = @id ORDER BY vuPREPARATION.prepStepNumber');
                if (DEBUG) { console.log('models/recipe: readById .. prep query successful') }
                if (!prep_result.recordset[0]) throw { code: 404, message: 'Preparation not found' }

                const ingredient_result = await pool.request()
                    .input('id', sql.Int, id)
                    .query('SELECT * FROM vuRECIPE JOIN vuRECIPEINGREDIENT ON vuRECIPEINGREDIENT.FK_recipeID = vuRECIPE.recipeID JOIN vuINGREDIENT ON vuRECIPEINGREDIENT.FK_ingredientID = vuINGREDIENT.ingredientID JOIN vuMEASUREMENT ON vuRECIPEINGREDIENT.FK_measurementID = vuMEASUREMENT.measurementID WHERE vuRECIPE.recipeID = @id');
                if (DEBUG) { console.log('models/recipe: readById .. ingredient query successful') }
                if (!ingredient_result.recordset[0]) throw { code: 404, message: 'Ingredient not found' } 

                const category_result = await pool.request()
                    .input('id', sql.Int, id)
                    .query('SELECT * FROM vuRECIPE JOIN vuRECIPECATEGORY ON vuRECIPECATEGORY.FK_recipeID = vuRECIPE.recipeID JOIN vuCATEGORY ON vuCATEGORY.categoryID = vuRECIPECATEGORY.FK_categoryID WHERE vuRECIPE.recipeID = @id');
                if (DEBUG) { console.log('models/recipe: readById .. category query successful') }
                if (!category_result.recordset[0]) throw { code: 404, message: 'Category not found' }     

                let prepSteps = [];
                for (let i = 0; i < prep_result.recordset.length; i++) {
                    const prepStep = {
                        prepStepNumber: prep_result.recordset[i].prepStepNumber,
                        prepStep: prep_result.recordset[i].prepStep
                    }

                    const {error} = Recipe.validatePrepStep(prepStep);
                    if(error) throw  { code: 500, message: 'Internal server error: prep data from DB does not validate.' };

                    prepSteps.push(prepStep);
                }

                let ingredients = [];
                for (let i = 0; i < ingredient_result.recordset.length; i++) {
                    const ingredient = {
                        riAmount: ingredient_result.recordset[i].riAmount,
                        measurementName: ingredient_result.recordset[i].measurementName,
                        ingredientName: ingredient_result.recordset[i].ingredientName
                    }

                    const {error} = Recipe.validateIngredient(ingredient);
                    if(error) throw  { code: 500, message: 'Internal server error: ingredient data from DB does not validate.' };

                    ingredients.push(ingredient);
                }

                let categories = [];
                for (let i = 0; i < category_result.recordset.length; i++) {
                    const category = {
                        categoryName: category_result.recordset[i].categoryName
                    }

                    const {error} = Recipe.validateCategory(category);
                    if(error) throw  { code: 500, message: 'Internal server error: category data from DB does not validate.' };

                    categories.push(category);
                }

                const recipe = {
                    id: recipe_result.recordset[0].recipeID,
                    name: recipe_result.recordset[0].recipeName,
                    prep: recipe_result.recordset[0].recipePrepTime,
                    cook: recipe_result.recordset[0].recipeCookTime,
                    image: recipe_result.recordset[0].recipePicture,
                    userid: recipe_result.recordset[0].FK_userID,
                    prepSteps: prepSteps,    
                    ingredients: ingredients,
                    categories: categories                
                }

                const { error } = Recipe.validate(recipe);
                if (error) throw { code: 500, message: 'Internal server error: data from DB does not validate.' };
                if (DEBUG) { console.log('models/recipe: readById .. recipe OK') }

                resolve(new Recipe(recipe));

            } catch (err) {
                if (DEBUG) { console.log(`models/recipe: readById .. ERROR: ${err.code + ": " + err.message}`) }
                const errSchema = Joi.object().keys({
                    code: Joi.number().integer().min(400).max(600).required(),
                    message: Joi.any()
                });
                let errorObj = {
                    code: err.code,
                    message: err.message
                }
                const { error } = errSchema.validate(err);
                if (error) {
                    errorObj.code = 500;
                    errorObj.message = `Internal server error: ${err.message}`;
                }

                reject(errorObj);
            }
            sql.close();
        });
    }

    static readAllByCategory(categoryID) {
        return new Promise(async (resolve, reject) => {
            if (DEBUG) { console.log('models/recipe: readAllByCategory .. started') }
            try {
                const pool = await sql.connect(con);
                if (!pool) throw {"code": 500, "message": 'Failed to connect recipe.readAllByCategory'}
                if (DEBUG) { console.log('models/recipe: readAllByCategory .. pool successful') }

                const foundCategoryRecipes = await pool.request()
                    .input('id', sql.Int, categoryID)
                    .query('SELECT * FROM vuRECIPE JOIN vuRECIPECATEGORY ON vuRECIPECATEGORY.FK_recipeID = vuRECIPE.recipeID JOIN vuCATEGORY ON vuCATEGORY.categoryID = vuRECIPECATEGORY.FK_categoryID WHERE vuCATEGORY.categoryID = @id');
                if (DEBUG) { console.log('models/recipe: readAllByCategory .. query successful') }

                let categoryRecipes = [];
                for (let i = 0; i < foundCategoryRecipes.recordset.length; i++) {
                    const categoryRecipe = {
                        id: foundCategoryRecipes.recordset[i].recipeID,
                        name: foundCategoryRecipes.recordset[i].recipeName,
                        prep: foundCategoryRecipes.recordset[i].recipePrepTime,
                        cook: foundCategoryRecipes.recordset[i].recipeCookTime,
                        image: foundCategoryRecipes.recordset[i].recipePicture,
                        userid: foundCategoryRecipes.recordset[i].FK_userID
                    }
                    const { error } = Recipe.validate(categoryRecipe);
                    if (error) throw { code: 500, message: `Internal server error. Category recipe ${categoryRecipe.id} does not validate from DB` }
                    if (DEBUG) { console.log(`models/recipe: readAllByRecipe .. Category recipe ${categoryRecipe.id} OK`) }

                    categoryRecipes.push(new Recipe(categoryRecipe));
                }

                if (DEBUG) { console.log('models/recipe: readAllByCategory .. categoryRecipes OK') }
                resolve(categoryRecipes);

            } catch (err) {
                if (DEBUG) { console.log(`models/recipe: readAllByCategory .. ERROR: ${err.code + ": " + err.message}`) }
                const errSchema = Joi.object().keys({
                    code: Joi.number().integer().min(400).max(600).required(),
                    message: Joi.any()
                });
                let errorObj = {
                    code: err.code,
                    message: err.message
                }
                const { error } = errSchema.validate(err);
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
        return new Promise(async (resolve, reject) => {
            if (DEBUG) { console.log('models/recipe: create .. started') }
            try {
                const pool = await sql.connect(con);
                if (DEBUG) { console.log('models/recipe: create .. pool successful') }

                const recipeExists = await pool.request()
                    .input('name', sql.NVarChar(255), obj.name)
                    .query('SELECT * FROM vuRECIPE WHERE recipeName = @name');
                if (DEBUG) { console.log('models/recipe: create .. query (recipeexists) successful') }
                if (recipeExists.recordset[0]) throw { code: 409, message: 'Conflict. Recipe already exists.' }

                const result = await pool.request()
                    .input('name', sql.NVarChar(255), obj.name)
                    .input('prep', sql.Int, obj.prep)
                    .input('cook', sql.Int, obj.cook)
                    .input('image', sql.NVarChar(255), obj.image)
                    .input('userid', sql.Int, obj.userid)
                    .query('INSERT INTO vuRECIPE (recipeName, recipePrepTime, recipeCookTime, recipePicture, FK_userID) VALUES (@name, @prep, @cook, @image, @userid); SELECT * FROM vuRECIPE WHERE recipeID = SCOPE_IDENTITY()');
                if (DEBUG) { console.log('models/recipe: create .. query (result) successful') }
                if (!result.recordset[0]) throw { code: 503, message: 'Service temporary unavailable, please try later.' };

                for(let i = 0; i < obj.prepSteps.length; i++){
                    const {error} = Recipe.validatePrepStep(obj.prepSteps[i]);
                    if (error) throw { code: 400, message: 'Bad request. Check payload.' }; 

                    const newStep = await pool.request()
                    .input('recipeID', sql.Int, result.recordset[0].recipeID)
                    .input('prepStepNumber', sql.Int, obj.prepSteps[i].prepStepNumber)
                    .input('prepStep', sql.NVarChar(sql.MAX), obj.prepSteps[i].prepStep)
                    .query('INSERT INTO vuPREPARATION (FK_recipeID, prepStepNumber, prepStep) VALUES (@recipeID, @prepStepNumber, @prepStep)'); 
                }

                const prep_result = await pool.request()
                    .input('recipeID', sql.Int, result.recordset[0].recipeID)
                    .query('SELECT * FROM vuPREPARATION WHERE FK_recipeID = @recipeID');

                let prepSteps = [];
                for (let i = 0; i < prep_result.recordset.length; i++) {
                    const prepStep = {
                        prepStepNumber: prep_result.recordset[i].prepStepNumber,
                        prepStep: prep_result.recordset[i].prepStep
                    }

                    const {error} = Recipe.validatePrepStep(prepStep);
                    if(error) throw  { code: 500, message: 'Internal server error: data from DB does not validate.' };

                    prepSteps.push(prepStep);
                }

                const recipe = {
                    id: result.recordset[0].recipeID,
                    name: result.recordset[0].recipeName,
                    prep: result.recordset[0].recipePrepTime,
                    cook: result.recordset[0].recipeCookTime,
                    image: result.recordset[0].recipePicture,
                    userid: result.recordset[0].FK_userID,
                    prepSteps: prepSteps
                }

                const { error } = Recipe.validate(recipe);
                if (error) throw { code: 500, message: 'Internal server error: data from DB does not validate.' };
                if (DEBUG) { console.log('models/recipe: create .. recipe OK') }

                resolve(new Recipe(recipe));

            } catch (err) {
                if (DEBUG) { console.log(`models/recipe: create .. ERROR: ${err.code + ": " + err.message}`) }
                const errSchema = Joi.object().keys({
                    code: Joi.number().integer().min(400).max(600).required(),
                    message: Joi.any()
                });
                let errorObj = {
                    code: err.code,
                    message: err.message
                }
                const { error } = errSchema.validate(err);
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

module.exports = Recipe;