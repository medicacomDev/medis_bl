const express = require("express");
const router = express.Router();
var user = require("../models/user");
var commande = require("../models/commande");
var bl = require("../models/bl");
var seg_pharma = require("../models/seg_pharma");
var pharmacie = require("../models/pharmacie");
var actionComercial = require("../models/actionComercial");
var commande_bl = require("../models/commande_bl");
var configuration = require("../config");
var Sequelize = require("sequelize");
var notification = require("../models/notification");
var fs = require("fs");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const privateKey = "mySecretKeyabs";
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
const auth = require("../middlewares/passport");
//Decharge
const storageDecharge = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./decharge");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const decharge = multer({ storage: storageDecharge });

// Desplay all lignes of client ...
function insertCmd(obj, idBls) {
  return new Promise((resolve, reject) => {
    var dateCreate = new Date(); // Or the date you'd like converted.
    var date = new Date(
      dateCreate.getTime() - dateCreate.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 10);
    var mm = dateCreate.getMonth() + 1;

    commande
      .create({
        id_action: obj.id_action,
        id_user: obj.id_user,
        id_pharmacie: obj.id_pharmacie,
        id_segment: obj.id_segment,
        etat: obj.etat,
        note: obj.note,
        date: date,
        total: obj.total,
        mois: mm,
      })
      .then((results) => {
        seg_pharma.update(
          { etat: obj.etat },
          { where: { id_pharmacie: obj.id_pharmacie, Segment: obj.id_segment } }
        );
        var splitBl = idBls.split(",");
        var arrayCmd = [];
        splitBl.forEach((val) => {
          arrayCmd.push({
            id_cmd: results.dataValues.id,
            id_bl: val,
          });
        });
        commande_bl.bulkCreate(arrayCmd).then(() => {});
        bl.update(
          { etatCmd: 1, mois: mm },
          { where: { client: obj.id_pharmacie, iduser: obj.id_user } }
        );
        return resolve(results);
      })
      .catch((error) => {
        console.log(error);
        return reject(error);
      });
  });
}

// Desplay all lignes of client ...
function removeLigne(idCmd) {
  return new Promise(async (resolve, reject) => {
    var findCmd = await commande.findOne({ where: { id: idCmd } });
    var findCmdBl = await commande_bl.findAll({ where: { id_cmd: idCmd } });
    if (findCmd) {
      if (findCmdBl.length > 0) {
        await commande_bl.destroy({ where: { id_cmd: idCmd } });
        var arrayBl = [];
        for (const key in findCmdBl) {
          const element = findCmdBl[key];
          arrayBl.push(element.id_bl);
        }
        bl.update({ etatCmd: 0, mois: null }, { where: { id: arrayBl } });
      }
      await commande.destroy({ where: { id: idCmd } });
      /* bl.update(
        { etatCmd: 0, mois:null }); */
    }
    /* commande
      .create({
        id_action: obj.id_action,
        id_user: obj.id_user,
        id_pharmacie: obj.id_pharmacie,
        id_segment: obj.id_segment,
        etat: obj.etat,
        note: obj.note,
        date:date,
        total:obj.total,
        mois:mm
      })
      .then((results) => {
        seg_pharma.update(
          { etat: obj.etat },
          { where: { id_pharmacie: obj.id_pharmacie, Segment: obj.id_segment } }
        );
        return resolve(results);
      })
      .catch((error) => {
        console.log(error);
        return reject(error);
      }); */
  });
}

