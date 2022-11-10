var Sequelize = require('sequelize');
var configuration = require("../config");
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

// setup ligne_support model and its fields.
var ligne_support = sequelize.define('ligne_supports', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
	id_prod: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: true, 
    },
	id_lift: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: true, 
    },
}, { timestamps: false }); 

// create all the defined tables in the specified database. 
sequelize.sync()
    .then(() => console.log('ligne_supports table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export ligne_support model for use in other files.
module.exports = ligne_support;