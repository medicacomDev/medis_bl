// Importing the packages required for the project.

const express = require("express");
var cron = require('node-cron');
var app = express();
app.use(express.json({limit: '205mb'}));
const path = require("path");
const fetch = require("node-fetch");

var cors = require("cors");
app.use(cors()); 
 
app.use(express.static(path.join(__dirname, "../client/build")));
// Used for sending the Json Data to Node API 
app.use(express.json());
app.use("/produit/", require("./controller/produitController"));
app.use("/pack/", require("./controller/packController"));
app.use("/pharmacie/", require("./controller/pharmacieController"));
app.use("/ims/", require("./controller/imsController"));
app.use("/secteur/", require("./controller/secteurController"));
app.use("/fournisseur/", require("./controller/fournisseurController"));
app.use("/user/", require("./controller/userController"));
app.use("/role/", require("./controller/roleController"));
app.use("/settings/", require("./controller/settingsController"));
app.use("/clustering/", require("./controller/clusteringController"));
app.use("/ligneIms/", require("./controller/ligneImsController"));
app.use("/marcheIms/", require("./controller/marcheImsController"));
app.use("/bl/", require("./controller/blController"));
app.use("/cron/", require("./controller/cronController"));
app.use("/actionComerciale/", require("./controller/actionComercialController"));
app.use("/segment/", require("./controller/segmentController"));
app.use("/todoList/", require("./controller/todoListController"));
app.use("/commande/", require("./controller/commandeController"));
app.use("/messageries/", require("./controller/messageriesController"));
app.use("/notification/", require("./controller/notificationController"));
app.use("/root/", require("./controller/rootController"));
app.use("/atc/", require("./controller/atcController"));

/* var task =cron.schedule('0 0 0 * * *', async() => {
  const generateExcel = await fetch(
    "http://40.68.198.129/cron/generateExcel",
    {
      method: "POST",     
    }
  )
  const generate = await generateExcel;
  
  const envoyerExcel = await fetch(
    "http://40.68.198.129/cron/envoyerExcel",
    {
      method: "POST",     
    }
  )
  const envoyer = await envoyerExcel;
}, {
  scheduled: false
}); 
task.start();*/ 


app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
}); 

const PORT = 4001 || 5000 || 6000;
app.listen(PORT, (err) =>
  err ? console.log(err) : console.log(`app listening on port ${PORT}!`)
);
