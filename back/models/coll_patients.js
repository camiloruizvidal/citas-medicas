var sequelize = require('../config/dbcon');
const Sequelize = require('sequelize');
const nameSchema='coll_patient';
const schema = sequelize.define
(
    nameSchema, 
    {
        id: {
            type: Sequelize.SMALLINT, 
            primaryKey: true
        },
        id_documentoType:   Sequelize.NUMBER,
        documento:          Sequelize.STRING,
        nombre_primero:     Sequelize.STRING,
        nombre_segundo:     Sequelize.STRING,
        apellido_primero:   Sequelize.STRING,
        apellido_segundo:   Sequelize.STRING,
        fecha_nacimiento:   Sequelize.DATE,
        email:              Sequelize.STRING,
        numero_contacto:    Sequelize.STRING,
        pais:               Sequelize.STRING,
        ciudad:             Sequelize.STRING,
        createdAt:          Sequelize.DATE,
        updatedAt:          Sequelize.DATE
    }
);
schema.belongsTo(require('./coll_documents_types'),{foreignKey: 'id_documentoType'});
module.exports=schema;
