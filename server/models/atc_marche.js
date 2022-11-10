var Sequelize = require('sequelize');
var configuration = require("../config");
var marche = require("./marcheIms");
var atc = require("./atc");
var config = configuration.connection;
	
// create a sequelize instance with our local postgres database information.
const sequelize = new Sequelize(config.base, config.root, config.password, {
	host:config.host,
	port: config.port,
	dialect:'mysql',
	pool:{
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	}, 
	operatorsAliases: false
});

// setup atc_marche model and its fields.
var atc_marche = sequelize.define('atc_marches', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
	id_marche: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: true, 
        references: {
          model: marche,
          key: "id",
        },
    },
	id_atc: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: true, 
        references: {
          model: atc,
          key: "id",
        },
    },
}, { timestamps: false }); 
atc_marche.belongsTo(atc, { as: 'atcs', foreignKey: 'id_atc'});
atc_marche.belongsTo(marche, { as: 'marches', foreignKey: 'id_marche'});

// create all the defined tables in the specified database. 
sequelize.sync()
    .then(() => console.log('atc_marches table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export atc_marche model for use in other files.
module.exports = atc_marche;