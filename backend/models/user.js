const sql = require('mssql');
const config = require('config');
const con = config.get('connectionString');
const Joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');

const DEBUG = config.get('DEBUG');

class User {
    constructor(obj) {
        this.id = obj.id;
        this.name = obj.name;
        this.password = obj.password;
    }

    static validate(obj) {
        let schema = Joi.object().keys({
            "name": Joi.string().min(2).max(255).required(),
            "password": Joi.string().min(1).max(255).required()
        });
        if (obj.id) {
            schema = schema.append({
                id: Joi.number().integer().min(1).required()
            });
        }

        return schema.validate(obj);
    }


    static login(credentials) {
        return new Promise(async (resolve, reject) => {
            if (DEBUG) console.log(`models/user: login ... started`);
            try {
                const pool = await sql.connect(con);
                if (!pool) throw { "code": 500, "message": 'Failed to User.login(credentials): internal server error.' };
                if (DEBUG) console.log(`models/user: login ... pool successful`);

                const result = await pool.request()
                    .input('name', sql.NVarChar(255), credentials.name)
                    .query('SELECT * FROM vuUSER WHERE userName = @name');
                if (DEBUG) console.log(`models/user: login ... query successful`);

                if (!result.recordset[0]) throw { code: 401, message: 'Unauthorised. Incorrect user name or password.' };

                const user = {
                    id: result.recordset[0].userID,
                    name: result.recordset[0].userName,
                    password: result.recordset[0].userPassword
                }

                const { error } = User.validate(user);
                if (error) throw { code: 500, message: 'Internal server error. User from DB is invalid.' };

                if (DEBUG) console.log(`models/user: login ... user validation successful`);

                // check password with bcrypt
                const match = await bcrypt.compare(credentials.password, user.password);
                if (!match) throw { code: 401, message: `Unauthorised. Invalid user name or password.` };

                if (DEBUG) console.log(`models/user: login ... password validation successful`);

                resolve(new User(user));

            } catch (err) {
                if (DEBUG) { console.log(`model/user: create .. ERROR: ${err.message}`) }
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

    static readById(id) {
        return new Promise(async (resolve, reject) => {
            if (DEBUG) { console.log('model/user: readById .. started') }
            try {
                const pool = await sql.connect(con);
                if (!pool) throw { "code": 500, "message": 'Failed to User.readById(id): internal server error.' }
                if (DEBUG) { console.log('model/user: readById .. pool successful') }

                const result = await pool.request()
                    .input('id', sql.Int, id)
                    .query('SELECT * FROM vuUSER WHERE userID = @id');
                    if (DEBUG) { console.log('model/user: readById .. query successful') }

                if (!result.recordset[0]) throw { code: 404, message: 'User not found' }

                const user = {
                    id: result.recordset[0].userID,
                    name: result.recordset[0].userName,
                    password: result.recordset[0].userPassword
                }

                const { error } = User.validate(user);
                if (error) throw { code: 500, message: 'Internal server error: data from DB does not validate.' };
                if (DEBUG) { console.log('model/user: readById .. User OK') }

                resolve(new User(user));

            } catch (err) {
                if (DEBUG) { console.log(`model/user: readById .. ERROR: ${err.message}`) }
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
        return new Promise(async (resolve, reject) => {
            if (DEBUG) { console.log('model/user: readAll .. started') }
            try {
                const pool = await sql.connect(con);
                if (DEBUG) { console.log('model/user: readAll .. pool successful') }

                const result = await pool.request()
                    .query('SELECT * FROM vuUSER');
                if (DEBUG) { console.log('model/user: readAll .. query successful') }
                
                let userAll = [];
                for (let i = 0; i < result.recordset.length; i++) {
                    const user = {
                        id: result.recordset[i].userID,
                        name: result.recordset[i].userName,
                        password: result.recordset[i].userPassword
                    }

                    const { error } = User.validate(user);
                    if (error) throw { code: 500, message: 'Internal server error: data from DB does not validate'}
                    if (DEBUG) { console.log('model/user: readAll .. User OK') }
                    
                    userAll.push(new User(user));
                }

                resolve(userAll);

            } catch (err) {
                if (DEBUG) { console.log(`model/user: readAll .. ERROR: ${err.message}`) }
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
        return new Promise(async (resolve, reject) => {
            if (DEBUG) console.log(`models/user: create ... started`);
            try {
                const pool = await sql.connect(con);
                if (DEBUG) console.log(`models/user: create ... pool successful`);

                const userExists = await pool.request()
                .input('name', sql.NVarChar(255), obj.name)
                .query('SELECT * FROM vuUSER WHERE userName = @name') 
                if (userExists.recordset[0]) throw {code: 409, message: 'Conflict. User already exists.'}

                const hashedPassword = await bcrypt.hash(obj.password, config.get('saltRounds'));
                if (DEBUG) console.log(`models/user: create ... password hashed`);

                const insertUser = await pool.request()
                    .input('name', sql.NVarChar(255), obj.name)
                    .input('password', sql.NVarChar(255), hashedPassword)
                    .query('INSERT INTO vuUSER (userName, userPassword) VALUES (@name, @password); SELECT * FROM vuUSER WHERE userID = SCOPE_IDENTITY()');
                if (!insertUser .recordset[0]) throw { code: 503, message: `Internal server error. Please try again later.` }

                const newUser = {
                    id: insertUser.recordset[0].userID,
                    name: insertUser.recordset[0].userName,
                    password: insertUser.recordset[0].userPassword
                }

                const { error } = User.validate(newUser);
                if (error) throw { code: 500, message: 'Internal server error: data from DB does not validate.' }
                if (DEBUG) { console.log('model/user: create .. User OK') }

                resolve(new User(newUser));

            } catch (err) {
                if (DEBUG) { console.log(`model/user: create .. ERROR: ${err.message}`) }
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

    update() {
        const obj = this;
        return new Promise (async (resolve, reject) => {
            if (DEBUG) console.log(`models/user: update ... started`);
            try {
                const pool = await sql.connect(con);
                if (!pool) throw { code: 500, message: 'Failed to User.update(): internal server error.'}
                if (DEBUG) { console.log('model/user: update .. pool successful') };

                const result = await pool.request()
                    .input('id', sql.Int, obj.id)
                    .input('name', sql.NVarChar, obj.name)
                    .input('password', sql.NVarChar, obj.password)
                    .query('UPDATE vuUSER SET userName = @name, userPassword = @password WHERE userID = @id; SELECT * FROM vuUSER WHERE userID = @id');
                    if (!result.recordset[0]) throw { code: 404, message: 'Failed to User.update(): User not found' };
                    if (DEBUG) { console.log('model/user: update .. query successful') };

                    const updateUser = {
                        id: result.recordset[0].userID,
                        name: result.recordset[0].userName,
                        password: result.recordset[0].userPassword
                    }

                    const { error } = User.validate(updateUser);
                    if (error) throw { code: 500, message: 'Internal server error: data from DB does not validate'}
                    if (DEBUG) { console.log('model/user: update .. User OK') }

                    resolve(new User(updateUser));

                } catch (err) {
                    if (DEBUG) { console.log(`model/user: update user .. ERROR: ${err}`) }
                    const errSchema = Joi.object().keys({
                        code: Joi.number().integer().min(400).max(600).required(),
                        message: Joi.any()
                    });
                    let errorObj = {
                        code: err.code,
                        message: err.message
                    }
                    const { error } = Joi.validate(errorObj, errSchema);
                    if (error) {
                        errorObj.code = 500;
                        errorObj.message = `Internal server error: ${err.message}`;
                    }
    
                    reject(errorObj);
                }
                sql.close();
        });
    }

    delete() {
        const obj = this;
        return new Promise (async (resolve, reject) => {
            if (DEBUG) console.log(`models/user: delete ... started`);
            try {
                if (DEBUG) { console.log('model/user: delete .. pool successful') };
                const pool = await sql.connect(con);
                if (!pool) throw { code: 500, message: 'Failed to User.delete(): internal server error.' }

                const result = await pool.request()
                    .input('id', sql.Int, obj.id)
                    .query('SELECT * FROM vuUSER WHERE userID = @id; DELETE FROM vuUSER WHERE userID = @id');
                if (!result.recordset[0]) throw { code: 404, message: 'Failed to User.delete(): User not found' };
                if (DEBUG) { console.log('model/user: delete .. query successful') };

                const user = {
                    id: result.recordset[0].userID,
                    name: result.recordset[0].userName,
                    password: result.recordset[0].userPassword
                }

                const { error } = User.validate(user);
                if (error) throw { code: 400, message: `Failed to User.delete(): validation error in id: ${user.id}.\n${JSON.stringify(error)}` }
                if (DEBUG) { console.log('model/user: delete .. User OK') };

                resolve(new User(user));

                } catch (err) {
                    if (DEBUG) { console.log(`model/user: update user .. ERROR: ${err}`) }
                    const errSchema = Joi.object().keys({
                        code: Joi.number().integer().min(400).max(600).required(),
                        message: Joi.any()
                    });
                    let errorObj = {
                        code: err.code,
                        message: err.message
                    }
                    const { error } = Joi.validate(errorObj, errSchema);
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

module.exports = User;