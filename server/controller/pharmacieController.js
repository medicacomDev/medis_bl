const express = require("express");
const router = express.Router();
var pharmacie = require("../models/pharmacie");
var seg_pharma = require("../models/seg_pharma");
const auth = require("../middlewares/passport");
const { Op } = require("sequelize");

// Desplay all lignes of client ...
router.post("/addPharmacie",auth, (req, res) => {
  var id = req.body.id;
  var idSeg = req.body.idSegment;
  if (id == 0) {
    pharmacie
      .create({
        nom: req.body.nom,
        adresse: req.body.adresse,
        idIms: req.body.idIms,
        idSegment: idSeg,
        telephone: req.body.telephone,
        email: req.body.email,
        code: req.body.code,
        lat: req.body.lat,
        lng: req.body.lng,
        etat: 1,
      })
      .then((r) => {
        if(idSeg!=0){
          seg_pharma.create({
            id_pharmacie:r.id ,
            Pharmacie:req.body.nom,
            Segment:idSeg,
          })
        }
        return res.status(200).send(true);
      })
      .catch((error) => {
        return res.status(403).send(false);
      });
  } else {
    pharmacie.findOne({ where: { id: id } }).then(function (r1) {
      if (!r1) {
        return res.status(403).send(false);
      } else {
        pharmacie
          .update(
            {
              nom: req.body.nom,
              adresse: req.body.adresse,
              idSegment: idSeg,
              telephone: req.body.telephone,
              email: req.body.email,
              code: req.body.code,
              lat: req.body.lat,
              lng: req.body.lng,
              etat: 1,
            },
            { where: { id: id } }
          )
          .then((r2) => {
            if(idSeg!=0){
              seg_pharma.findOne({where:{id_pharmacie:id}}).then(val=>{
                if(val==null)
                  seg_pharma.create({
                    id_pharmacie:id ,
                    Pharmacie:req.body.nom,
                    Segment:idSeg,
                  })
                else {
                  seg_pharma.update(
                    {
                      Segment: idSeg,
                    },
                    { where: { id_pharmacie: id } }
                  );
                }
              })
            }
            else {
              seg_pharma.findOne({where:{id_pharmacie:id}}).then(val=>{
                if(val!=null)
                  seg_pharma.destroy({where:{id_pharmacie:id}})
              })
            }
            return res.status(200).send(true);
          })
          .catch((error) => {
            return res.status(403).send(false);
          });
      }
    });
  }
});
router.post("/allPharmacie", auth, (req, res) => {
  pharmacie.findAll({order:[["id","desc"]]}).then(function (r) {
    return res.status(200).send(r);
  });
});
router.post("/getPharmacieByBricks", auth, (req, res) => {
  var idBricks = req.body.idBricks;
  pharmacie.findAll({ where: { etat: 1,idIms:idBricks },include:["ims"] }).then(function (r) {
    return res.status(200).send(r);
  });
});
router.post("/getActive", auth, (req, res) => {
  pharmacie.findAll({ where: { etat: 1 },include:["ims"] }).then(function (r) {
    return res.status(200).send(r);
  });
});

//Delete client
router.delete("/deletePharmacie/:id",auth, (req, res) => {
  var id = req.params.id;
  pharmacie.findOne({ where: { id: id } }).then(function (r1) {
    if (!r1) {
      return res.status(403).send(false);
    } else {
      pharmacie
        .destroy({ where: { id: id } })
        .then((r2) => {
          return res.status(200).send(true);
        })
        .catch((error) => {
          return res.status(403).send(false);
        });
    }
  });
});
router.post("/getPharmacie", auth, (req, res) => {
  var id = req.headers["id"];
  pharmacie.findOne({ where: { id: id } }).then(function (r1) {
    if (!r1) {
      return res.status(403).send(false);
    } else {
      return res.status(200).json(r1.dataValues);
    }
  });
});

router.put("/changeEtat/:id",auth, (req, res) => {
  var id = req.params.id;
  pharmacie.findOne({ where: { id: id } }).then(function (r1) {
    var etat = 0;
    if(r1.dataValues.etat == 0)
      etat = 1;
    if (!r1) {
      return res.status(403).send(false);
    } else {
      pharmacie.update({
        etat: etat
      },{ where: { id: id } })
      .then((r2) => {
        return res.status(200).send(true);
      })
      .catch((error) => {
        return res.status(403).send(false);
      });
    }
  });
});

router.post("/getPharmacieByNum", auth, (req, res) => {
  var code = req.body.code;
  var where = {
    code: code,
  };
  if (req.body.id != 0)
    where = {
      code: code,
      id: { [Op.ne]: req.body.id },
    };
  pharmacie.findAll({
    where: where,
  }).then(async function (r) {
    if (r.length != 0) {
      return res.status(200).json(true);
    } else {
      return res.status(200).json(false);
    }
  })
});

module.exports = router;