router.post("/addCommande", auth, async (req, res) => {
  // etat 1: oui delegue *** 2:non delegue *** 3:oui superviseur *** 4: non superviseur *** 5: refuse admin *** 6: refuse admin superviseur *** 7: recommande
  var id_action = req.body.id_action;
  var id_user = req.body.id_user;
  var id_pharmacie = req.body.id_pharmacie;
  var id_segment = req.body.id_segment;
  var etat = req.body.etat;
  var note = req.body.note;
  var total = req.body.total;
  var idBls = req.body.idBls;
  var id_cmd = req.body.id_cmd;
  var obj = {
    id_action: id_action,
    id_user: id_user,
    id_pharmacie: id_pharmacie,
    id_segment: id_segment,
    etat: etat,
    note: note,
    total: total,
  };
  var pharmaFind = await pharmacie.findOne({ where: { id: id_pharmacie } });
  var text = `Commande pharmacie :${pharmaFind.dataValues.nom}`;
  switch (etat) {
    case "1":
    case "3":
      text += ` clôturer`;
      break;
    default:
      text += ` refusée`;
      break;
  }
  if (etat == 1 || etat == 2) {
    var etatNotif = etat == 1 ? 8 : 9;
    var userFind = await user.findOne({ where: { id: id_user } });
    var userFindByline = await user.findAll({
      where: { line: userFind.dataValues.line, idrole: 1 },
    });
    userFindByline.forEach((e) => {
      notification.create({
        id_user: e.dataValues.id,
        etat: etatNotif,
        text: text,
      });
    });
  } else {
    var cmd = await commande.findOne({
      where: { id_pharmacie: id_pharmacie, id_action: id_action },
    });
    var etatNotif = etat == 3 ? 10 : 11;
    notification.create({
      id_user: cmd.dataValues.id_user,
      etat: etatNotif,
      text: text,
    });
  }
  var mois = new Date().getMonth() + 1;
  /* var userFind=await user.findOne({ where: { id: id_user } });
  var userFindByline=await findAll(userFind.dataValues.line); */
  // etat 1: oui delegue *** 2:non delegue *** 3:oui superviseur *** 4: non superviseur *** 5: refuse admin *** 6: refuse admin superviseur *** 7: recommande

  switch (etat) {
    case "1":
    case "2":
      {
        insertCmd(obj, idBls);
      }
      break;
    case "4":
    case "5":
    case "6":
      {
        commande.update({ etat: etat, note: note }, { where: { id: id_cmd } });
      }
      break;
    case "3":
      {
        commande.update(
          { etat: etat, note: note, mois: mois },
          { where: { id: id_cmd } }
        );
      }
      break;
    /*  case "5":{
        commande.update(
          { etat: etat,note: note },
          { where: { id_pharmacie: id_pharmacie, id_action: id_action } }
        );
      }
      break; */
    default:
      {
        removeLigne(id_cmd);
        /*  commande.destroy(
          { where: { id: id_cmd } }
        );
       bl.update(
          { etatCmd: 0, mois:null },
          { where: { client: obj.id_pharmacie, iduser: obj.id_user } }); */
      }
      break;
  }
  return res.status(200).send(true);
});
router.get("/getCommande/:idAction", auth, async (req, res) => {
  var idAction = req.params.idAction;
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;
  var idRole = decoded.idrole;

  var where = { id_action: idAction, etat: [2, 3] };
  if (idRole == 2)
    where = { id_action: idAction, etat: [2, 3], id_user: idUser };

  var whereR = { id_action: idAction, etat: [5] };
  if (idRole == 2)
    whereR = { id_action: idAction, etat: [4, 6], id_user: idUser };
  var whereU = idRole === 1 ? {id_parent:idUser} : {}
  try {
    var findCmd = await commande.findAll({
      where: where,
      include: ["pharmacies", "segments", { model: user, as: "users", where: whereU }],
      order: [["id", "desc"]],
    });
    var findCmdR = await commande.findAll({
      where: whereR,
      include: ["pharmacies", "segments", { model: user, as: "users", where: whereU }],
      order: [["id", "desc"]],
    });
    return res.status(200).send({ findCmd, findCmdR });
  } catch (error) {}
  /* commande
    .findAll({
      where: where,
      include: ["pharmacies", "segments","users"],
      order: [["id", "desc"]],
    })
    .then(function (r) {
      return res.status(200).send(r);
    }); */
});
/* router.get("/getCommandeRefuser/:idAction", auth, (req, res) => {
  var idAction = req.params.idAction;
  var token =(req.headers["x-access-token"])
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;
  var idRole = decoded.idrole;
  var where = {id_action: idAction,etat:[5,6]}
  if(idRole==2)
    where = {id_action: idAction,etat:[5,6] ,id_user:idUser}
  commande
    .findAll({
      where: where,
      include: ["pharmacies", "segments","users"],
      order: [["id", "desc"]],
    })
    .then(function (r) {
      return res.status(200).send(r);
    });
}); */
router.get("/getCommandeByEtat/:idAction", auth, (req, res) => {
  var idAction = req.params.idAction;
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;
  var idRole = decoded.idrole;
  var where = idRole === 1 ? { id_action: idAction, etat: [1] } : { id_action: idAction, etat: [1], id_user: idUser };
  var whereU = idRole === 1 ? {id_parent:idUser} : {}
  commande
    .findAll({
      where: where,
      include: ["pharmacies", "segments", { model: user, as: "users", where: whereU }],
      order: [["id", "desc"]],
    })
    .then(async function (rows) {
      var list = [];
      if (rows.length != 0) {
        rows.forEach((e) => {
          list.push({
            delegue: e.users.nomU + " " + e.users.prenomU,
            Pharmacie: e.pharmacies.nom,
            Segment: e.segments.id,
            id: e.id,
            id_pharmacie: e.id_pharmacie,
            nomSeg: e.segments.nom,
            total: e.total.toFixed(3),
          });
        });
      }
      return res.status(200).send({
        rows: list,
      });
    });
});
router.post(
  "/saveDecharge/:id",
  auth,
  decharge.single("file"),
  async (req, res) => {
    var id = req.params.id;
    var date = new Date(); // Or the date you'd like converted.
    var datePayement = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 10);
    var blFind = await commande.findOne({ where: { id: id } });
    if (blFind != null) {
      commande
        .update(
          {
            datePayement: datePayement,
            payer: 1,
            decharge: req.body.fileName,
          },
          { where: { id: id } }
        )
        .then(() => {
          return res.status(200).send(true);
        })
        .catch((error) => {
          return res.status(403).send(false);
        });
    }
  }
);
router.get("/getDecharge/:id", async (req, res) => {
  var id = req.params.id;
  var blFind = await commande.findOne({ where: { id: id } });
  if (blFind != null) {
    var file = blFind.dataValues.decharge;
    if (file) {
      if (fs.existsSync("./decharge/" + file)) {
        var file = fs.createReadStream("./decharge/" + file);
        file.pipe(res);
      } else return res.status(403).json({ message: false });
    } else {
      return res.status(403).json({ message: false });
    }
  }
});
router.get("/getAllParmacieCmd", auth, (req, res) => {
  commande
    .findAll({
      include: [
        {
          attributes: ["id", "nom"],
          model: pharmacie,
          as: "pharmacies",
        },
      ],
      group: ["id_pharmacie"],
    })
    .then(function (client) {
      var arrayOption = [];
      arrayOption.push({
        value: 0,
        label: "Tous",
      });
      client.forEach((elem) => {
        arrayOption.push({
          value: elem.pharmacies.id,
          label: elem.pharmacies.nom,
        });
      });
      return res.status(200).send(arrayOption);
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});
router.get("/totalCaByAction/:idAction", auth, async (req, res) => {
  const idAction = req.params.idAction;
  /* var findAction = await actionComercial.findOne({
    where: { id: idAction },
  }); */
  var mntTotal = await commande.sum("total", {
    where: {
      [Op.and]: [{ id_action: idAction }, { etat: 3 }],
    },
  });
  var final = mntTotal ? mntTotal.toFixed(3) : 0;
  return res.status(200).send({ mntTotal: final });
});
module.exports = router;
