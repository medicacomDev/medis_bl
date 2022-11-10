const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const privateKey = "mySecretKeyabs";
/** start import model **/
var bl = require("../models/bl");
var exportBl = require("../models/exportBl");
var ims = require("../models/ims");
var produit = require("../models/produit");
var marcheIms = require("../models/marcheIms");
var ligneBl = require("../models/ligneBl");
var commande_bl = require("../models/commande_bl");
var detailsims = require("../models/detailsims");
var user = require("../models/user");
var pharmacie = require("../models/pharmacie");
var secteur = require("../models/secteur");
var pack = require("../models/pack");
var actionPacks = require("../models/actionPacks");
var pack_atc = require("../models/pack_atc");
var pack_presentation = require("../models/pack_presentation");
var pack_produit = require("../models/pack_produit");
var notification = require("../models/notification");
var atc = require("../models/atc");
const fetch = require("node-fetch");
var FormData = require("form-data");
/** end import model **/
const auth = require("../middlewares/passport");
const multer = require("multer");
var fs = require("fs");
var configuration = require("../config");
const { Op } = require("sequelize");
var Sequelize = require("sequelize");
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
const SaveBase64 = require("node-base64-to-image");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./bl");
  },
  filename: function (req, file, cb) {
    var splitF = file.originalname.split(".");
    var extensionFile = splitF[1];
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + extensionFile);
  },
});
const upload = multer({ storage: storage });
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

