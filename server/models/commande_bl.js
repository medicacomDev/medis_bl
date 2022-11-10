var Sequelize = require('sequelize');
var configuration = require("../config")
var user = require("./user")
var bl = require("./bl")
var commande = require("./commande")
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

// setup Notification model and its fields.
var Notification = sequelize.define('commande_bls', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    id_user: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: true,
        references: {
            model: user,
            key: "id"
        }
    },
    id_cmd: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: true,
        onDelete:'cascade',
        references: {
            model: commande,
            key: "id"
        }
    },
    id_bl: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: true,
        references: {
            model: bl,
            key: "id"
        }
    },
}); 

Notification.belongsTo(user, {as: 'users', foreignKey: 'id_user'});

// create all the defined tables in the specified database. alter:true 
sequelize.sync()
    .then(() => console.log('Notifications table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export Notification model for use in other files.
module.exports = Notification;