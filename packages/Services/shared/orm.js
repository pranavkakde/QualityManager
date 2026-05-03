const { Sequelize, DataTypes } = require('sequelize');

class TableSchema {
    constructor(schemaObj) {
        this.schemaObj = schemaObj;
    }
}

class TableMapper {
    constructor(tableName, schema) {
        let name = tableName.replace(/dbo\.\[(.*?)\]/i, '$1').replace(/\[|\]/g, '');
        this.tableName = name;
        this.schema = schema;
        this.sequelize = null;
        this.model = null;
    }

    setConfig(config) {
        if (!this.sequelize) {
            let dialect = config.driverType === 'mssql' ? 'mssql' : 
                          config.driverType === 'mysql' ? 'mysql' : 
                          config.driverType === 'postgres' ? 'postgres' : 'mssql';
            
            let host = config.server || 'localhost';
            let dialectOptions = {};
            
            if (dialect === 'mssql' && host.includes('\\')) {
                 const parts = host.split('\\');
                 host = parts[0];
                 dialectOptions.options = { instanceName: parts[1], encrypt: false, trustServerCertificate: true };
            } else if (dialect === 'mssql') {
                 dialectOptions.options = { encrypt: false, trustServerCertificate: true };
            }

            this.sequelize = new Sequelize(config.database, config.username, config.password, {
                host: host,
                dialect: dialect,
                dialectOptions: dialectOptions,
                logging: console.log, // Perfect Telemetry! We will now see all SQL queries
            });

            let seqSchema = {};
            let isFirst = true;
            for(let key in this.schema.schemaObj) {
                let type = this.schema.schemaObj[key].type;
                let seqType = DataTypes.STRING;
                if (type === Number) seqType = DataTypes.INTEGER;
                else if (type === Boolean) seqType = DataTypes.BOOLEAN;
                else if (type === Date) seqType = DataTypes.DATE;
                
                seqSchema[key] = {
                    type: seqType,
                    primaryKey: isFirst,
                    autoIncrement: isFirst && (type === Number) 
                };
                isFirst = false;
            }

            this.model = this.sequelize.define(this.tableName, seqSchema, {
                tableName: this.tableName,
                timestamps: false,
                freezeTableName: true
            });
        }
    }

    find(criteria, callback) {
        this.model.findAll({ where: criteria, raw: true })
            .then(data => callback(null, data))
            .catch(err => callback(err, null));
    }

    insert(data, callback) {
        this.model.create(data)
            .then(record => callback(null, record.toJSON ? record.toJSON() : record))
            .catch(err => callback(err, null));
    }

    update(criteria, data, callback) {
        this.model.update(data, { where: criteria })
            .then(result => callback(null, result))
            .catch(err => callback(err, null));
    }

    delete(criteria, callback) {
        this.model.destroy({ where: criteria })
            .then(result => callback(null, result))
            .catch(err => callback(err, null));
    }
}

module.exports = {
    TableSchema,
    TableMapper
};
