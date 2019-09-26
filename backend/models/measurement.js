const sql = require('mssql');
const config = require('config');
const Joi = require('@hapi/joi');
const con = config.get('connectionString');

const DEBUG = config.get('DEBUG');

class Measurement {
    constructor(obj) {
        this.name = obj.name;
        this.id = obj.id;
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
        return new Promise(async (resolve, reject) => {
            if (DEBUG) { console.log('model/measurement: readById .. started') }
            try {
                const pool = await sql.connect(con);
                if (DEBUG) { console.log('model/measurement: readById .. pool successful') }

                const result = await pool.request()
                    .input('id', sql.Int, id)
                    .query('SELECT * FROM vuMEASUREMENT WHERE measurementID = @id');

                if (!result.recordset[0]) throw { code: 404, message: 'Measurement not found' }
                if (DEBUG) { console.log('model/measurement: readById .. query successful') }

                const measurement = {
                    id: result.recordset[0].measurementID,
                    name: result.recordset[0].measurementName
                }

                const { error } = Measurement.validate(measurement);
                if (error) throw { code: 500, message: 'Internal server error: data from DB does not validate.' };
                if (DEBUG) { console.log(`model/measurement: readById .. measurement ${measurement.id} OK`) }

                resolve(new Measurement(measurement));

            } catch (err) {
                if (DEBUG) { console.log(`model/measurement: readById .. ERROR: ${err.message}`) }
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
            if (DEBUG) { console.log('model/measurement: readAll .. started') }
                try {
                    const pool = await sql.connect(con);
                    if (!pool) throw {"code": 500, "message": 'Failed to connect measurement.readAll'} 
                    if (DEBUG) { console.log('model/measurement: readAll .. pool successful') }

                    const result = await pool.request()
                        .query('SELECT * FROM vuMEASUREMENT');
                    if (DEBUG) { console.log('model/measurement: readAll .. query successful') }

                    let measurements = [];
                    for (let i = 0; i < result.recordset.length; i++) {
                        const measurement = {
                            name: result.recordset[i].measurementName,
                            id: result.recordset[i].measurementID  
                        }

                        const { error } = Measurement.validate(measurement);
                        if (error) throw {code: 400, message: `Failed to measurement.readAll. validation error in id: ${measurement.id}.\n${JSON.stringify(error)}`}
                        if (DEBUG) { console.log(`model/measurement: readAll .. measurement ${measurement.id} OK`) }

                        measurements.push(new Measurement(measurement));
                    }
                    if (DEBUG) { console.log('model/measurement: readAll .. measurement OK') }

                    resolve(measurements);

                } catch (err) {
                    if (DEBUG) { console.log(`model/measurement: readAll .. ERROR: ${err.message}`) }
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

    module.exports = Measurement;