var path = require("path");
const commande = require("../models/commande");
var public = path.join(__dirname, "bl");
router.post("/saveFile", auth, upload.single("file"), (req, res) => {
  res.send({ filename: req.file.filename });
});
async function sendFile(file) {
  const filepath = path.join(file);
  const image = fs.createReadStream(filepath);
  var form = new FormData();
  form.append("file", image);
  form.append("name", "eee.jpg");
  /* form.append("api_key", "WU011uRaUe66Utp5YgaJANFMLiw0MPuZgf87djyX"); */
  form.append("api_key", "Nbx4JmLl60xFosvHAksDYqUlTpYl8pgMVgnNfxnx");
  const response = await fetch("http://164.132.56.71:8080/bon-livraison", {
    method: "POST",
    headers: form.getHeaders(),
    body: form,
  }).then();
  const data = await response.json();
  return data;
  /* res.send({ data: data }); */
}
router.post("/saveFile64", auth, async (req, res) => {
  const base64Data = req.body.imageSrc;
  var img = base64Data.indexOf("data:image/png");
  var ext = img == 0 ? "png" : "jpg";
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const imageNameWithPath = `./bl/${uniqueSuffix}.${ext}`;
  var fileName = `${uniqueSuffix}.${ext}`;
  SaveBase64(base64Data, imageNameWithPath, ext);
  var data = await sendFile(imageNameWithPath);
  return res.status(200).send({ data, fileName });
});
/* router.post("/sendFile", async (req, res) => {
  const filepath = path.join('./bl/eee.jpg')
  const image = fs.createReadStream(filepath)
  var form = new FormData();
  form.append("file", image);
  form.append("name", "eee.jpg");
  form.append("api_key", "Nbx4JmLl60xFosvHAksDYqUlTpYl8pgMVgnNfxnx");
  const response = await fetch(
    "http://164.132.56.71:8080/bon-livraison",
    {
      method: "POST",
      headers: form.getHeaders(),
      body: form,
    }
  ).then();
  const data = await response.json();
  res.send({ data: data });
  
}); */
router.post("/addBl", auth, async (req, res) => {
  var date1 = new Date(); // Or the date you'd like converted.
  var date = new Date(date1.getTime() - date1.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var line = decoded.line;
  var getUserByLine = await user.findAll({
    where: {
      line: line,
      idrole: 1,
    },
  });
  var entities = Object.values(JSON.parse(JSON.stringify(getUserByLine)));
  bl.create({
    client: req.body.bl.Client,
    id_gouvernorat: req.body.bl.idIms,
    numBl: req.body.bl.numeroBL,
    numeroBL: req.body.bl.numeroBL,
    dateBl: req.body.bl.dateBL,
    fournisseur: req.body.bl.Fournisseur,
    iduser: req.body.bl.iduser,
    action: req.body.bl.action,
    file: req.body.bl.file,
    etat: 1,
    dateInsertion: date,
  })
    .then((r) => {
      req.body.ligneBl.forEach(async (e) => {
        var findLigne = ligneBl.findAll({ where: { idProduit: e.idProduit } });
        /* var rest = e.quantite_pack - e.Quantite; */
        /* if(findLigne.length !=0){
          var montant = await ligneBl.sum("quantite", {
            where: { idProduit: e.idProduit },
            include: {
              model: bl,
              as: "bls",
            },
          });
          
        }*/
        ligneBl.create({
          idbielle: r.id,
          montant: e.Montant,
          idproduit: e.idProduit,
          quantite: e.Quantite,
          quantite_rest: e.quantite_pack,
          quantite_rest_p: e.quantite_rest_p,
          quantite_rest_m: e.quantite_rest_m,
          montant_rest: e.montant_rest,
          montant_rest_p: e.montant_rest_p,
          montant_rest_m: e.montant_rest_m,
          id_pack: e.id_pack,
          id_atc: e.id_atc,
        });
        /* ligneBl.create({
          idbielle: r.id,
          quantite_rest: e.quantite_pack,
          montant: e.Montant,
          idproduit: e.idProduit,
          quantite: e.Quantite,
          id_pack: e.id_pack
        }); */
      });
      entities.forEach((e) => {
        notification.create({
          id_user: e.id,
          etat: 1,
          text: "Nouveau bl: " + req.body.bl.numeroBL,
        });
      });
      return res.status(200).send(true);
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});
router.post("/getAllAnneeLignesBL", auth, (req, res) => {
  bl.findAll({
    attributes: [[sequelize.fn("YEAR", sequelize.col("dateBl")), "annee"]],
    group: ["annee"],
  })
    .then(function (b) {
      return res.status(200).send(b);
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});
router.post("/tableProduits", auth, (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;
  const annee = req.body.annee;
  const trimestre = req.body.trimestre;
  const idLine = req.body.idLine;
  const idRole = req.body.idRole;
  const tab = [];
  tab.push(" b.etat = 1 ");
  switch (trimestre) {
    case 1:
      tab.push(" DATE_FORMAT(b.dateBl,'%c') in (1,2,3) ");
      break;
    case 2:
      tab.push(" DATE_FORMAT(b.dateBl,'%c') in (4,5,6) ");
      break;
    case 3:
      tab.push(" DATE_FORMAT(b.dateBl,'%c') in (7,8,9) ");
      break;
    case 4:
      tab.push(" DATE_FORMAT(b.dateBl,'%c') in (10,11,12) ");
      break;
  }
  if (idRole == 1) {
    tab.push(` u.id_parent = ${idUser} `);
  }
  tab.push(` year(b.dateBl) = ${annee} `);
  var condition = tab.join(" and ");
  var sql = `SELECT b.id as idBl,b.numeroBL,b.dateInsertion,b.bonification, b.dateBl,u.nomU as nomDelegue,
  i.libelle as ims,b.client,cl.nom as nomClt, pp.nom as pack,b.fournisseur,b.dateValidation,
  p.designation as designation , li.montant as mnt,li.quantite as qte , 
  DATE_FORMAT(b.dateBl,'%Y') as annee , 
  DATE_FORMAT(b.dateBl,'%b') as month ,
  DATE_FORMAT(b.dateBl,'%e') as day
  FROM bls b 
  left join lignebls li on b.id =li.idbielle
  left join pharmacies cl on cl.id =b.client
  left join users u on u.id =b.iduser
  left join produits p on p.id =li.idproduit
  left join packs pp on pp.id = li.id_pack
  left join ims i on i.id =b.id_gouvernorat
  where ${condition}
  ORDER BY dateBl desc`;
  sequelize
    .query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(function (r1) {
      if (!r1) {
        return res.status(403).send(false);
      } else {
        return res.status(200).json(r1);
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});
router.post("/blVerif", auth, (req, res) => {
  var where = {
    numeroBL: req.body.numeroBL,
    fournisseur: req.body.fournisseur,
  };
  if (typeof req.body.id != "undefined")
    where = {
      numeroBL: req.body.numeroBL,
      fournisseur: req.body.fournisseur,
      id: { [Op.ne]: req.body.id },
    };
  bl.findAll({
    where: where,
  })
    .then(async function (r) {
      var test = false;
      if (r.length != 0) {
        r.forEach(async (e, k) => {
          var montant = await ligneBl.sum("montant", {
            where: { idbielle: e.dataValues.id },
            include: {
              model: bl,
              as: "bls",
            },
          });
          if (parseFloat(montant).toFixed(3) == parseFloat(req.body.somme)) {
            test = true;
          }
          if (k + 1 === r.length) return res.status(200).send(test);
        });
      } else {
        return res.status(200).send(test);
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});

router.post("/getBlBack", auth, (req, res) => {
  var where = {};
  var whereU = {};
  if (req.body.idRole == 1) {
    where = { etat: 0 };
    ///whereU = { line: req.body.idLine };
    if (req.body.id > 0) whereU = { line: req.body.idLine, id: req.body.id };
  } else where = { etat: [0, 2] };
  /* bl.findAll({
    where: {
      [Op.and]: [
        sequelize.where(
          sequelize.fn("year", sequelize.col("dateBl")), 
          req.body.year
        ),
        where,
      ],
    },
    include: [
      { model: user, as: "users", where: whereU },
      "pharmacies",
      "packs",
    ],
    order: [["etat", "DESC"]],
  }).then(function (r) {
    return res.status(200).send(r);
  }); */
  ligneBl
    .findAll({
      attributes: [[sequelize.fn("sum", sequelize.col("montant")), "mnt"]],
      group: ["idbielle"],
      include: {
        model: bl,
        as: "bls",
        where: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn("year", sequelize.col("dateBl")),
              req.body.year
            ),
            where,
          ],
        },
        include: [
          {
            model: user,
            as: "users",
            where: whereU,
          },
          "pharmacies",
          "packs",
          "ims",
        ],
        order: [["etat", "DESC"]],
      },
    })
    .then(function (r) {
      return res.status(200).send(r);
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});

router.post("/getBl", auth, (req, res) => {
  var where = {};
  var whereU = {};
  /* if (req.body.idRole == 1) {
    where = { etat: 0 };
    whereU = { line: req.body.idLine };
  } else {
    where = { etat: [0, 2] };  
    whereU = { id:req.body.id};  
  } */

  if (req.body.idRole == 1 || req.body.idRole == 2) {
    whereU = { line: req.body.idLine };
    if (req.body.idRole == 1)
      if (req.body.idDelegue != 0)
        where = { etat: 0, iduser: req.body.idDelegue };
      else where = { etat: 0 };
    if (req.body.idRole == 2)
      if (req.body.idDelegue != 0)
        where = { etat: [0, 2], iduser: req.body.idDelegue };
      else where = { etat: [0, 2] };
  } else {
    if (req.body.idDelegue != 0) where = { iduser: req.body.idDelegue };
  }
  ligneBl
    .findAll({
      attributes: [[sequelize.fn("sum", sequelize.col("montant")), "mnt"]],
      group: ["idbielle"],
      include: {
        model: bl,
        as: "bls",
        where: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn("year", sequelize.col("dateBl")),
              req.body.year
            ),
            where,
          ],
        },
        include: [
          {
            model: user,
            as: "users",
            where: whereU,
          },
          "pharmacies",
          "actions",
          "ims",
        ],
      },
      order: [["idbielle", "DESC"]],
    })
    .then(function (data) {
      var array = [];
      data.forEach((e, key) => {
        var bls = e.dataValues.bls;
        var ext = bls.file.split(".");
        array.push({
          id: bls.id,
          pharmacie: bls.pharmacies.nom,
          users: bls.users.nomU + bls.users.prenomU,
          action: bls.actions.nom,
          date: bls.dateBl,
          dateInsertion: bls.dateInsertion,
          fileURL: null,
          etat: bls.etat,
          mnt: parseFloat(e.dataValues.mnt).toFixed(3),
          numeroBl: bls.numeroBL,
          ext: ext[1],
          file: bls.file,
          fournisseur: bls.fournisseur,
          commentaire: bls.commentaire,
          ims: bls.ims.libelle,
        });
      });
      return res.status(200).send(array);
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});
router.post("/getBlVis", auth, (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;
  const client = req.body.client;
  const idDelegue = req.body.idDelegue;
  const idLine = parseInt(req.body.idLine);
  const idRole = parseInt(req.body.idRole);
  const year = parseInt(req.body.year);
  var whereD = {};
  var whereC = {};
  var whereU = {};
  if (idRole == 1 || idRole == 2) {
     whereU = idRole == 1 ?{ id_parent: idUser }:{};
    if (idDelegue != 0) whereD = { iduser: idDelegue };
  } else {
    if (idDelegue != 0) whereD = { iduser: idDelegue };
  }
  if (client != 0) whereC = { client: client };
  ligneBl
    .findAll({
      attributes: [[sequelize.fn("sum", sequelize.col("montant")), "mnt"]],
      group: ["idbielle"],
      include: {
        model: bl,
        as: "bls",
        where: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn("year", sequelize.col("dateBl")),
              year
            ),
            { etat: 1, payer: 0 },
            whereC,
            whereD,
          ],
        },
        include: [
          { model: user, as: "users", where: whereU },
          "pharmacies",
          "actions",
          "ims",
        ],
        /* order: [["id", "DESC"]], */
      },
      order: [["idbielle", "DESC"]],
    })
    .then(function (r) {
      var array = [];
      r.forEach((e, key) => {
        var bls = e.dataValues.bls;
        var ext = bls.file.split(".");
        array.push({
          id: bls.id,
          pharmacie: bls.pharmacies.nom,
          users: bls.users.nomU + " " + bls.users.prenomU,
          action: bls.actions.nom,
          bonification: bls.bonification,
          payer: bls.payer,
          date: bls.dateBl,
          fileURL: null,
          etat: bls.etat,
          mnt: parseFloat(e.dataValues.mnt).toFixed(3),
          numeroBl: bls.numeroBL,
          ext: ext[1],
          file: bls.file,
          fournisseur: bls.fournisseur,
          ims: bls.ims.libelle,
        });
      });
      return res.status(200).send(array);
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});
router.post("/totalCA", auth, async (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;
  const year = req.body.year;
  const mois = req.body.mois;
  const idLine = req.body.idLine;
  const idRole = req.body.idRole;
  var where = idRole ==1 ? { id_parent: idUser } : {};
  var whereMois = null;
  if (mois != 0) {
    whereMois = sequelize.where(
      sequelize.fn("month", sequelize.col("dateBl")),
      mois
    );
  }
  var montant = await ligneBl.sum("montant", {
    include: {
      model: bl,
      as: "bls",
      where: {
        [Op.and]: [
          sequelize.where(sequelize.fn("year", sequelize.col("dateBl")), year),
          whereMois,
          { etat: 1 },
        ],
      },
      include: {
        model: user,
        as: "users",
        where: where,
      },
    },
  });
  var totalBl = await bl.count({
    distinct: true,
    col: "id",
    where: {
      [Op.and]: [
        sequelize.where(sequelize.fn("year", sequelize.col("dateBl")), year),
        whereMois,
        { etat: 1 },
      ],
    },
    include: {
      model: user,
      as: "users",
      where: where,
    },
  });
  var totalClient = await bl.count({
    distinct: true,
    col: "client",
    where: {
      [Op.and]: [
        sequelize.where(sequelize.fn("year", sequelize.col("dateBl")), year),
        whereMois,
        { etat: 1 },
      ],
    },
    include: {
      model: user,
      as: "users",
      where: where,
    },
  });
  montant = montant == null ? 0 : montant;
  totalClient = totalClient == null ? 0 : totalClient;
  totalBl = totalBl == null ? 0 : totalBl;
  return res
    .status(200)
    .send({ montant: montant.toFixed(3), totalBl, totalClient });
});
router.post("/totalCaByPack", auth, async (req, res) => {
  const idPack = req.body.idPacks;
  const idLine = req.body.idLine;
  const dateDebut = req.body.dateDebut;
  const dateFin = req.body.dateFin;
  var splitId = idPack.split(",");
  /*  var countBl = await ligneBl.findAll({
    where: { id_pack: splitId },
    include: {
      model: bl,
      as: "bls",
      where: {
        [Op.and]: [
          { dateBl: { [Op.gte]: dateDebut } },
          { dateBl: { [Op.lte]: dateFin } },
        ],
      },
      include: {
        model: user,
        as: "users",
        where: { line: idLine },
      },
    },
  }); */
  /* var mntBl = await ligneBl.sum("montant", {
    where: { id_pack: splitId },
    include: {
      model: bl,
      as: "bls",
      where: {
        [Op.and]: [
          { dateBl: { [Op.gte]: dateDebut } },
          { dateBl: { [Op.lte]: dateFin } },
        ],
      },
      include: {
        model: user,
        as: "users",
        where: { line: idLine },
      },
    },
  }); */
  return res.status(200).send({ countBl: 0 });
});
router.post("/changeEtat", auth, async (req, res) => {
  var id = req.body.id;
  var etat = req.body.etat;
  var bonification = req.body.bonification;
  var commentaire = req.body.commentaire;
  var date1 = new Date(); // Or the date you'd like converted.
  var dateValidation = new Date(
    date1.getTime() - date1.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 10);

  var getBlByUser = await bl.findOne({ where: { id: id }, include: ["users"] });
  /* var getUserById = await user.findOne({
    where: { id: getBlByUser.dataValues.iduser }
  }); */
  var txt = "";
  var etatNotif = 0;
  if (etat == 1) {
    txt = "Bl accepter : " + getBlByUser.dataValues.numeroBL;
    etatNotif = 2;
  } else {
    txt = "Bl refuser : " + getBlByUser.dataValues.numeroBL;
    etatNotif = 3;
  }

  notification.create({
    id_user: getBlByUser.dataValues.iduser,
    etat: etatNotif,
    text: txt,
  });
  bl.update(
    {
      etat: etat,
      bonification: bonification,
      dateValidation: dateValidation,
      commentaire: commentaire,
    },
    { where: { id: id } }
  )
    .then((r2) => {
      return res.status(200).send(r2);
    })
    .catch((error) => {
      return res.status(403).send(false);
    });
});
router.delete("/delete/:id", auth, async (req, res) => {
  var id = req.params.id;
  var blFind = await bl.findOne({ where: { id: req.params.id } });
  if (blFind != null) {
    var file = blFind.dataValues.file;
    if (file != "")
      if (fs.existsSync("./bl/" + file)) fs.unlinkSync("./bl/" + file);
    ligneBl
      .destroy({ where: { idbielle: id } })
      .then((r2) => {
        bl.destroy({ where: { id: id } }).then((r2) => {
          return res.status(200).send(true);
        });
      })
      .catch((error) => {
        return res.status(403).send(false);
      });
  }
});
router.put("/updateNum/:id", auth, async (req, res) => {
  var id = req.params.id;
  var numeroBL = req.body.numeroBL;
  var blFind = await bl.findOne({ where: { id: req.params.id } });
  if (blFind != null) {
    bl.update(
      {
        numeroBL: numeroBL,
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
router.put("/payer/:id", auth, async (req, res) => {
  var id = req.params.id;
  var date = new Date(); // Or the date you'd like converted.
  var datePayement = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  var blFind = await bl.findOne({ where: { id: id } });
  if (blFind != null) {
    bl.update(
      {
        datePayement: datePayement,
        payer: 1,
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
});
router.get("/getFile/:id", async (req, res) => {
  var id = req.params.id;
  var blFind = await bl.findOne({ where: { id: id } });
  if (blFind != null) {
    var file = blFind.dataValues.file;
    if (file) {
      if (fs.existsSync("./bl/" + file)) {
        var file = fs.createReadStream("./bl/" + file);
        file.pipe(res);
      } else return res.status(403).json({ message: false });
    } else {
      return res.status(403).json({ message: false });
    }
  }
  /* if (fs.existsSync("./bl/" + req.params.file)) {
    var file = fs.createReadStream("./bl/" + req.params.file);
    file.pipe(res);
  } else return res.status(403).json({ message: false }); */
});
router.post("/getAllClientBl", auth, (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idSuper = decoded.id;
  var where = {};
  var whereL = {};
  var year = req.body.anneeLocal;
  if (req.body.idRole == 2) {
    if (req.body.idUser > 0) where = { etat: 1, iduser: req.body.idUser };
  } else if (req.body.idRole == 1) {
    whereL = { id_parent: idSuper };
  } else {
    where = { etat: 1 };
  }

  bl.findAll({
    where: {
      [Op.and]: [
        sequelize.where(
          sequelize.fn("year", sequelize.col("bls.dateBl")),
          year
        ),
        where,
      ],
    },
    include: [
      {
        model: user,
        as: "users",
        where: {
          [Op.and]: [whereL],
        },
      },
      "pharmacies",
    ],
    order: [["id", "DESC"]],
    group: ["client"],
  })
    .then(function (r) {
      return res.status(200).send(r);
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});

router.post("/getAllDelegueBl", auth, (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;
  var whereL = {};
  var year = req.body.year;
  if (req.body.idRole == 1) {
    whereL = { id_parent: idUser };
  }
  bl.findAll({
    attributes: ["iduser", "dateBl", "etat"],
    where: {
      [Op.and]: [
        sequelize.where(sequelize.fn("year", sequelize.col("dateBl")), year),
      ],
    },

    include: [
      {
        attributes: ["id", "nomU", "prenomU"],
        model: user,
        as: "users",
        where: whereL,
        /* where: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn("year", sequelize.col("dateBl")),
              year
            ),
            whereL,
          ],
        }, */
      },
    ],
    order: [["id", "DESC"]],
    group: ["bls.iduser"],
  })
    .then(function (r) {
      return res.status(200).send(r);
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});

router.post("/getAllProduitBl", auth, (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;
  var whereL = {};
  var year = req.body.anneeLocal;
  if (req.body.idRole == 1) {
    whereL = { id_parent: idUser };
  }
  ligneBl
    .findAll({
      attributes: ["id", "idproduit"],
      include: [
        {
          attributes: ["id", "designation"],
          model: produit,
          as: "produits",
        },
        {
          model: bl,
          as: "bls",
          where: {
            [Op.and]: [
              sequelize.where(
                sequelize.fn("year", sequelize.col("dateBl")),
                year
              ),
            ],
          },
          include: [
            {
              model: user,
              as: "users",
              where: whereL,
            },
          ],
        },
      ],
      group: ["lignebls.idproduit"],
    })
    .then(function (prod) {
      var arrayOption = [];
      prod.forEach((elem) => {
        arrayOption.push({
          value: elem.produits.id,
          label: elem.produits.designation,
        });
      });
      return res.status(200).send(arrayOption);
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});
router.post("/getAllMarcheBl", auth, (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;
  var whereL = {};
  var year = req.body.anneeLocal;
  if (req.body.idRole == 1) {
    whereL = { id_parent: idUser };
  }
  ligneBl
    .findAll({
      include: [
        {
          attributes: ["id", "desigims"],
          model: produit,
          as: "produits",
          include: {
            attributes: ["id", "lib"],
            model: marcheIms,
            as: "marcheims",
          },
        },
        {
          model: bl,
          as: "bls",
          where: {
            [Op.and]: [
              sequelize.where(
                sequelize.fn("year", sequelize.col("dateBl")),
                year
              ),
            ],
          },
          include: [
            {
              model: user,
              as: "users",
              where: whereL,
            },
          ],
        },
      ],
      group: ["produits.desigims"],
    })
    .then(function (marche) {
      var arrayOption = [];
      marche.forEach((elem) => {
        if (elem.produits.marcheims.id)
          arrayOption.push({
            value: elem.produits.marcheims.id,
            label: elem.produits.marcheims.lib,
          });
      });
      return res.status(200).send(arrayOption);
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});

router.post("/getAllSecteurBl", auth, (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;
  var whereL = {};
  var year = req.body.anneeLocal;
  if (req.body.idRole == 1) {
    whereL = { id_parent: idUser };
  }

  bl.findAll({
    where: {
      [Op.and]: [
        sequelize.where(sequelize.fn("year", sequelize.col("dateBl")), year),
      ],
    },
    include: [
      {
        attributes: ["idsect"],
        model: user,
        as: "users",
        where: whereL,
        include: [
          {
            attributes: ["libelleSect", "id"],
            model: secteur,
            as: "secteurs",
          },
        ],
      },
    ],
    order: [["id", "DESC"]],
    group: ["users.idsect"],
  })
    .then(function (r) {
      return res.status(200).send(r);
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});
router.post("/getAllParmacieBl", auth, (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;
  var year = req.body.anneeLocal;
  var where = {};
  var whereL = {};
  if (req.body.idRole == 2) {
    if (req.body.idUser > 0) where = { etat: 1, iduser: req.body.idUser, };
  } else if (req.body.idRole == 1) {
    whereL = { id_parent: idUser  };
  } else {
    where = { etat: 1 };
  }
  bl.findAll({
    where: {
      [Op.and]: [
        sequelize.where(sequelize.fn("year", sequelize.col("dateBl")), year),
        where,
      ],
    },
    include: [
      {
        model: user,
        as: "users",
        where: whereL,
      },
      {
        attributes: ["id", "nom"],
        model: pharmacie,
        as: "pharmacies",
      },
    ],
    group: ["client"],
  })
    .then(function (client) {
      var arrayOption = [];
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
router.post("/getMarcheFromDetail", auth, (req, res) => {
  detailsims
    .findAll({
      group: ["chef_produit"],
      order: [["chef_produit", "DESC"]],
    })
    .then(function (data) {
      var arrayOption = [];
      data.forEach((elem) => {
        arrayOption.push({
          value: elem.chef_produit,
          label: elem.chef_produit,
        });
      });
      return res.status(200).send(arrayOption);
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});
router.post("/getAllImsBl", auth, (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;
  var whereL = {};
  var year = req.body.anneeLocal;
  if (req.body.idRole == 1) {
    whereL = { id_parent: idUser };
  }
  bl.findAll({
    where: {
      [Op.and]: [
        sequelize.where(sequelize.fn("year", sequelize.col("dateBl")), year),
      ],
    },
    include: [
      {
        attributes: ["id", "nomU", "prenomU"],
        model: user,
        as: "users",
        where: whereL,
      },
      {
        attributes: ["id", "libelle"],
        model: ims,
        as: "ims",
      },
    ],
    group: ["id_gouvernorat"],
  })
    .then(function (bricks) {
      var arrayOption = [{ value: 0, label: "Tous" }];
      bricks.forEach((elem) => {
        arrayOption.push({
          value: elem.ims.id,
          label: elem.ims.libelle,
        });
      });
      return res.status(200).send(arrayOption);
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});
router.post("/getAllPackBl", auth, (req, res) => {
  ligneBl
    .findAll({
      attributes: ["id", "id_pack"],
      include: [
        {
          attributes: ["id", "nom"],
          model: pack,
          as: "packs",
        },
      ],
      group: ["id_pack"],
    })
    .then(function (data) {
      var arrayOption = [];
      data.forEach((elem) => {
        arrayOption.push({
          value: elem.packs.id,
          label: elem.packs.nom,
        });
      });
      return res.status(200).send(arrayOption);
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});
router.post("/comparaisonImsBricks", auth, (req, res) => {
  var year = req.body.year;
  const mois = req.body.mois;
  var whereMois = null;
  var whereMois1 = null;
  if (mois != 0) {
    whereMois = sequelize.where(
      sequelize.fn("month", sequelize.col("dateBl")),
      mois
    );
    whereMois1 = sequelize.where(
      sequelize.fn("month", sequelize.col("date")),
      mois
    );
  }
  ims
    .findAll({
      where: { etat: 1, id: { [Op.ne]: 0 } },
    })
    .then(function (r) {
      var list = [];
      if (r)
        r.forEach(async (e, k) => {
          // sum mnt from bl
          var mntBl = await ligneBl.sum("montant", {
            group: ["idbielle"],
            include: {
              model: bl,
              as: "bls",
              where: {
                [Op.and]: [
                  sequelize.where(
                    sequelize.fn("year", sequelize.col("dateBl")),
                    year
                  ),
                  { id_gouvernorat: e.dataValues.id },
                  { etat: 1 },
                  whereMois,
                ],
              },
            },
          });

          // qte from bl
          var qteBl = await ligneBl.sum("quantite", {
            group: ["idbielle"],
            include: {
              model: bl,
              as: "bls",
              where: {
                [Op.and]: [
                  sequelize.where(
                    sequelize.fn("year", sequelize.col("dateBl")),
                    year
                  ),
                  { id_gouvernorat: e.dataValues.id },
                  { etat: 1 },
                  whereMois,
                ],
              },
            },
          });

          // sum mnt from Detail
          var mntDetail = await detailsims.sum("total", {
            group: ["idIms"],
            where: {
              [Op.and]: [
                sequelize.where(
                  sequelize.fn("year", sequelize.col("date")),
                  year
                ),
                { idIms: e.dataValues.id },
                whereMois1,
              ],
            },
          });

          // qte from Detail
          var qteDetail = await detailsims.sum("volume", {
            group: ["idIms"],
            where: {
              [Op.and]: [
                sequelize.where(
                  sequelize.fn("year", sequelize.col("date")),
                  year
                ),
                { idIms: e.dataValues.id },
                whereMois1,
              ],
            },
          });
          mntBl = mntBl === null ? 0 : mntBl;
          qteBl = qteBl === null ? 0 : qteBl;
          mntDetail = mntDetail === null ? 0 : mntDetail;
          qteDetail = qteDetail === null ? 0 : qteDetail;

          list.push({
            ims: e.dataValues.libelle,
            idIms: e.dataValues.id,
            mntBl: mntBl.toFixed(3),
            qteBl: qteBl,
            mntDetail: mntDetail.toFixed(3),
            qteDetail: qteDetail,
          });
          if (k + 1 === r.length) return res.status(200).send({ list });
        });
      else return res.status(403).send(list);
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});
router.post("/comparaisonMarcheIms", auth, (req, res) => {
  var year = req.body.year;
  const mois = req.body.mois;
  var whereMois = null;
  var whereMois1 = null;
  if (mois != 0) {
    whereMois = sequelize.where(
      sequelize.fn("month", sequelize.col("dateBl")),
      mois
    );
    whereMois1 = sequelize.where(
      sequelize.fn("month", sequelize.col("date")),
      mois
    );
  }
  marcheIms
    .findAll({ where: { etat: 1 } })
    .then(function (r) {
      var list = [];
      if (r)
        r.forEach(async (e, k) => {
          // total montant bl
          var mntBl = await ligneBl.sum("montant", {
            include: {
              model: bl,
              as: "bls",
              where: {
                [Op.and]: [
                  sequelize.where(
                    sequelize.fn("year", sequelize.col("dateBl")),
                    year
                  ),
                  { etat: 1 },
                  whereMois,
                ],
              },
            },
            include: {
              model: produit,
              as: "produits",
              where: { desigims: e.dataValues.id },
              group: ["desigims"],
            },
          });
          // total quantite bl
          var qteBl = await ligneBl.sum("quantite", {
            include: {
              model: bl,
              as: "bls",
              where: {
                [Op.and]: [
                  sequelize.where(
                    sequelize.fn("year", sequelize.col("dateBl")),
                    year
                  ),
                  { etat: 1 },
                  whereMois,
                ],
              },
            },
            include: {
              model: produit,
              as: "produits",
              where: { desigims: e.dataValues.id },
              group: ["desigims"],
            },
          });

          // sum mnt from Detail
          var mntDetail = await detailsims.sum("total", {
            group: ["chef_produit"],
            where: {
              [Op.and]: [
                sequelize.where(
                  sequelize.fn("year", sequelize.col("date")),
                  year
                ),
                { chef_produit: e.dataValues.lib },
                whereMois1,
              ],
            },
          });

          // qte from Detail
          var qteDetail = await detailsims.sum("volume", {
            group: ["chef_produit"],
            where: {
              [Op.and]: [
                sequelize.where(
                  sequelize.fn("year", sequelize.col("date")),
                  year
                ),
                { chef_produit: e.dataValues.lib },
                whereMois1,
              ],
            },
          });
          mntBl = mntBl === null ? 0 : mntBl;
          qteBl = qteBl === null ? 0 : qteBl;
          mntDetail = mntDetail === null ? 0 : mntDetail;
          qteDetail = qteDetail === null ? 0 : qteDetail;

          list.push({
            marche: e.dataValues.lib,
            idMarche: e.dataValues.id,
            mntBl: mntBl.toFixed(3),
            qteBl: qteBl,
            mntDetail: mntDetail.toFixed(3),
            qteDetail: qteDetail,
          });
          if (k + 1 === r.length) return res.status(200).send({ list });
        });
      else return res.status(403).send(list);
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});

router.post("/suiviMensuelBack", auth, (req, res) => {
  const year = req.body.year;
  const qteCA = req.body.qteCA;
  const mois = req.body.mois;
  const idClient = req.body.idClient;
  const idLine = req.body.idLine;
  const idUser = req.body.idUser;
  var whereMois = null;
  var whereLine = null;
  if (mois != 0) {
    whereMois = sequelize.where(
      sequelize.fn("month", sequelize.col("dateBl")),
      mois
    );
  }
  if (idLine != 0) whereLine = { line: idLine };
  ligneBl
    .findAll({
      attributes: [[sequelize.fn("sum", sequelize.col("montant")), "mnt"]],
      include: {
        model: bl,
        as: "bls",
        attributes: [
          [sequelize.fn("YEAR", sequelize.col("dateBl")), "annee"],
          [sequelize.fn("MONTH", sequelize.col("dateBl")), "mois"],
        ],
        where: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn("year", sequelize.col("dateBl")),
              year
            ),
            whereMois,
            { etat: 1 },
          ],
        },
        include: [
          {
            model: user,
            as: "users",
          },
          {
            model: pharmacie,
            as: "pharmacies",
          },
        ],
      },
      group: [
        [sequelize.fn("YEAR", sequelize.col("dateBl")), "annee"],
        [sequelize.fn("MONTH", sequelize.col("dateBl")), "mois"],
      ],
    })
    .then(function (r) {
      return res.status(200).send(r);
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});

//Évolution du CA généré par BL && Suivi mensuel du CA généré par BL
router.post("/suiviMensuel", auth, (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idRole = decoded.idrole;
  var idSuper = decoded.id;
  const qteCA = req.body.qteCA;
  const idLine = req.body.idLine;
  const idUser = req.body.idUser;
  const year = req.body.year;
  const lastYear = year - 1;
  var where = ` where b.etat = 1 and DATE_FORMAT(b.dateBl,'%Y') IN (${year} , ${lastYear}) `;
  if (idRole == 1) {
    where += ` and u.id_parent = ${idSuper}`;
  }
  /* if (idLine != 0) {
    where += ` and u.line=${idLine}`;
  } */
  if (idUser != 0) {
    where += ` and b.iduser=${idUser}`;
  }
  var valQteCA = "";
  var order = "";
  if (qteCA == 1) {
    valQteCA = " sum(li.quantite) as qteCA";
    order = "qteCA";
  } else {
    valQteCA = " sum(li.montant) as qteCA";
    order = "qteCA";
  }
  var sql = `SELECT  ${valQteCA},
      DATE_FORMAT(b.dateBl,'%b') as mounth ,
      DATE_FORMAT(b.dateBl,'%Y') as annee
      FROM bls b 
      left join lignebls li on  b.id =li.idbielle  
      left join users u on b.iduser = u.id
      ${where}
      group by mounth,annee order by ${order}  DESC`;
  sequelize
    .query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(function (r1) {
      if (!r1) {
        return res.status(403).send(false);
      } else {
        return res.status(200).json(r1);
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});

//CA généré par les BL selon le secteur
router.post("/chiffreParSecteur", auth, (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;
  const year = req.body.year;
  const qteCA = req.body.qteCA;
  const mois = req.body.mois;
  const idLine = req.body.idLine;
  const idRole = req.body.idRole;
  const secteurs = req.body.secteur;
  const limit = req.body.limit;
  var whereU = {};
  if (secteurs.length != 0 && idRole == 1) {
    /* whereU = [{ idsect: secteurs, line: idLine }]; */
    whereU = [{ idsect: secteurs, id_parent: idUser }];
  } else if ( idRole == 1) {
    /* whereU = [{ line: idLine }]; */
    whereU = [{ id_parent: idUser }];
  } else if (secteurs.length != 0) {
    whereU = [{ idsect: secteurs }];
  }
  var whereMois = null;
  if (mois != 0) {
    whereMois = sequelize.where(
      sequelize.fn("month", sequelize.col("dateBl")),
      mois
    );
  }
  /* if (idRole != 0) whereLine = { line: idLine }; */
  var valQteCA = "";
  if (qteCA == 1) {
    valQteCA = "quantite";
    order = "qteCA";
  } else {
    valQteCA = "montant";
    order = "qteCA";
  }
  ligneBl
    .findAll({
      limit: limit,
      attributes: [[sequelize.fn("sum", sequelize.col(valQteCA)), "qteCA"]],
      include: {
        model: bl,
        as: "bls",
        attributes: [[sequelize.fn("YEAR", sequelize.col("dateBl")), "annee"]],
        where: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn("year", sequelize.col("dateBl")),
              year
            ),
            whereMois,
            { etat: 1 },
          ],
        },
        include: [
          {
            model: user,
            as: "users",
            where: whereU,
            include: {
              model: secteur,
              as: "secteurs",
            },
          },
        ],
      },
      group: [["bls.users.idsect"]],
      order: [[sequelize.fn("sum", sequelize.col(valQteCA)), "DESC"]],
    })
    .then(function (data) {
      var arraySect = [];
      var arrayMnt = [];
      var arrayOption = [];
      data.forEach((d, k) => {
        var som =
          qteCA == 1 ? d.dataValues.qteCA : d.dataValues.qteCA.toFixed(3);
        arrayMnt.push(som);
        arraySect.push(d.dataValues.bls.users.secteurs.libelleSect);
        arrayOption.push({
          value: d.dataValues.bls.users.secteurs.id,
          label: d.dataValues.bls.users.secteurs.libelleSect,
        });
      });
      return res.status(200).send({ arraySect, arrayMnt, arrayOption });
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});

//CA géneré par les BL selon délégué
router.post("/venteBLParDelegue", auth, (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;
  const year = req.body.year;
  const qteCA = req.body.qteCA;
  const mois = req.body.mois;
  const idLine = req.body.idLine;
  const idRole = req.body.idRole;
  const users = req.body.user;
  const limit = req.body.limit;
  var whereU = {};
  if (users.length != 0 && idRole == 1) {
    whereU = [{ id: users, line: idLine, id_parent: idUser }];
    /* whereU = [{ id: users, line: idLine }]; */
  } else if (idRole == 1) {
    whereU = [{ line: idLine, id_parent: idUser }];
    /* whereU = [{ line: idLine }]; */
  } else if (users.length != 0) {
    whereU = [{ id: users }];
  }
  var whereMois = null;
  if (mois != 0) {
    whereMois = sequelize.where(
      sequelize.fn("month", sequelize.col("dateBl")),
      mois
    );
  }
  /* if (idRole != 0) whereLine = { line: idLine }; */
  var valQteCA = "";
  if (qteCA == 1) {
    valQteCA = "quantite";
    order = "qteCA";
  } else {
    valQteCA = "montant";
    order = "qteCA";
  }
  ligneBl
    .findAll({
      limit: limit,
      attributes: [[sequelize.fn("sum", sequelize.col(valQteCA)), "qteCA"]],
      include: {
        model: bl,
        as: "bls",
        attributes: [[sequelize.fn("YEAR", sequelize.col("dateBl")), "annee"]],
        where: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn("year", sequelize.col("dateBl")),
              year
            ),
            whereMois,
            { etat: 1 },
          ],
        },
        include: [
          {
            model: user,
            as: "users",
            where: whereU,
          },
        ],
      },
      order: [[sequelize.fn("sum", sequelize.col(valQteCA)), "DESC"]],
      group: [["bls.users.id"]],
    })
    .then(function (data) {
      var arrayUser = [];
      var arrayOption = [];
      var arrayMnt = [];
      data.forEach((d) => {
        var som =
          qteCA == 1 ? d.dataValues.qteCA : d.dataValues.qteCA.toFixed(3);
        arrayMnt.push(som);
        arrayUser.push(
          d.dataValues.bls.users.nomU + " " + d.dataValues.bls.users.prenomU
        );
        arrayOption.push({
          value: d.dataValues.bls.users.id,
          label:
            d.dataValues.bls.users.nomU + " " + d.dataValues.bls.users.prenomU,
        });
      });
      return res.status(200).send({ arrayUser, arrayMnt, arrayOption });
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});

//CA des produits extraits des BL
router.post("/produitMarche", auth, (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;
  const year = req.body.year;
  const qteCA = req.body.qteCA;
  const mois = req.body.mois;
  const idLine = req.body.idLine;
  const idRole = req.body.idRole;
  const marches = req.body.marche;
  var limit = req.body.limit;
  if (limit == 0) {
    limit = 10;
  }
  /* var whereU = {};
  if (idRole != 0 && idRole != 4 && idRole != 5) whereU = { line: idLine }; */
  var whereU = idRole == 1 ? { id_parent: idUser } : {};
  var whereMois = null;
  if (mois != 0) {
    whereMois = sequelize.where(
      sequelize.fn("month", sequelize.col("dateBl")),
      mois
    );
  }
  var whereProd = {};
  if (marches.length != 0) whereProd = { desigims: marches };
  var valQteCA = "";
  if (qteCA == 1) {
    valQteCA = "quantite";
    order = "qteCA";
  } else {
    valQteCA = "montant";
    order = "qteCA";
  }
  ligneBl
    .findAll({
      limit: limit,
      attributes: [[sequelize.fn("sum", sequelize.col(valQteCA)), "qteCA"]],
      include: [
        {
          model: bl,
          as: "bls",
          attributes: [
            [sequelize.fn("YEAR", sequelize.col("dateBl")), "annee"],
          ],
          where: {
            [Op.and]: [
              sequelize.where(
                sequelize.fn("year", sequelize.col("dateBl")),
                year
              ),
              whereMois,
              { etat: 1 },
            ],
          },
          include: [
            {
              attributes: ["id", "line"],
              model: user,
              as: "users",
              where: whereU,
            },
          ],
        },
        {
          attributes: ["id", "designation"],
          model: produit,
          as: "produits",
          where: whereProd,
          include: {
            attributes: ["id", "lib"],
            model: marcheIms,
            as: "marcheims",
            where: { id: { [Op.ne]: 0 } },
          },
        },
      ],
      group: [["produits.marcheims.lib"]],
      order: [[sequelize.fn("sum", sequelize.col(valQteCA)), "DESC"]],
    })
    .then(function (data) {
      var arrayMarche = [];
      var arrayOption = [];
      var arrayMnt = [];
      data.forEach((d) => {
        var som =
          qteCA == 1 ? d.dataValues.qteCA : d.dataValues.qteCA.toFixed(3);
        arrayMnt.push(som);
        arrayMarche.push(d.dataValues.produits.marcheims.lib);
        arrayOption.push({
          value: d.dataValues.produits.marcheims.id,
          label: d.dataValues.produits.marcheims.lib,
        });
      });
      return res.status(200).send({ arrayMarche, arrayMnt, arrayOption });
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});

//CA BL par produit
router.post("/venteBLProduit", auth, (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;
  const year = req.body.year;
  const qteCA = req.body.qteCA;
  const mois = req.body.mois;
  const idLine = req.body.idLine;
  const idRole = req.body.idRole;
  const produits = req.body.produit;
  var limit = req.body.limit;
  if (limit == 0) limit = 10;
  var whereU = idRole == 1 ? { id_parent: idUser } : {};
  var whereMois = null;
  if (mois != 0) {
    whereMois = sequelize.where(
      sequelize.fn("month", sequelize.col("dateBl")),
      mois
    );
  }
  var whereProd = {};
  if (produits.length != 0) whereProd = { id: produits };
  var valQteCA = "";
  if (qteCA == 1) {
    valQteCA = "quantite";
    order = "qteCA";
  } else {
    valQteCA = "montant";
    order = "qteCA";
  }
  ligneBl
    .findAll({
      limit: limit,
      attributes: [[sequelize.fn("sum", sequelize.col(valQteCA)), "qteCA"]],
      include: [
        {
          model: bl,
          as: "bls",
          attributes: [
            [sequelize.fn("YEAR", sequelize.col("dateBl")), "annee"],
          ],
          where: {
            [Op.and]: [
              sequelize.where(
                sequelize.fn("year", sequelize.col("dateBl")),
                year
              ),
              whereMois,
              { etat: 1 },
            ],
          },
          include: [
            {
              attributes: ["id", "line"],
              model: user,
              as: "users",
              where: whereU,
            },
          ],
        },
        {
          attributes: ["id", "designation"],
          model: produit,
          as: "produits",
          where: whereProd,
          include: {
            model: marcheIms,
            as: "marcheims",
          },
        },
      ],
      group: [["produits.designation"]],
      order: [[sequelize.fn("sum", sequelize.col(valQteCA)), "DESC"]],
    })
    .then(function (data) {
      var arrayProd = [];
      var arrayOption = [];
      var arrayMnt = [];
      data.forEach((d) => {
        var som =
          qteCA == 1 ? d.dataValues.qteCA : d.dataValues.qteCA.toFixed(3);
        arrayMnt.push(som);
        arrayProd.push(d.dataValues.produits.designation);
        arrayOption.push({
          value: d.dataValues.produits.id,
          label: d.dataValues.produits.designation,
        });
      });
      return res.status(200).send({ arrayProd, arrayMnt, arrayOption });
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});

//CA BL par pharmacie
router.post("/venteBLPharmacie", auth, (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idSuper = decoded.id;
  const year = req.body.year;
  const qteCA = req.body.qteCA;
  const mois = req.body.mois;
  const idLine = req.body.idLine;
  const idRole = req.body.idRole;
  const pharmacies = req.body.pharmacie;
  const idUser = req.body.idUser;
  var limit = req.body.limit;
  if (limit == 0) {
    limit = 10;
  }
  /* var whereU = {};
  if (idRole != 0 && idRole != 4 && idRole != 5) whereU = { line: idLine }; */
  var whereU = idRole == 1 ? { id_parent: idSuper } : {};
  var whereUser = {};
  if (idUser != 0) whereUser = { iduser: idUser };
  var whereMois = null;
  if (mois != 0) {
    whereMois = sequelize.where(
      sequelize.fn("month", sequelize.col("dateBl")),
      mois
    );
  }
  var wherePharmacie = {};
  if (pharmacies.length != 0) wherePharmacie = { id: pharmacies };
  var valQteCA = "";
  if (qteCA == 1) {
    valQteCA = "quantite";
    order = "qteCA";
  } else {
    valQteCA = "montant";
    order = "qteCA";
  }
  ligneBl
    .findAll({
      limit: limit,
      attributes: [[sequelize.fn("sum", sequelize.col(valQteCA)), "qteCA"]],
      include: [
        {
          model: bl,
          as: "bls",
          attributes: [
            [sequelize.fn("YEAR", sequelize.col("dateBl")), "annee"],
            /* [sequelize.fn("DISTINCT", sequelize.col("id_gouvernorat")), "id_gouvernorat"], */
          ],
          where: {
            [Op.and]: [
              sequelize.where(
                sequelize.fn("year", sequelize.col("dateBl")),
                year
              ),
              whereMois,
              whereUser,
              { etat: 1 },
            ],
          },
          include: [
            {
              attributes: ["id", "line", "id_parent"],
              model: user,
              as: "users",
              where: whereU,
            },
            {
              model: pharmacie,
              attributes: ["id", "nom"],
              as: "pharmacies",
              where: wherePharmacie,
            },
          ],
        },
      ],
      group: [["bls.pharmacies.nom"]],
      order: [[sequelize.fn("sum", sequelize.col(valQteCA)), "DESC"]],
    })
    .then(function (data) {
      var arrayPharmacie = [];
      var arrayOption = [];
      var arrayMnt = [];
      data.forEach((d) => {
        var som =
          qteCA == 1 ? d.dataValues.qteCA : d.dataValues.qteCA.toFixed(3);
        arrayMnt.push(som);
        arrayPharmacie.push(d.dataValues.bls.pharmacies.nom);
        arrayOption.push({
          value: d.dataValues.bls.pharmacies.id,
          label: d.dataValues.bls.pharmacies.nom,
        });
      });
      return res
        .status(200)
        .send({ data, arrayPharmacie, arrayMnt, arrayOption });
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});

//CA par pharmacies par bricks (Top 15)
router.post("/chartPharmacieBricks", auth, (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;
  const year = req.body.year;
  const qteCA = req.body.qteCA;
  const mois = req.body.mois;
  const idLine = req.body.idLine;
  const idRole = req.body.idRole;
  const idBriks = req.body.idBriks;
  var where = "";
  if (mois != 0) {
    where += `and month(b.dateBl) ='${mois}'`;
  }

  if (idRole == 1) {
    /* where += `and u.line=${idLine}`; */
    where += ` and u.id_parent = ${idUser}`;
  }
  var valIdBriks = "";
  if (idBriks != 0) {
    valIdBriks = "and i.id = " + idBriks;
  }

  var valQteCA = "";
  var order = "";
  if (qteCA == 1) {
    valQteCA = " sum(li.quantite) as mnt";
    order = "mnt";
  } else {
    valQteCA = " sum(li.montant) as mnt";
    order = "mnt";
  }
  var sql = `SELECT distinct(i.libelle) as libelleIms,c.nom as nomClient,i.id ,
  ${valQteCA} ,year(b.dateBl) as annee,b.client
  FROM bls b 
  left join lignebls li on  b.id =li.idbielle 
  left join pharmacies c on  c.id =b.client 
  left join ims i on  i.id =c.idIms
  left join users u on b.iduser = u.id
  where b.etat = 1 and 
  year(b.dateBl)=${year} 
  ${where} ${valIdBriks}
  group by b.client order by ${order} DESC limit 15`;
  sequelize
    .query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(function (dataBL) {
      if (!dataBL) {
        return res.status(403).send(false);
      } else {
        var arrayIms = [];
        var arrayMnt = [];
        dataBL.forEach((data2) => {
          arrayIms.push(data2.nomClient);
          arrayMnt.push(parseFloat(data2.mnt).toFixed(3));
        });
        return res.status(200).json({ arrayIms, arrayMnt });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});

//CA des BL par Bricks
router.post("/chiffreParIms", auth, (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;
  const year = req.body.year;
  const qteCA = req.body.qteCA;
  const mois = req.body.mois;
  const idLine = req.body.idLine;
  const idRole = req.body.idRole;
  const idBriks = req.body.idBriks;
  var limit = req.body.limit;
  if (limit == 0) {
    limit = 10;
  }
  /* var whereU = {};
  if (idRole != 0 && idRole != 4 && idRole != 5) whereU = { line: idLine }; */
  var whereU = idRole == 1 ? { id_parent: idUser } : {};
  var whereMois = null;
  if (mois != 0) {
    whereMois = sequelize.where(
      sequelize.fn("month", sequelize.col("dateBl")),
      mois
    );
  }
  var whereBriks = {};
  if (idBriks.length != 0) whereBriks = { id: idBriks };
  var valQteCA = "";
  if (qteCA == 1) {
    valQteCA = "quantite";
    order = "qteCA";
  } else {
    valQteCA = "montant";
    order = "qteCA";
  }
  ligneBl
    .findAll({
      limit: limit,
      attributes: [[sequelize.fn("sum", sequelize.col(valQteCA)), "qteCA"]],
      include: [
        {
          model: bl,
          as: "bls",
          attributes: [
            [sequelize.fn("YEAR", sequelize.col("dateBl")), "annee"],
            "id_gouvernorat",
          ],
          where: {
            [Op.and]: [
              sequelize.where(
                sequelize.fn("year", sequelize.col("dateBl")),
                year
              ),
              whereMois,
              { etat: 1 },
            ],
          },
          include: [
            {
              attributes: ["id", "line"],
              model: user,
              as: "users",
              where: whereU,
            },
            {
              model: ims,
              as: "ims",
              attributes: ["id", "libelle"],
              where: whereBriks,
            },
          ],
        },
      ],
      group: [["bls.id_gouvernorat"]],
      order: [[sequelize.fn("sum", sequelize.col(valQteCA)), "DESC"]],
    })
    .then(function (data) {
      var arrayIms = [];
      var arrayOption = [];
      var arrayMnt = [];
      data.forEach((d) => {
        var som =
          qteCA == 1 ? d.dataValues.qteCA : d.dataValues.qteCA.toFixed(3);
        arrayMnt.push(som);
        arrayIms.push(d.dataValues.bls.ims.libelle);
        arrayOption.push({
          value: d.dataValues.bls.ims.id,
          label: d.dataValues.bls.ims.libelle,
        });
      });
      return res.status(200).send({ arrayIms, arrayMnt, arrayOption });
    });
});

//CA (IMS) d'Opalia par rapport au total du marché par bricks
router.post("/detailsImsBricks", auth, async (req, res) => {
  const year = req.body.year;
  const qteCA = req.body.qteCA;
  const idBriks = req.body.idBriks;
  const mois = req.body.mois;
  var arrayMarket = [];
  var arrayOpalia = [];
  var arrayIms = [];
  var whereBriks = null;
  var whereMois = null;
  if (mois != 0) {
    whereMois = sequelize.where(
      sequelize.fn("month", sequelize.col("date")),
      mois
    );
  }
  var whereBriks = {};
  if (idBriks.length != 0) whereBriks = { idIms: idBriks };
  if (qteCA == 1) {
    valQteCA = "volume";
    order = "qteCA";
  } else {
    valQteCA = "total";
    order = "qteCA";
  }
  var opalia = await detailsims.findAll({
    limit: 10,
    attributes: [
      [sequelize.fn("sum", sequelize.col(valQteCA)), "qteCA"],
      "date",
      "total",
      "volume",
      "idIms",
      "produit",
    ],
    where: {
      [Op.and]: [
        sequelize.where(sequelize.fn("year", sequelize.col("date")), year),
        whereMois,
        whereBriks,
        /* { produit: { [Op.like]: "%OPALIA TOTAL%" } }, */
      ],
    },
    include: ["ims"],
    group: [["idIms"]],
  });
  var market = await detailsims.findAll({
    limit: 10,
    attributes: [
      [sequelize.fn("sum", sequelize.col(valQteCA)), "qteCA"],
      "date",
      "total",
      "volume",
      "idIms",
      "produit",
    ],
    where: {
      [Op.and]: [
        sequelize.where(sequelize.fn("year", sequelize.col("date")), year),
        whereMois,
        whereBriks,
        { produit: { [Op.like]: "%TOTAL MARKET%" } },
      ],
    },
    include: ["ims"],
    group: [["idIms"]],
  });
  var j = 0;
  opalia.forEach((e) => {
    arrayOpalia[j] = e.dataValues.qteCA;
    arrayIms[j] = e.dataValues.ims.libelle;
    j++;
  });
  var j1 = 0;
  market.forEach((e) => {
    arrayMarket[j1] = e.dataValues.qteCA;
    j1++;
  });
  return res.status(200).send({ arrayIms, opalia, arrayOpalia, arrayMarket });
});

//CA (IMS) produit opalia par rapport au marché total
router.post("/detailsImsMarche", auth, async (req, res) => {
  const year = req.body.year;
  const qteCA = req.body.qteCA;
  const idMarche = req.body.idMarche;
  const mois = req.body.mois;
  var arrayMarket = [];
  var arrayOpalia = [];
  var arrayMarche = [];
  var whereMarche = null;
  var whereMois = null;
  if (mois != 0) {
    whereMois = sequelize.where(
      sequelize.fn("month", sequelize.col("date")),
      mois
    );
  }
  var whereMarche = {};
  if (idMarche.length != 0) whereMarche = { chef_produit: idMarche };
  if (qteCA == 1) {
    valQteCA = "volume";
    order = "qteCA";
  } else {
    valQteCA = "total";
    order = "qteCA";
  }
  var opalia = await detailsims.findAll({
    limit: 10,
    attributes: [
      [sequelize.fn("sum", sequelize.col(valQteCA)), "qteCA"],
      "date",
      "total",
      "volume",
      "idIms",
      "chef_produit",
    ],
    where: {
      [Op.and]: [
        sequelize.where(sequelize.fn("year", sequelize.col("date")), year),
        whereMois,
        whereMarche,
        /* { chef_produit: { [Op.ne]: "opalia total" } }, */
      ],
    },
    group: [["chef_produit"]],
    order: [["chef_produit", "DESC"]],
  });
  var market = await detailsims.findAll({
    limit: 10,
    attributes: [
      [sequelize.fn("sum", sequelize.col(valQteCA)), "qteCA"],
      "date",
      "total",
      "volume",
      "idIms",
      "chef_produit",
    ],
    where: {
      [Op.and]: [
        sequelize.where(sequelize.fn("year", sequelize.col("date")), year),
        whereMois,
        whereMarche,
        { etat: 1 },
      ],
    },
    group: [["chef_produit"]],
    order: [["chef_produit", "DESC"]],
  });
  var j = 0;
  opalia.forEach((e) => {
    arrayOpalia[j] = e.dataValues.qteCA;
    arrayMarche[j] = e.dataValues.chef_produit;
    j++;
  });
  var j1 = 0;
  market.forEach((e) => {
    arrayMarket[j1] = e.dataValues.qteCA;
    j1++;
  });
  return res
    .status(200)
    .send({ arrayMarche, opalia, arrayOpalia, arrayMarket });
});

//Distrubition du CA des packs par bricks
router.post("/getPackBriks", auth, async (req, res) => {
  const year = req.body.year;
  const qteCA = req.body.qteCA;
  const idBriks = req.body.idBriks;
  const idPack = req.body.idPack;
  const mois = req.body.mois;
  var whereMois = null;
  if (mois != 0) {
    whereMois = sequelize.where(
      sequelize.fn("month", sequelize.col("dateBl")),
      mois
    );
  }
  var whereBriks = {};
  if (idBriks.length != 0) whereBriks = { id: idBriks };

  var wherePack = {};
  if (idPack.length != 0) wherePack = { id_pack: idPack };
  var valQteCA = "";
  if (qteCA == 1) {
    valQteCA = "quantite";
    order = "qteCA";
  } else {
    valQteCA = "montant";
    order = "qteCA";
  }

  var packs = await ligneBl.findAll({
    limit: 10,
    attributes: [[sequelize.fn("sum", sequelize.col(valQteCA)), "qteCA"]],
    where: wherePack,
    include: [
      {
        model: bl,
        as: "bls",
        attributes: [
          [sequelize.fn("YEAR", sequelize.col("dateBl")), "annee"],
          "id_gouvernorat",
        ],
        where: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn("year", sequelize.col("dateBl")),
              year
            ),
            whereMois,
            { etat: 1 },
          ],
        },
        include: [
          {
            model: ims,
            as: "ims",
            attributes: ["id", "libelle"],
            where: whereBriks,
          },
        ],
      },
    ],
    group: [["bls.id_gouvernorat"]],
    order: [[sequelize.fn("sum", sequelize.col(valQteCA)), "DESC"]],
  });

  var som = await ligneBl.findOne({
    where: wherePack,
    attributes: [[sequelize.fn("sum", sequelize.col(valQteCA)), "qteCA"]],
    include: [
      {
        model: bl,
        as: "bls",
        attributes: [
          [sequelize.fn("YEAR", sequelize.col("dateBl")), "annee"],
          "id_gouvernorat",
        ],
        where: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn("year", sequelize.col("dateBl")),
              year
            ),
            whereMois,
            { etat: 1 },
          ],
        },
      },
    ],
  });
  var pie = [];
  var pieVal = [];
  var minus = som.dataValues.qteCA;
  var arraySelect = [];
  packs.forEach((e) => {
    var moy = 0;
    arraySelect.push({
      value: e.dataValues.bls.ims.id,
      label: e.dataValues.bls.ims.libelle,
    });
    moy =
      (Math.round(e.dataValues.qteCA) * 100) / Math.round(som.dataValues.qteCA);
    pieVal.push(Math.round(moy));
    minus -= e.dataValues.qteCA;
    pie.push(e.dataValues.bls.ims.libelle + "(" + Math.round(moy) + "%)");
  });
  minus = (Math.round(minus) * 100) / Math.round(som.dataValues.qteCA);
  if (som.dataValues.qteCA == null) {
    pie.push("Reste" + "(100%)");
    pieVal.push(100);
  } else if (minus != 0) {
    pie.push("Reste" + "(" + Math.round(minus) + "%)");
    pieVal.push(Math.round(minus));
  }
  return res.status(200).send({ arraySelect, pieVal, pie });
});
router.post("/getBriksPack", auth, async (req, res) => {
  const year = req.body.year;
  const idBriks = req.body.idBriks;
  const mois = req.body.mois;
  var whereMois = null;
  if (mois != 0) {
    whereMois = sequelize.where(
      sequelize.fn("month", sequelize.col("dateBl")),
      mois
    );
  }
  var whereBriks = {};
  /* if (idBriks.length != 0) whereBriks = { id_gouvernorat: idBriks }; */
  if (idBriks != 0) whereBriks = { id_gouvernorat: idBriks };
  /* var packs = await bl.findAll({
    limit: 10,
    attributes: [
      [sequelize.fn("count", sequelize.col("id_pack")), "totpack"],
      "id_gouvernorat",
      "id_pack",
      "dateBl",
    ],
    where: {
      [Op.and]: [
        sequelize.where(sequelize.fn("year", sequelize.col("dateBl")), year),
        whereMois,
        whereBriks,
        { etat: 1 },
      ],
    },
    include: [
      {
        model: pack,
        as: "packs",
      },
      {
        model: ims,
        as: "ims",
      },
    ],
    group: [["id_gouvernorat"], ["id_pack"]],
    order: sequelize.literal("count(id_pack) DESC"),
  }); */
  /*  var packs = await ligneBl.findAll({
    limit: 10,
    attributes: [[sequelize.fn("count", sequelize.col("id_pack")), "totpack"]],
    include: [
      {
        model: pack,
        as: "packs",
      },
      {
        model: bl,
        as: "bls",
        attributes: [          
          "id_gouvernorat",
          "dateBl",
        ],
        where: {
          [Op.and]: [
            sequelize.where(sequelize.fn("year", sequelize.col("dateBl")), year),
            whereMois,
            whereBriks,
            { etat: 1 },
          ],
        },
        include: [
          {
            model: ims,
            as: "ims",
          },
        ],
      },
    ],
    group: [["id_pack"]],
    order: sequelize.literal("count(id_pack) DESC"),
  }); */
  var packs = await ligneBl.findAll({
    limit: 10,
    attributes: [[sequelize.fn("count", sequelize.col("id_pack")), "totpack"]],
    include: [
      {
        model: bl,
        as: "bls",
        attributes: [[sequelize.fn("YEAR", sequelize.col("dateBl")), "annee"]],
        where: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn("year", sequelize.col("dateBl")),
              year
            ),
            whereMois,
            whereBriks,
          ],
        },
      },
      {
        model: pack,
        as: "packs",
      },
    ],
    group: [["bls.id_gouvernorat"], ["id_pack"]],
    order: sequelize.literal("count(id_pack) DESC"),
  });
  var arrayPack = [];
  var arrayTot = [];
  packs.forEach((data2) => {
    arrayPack.push(data2.dataValues.packs.nom);
    arrayTot.push(data2.dataValues.totpack);
  });
  return res.status(200).send({ packs, arrayPack, arrayTot });
});
router.post("/distinct", async (req, res) => {
  var packs = await bl.findAll({
    attributes: [
      [Sequelize.literal("DISTINCT `id_gouvernorat`"), "id_gouvernorat"],
      "id_pack",
    ],
  });
  return res.status(200).send(packs);
});

//CA du total des packs vendus en %
router.post("/getTotalPack", auth, async (req, res) => {
  const year = req.body.year;
  const qteCA = req.body.qteCA;
  const mois = req.body.mois;
  var whereMois = null;
  if (mois != 0) {
    whereMois = sequelize.where(
      sequelize.fn("month", sequelize.col("dateBl")),
      mois
    );
  }
  var valQteCA = "";
  if (qteCA == 1) {
    valQteCA = "quantite";
    order = "qteCA";
  } else {
    valQteCA = "montant";
    order = "qteCA";
  }

  var somPacks = await ligneBl.findOne({
    limit: 10,
    attributes: [
      [sequelize.fn("sum", sequelize.col(valQteCA)), "total"],
      "id_pack",
    ],
    include: [
      {
        model: bl,
        as: "bls",
        attributes: [
          [sequelize.fn("YEAR", sequelize.col("dateBl")), "annee"],
          "dateBl",
        ],
        where: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn("year", sequelize.col("dateBl")),
              year
            ),
            whereMois,
            { etat: 1 },
          ],
        },
      },
    ],
    order: [[sequelize.fn("sum", sequelize.col(valQteCA)), "DESC"]],
  });
  var packs = await ligneBl.findAll({
    limit: 10,
    attributes: [
      [sequelize.fn("sum", sequelize.col(valQteCA)), "qteCA"],
      "id_pack",
    ],
    include: [
      {
        model: bl,
        as: "bls",
        attributes: [
          [sequelize.fn("YEAR", sequelize.col("dateBl")), "annee"],
          "dateBl",
        ],
        where: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn("year", sequelize.col("dateBl")),
              year
            ),
            whereMois,
            { etat: 1 },
          ],
        },
        /* include: [
          {
            model: pack,
            as: "packs",
          },
        ], */
      },
      "packs",
    ],
    group: [["id_pack"]],
    order: [[sequelize.fn("sum", sequelize.col(valQteCA)), "DESC"]],
  });
  var tabpack = [];
  var valpack = [];
  packs.forEach((e) => {
    var moy =
      (parseInt(e.dataValues.qteCA) * 100) /
      parseInt(somPacks.dataValues.total);
    if (Math.round(moy) != 0) tabpack.push(Math.round(moy));

    var nom = e.dataValues.packs.nom;
    if (Math.round(moy) != 0) valpack.push(nom + "(" + Math.round(moy) + "%)");
  });
  var countNoPack = await ligneBl.findAll({
    /* where: {
      [Op.and]: [
        sequelize.where(sequelize.fn("year", sequelize.col("dateBl")), year),
        whereMois,
        { id_pack: 0 },
      ],
    }, */
    where: { id_pack: 0 },
    include: [
      {
        model: bl,
        as: "bls",
        where: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn("year", sequelize.col("dateBl")),
              year
            ),
            whereMois,
          ],
        },
      },
    ],
  });
  if (countNoPack.length == 0) {
    tabpack.push(0);
    valpack.push("No pack (0)%");
  }
  return res.status(200).send({ valpack, tabpack });
});
router.get("/getDetailBl/:id", auth, async (req, res) => {
  var l = await ligneBl.findAll({
    where: { idbielle: req.params.id },
    include: ["produits", "packs"],
  });
  return res.status(200).send(l);
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
    var blFind = await bl.findOne({ where: { id: id } });
    if (blFind != null) {
      bl.update(
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
//bl payer
router.post("/getBlPayer", auth, (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;
  const client = req.body.client;
  const idDelegue = req.body.idDelegue;
  const idLine = parseInt(req.body.idLine);
  const idRole = parseInt(req.body.idRole);
  const year = parseInt(req.body.year);
  var whereD = {};
  var whereC = {};
  var whereU = {};
  if (idRole != 0 && idRole != 3) {
    whereU = idRole == 1?{ id_parent: idUser }:{};
    if (idDelegue != 0) whereD = { iduser: idDelegue };
  }
  if (client != 0) whereC = { client: client };
  ligneBl
    .findAll({
      attributes: [[sequelize.fn("sum", sequelize.col("montant")), "mnt"]],
      group: ["idbielle"],
      include: {
        model: bl,
        as: "bls",
        where: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn("year", sequelize.col("dateBl")),
              year
            ),
            { etat: 1, payer: { [Op.eq]: 1 } },
            whereC,
            whereD,
          ],
        },
        include: [
          { model: user, as: "users", where: whereU },
          "pharmacies",
          "actions",
          "ims",
        ],
        /* order: [["etat", "DESC"]], */
      },
      order: [["idbielle", "DESC"]],
    })
    .then(function (r) {
      var array = [];
      r.forEach((e, key) => {
        var bls = e.dataValues.bls;
        var ext = bls.file.split(".");
        array.push({
          id: bls.id,
          pharmacie: bls.pharmacies.nom,
          users: bls.users.nomU,
          action: bls.actions.nom,
          bonification: bls.bonification,
          payer: bls.payer,
          date: bls.dateBl,
          fileURL: null,
          etat: bls.etat,
          mnt: parseFloat(e.dataValues.mnt).toFixed(3),
          numeroBl: bls.numeroBL,
          ext: ext[1],
          file: bls.file,
          fournisseur: bls.fournisseur,
          ims: bls.ims.libelle,
          decharge: bls.decharge,
        });
      });
      return res.status(200).send(array);
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(error);
    });
});
router.get("/getDecharge/:id", async (req, res) => {
  var id = req.params.id;
  var blFind = await bl.findOne({ where: { id: id } });
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
// save bl extracter
router.post("/exportBl", auth, (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;

  exportBl
    .create({
      idUser: idUser,
    })
    .then((r) => {
      return res.status(200).send(true);
    })
    .catch((error) => {
      return res.status(403).send(false);
    });
});
router.get("/getExport", auth, async (req, res) => {
  var blExport = await exportBl.findAll({ include: ["users"] });
  return res.status(200).send(blExport);
});
router.get("/getBlById/:id", auth, async (req, res) => {
  var blExport = await bl.findOne({
    where: { id: req.params.id },
    include: ["users", "pharmacies", "ims", "actions"],
  });
  return res.status(200).send(blExport);
});
router.get(
  "/getBlByPackClient/:idClient/:idAction/:idUser/:idRole",
  auth,
  async (req, res) => {
    var idAction = req.params.idAction;
    var idClient = req.params.idClient;
    var idRole = req.params.idRole;
    var idUser = req.params.idUser;
    var where =
      idRole == 2
        ? { action: idAction, client: idClient, iduser: idUser, etatCmd: 0 }
        : idRole == 0
        ? { action: idAction, client: idClient, etatCmd: 1 }
        : { action: idAction, client: idClient, etatCmd: 0 };
    //get by atc
    var qte = await ligneBl.findAll({
      attributes: [
        "quantite_rest",
        "montant_rest",
        [sequelize.fn("sum", sequelize.col("quantite")), "quantite"],
        [sequelize.fn("sum", sequelize.col("montant")), "montant"],
      ],
      include: [
        {
          model: bl,
          as: "bls",
          where: where,
        },
        {
          model: atc,
          as: "atcs",
        },
        {
          model: produit,
          as: "produits",
          /* include: {
          model: atc,
          as: "atcs",
        }, */
        },
        "packs",
      ],
      group: ["id_pack", "lignebls.id_atc"],
      order: [["id_pack", "desc"]],
    });
    //get by presentation
    var qte_p = await ligneBl.findAll({
      attributes: [
        "montant_rest_p",
        "montant_rest_m",
        "quantite_rest_p",
        "quantite_rest_m",
        [sequelize.fn("sum", sequelize.col("quantite")), "quantite"],
        [sequelize.fn("sum", sequelize.col("montant")), "montant"],
      ],
      include: [
        {
          model: bl,
          as: "bls",
          where: {
            action: idAction,
            client: idClient,
            etatCmd: idRole==0?1:0,
          },
        },
        {
          model: atc,
          as: "atcs",
        },
        {
          model: produit,
          as: "produits",
          include: [
            /* {
            model: atc,
            as: "atcs",
          }, */
            {
              model: marcheIms,
              as: "marcheims",
            },
          ],
        },
        "packs",
      ],
      group: ["produits.id", "id_pack"],
      order: [["id_pack", "desc"]],
    });

    //get by produits
    var qte_m = await ligneBl.findAll({
      attributes: [
        "montant_rest_p",
        "montant_rest_m",
        "quantite_rest_p",
        "quantite_rest_m",
        [sequelize.fn("sum", sequelize.col("quantite")), "quantite"],
        [sequelize.fn("sum", sequelize.col("montant")), "montant"],
      ],
      include: [
        {
          model: bl,
          as: "bls",
          where: {
            action: idAction,
            client: idClient,
            etatCmd: idRole ==0 ? 1: 0,
          },
        },
        {
          model: atc,
          as: "atcs",
        },
        {
          model: produit,
          as: "produits",
          include: [
            /* {
            model: atc,
            as: "atcs",
          }, */
            {
              model: marcheIms,
              as: "marcheims",
            },
          ],
        },
        "packs",
      ],
      group: ["produits.desigims", "id_pack"],
      order: [["id_pack", "desc"]],
    });
    return res.status(200).send({ qte, qte_p, qte_m });
  }
);
router.get("/getDetailCommande/:idCmd", auth, async (req, res) => {
  var idCmd = req.params.idCmd;
  var findCmd = await commande_bl.findOne({
    attributes: [
      [sequelize.fn("GROUP_CONCAT", sequelize.col("id_bl")), "id_bls"],
    ],
    where: { id_cmd: idCmd },
  });
  var where = findCmd ? { id: findCmd.dataValues.id_bls.split(",") } : {};
  /* var where =
    idRole == 2
      ? { action: idAction, client: idClient, iduser: idUser, etatCmd: 0 }
      : { action: idAction, client: idClient, etatCmd: 0 }; */
  //get by atc
  var qte = await ligneBl.findAll({
    attributes: [
      "quantite_rest",
      "montant_rest",
      [sequelize.fn("sum", sequelize.col("quantite")), "quantite"],
      [sequelize.fn("sum", sequelize.col("montant")), "montant"],
    ],
    include: [
      {
        model: bl,
        as: "bls",
        where: where,
      },
      {
        model: atc,
        as: "atcs",
      },
      {
        model: produit,
        as: "produits",
        /* include: {
          model: atc,
          as: "atcs",
        }, */
      },
      "packs",
    ],
    group: ["id_pack", "lignebls.id_atc"],
    order: [["id_pack", "desc"]],
  });
  //get by presentation
  var qte_p = await ligneBl.findAll({
    attributes: [
      "montant_rest_p",
      "montant_rest_m",
      "quantite_rest_p",
      "quantite_rest_m",
      [sequelize.fn("sum", sequelize.col("quantite")), "quantite"],
      [sequelize.fn("sum", sequelize.col("montant")), "montant"],
    ],
    include: [
      {
        model: bl,
        as: "bls",
        where: where,
      },
      {
        model: atc,
        as: "atcs",
      },
      {
        model: produit,
        as: "produits",
        include: [
          /* {
            model: atc,
            as: "atcs",
          }, */
          {
            model: marcheIms,
            as: "marcheims",
          },
        ],
      },
      "packs",
    ],
    group: ["produits.id", "id_pack"],
    order: [["id_pack", "desc"]],
  });

  //get by produits
  var qte_m = await ligneBl.findAll({
    attributes: [
      "montant_rest_p",
      "montant_rest_m",
      "quantite_rest_p",
      "quantite_rest_m",
      [sequelize.fn("sum", sequelize.col("quantite")), "quantite"],
      [sequelize.fn("sum", sequelize.col("montant")), "montant"],
    ],
    include: [
      {
        model: bl,
        as: "bls",
        where: where,
      },
      {
        model: atc,
        as: "atcs",
      },
      {
        model: produit,
        as: "produits",
        include: [
          /* {
            model: atc,
            as: "atcs",
          }, */
          {
            model: marcheIms,
            as: "marcheims",
          },
        ],
      },
      "packs",
    ],
    group: ["produits.desigims", "id_pack"],
    order: [["id_pack", "desc"]],
  });
  return res.status(200).send({ qte, qte_p, qte_m });
});

// client back-up
// router.get("/getBlByClientRestBack/:idAction/:annee/:idClient", auth, async (req, res) => {
//   try {
//     var idAction = req.params.idAction;
//     var idClient = req.params.idClient;
//     var where = idAction != 0 ? { id_action:idAction } : {}
//     var whereA = idAction != 0 ? { action:idAction } : {}
//     var whereC = idClient != 0 ? { id_pharmacie:idClient } : {}
//     var findPack = await actionPacks.findOne({attributes: [[sequelize.fn("GROUP_CONCAT", sequelize.col("id_pack")), "id_packs"]]})
//     var id_packs = await (findPack.dataValues.id_packs).split(",");

//     var findAtcPack = await pack_atc.findAll({
//       attributes: ["id",[sequelize.fn("sum", sequelize.col("quantite")), "quantite"]],
//       where:{ packId:id_packs },
//       group:["packId"]
//     });
//     var arrayProd = new Object();

//     for (const key in findAtcPack) {
//       const element = findAtcPack[key].dataValues;
//       arrayProd[element.id] = (element);
//     }
//     var findClient = await commande.findAll({
//       where: {
//         [Op.and]: [
//           where,
//           whereC
//         ],
//       },
//       group: [["id_pharmacie"]],
//     });
//     var arrayClient = [];
//     for (const key in findClient) {
//       const element = findClient[key];
//       arrayClient.push(element.dataValues.id_pharmacie);
//     }

//     var whereClt = { client: arrayClient };
//     var findBlClient = await ligneBl.findAll({
//       where: { id_atc: { [Op.ne]: 0 } },
//       attributes: ["id_pack","id_atc","idproduit",[sequelize.fn("sum", sequelize.col("quantite")), "nb"]],
//       include: [
//         {
//           model: bl,
//           as: "bls",
//           where: {
//             [Op.and]: [
//               whereA,
//               whereClt
//             ],
//           },
//           include: ["pharmacies","actions"],
//           order: [["bls.client"]],
//         },
//         "packs",
//       ],
//       group: [["lignebls.id_atc","bls.action","bls.client"]],
//     });
//     var arrayFinal = [];

//     for (const key in findBlClient) {
//       const element = findBlClient[key];
//         arrayFinal.push({
//           id:element.dataValues.bls.pharmacies.id,
//           nomClient:element.dataValues.bls.pharmacies.nom,
//           idAction:element.dataValues.bls.actions.id,
//           objectif:element.dataValues.bls.actions.nom,
//           pack:element.dataValues.packs.nom,
//         })
//     }

//     return res.status(200).send(arrayFinal);

//   } catch (error) {
//     console.log(error)
//     return res.status(403).send(error);

//   }
// });
router.get(
  "/getBlByClientRest/:idAction/:annee/:idClient",
  auth,
  async (req, res) => {
    try {
      var idAction = req.params.idAction;
      var idClient = req.params.idClient;
      var where = idAction != 0 ? { id_action: idAction } : {};
      var whereA = idAction != 0 ? { action: idAction } : {};
      var whereC = idClient != 0 ? { client: idClient } : {};
      var findPack = await actionPacks.findOne({
        attributes: [
          [sequelize.fn("GROUP_CONCAT", sequelize.col("id_pack")), "id_packs"],
        ],
      });
      var id_packs = await findPack.dataValues.id_packs.split(",");

      /** start get pack_presentation **/
      var findPre = await pack_presentation.findAll({
        include: ["produits"],
        where: { packId: id_packs },
      });

      var objPro = new Object();
      for (const key in findPre) {
        const element = findPre[key].dataValues;
        objPro[element.produits.parent] = element;
      }

      /** end get pack_presentation **/

      /** start get pack_produit **/
      var findProd = await pack_produit.findAll({
        include: ["marches"],
        where: { packId: id_packs },
      });

      var objMarche = new Object();
      for (const key in findProd) {
        const element = findProd[key].dataValues;
        objMarche[element.marches.id] = element;
      }

      /** end get pack_presentation **/

      /** start get pack_atc **/
      var findAtc = await pack_atc.findAll({
        include: ["atcs"],
        where: { packId: id_packs },
      });

      var objAtc = new Object();
      for (const key in findAtc) {
        const element = findAtc[key].dataValues;
        objAtc[element.atcs.id] = element;
      }

      /** end get pack_presentation **/

      /** start get pack_atc **/
      var findClient = await commande.findAll({
        where: {
          [Op.and]: [where, whereClt, { etat: 3 }],
        },
        group: [["id_pharmacie"]],
      });
      var arrayClient = [];
      for (const key in findClient) {
        const element = findClient[key];
        arrayClient.push(element.dataValues.id_pharmacie);
      }
      var whereClt = { client: arrayClient };

      /** end get pack_presentation **/
      var arrayFinalF = [];
      if (findClient.length != 0) {
        var findBlClient = await ligneBl.findAll({
          where: { id_atc: { [Op.ne]: 0 }, id_pack: { [Op.ne]: 0 } },
          include: [
            {
              model: bl,
              as: "bls",
              where: {
                [Op.and]: [whereA, whereC],
              },
              include: ["pharmacies", "actions"],
              order: [["bls.client"]],
            },
            "packs",
          ],
        });

        var objPreAtc = new Object();
        var objMarcheAtc = new Object();
        var objAtcAtc = new Object();
        for (const key in findBlClient) {
          const element = findBlClient[key].dataValues;
          var prod = objPro[element.idproduit];
          var marche = objMarche[prod.id_marche];
          var atc = objAtc[element.id_atc];

          if (prod.quantite !== 0) {
            if (!objPreAtc[element.bls.client + "-" + element.idproduit]) {
              objPreAtc[element.bls.client + "-" + element.idproduit] = {
                qtePreBl: 0,
                qtePre: 0,
                mntPre: 0,
                mntBl: 0,
                idproduit: 0,
              };
            }
            objPreAtc[element.bls.client + "-" + element.idproduit].qtePre =
              prod.quantite;
            objPreAtc[element.bls.client + "-" + element.idproduit].qtePreBl +=
              element.quantite;

            objPreAtc[element.bls.client + "-" + element.idproduit].mntPre =
              prod.montant;
            objPreAtc[element.bls.client + "-" + element.idproduit].mntBl +=
              element.montant;

            objPreAtc[element.bls.client + "-" + element.idproduit].idproduit =
              element.idproduit;
          }

          if (marche.quantite !== 0) {
            if (!objMarcheAtc[element.bls.client + "-" + prod.id_marche]) {
              objMarcheAtc[element.bls.client + "-" + prod.id_marche] = {
                qtePreBl: 0,
                qtePre: 0,
                mntPre: 0,
                mntBl: 0,
                id_marche: 0,
              };
            }
            objMarcheAtc[element.bls.client + "-" + prod.id_marche].qtePre =
              marche.quantite;
            objMarcheAtc[element.bls.client + "-" + prod.id_marche].qtePreBl +=
              element.quantite;

            objMarcheAtc[element.bls.client + "-" + prod.id_marche].mntPre =
              marche.montant;
            objMarcheAtc[element.bls.client + "-" + prod.id_marche].mntBl +=
              element.montant;

            objMarcheAtc[element.bls.client + "-" + prod.id_marche].id_marche =
              prod.id_marche;
          }

          if (atc.quantite !== 0) {
            if (!objAtcAtc[element.bls.client + "-" + element.id_atc]) {
              objAtcAtc[element.bls.client + "-" + element.id_atc] = {
                qtePreBl: 0,
                qtePre: 0,
                mntPre: 0,
                mntBl: 0,
                id_atc: 0,
              };
            }
            objAtcAtc[element.bls.client + "-" + element.id_atc].qtePre =
              atc.quantite;
            objAtcAtc[element.bls.client + "-" + element.id_atc].qtePreBl +=
              element.quantite;

            objAtcAtc[element.bls.client + "-" + element.id_atc].mntPre =
              atc.montant;
            objAtcAtc[element.bls.client + "-" + element.id_atc].mntBl +=
              element.montant;
            objAtcAtc[element.bls.client + "-" + element.id_atc].id_atc =
              element.id_atc;
          }
        }

        var arrayFinal = new Object();
        //condition presentations
        if (Object.keys(objPreAtc).length > 0) {
          for (const key in findBlClient) {
            const element = findBlClient[key].dataValues;
            if (objPreAtc[element.bls.client + "-" + element.idproduit]) {
              var qtePre =
                objPreAtc[element.bls.client + "-" + element.idproduit].qtePre;
              var qtePreBl =
                objPreAtc[element.bls.client + "-" + element.idproduit]
                  .qtePreBl;
              var mntBl =
                objPreAtc[element.bls.client + "-" + element.idproduit].mntBl;
              var mntPre =
                objPreAtc[element.bls.client + "-" + element.idproduit].mntPre;
              if (qtePreBl < qtePre) {
                arrayFinal[element.bls.client + "-" + element.bls.action] = {
                  id: element.bls.pharmacies.id,
                  nomClient: element.bls.pharmacies.nom,
                  idAction: element.bls.actions.id,
                  objectif: element.bls.actions.nom,
                  pack: element.packs.nom,
                };
              }
              if (mntBl < mntPre) {
                arrayFinal[element.bls.client + "-" + element.bls.action] = {
                  id: element.bls.pharmacies.id,
                  nomClient: element.bls.pharmacies.nom,
                  idAction: element.bls.actions.id,
                  objectif: element.bls.actions.nom,
                  pack: element.packs.nom,
                };
              }
            }
          }
        }

        //condition produits
        if (
          Object.keys(arrayFinal).length == 0 &&
          Object.keys(objMarcheAtc).length > 0
        ) {
          for (const key in findBlClient) {
            const element = findBlClient[key].dataValues;
            var prod = objPro[element.idproduit];
            if (objMarcheAtc[element.bls.client + "-" + prod.id_marche]) {
              var qtePre =
                objMarcheAtc[element.bls.client + "-" + prod.id_marche].qtePre;
              var qtePreBl =
                objMarcheAtc[element.bls.client + "-" + prod.id_marche]
                  .qtePreBl;
              var mntBl =
                objMarcheAtc[element.bls.client + "-" + prod.id_marche].mntBl;
              var mntPre =
                objMarcheAtc[element.bls.client + "-" + prod.id_marche].mntPre;

              if (qtePreBl < qtePre) {
                arrayFinal[element.bls.client + "-" + element.bls.action] = {
                  id: element.bls.pharmacies.id,
                  nomClient: element.bls.pharmacies.nom,
                  idAction: element.bls.actions.id,
                  objectif: element.bls.actions.nom,
                  pack: element.packs.nom,
                };
              }
              if (mntBl < mntPre) {
                arrayFinal[element.bls.client + "-" + element.bls.action] = {
                  id: element.bls.pharmacies.id,
                  nomClient: element.bls.pharmacies.nom,
                  idAction: element.bls.actions.id,
                  objectif: element.bls.actions.nom,
                  pack: element.packs.nom,
                };
              }
            }
          }
        } else if (Object.keys(objMarcheAtc).length > 0) {
          for (const key in findBlClient) {
            const element = findBlClient[key].dataValues;
            var prod = objPro[element.idproduit];
            if (Object.keys(objPreAtc).length > 0) {
              if (objMarcheAtc[element.bls.client + "-" + prod.id_marche]) {
                var qtePre =
                  objMarcheAtc[element.bls.client + "-" + prod.id_marche]
                    .qtePre;
                var qtePreBl =
                  objMarcheAtc[element.bls.client + "-" + prod.id_marche]
                    .qtePreBl;
                var mntBl =
                  objMarcheAtc[element.bls.client + "-" + prod.id_marche].mntBl;
                var mntPre =
                  objMarcheAtc[element.bls.client + "-" + prod.id_marche]
                    .mntPre;

                if (qtePreBl < qtePre) {
                  arrayFinal[element.bls.client + "-" + element.bls.action] = {
                    id: element.bls.pharmacies.id,
                    nomClient: element.bls.pharmacies.nom,
                    idAction: element.bls.actions.id,
                    objectif: element.bls.actions.nom,
                    pack: element.packs.nom,
                  };
                }

                if (mntBl < mntPre) {
                  arrayFinal[element.bls.client + "-" + element.bls.action] = {
                    id: element.bls.pharmacies.id,
                    nomClient: element.bls.pharmacies.nom,
                    idAction: element.bls.actions.id,
                    objectif: element.bls.actions.nom,
                    pack: element.packs.nom,
                  };
                }
              }
            }
          }
        }

        //condition atc
        if (
          Object.keys(arrayFinal).length == 0 &&
          Object.keys(objAtcAtc).length > 0
        ) {
          for (const key in findBlClient) {
            const element = findBlClient[key].dataValues;
            var prod = objPro[element.idproduit];
            if (objAtcAtc[element.bls.client + "-" + prod.id_atc]) {
              var qtePre =
                objAtcAtc[element.bls.client + "-" + prod.id_atc].qtePre;
              var qtePreBl =
                objAtcAtc[element.bls.client + "-" + prod.id_atc].qtePreBl;
              var mntBl =
                objAtcAtc[element.bls.client + "-" + prod.id_atc].mntBl;
              var mntPre =
                objAtcAtc[element.bls.client + "-" + prod.id_atc].mntPre;

              if (qtePreBl < qtePre) {
                arrayFinal[element.bls.client + "-" + element.bls.action] = {
                  id: element.bls.pharmacies.id,
                  nomClient: element.bls.pharmacies.nom,
                  idAction: element.bls.actions.id,
                  objectif: element.bls.actions.nom,
                  pack: element.packs.nom,
                };
              }

              if (mntBl < mntPre) {
                arrayFinal[element.bls.client + "-" + element.bls.action] = {
                  id: element.bls.pharmacies.id,
                  nomClient: element.bls.pharmacies.nom,
                  idAction: element.bls.actions.id,
                  objectif: element.bls.actions.nom,
                  pack: element.packs.nom,
                };
              }
            }
          }
        } else if (Object.keys(objAtcAtc).length > 0) {
          for (const key in findBlClient) {
            const element = findBlClient[key].dataValues;
            if (Object.keys(objPreAtc).length > 0) {
              if (objAtcAtc[element.bls.client + "-" + element.id_atc]) {
                var qtePre =
                  objAtcAtc[element.bls.client + "-" + element.id_atc].qtePre;
                var qtePreBl =
                  objAtcAtc[element.bls.client + "-" + element.id_atc].qtePreBl;
                var mntBl =
                  objAtcAtc[element.bls.client + "-" + prod.id_atc].mntBl;
                var mntPre =
                  objAtcAtc[element.bls.client + "-" + prod.id_atc].mntPre;

                if (qtePreBl < qtePre) {
                  arrayFinal[element.bls.client + "-" + element.bls.action] = {
                    id: element.bls.pharmacies.id,
                    nomClient: element.bls.pharmacies.nom,
                    idAction: element.bls.actions.id,
                    objectif: element.bls.actions.nom,
                    pack: element.packs.nom,
                  };
                }

                if (mntBl < mntPre) {
                  arrayFinal[element.bls.client + "-" + element.bls.action] = {
                    id: element.bls.pharmacies.id,
                    nomClient: element.bls.pharmacies.nom,
                    idAction: element.bls.actions.id,
                    objectif: element.bls.actions.nom,
                    pack: element.packs.nom,
                  };
                }
              }
            }
          }
        }
        arrayFinalF = Object.values(arrayFinal);
      }
      return res.status(200).send(arrayFinalF);
    } catch (error) {
      console.log(error);
      return res.status(403).send(error);
    }
  }
);

router.get("/getBlByClientId/:idClient/:idAction", auth, async (req, res) => {
  var token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, privateKey);
  var idUser = decoded.id;
  var idRole = decoded.idrole;
  var idClient = req.params.idClient;
  var idAction = req.params.idAction;
  var where = idRole != 2? { client: idClient, action: idAction,etatCmd: 1  }:{ iduser: idUser,client: idClient, action: idAction,etatCmd: 0  }
  ligneBl
    .findAll({
      attributes: [[sequelize.fn("sum", sequelize.col("montant")), "mnt"]],
      group: ["idbielle"],
      include: {
        model: bl,
        as: "bls",
        where: where,
        include: ["users", "pharmacies", "actions", "ims"],
      },
      order: [["idbielle", "DESC"]],
    })
    .then((val) => {
      var array = [];
      val.forEach((e, key) => {
        var bls = e.dataValues.bls;
        array.push({
          id: bls.id,
          file: bls.file,
          pharmacie: bls.pharmacies.nom,
          users: bls.users.nomU,
          action: bls.actions.nom,
          date: bls.dateBl,
          dateInsertion: bls.dateInsertion,
          etat: bls.etat,
          mnt: parseFloat(e.dataValues.mnt).toFixed(3),
          numeroBl: bls.numeroBL,
          fournisseur: bls.fournisseur,
          commentaire: bls.commentaire,
          ims: bls.ims.libelle,
        });
      });
      return res.status(200).send(array);
    });
});

router.get("/getBlByCmd/:idCmd", auth, async (req, res) => {
  var idCmd = req.params.idCmd;
  var findCmd = await commande_bl.findOne({
    attributes: [
      [sequelize.fn("GROUP_CONCAT", sequelize.col("id_bl")), "id_bls"],
    ],
    where: { id_cmd: idCmd },
  });
  var where = { id: findCmd.dataValues.id_bls.split(",") };
  ligneBl
    .findAll({
      attributes: [[sequelize.fn("sum", sequelize.col("montant")), "mnt"]],
      group: ["idbielle"],
      include: {
        model: bl,
        as: "bls",
        where: where,
        include: ["users", "pharmacies", "actions", "ims"],
      },
      order: [["idbielle", "DESC"]],
    })
    .then((val) => {
      var array = [];
      val.forEach((e, key) => {
        var bls = e.dataValues.bls;
        array.push({
          id: bls.id,
          file: bls.file,
          pharmacie: bls.pharmacies.nom,
          users: bls.users.nomU,
          action: bls.actions.nom,
          date: bls.dateBl,
          dateInsertion: bls.dateInsertion,
          etat: bls.etat,
          mnt: parseFloat(e.dataValues.mnt).toFixed(3),
          numeroBl: bls.numeroBL,
          fournisseur: bls.fournisseur,
          commentaire: bls.commentaire,
          ims: bls.ims.libelle,
        });
      });
      return res.status(200).send(array);
    });
});
module.exports = router;
