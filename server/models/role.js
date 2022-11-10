var Sequelize = require('sequelize');
var configuration = require("../config")
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

// setup Role model and its fields.
var Role = sequelize.define('roles', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
	nom: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true, 
        defaultValue: 1
    },
}, { timestamps: false }); 

Role.findAll().then(function (u) {
    if (u.length == 0) {
        Role.create({
            nom: "admin"
        })
    }
});


// create all the defined tables in the specified database. 
sequelize.sync()
    .then(() => console.log('Roles table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export Role model for use in other files.
module.exports = Role;