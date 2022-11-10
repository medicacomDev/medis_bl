const express = require("express");
const router = express.Router();
var marche = require("../models/marcheIms");
var produit = require("../models/produit");
var atc = require("../models/atc");
var marcheAtc = require("../models/atc_marche");
const auth = require("../middlewares/passport");
var configuration = require("../config");
var Sequelize = require("sequelize");
const { Op } = require("sequelize");
const sequelize = new Sequelize(
  configuration.connection.base,
  configuration.connection.root,
  configuration.connection.password,
  {
    host: configuration.connection.host,
    port: configuration.connection.port,
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    operatorsAliases: false,
  }
);

// Desplay all lignes of client ...
router.post("/addAtc", auth, (req, res) => {
  var id = req.body.id;
  if (id == 0) {
    atc
      .create({
        nom: req.body.nom,
        etat: 1,
      })
      .then((s) => {
        req.body.marcheSelect.forEach((element) => {
          marcheAtc
            .create({
              id_atc: s.dataValues.id,
              id_marche: element.value,
            })
            .then((pp) => {})
            .catch((error) => {
              console.log(error);
              return res.status(403).send(false);
            });
        });
        return res.status(200).send(true);
      })
      .catch((error) => {
        return res.status(403).send(false);
      });
  } else {
    atc.findOne({ where: { id: id } }).then(function (r1) {
      if (!r1) {
        return res.status(403).send(false);
      } else {
        atc
          .update(
            {
              nom: req.body.nom,
              etat: 1,
            },
            { where: { id: id } }
          )
          .then((r2) => {
            marcheAtc
              .destroy({ where: { id_atc: id } })
              .then((des) => {
                req.body.marcheSelect.forEach((element) => {
                  marcheAtc
                    .create({
                      id_atc: id,
                      id_marche: element.value,
                    })
                    .then((pp) => {})
                    .catch((error) => {
                      console.log(error);
                      return res.status(403).send(false);
                    });
                });
              })
              .catch((error) => {
                console.log(error);
                return res.status(403).send(error);
              });
            return res.status(200).send(true);
          })
          .catch((error) => {
            return res.status(403).send(false);
          });
      }
    });
  }
});
router.post("/allAtc", auth, (req, res) => {
  marcheAtc
    .findAll({
      include: [
        {
          model: marche,
          as: "marches",
        },
        {
          model: atc,
          as: "atcs",
        },
      ],
      attributes: [
        "id_atc",
        [sequelize.fn("GROUP_CONCAT", sequelize.col("marches.lib")), "marche"],
      ],
      group: ["id_atc"],
      order: [["id_atc", "desc"]],
    })
    .then(function (r) {
      return res.status(200).send(r);
    });
});

router.post("/getAtc", auth, (req, res) => {
  var id = req.headers["id"];
  atc.findOne({ where: { id: id } }).then(function (r1) {
    if (!r1) {
      return res.status(403).send(false);
    } else {
      return res.status(200).json(r1.dataValues);
    }
  });
});
router.get("/getIdMarcheAtc/:id", auth, (req, res) => {
  var id = req.params.id;
  var arrayOption = [];
  marcheAtc
    .findAll({ where: { id_atc: id }, include: ["marches"] })
    .then(function (r1) {
      if (!r1) {
        return res.status(403).send(false);
      } else {
        r1.forEach((elem) => {
          arrayOption.push({
            value: elem.marches.id,
            label: elem.marches.lib,
          });
        });
        return res.status(200).json({ arrayOption });
      }
    });
});
router.post("/getActive", auth, (req, res) => {
  atc.findAll({ where: { etat: 1, id: { [Op.ne]: 0 } } }).then(function (r) {
    return res.status(200).send(r);
  });
});
router.put("/changerEtat/:id", auth, (req, res) => {
  var id = req.params.id;
  atc.findOne({ where: { id: id } }).then(function (r1) {
    var etat = 0;
    if (r1.dataValues.etat == 0) etat = 1;
    if (!r1) {
      return res.status(403).send(false);
    } else {
      atc
        .update(
          {
            etat: etat,
          },
          { where: { id: id } }
        )
        .then((r2) => {
          return res.status(200).send(true);
        })
        .catch((error) => {
          return res.status(403).send(false);
        });
    }
  });
});

router.get("/getProduits/:id", auth, async (req, res) => {
  var id = req.params.id;

  var sql_m = await `select COALESCE(0) as quantite,COALESCE(0) as montant, m.lib, am.id_marche, am.id_atc from atc_marches am
  left join atcs a on a.id = am.id_atc
  left join marcheims m on m.id=am.id_marche
  left join produits p on p.desigims = m.id
  where a.id = ${id} group by am.id_marche`;
  var findMarcheAtc = await sequelize.query(sql_m, { type: sequelize.QueryTypes.SELECT });
  
  var sql = await `select COALESCE(0) as quantite,COALESCE(0) as montant, p.designation, am.id_marche, p.id as id_produit, am.id_atc
  from atc_marches am
  left join atcs a on a.id = am.id_atc
  left join marcheims m on m.id=am.id_marche
  left join produits p on p.desigims = m.id
  where a.id = ${id}`;
  var findProduitAtc = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  return res.status(200).send({findMarcheAtc,findProduitAtc});
});
module.exports = router;
