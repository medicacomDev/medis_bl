var Sequelize = require("sequelize");
var Produit = require("./produit");
var atc = require("./atc");
var Pack = require("./pack");
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
}, { timestamps: false });

const pack_atc = sequelize.define("pack_atcs", {
  id: {
    type: Sequelize.INTEGER,
    unique: true,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  packId: {
    type: Sequelize.INTEGER,
    unique: false,
    allowNull: true,
    onDelete:'cascade',
    references: {
      model: Pack,
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
  quantite: {
    type: Sequelize.FLOAT,
    unique: false,
    allowNull: true,
  },
  montant: {
    type: Sequelize.FLOAT,
    unique: false,
    allowNull: true,
  },
}, { timestamps: false });
pack_atc.belongsTo(atc, { as: 'atcs', foreignKey: 'id_atc'});
pack_atc.belongsTo(Pack, { as: 'packs', foreignKey: 'packId'});

// create all the defined tables in the specified database.  0
sequelize
  .sync()
  .then(() =>
    console.log(
      "pack table has been successfully created, if one doesn't exist"
    )
  )
  .catch((error) => console.log("This error occured", error));

// export pack model for use in other files
module.exports = pack_atc;
