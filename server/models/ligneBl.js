var Sequelize = require("sequelize");
var produit = require("./produit");
var bl = require("./bl");
var pack = require("./pack");
var configuration = require("../config");
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
}, { timestamps: false });

const LigneBl = sequelize.define("lignebls", {
  id: {
    type: Sequelize.INTEGER,
    unique: true,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  idbielle: {
    type: Sequelize.INTEGER,
    unique: false,
    onDelete:'cascade',
    references: {
      model: bl,
      key: "id", 
    },
  },
  idproduit: {
    type: Sequelize.INTEGER,
    unique: false,
    references: {
      model: produit,
      key: "id",
    },
  },
  quantite: {
    type: Sequelize.FLOAT,
    unique: false,
    allowNull: true,
  },
  quantite_rest: {
    type: Sequelize.FLOAT,
    unique: false,
    allowNull: true,
    defaultValue: 0
  },
  quantite_rest_p: {
    type: Sequelize.FLOAT,
    unique: false,
    allowNull: true,
    defaultValue: 0
  },
  quantite_rest_m: {
    type: Sequelize.FLOAT,
    unique: false,
    allowNull: true,
    defaultValue: 0
  },
  montant: {
    type: Sequelize.FLOAT,
    unique: false,
    allowNull: true,
  },
  montant_rest: {
    type: Sequelize.FLOAT,
    unique: false,
    allowNull: true,
    defaultValue: 0
  },
  montant_rest_p: {
    type: Sequelize.FLOAT,
    unique: false,
    allowNull: true,
    defaultValue: 0
  },
  montant_rest_m: {
    type: Sequelize.FLOAT,
    unique: false,
    allowNull: true,
    defaultValue: 0
  },
  id_pack: {
      type: Sequelize.INTEGER,
      unique: false,
      allowNull: false,
      references: {
          model: pack,
          key: "id"
      }
  },
  id_atc: {
      type: Sequelize.INTEGER,
      unique: false,
      allowNull: false,
      references: {
          model: atc,
          key: "id"
      }
  },
}, { timestamps: false });
LigneBl.belongsTo(produit, { as: 'produits', foreignKey: 'idproduit'});
LigneBl.belongsTo(bl, { as: 'bls', foreignKey: 'idbielle'});
LigneBl.belongsTo(pack, {as: 'packs', foreignKey: 'id_pack'});
LigneBl.belongsTo(atc, {as: 'atcs', foreignKey: 'id_atc'});

// create all the defined tables in the specified database.
sequelize.sync({alter:true})
  .then(() =>
    console.log("Ligne Bl table has been successfully created, if one doesn't exist")
  )
  .catch((error) => console.log("This error occured", error));

// export pack model for use in other files
module.exports = LigneBl;
