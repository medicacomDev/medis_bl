const express = require("express");
const router = express.Router();
var seg_pharma = require("../models/seg_pharma");
var produit = require("../models/produit");
var pack_atc = require("../models/pack_atc");
var pack_presentation = require("../models/pack_presentation");
var pack_produit = require("../models/pack_produit");
var pack = require("../models/pack");
const auth = require("../middlewares/passport");
var configuration = require("../config");
var Sequelize = require("sequelize");
const { Op } = require("sequelize");
const marcheIms = require("../models/marcheIms");
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
router.post("/addPack", auth, (req, res) => {
  var id = req.body.id;
  var date = req.body.date;
  var pharma = req.body.idPharmacie == 0 ? null : req.body.idPharmacie;
  if (id == 0) {
    pack
      .create({
        nom: req.body.nom,
        bonification: req.body.bonification,
        id_pharmacie: pharma,
        date: date,
        segment: req.body.segment,
        etat: 1,
      })
      .then((p) => {
        return res.status(200).send({ id: p.dataValues.id, msg: true });
      })
      .catch((error) => {
        return res.status(403).send({ error: error.id, msg: false });
      });
  } else {
    pack.findOne({ where: { id: id } }).then(function (r1) {
      if (!r1) {
        return res.status(403).send(false);
      } else {
        pack
          .update(
            {
              nom: req.body.nom,
              bonification: req.body.bonification,
              id_pharmacie: pharma,
              date: date,
              segment: req.body.segment,
              etat: 1,
            },
            { where: { id: id } }
          )
          .then(async() => {

            await pack_atc.findAll({ where: { packId: id } }).then((val) => {
              if(val.length)
                pack_atc.destroy({ where: { packId: id } });
            });
            await pack_presentation.findAll({ where: { packId: id } }).then((val) => {
              if(val.length)
                pack_presentation.destroy({ where: { packId: id } });
            });
            await pack_produit.findAll({ where: { packId: id } }).then((val) => {
              if(val.length)
                pack_produit.destroy({ where: { packId: id } });
            });
            return res.status(200).send({ id: id, msg: true });
          })
          .catch((error) => {
            console.log(error);
            return res.status(403).send({ error: error.id, msg: false });
          });
      }
    });
  }
});
router.post("/addFils", auth, (req, res) => {
  var arrayAtc = req.body.arrayAtc;
  var arrayMarches = req.body.arrayMarches;
  var arrayProduits = req.body.arrayProduits;
  pack_atc.bulkCreate(arrayAtc).then(() => {});
  pack_presentation.bulkCreate(arrayProduits).then(() => {});
  pack_produit.bulkCreate(arrayMarches).then(() => {});
  return res.status(200).send(true);
});
router.post("/allPack", auth, async (req, res) => {
  /* pack_produit.findAll({
    include:[{
      model:marcheIms,
      as:"marches"
    },{
      model:pack,
      as:"packs"
    }],
    attributes: [
      'packId',
      [sequelize.fn('GROUP_CONCAT', sequelize.col('marches.lib')), 'desProd']
    ],
    group:["packId"],
    order:[["packId","desc"]]
  }).then(function (r) {
    return res.status(200).send(r);
  }); */
  pack.findAll({ where: { id: { [Op.ne]: 0 } }, order: [["id", "desc"]] })
     .then(function (r) {
      return res.status(200).send(r);
    });
});
router.post("/getActive", auth, (req, res) => {
  pack.findAll({ where: { etat: 1 } }).then(function (r) {
    return res.status(200).send(r);
  });
});

