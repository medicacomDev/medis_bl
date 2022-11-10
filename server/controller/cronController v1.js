const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
var FormData = require("form-data");
const excelJS = require("exceljs");
var fs = require("fs");

var app = express();
/* var config = require("../config/conectdb");
var mysqlConnection = config.connection; */
var configuration = require("../config");
const { Op, where } = require("sequelize");
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
app.use(express.json());
var objectif = require("../excel/objectif.json");

const auth = require("../middlewares/passport");
router.post("/envoyerExcel", async (req, res) => {
  var buffer = fs.readFile("./excel/opalia_clustering.xlsx",
    async (err, d) => {
      var form = new FormData();
      form.append("file", d, {
        filepath: "./excel/opalia_clustering.xlsx",
        contentType: "*/*",
      });
      const response = await fetch(
        "http://142.93.52.92/rfm_opalia_api/Clustering",
        {
          method: "POST",
          headers: form.getHeaders(),
          body: form,
        }
      ).then();
      const data = await response;
    }
  );
});

router.post("/generateExcel", async (req, res) => {
  var sql = `SELECT cl.nom as nomClt,b.fournisseur,p.designation as designation ,
  li.montant as mnt,li.quantite as qte ,
  DATE_FORMAT(b.dateBl,'%Y') as annee , 
  DATE_FORMAT(b.dateBl,'%b') as mounth ,
  DATE_FORMAT(b.dateBl,'%e') as day
  FROM bls b 
  left join lignebls li on b.id =li.idbielle
  left join pharmacies cl on cl.id =b.client
  left join users u on u.id =b.iduser
  left join produits p on p.id =li.idproduit
  group by b.client,p.designation,b.dateBl
  ORDER BY nomClt ASC`;
  
  sequelize
    .query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(async function  (rows) {
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("Produits");
      const path = "./excel";
    
      worksheet.columns = [
        { header: "Pharmacie", key: "nomClt", width: 10 },
        { header: "Fournisseur", key: "fournisseur", width: 10 },
        { header: "Quantite", key: "qte", width: 10 },
        { header: "Jour", key: "day", width: 10 },
        { header: "Mois", key: "mounth", width: 10 },
        { header: "Annee", key: "annee", width: 10 },
        { header: "Total HT", key: "mnt", width: 10 },
      ];
    
      let counter = 1;
      rows.forEach((user) => {
        user.s_no = counter;
        worksheet.addRow(user);
        counter++;
      });
    
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });
    
      try {
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", `attachment; filename=opalia_clustering.xlsx`);
      
    
          await workbook.xlsx.writeFile(`${path}/opalia_clustering.xlsx`).then(() => {
            
            res.send({
              status: "success",
              message: "file successfully downloaded",
              path: `${path}/opalia_clustering.xlsx`,
            });
        });
      } catch (err) {
        res.send({
          status: "error",
          message: err,
        });
      }
    
    });
});
/*** walid api **/
function insertSup(e,id_prod){
  return new Promise((resolve, reject)=>{
    var lhs_1 = e.lhs_1?"'"+e.lhs_1+"'":null;
    var lhs_2 = e.lhs_2?"'"+e.lhs_2+"'":null;
    var lhs_3 = e.lhs_3?"'"+e.lhs_3+"'":null;
    var lhs_4 = e.lhs_4?"'"+e.lhs_4+"'":null;
    var lhs_5 = e.lhs_5?"'"+e.lhs_5+"'":null;
    var rhs = e.lhs_5?"'"+e.rhs+"'":null;
    var arraySeg = ["","Best","Churn","FirstTime","Frequent","Uncertain","Valuable"]
    var i =0;
    arraySeg.filter((element, index, array) => {
      if (element == e.Segment){
        i = index;
      }
    })
    var sql =`INSERT INTO support_lift (lhs_1,lhs_2,lhs_3,lhs_4,lhs_5,rhs,id_principal,support,
    confidence,coverage,lift,count,Segment) 
    VALUES (${lhs_1},${lhs_2},${lhs_3},${lhs_4},${lhs_5},${rhs},${id_prod},${e.support},
    ${e.confidence},${e.coverage},${e.lift},${e.count},${i})`;
    sequelize
      .query(sql, { plain:true,raw: true,type: sequelize.QueryTypes.INSERT })
      .then(function (results) {
        if (!results) {
          return reject(error);
        } else {
          return resolve(results);
        }
      });
  });
}
function insertSegment(e,pharmacie){
  return new Promise((resolve, reject)=>{
    var indexPharmacie =0;
    pharmacie.filter((element, index, array) => {
      if (element.nom == e.Pharmacie){
        indexPharmacie = element.id;
      }
    })
    var arraySeg = ["","Best","Churn","FirstTime","Frequent","Uncertain","Valuable","Spenders"]
    var indexSegment =0;
    arraySeg.filter((element, index, array) => {
      if (element == e.Segment){
        indexSegment = index;
      }
    })
    var sql =`INSERT INTO seg_pharma (segment,pharmacie,id_pharmacie)
    VALUES (${indexSegment},'${e.Pharmacie}',${indexPharmacie})`;
    sequelize
      .query(sql, { type: sequelize.QueryTypes.INSERT })
      .then(function (results) {
        if (!results) {
          return reject(error);
        } else {
          return resolve(results);
        }
      });
  });
}
function insertLigne(idProd,idLift){
  return new Promise((resolve, reject)=>{
    var sql =`INSERT INTO ligne_support (id_prod,id_lift) VALUES (${idProd},${idLift})`;
    sequelize
      .query(sql, { type: sequelize.QueryTypes.INSERT })
      .then(function (results) {
        if (!results) {
          return reject(error);
        } else {
          return resolve(results);
        }
      });
  });
}
function cheeckProduit(nom){
  return new Promise((resolve, reject)=>{
    var nomFinal = nom.replaceAll('.', ',');
    var sql =`SELECT * from produits where designation = '${nomFinal}'`;
    sequelize
      .query(sql, { type: sequelize.QueryTypes.SELECT })
      .then(function (results) {
        if (!results) {
          return reject(error);
        } else {
          return resolve(results);
        }
      });
  });

}
function getPharmacie(nom){
  return new Promise((resolve, reject)=>{
    var sql =`SELECT * from pharmacies`;
    sequelize
      .query(sql, { type: sequelize.QueryTypes.SELECT })
      .then(function (results) {
        if (!results) {
          return reject(error);
        } else {
          return resolve(results);
        }
      });
  });

}
router.post("/envoyerExcelTest", async (req, res) => {
  var support = objectif.support;
  var segmnet = objectif.segmnet;
  for (const key in support) {
    var principale = await cheeckProduit(support[key].rhs);
    if(principale.length !=0)
      var insert = await insertSup(support[key],principale[0].id);
    var lhs_1 = support[key].lhs_1?support[key].lhs_1:"";
    var lhs_2 = support[key].lhs_2?support[key].lhs_2:"";
    var lhs_3 = support[key].lhs_3?support[key].lhs_3:"";
    var lhs_4 = support[key].lhs_4?support[key].lhs_4:"";
    var lhs_5 = support[key].lhs_5?support[key].lhs_5:"";
    if(lhs_1!="") {
      var rows = await cheeckProduit(lhs_1);
      if(rows.length !=0)
        var ligne = await insertLigne(rows[0].id,insert[0]);
    }
    if(lhs_2!="") {
      var rows = await cheeckProduit(lhs_2);
      if(rows.length !=0)
        var ligne = await insertLigne(rows[0].id,insert[0]);
    }
    if(lhs_3!="") {
      var rows = await cheeckProduit(lhs_3);
      if(rows.length !=0)
        var ligne = await insertLigne(rows[0].id,insert[0]);
    }
    if(lhs_4!="") {
      var rows = await cheeckProduit(lhs_4);
      if(rows.length !=0)
        var ligne = await insertLigne(rows[0].id,insert[0]);
    }
    if(lhs_5!="") {
      var rows = await cheeckProduit(lhs_5);
      if(rows.length !=0)
        var ligne = await insertLigne(rows[0].id,insert[0]);
    }
  }
  var pharmacie = await getPharmacie();
  for (const key in segmnet) {
    var insert = await insertSegment(segmnet[key],pharmacie);
  }
  return res.status(200).send({objectif});
});
module.exports = router;