router.put("/changeEtat/:id", auth, (req, res) => {
  var id = req.params.id;
  pack.findOne({ where: { id: id } }).then(function (r1) {
    var etat = 0;
    if (r1.dataValues.etat == 0) etat = 1;
    if (!r1) {
      return res.status(403).send(false);
    } else {
      pack
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
router.post("/getPack", auth, async (req, res) => {
  var id = req.headers["id"];
  var table = await pack_atc.findAll({
    where: { packId: id },
    include: ["packs", "atcs"],
  });

  var header = await pack.findOne({
    where: { id: id },
    include: ["segments", "pharmacies"],
  });

  var tableFinal = [];
  for (const key in table) {
    var element = table[key].dataValues;

    var tablePresentation = await pack_presentation.findAll({
      where: { id_atc: element.id_atc, packId: id },
      include: ["produits", "atcs"],
    });

    var tableProduit = await pack_produit.findAll({
      where: { id_atc: element.id_atc, packId: id },
      include: ["marches", "atcs"],
    });

    element.marches = tableProduit;
    element.produits = tablePresentation;
    tableFinal.push(element);
  }
  return res.status(200).json({ header: header, table: tableFinal });
});

router.post("/getPackByProduits", auth, async (req, res) => {
  var arrayFinal = req.body.arrayFinal;
  var idPacks = req.body.idPacks;
  var arrayId = idPacks.split(",");
  var packSelected = [];
  var test = false;
  for (const key in arrayFinal) {
    var atc = await pack_presentation.findOne({
      where: { id_produit: arrayFinal[key].idProduit, packId: arrayId },
      include: ["atcs"],
    });
    if (atc != null) {
      var table = await pack_atc.findOne({
        where: { packId: atc.dataValues.packId, id_atc: atc.dataValues.id_atc },
        include: ["packs", "atcs"],
      });

      //get by produit
      /*  var table_produit = await pack_presentation.findOne({
        where: { id_produit: atc.dataValues.id, packId: arrayId },
        include: ["packs", "produits"], 
      }); */

      //get by marche
      var table_marche = await pack_produit.findOne({
        where: {
          packId: atc.dataValues.packId,
          id_marche: atc.dataValues.id_marche,
        },
        include: ["packs", "marches"],
      });
      if (table != null) {
        arrayFinal[key].id_pack = table.dataValues.packId;
        arrayFinal[key].id_atc = table.dataValues.id_atc;
        /* arrayFinal[key].quantite_pack = parseFloat(table.dataValues.quantite - arrayFinal[key].Quantite); */
        arrayFinal[key].quantite_pack = table.dataValues.quantite;
        arrayFinal[key].quantite_rest_p = atc ? atc.dataValues.quantite : 0;
        arrayFinal[key].quantite_rest_m = table_marche
          ? table_marche.dataValues.quantite
          : 0;

        arrayFinal[key].montant_rest = table.dataValues.montant;
        arrayFinal[key].montant_rest_p = atc ? atc.dataValues.montant : 0;
        arrayFinal[key].montant_rest_m = table_marche
          ? table_marche.dataValues.montant
          : 0;
        var getPacks = table.dataValues.packs;
        packSelected.push({
          id_atc: atc.dataValues.id_atc,
          value: getPacks.id,
          label: getPacks.nom,
          qte: table.dataValues.quantite,
          qte_p: atc ? atc.dataValues.quantite : 0,
          qte_m: table_marche ? table_marche.dataValues.quantite : 0,
          mnt: table.dataValues.montant,
          mnt_p: atc ? atc.dataValues.montant : 0,
          mnt_m: table_marche ? table_marche.dataValues.montant : 0,
        });
      } else {
        arrayFinal[key].id_pack = 0;
        test = true;
        packSelected.push({
          id_atc: 0,
          value: 0,
          label: "Commande groupée",
          qte: 0,
          qte_p: 0,
          qte_m: 0,
          mnt: 0,
          mnt_p: 0,
          mnt_m: 0,
        });
      }
    } else {
      arrayFinal[key].id_pack = 0;
      test = true;
      packSelected.push({
        id_atc: 0,
        value: 0,
        label: "Commande groupée",
        qte: 0,
        qte_p: 0,
        qte_m: 0,
        mnt: 0,
        mnt_p: 0,
        mnt_m: 0,
      });
    }
  }
  return res.status(200).json({ arrayFinal, packSelected,test });
});
router.get("/getPackBySegment/:id", auth, async (req, res) => {
  var id = req.params.id;
  var arrayOption = [];
  var reqParma = await seg_pharma.findOne({ where: { id_pharmacie: id } });
  var reqFromPack = await pack.findAll({
    where: {
      [Op.or]: [{ id_pharmacie: id }, { id_pharmacie: { [Op.is]: null } }],
    },
    order: [["id_pharmacie", "desc"]],
  });
  var entities = Object.values(JSON.parse(JSON.stringify(reqFromPack)));

  entities.forEach((e) => {
    if (reqParma) {
      if (e.segment == reqParma.dataValues.Segment)
        arrayOption.push({ value: e.id, label: e.nom + "(Recommandé)" });
      else {
        arrayOption.push({ value: e.id, label: e.nom });
      }
    } else {
      arrayOption.push({ value: e.id, label: e.nom });
    }
  });
  return res.status(200).json(arrayOption);
});

module.exports = router;
