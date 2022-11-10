import React, { useEffect, useCallback, useState } from "react";
import NotificationAlert from "react-notification-alert";
import Select from "react-select";

import { Document, Page } from "react-pdf/dist/esm/entry.webpack";
import {
  extractionsBL,
  blAdded,
  saveFile,
  blVerif,
} from "../../Redux/blReduce";
import { cheeckProduit, getActiveProduit } from "../../Redux/produitReduce";
import { getPharmacieByBricks, getActivePharmacie } from "../../Redux/pharmacieReduce";
import { getIdSecteurIms } from "../../Redux/secteurReduce";
import {
  getActiveFournisseur,
  cheeckFournisseur,
} from "../../Redux/fournisseurReduce";
import { getActiveDelegue } from "../../Redux/usersReduce";
import { getActionByLine } from "../../Redux/actionReduce";
import { getPackByProduits } from "../../Redux/packReduce";
import { useDispatch } from "react-redux";
import ReactTable from "../../components/ReactTable/ReactTableBl.js";
import jwt_decode from "jwt-decode";

// react-bootstrap components
import { Button, Card, Form, Container, Row, Col } from "react-bootstrap";
import Configuration from "../../configuration";
import Camera from "./Camera";

import Cropper from 'react-easy-crop'
import getCroppedImg from './cropImage'
import Slider from '@material-ui/core/Slider'
import Typography from '@material-ui/core/Typography'
import { styles } from './styles'

function TransformerBL({ classes }) {
  const dogImg =
  'https://img.huffingtonpost.com/asset/5ab4d4ac2000007d06eb2c56.jpeg?cache=sih0jwle4e&ops=1910_1000'

  var token = localStorage.getItem("x-access-token");
  var decoded = jwt_decode(token);
  const idrole = decoded.idrole;
  const idSect = decoded.idsect;
  const idUser = decoded.id;
  const idLine = decoded.line;
  const notificationAlertRef = React.useRef(null);
  const notify = (place, msg, type) => {
    var options = {};
    options = {
      place: place,
      message: (
        <div>
          <div>{msg}</div>
        </div>
      ),
      type: type,
      icon: "nc-icon nc-bell-55",
      autoDismiss: 7,
    };
    notificationAlertRef.current.notificationAlert(options);
  };
  const dispatch = useDispatch();
  const [activeCamera, setActiveCamera] = useState(false);
  const [load, setLoad] = useState(true);
  const [extensionFile, setExtensionFile] = useState("");
  const [image, setImage] = useState("");
  const [somme, setSomme] = useState(0.0);
  const [adresse, setAdresse] = useState(null);

  /** start crop img**/
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [croppedImage, setCroppedImage] = useState(null)

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(
        dogImg,
        croppedAreaPixels,
        rotation
      )
      setCroppedImage(croppedImage)
    } catch (e) {
      console.error(e)
    }
  }, [croppedAreaPixels, rotation])

  const onClose = useCallback(() => {
    setCroppedImage(null)
  }, [])
  
  /** end crop img**/

  //user
  const [userSelected, setUserSelected] = React.useState(null);
  const [optionUser, setOptionUser] = React.useState([
    {
      value: "",
      label: "User",
      isDisabled: true,
    },
  ]);
  //client
  const [clientSelected, setClientSelected] = React.useState(null);
  const [optionClient, setOptionClient] = React.useState([
    {
      value: "",
      label: "Pharmacie",
      isDisabled: true,
    },
  ]);
  //IMS
  const [ims, setIms] = React.useState(null);
  //pack
  const [packSelected, setPackSelected] = React.useState([]);
  const [optionPack, setOptionPack] = React.useState([
    {
      value: "",
      label: "Pack",
      isDisabled: true,
    },
  ]);
  //fournisseur
  const [fournisseur, setFournisseur] = React.useState(null);
  const [fourSelected, setFourSelected] = React.useState(null);
  const [optionFour, setOptionFour] = React.useState([
    {
      value: "",
      label: "Fournisseur",
      isDisabled: true,
    },
  ]);
  //Produit
  const [produitSelect, setProduitSelect] = React.useState([]);
  const [optionProduit, setOptionProduit] = React.useState([
    {
      value: "",
      label: "Produit",
      isDisabled: true,
    },
  ]);

  //Objectif
  const [objectifSelect, setObjectifSelect] = React.useState([]);
  const [optionObjectif, setOptionObjectif] = React.useState([
    {
      value: "",
      label: "Objectif",
      isDisabled: true,
    },
  ]);
  //table body
  const [entities, setEntities] = useState([]);
  const [data, setData] = useState([]);
  const [entitiesEntete, setEntitiesEntete] = useState([]);
  const [uploadFile, setUploadFile] = React.useState();

  const [numPages, setNumPages] = useState(null);
  const [pdfFile, setPdfFile] = useState("");
  const pdfOptions = {
    cMapUrl: "cmaps/",
    cMapPacked: true,
  };
  function setFour(four,newDateFormat,idDelegue){
    var array = [];
    array.push({
      Adresse: null,
      Client: null,
      nomClient: null,
      Fournisseur: four,
      dateBL: newDateFormat,
      ims: null,
      numBl: null,
      iduser: idDelegue,
      id_pack: 0,
      action: null,
      file: null,
      numeroBL: null,
    });
    setEntitiesEntete(array);
  }
  const checkFour = useCallback(
    async (four, entities) => {
      dispatch(cheeckFournisseur({ nomFournisseur: four.Fournisseur })).then(
        (rowsdes) => {
          var idDelegue = parseInt(idrole) === 2 ? idUser : null;
          var fo = rowsdes.payload;
          
          var newDateFormat = setFormatDate(entities[0].DateBL);
          var four = null;
          if (fo[0] !== null) {
            setFournisseur(fo[0][0]);
            four = fo[0][0];
          } else {
            setFournisseur(null);
          }          
          setFour(four,newDateFormat,idDelegue)
        }
      );
    },
    [dispatch, idUser, idrole]
  );
  const checkProd = useCallback(
    async (table) => {
      var arrayBody = [];
      dispatch(cheeckProduit(table)).then((rowsdes) => {
        var prod = rowsdes.payload;
        var som = 0;
        for (var i = 0; i < prod.length; i++) {
          var prix = 0;
          var qte = 0;
          if (!isNaN(parseFloat(table[i].Quantite))) {
            qte = parseFloat(table[i].Quantite);
          }
          if (!isNaN(parseFloat(table[i].Prix))) {
            prix = parseFloat(table[i].Prix);
          }
          var mnt= prix * qte;
          som += mnt;
          if (prod[i] !== null) {
            arrayBody.push({
              Designation: prod[i][0],
              Prix: prix,
              Quantite: qte,
              Code: table[i].Code,
              Montant: mnt.toFixed(3),
              id_pack: 0,
              idProduit: prod[i][2],
              quantite_pack: 0,
              id_atc: 0,
            });
          } else {
            arrayBody.push({
              Designation: table[i].Designation,
              Prix: prix,
              Quantite: qte,
              Code: table[i].Code,
              Montant: mnt.toFixed(3),
              id_pack: 0,
              idProduit: null,
              quantite_pack: 0,
              id_atc: 0,
            });
          }
        }
        setSomme(som.toFixed(3));
        setEntities(arrayBody);
        document.getElementById("loaderTable").classList.add("hidden");
      });
      /* dispatch(cheeckProduit(table)).then((rowsdes) => {
        var prod = rowsdes.payload;
        for (var i = 0; i < prod.length; i++) {
          var prix = 0;
          var qte = 0;
          if (!isNaN(parseFloat(table[i].Quantite))) {
            qte = parseFloat(table[i].Quantite);
          }
          if (!isNaN(parseFloat(table[i].Prix))) {
            prix = parseFloat(table[i].Prix);
          }
          var mnt= prix * qte;
          if (prod[i] !== null) {
            arrayBody.push({
              Designation: prod[i][0],
              Prix: prix,
              Quantite: qte,
              Code: table[i].Code,
              Montant: mnt.toFixed(3),
              idProduit: prod[i][2],
              id_pack: null,
              quantite_pack: 0,
            });
          } else {
            arrayBody.push({
              Designation: table[i].Designation,
              Prix: prix,
              Quantite: qte,
              Code: table[i].Code,
              Montant: mnt.toFixed(3),
              idProduit: null,
              id_pack: null,
              quantite_pack: 0,
            });
          }
        }
        dispatch(getPrixProduit({arrayBody})).then((dataprod) => {
          var somFinal = dataprod.payload.som;
          var arrayFinal = dataprod.payload.arrayBody;
          setSomme(somFinal.toFixed(3));
          setEntities(arrayFinal);
          setPackSelected([]);
          document.getElementById("loaderTable").classList.add("hidden");
        })
      }); */
    },
    [dispatch]
  );
  const setTable = useCallback(
    async (table, init) => {
      //1 => update table ***** 0 => initialiser table
      var arrayBody = [];
      if (init === 1) {
        var moy = 0;
        table.forEach((value) => {
          var sommeMnt=parseFloat(value.Prix) * parseFloat(value.Quantite);
          arrayBody.push({
            Designation: value.Designation,
            Prix: value.Prix,
            Quantite: value.Quantite,
            Code: value.Code,
            Montant: sommeMnt.toFixed(3),
            idProduit: value.idProduit,
            id_pack: value.id_pack,
            quantite_pack: value.quantite_pack,
          });
          moy += parseFloat(sommeMnt);
        });
        setSomme(moy.toFixed(3));
        setEntities(arrayBody);
      } else {
        checkProd(table);
      }
    },
    [checkProd]
  );
  function uploadBL(event) {
    var element = document.getElementById("table-BL");
    var element1 = document.getElementById("table-BL-header");
    element.classList.add("hidden");
    element1.classList.add("hidden");
    let blFile = event.target.files[0];
    if(blFile){
      var ext = blFile.name.split(".")
      setExtensionFile(ext[1]);
      setImage(URL.createObjectURL(blFile));
      if (ext[1] === "pdf") {
        setUploadFile(blFile);
      } else {
        setUploadFile(blFile);
      }
      setEntities([]);
      onFileChange(event);
    }
  }
  function onFileChange(event) {
    setPdfFile(event.target.files[0]);
  }

  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);

    setTimeout(() => {
      convertCanvasToImage();
    }, 1000);
  }

  function convertCanvasToImage() {
    let canvases = document.getElementsByClassName("react-pdf__Page__canvas");
    if (!canvases || canvases.length === 0) {
      console.warn("no canvases :'(");
      return;
    }
  }
  //get Produit
  const getProduit = useCallback(async () => {
    var type = await dispatch(getActiveProduit());
    var entities = type.payload;
    var arrayOption = [];
    entities.forEach((e) => {
      arrayOption.push({ value: e.id, label: e.designation });
    });
    setOptionProduit(arrayOption);
    setLoad(false)
  }, [dispatch]);

  //get pharmacie
  const getPharmacie = useCallback(async () => {
    var entities = [];
    if(idrole === 2){
      var secteur = await dispatch(getIdSecteurIms(idSect));
      var idBricks = secteur.payload;
      if(idBricks[0] === 0)
        entities = await dispatch(getActivePharmacie());
      else
        entities = await dispatch(getPharmacieByBricks({idBricks}));
    }      
    else{
      entities = await dispatch(getActivePharmacie());
    }
    var arrayOption = [];
      entities.payload.forEach((e) => {
        arrayOption.push({
          value: e.id,
          label: e.nom,
          idIms: e.ims.id,
          libIms: e.ims.libelle,
          adresse: e.adresse,
        });
      });
    setOptionClient(arrayOption);
  }, [dispatch,idSect,idrole]);

  //get fournisseur
  const getFournisseur = useCallback(async () => {
    var fournisseur = await dispatch(getActiveFournisseur());
    var entities = fournisseur.payload;
    var arrayOption = [];
    entities.forEach((e) => {
      arrayOption.push({ value: e.id, label: e.nom });
    });
    setOptionFour(arrayOption);
  }, [dispatch]);

  //get utilisateur
  const getUtilisateur = useCallback(async () => {
    var utilisateur = await dispatch(getActiveDelegue());
    var entities = utilisateur.payload;
    var arrayOption = [];
    entities.forEach((e) => {
      arrayOption.push({ value: e.id, label: e.nomU + " " + e.prenomU });
    });
    setOptionUser(arrayOption);
  }, [dispatch]);

  //get pack
  const getPackProd = useCallback(async (idPacks,list) => {
    dispatch(getPackByProduits({arrayFinal:list,idPacks:idPacks})).then((dataFinal) => {
      var ligneFinal= dataFinal.payload.arrayFinal;
      var packsFinal= dataFinal.payload.packSelected;
      setEntities(ligneFinal);
      setPackSelected(packsFinal);
    })
    /* var idPacksFinal = idPacks.split(","); */
  }, [dispatch]);
  const getObjectif = useCallback(async () => {
    var objectif = await dispatch(getActionByLine(idLine));
    var entities = objectif.payload;
    var arrayOption = [];
    entities.forEach((e) => {
      arrayOption.push({ value: e.id, label: e.nom,libPack:e.libPack,idPack:e.idPack });
    });
    setOptionObjectif(arrayOption);
  }, [dispatch,idLine]);

  const showTable = useCallback(
    async (file) => {
      var element = document.getElementById("table-BL");
      var element1 = document.getElementById("table-BL-header");
      element.classList.add("hidden");
      element1.classList.add("hidden");
      if (typeof file === "object") {
        document.getElementById("loaderTable").classList.remove("hidden");
        const dataArray = new FormData();
        dataArray.append("file", file);
        dataArray.append("api_key", Configuration.api_key);

        dataArray.append("name", file.name);
        var bl = await dispatch(extractionsBL(dataArray));
        var entities = bl.payload;

        /* var element = document.getElementById("table-BL");
        var element1 = document.getElementById("table-BL-header"); */
        element.classList.remove("hidden");
        element1.classList.remove("hidden");
        if (entities.length !== 0) {
          checkFour(entities[0], entities);
        }
        setTable(entities, 0);
        notify("tr", "Extraction avec succes", "success");
      } else {
        notify("tr", "Il faut selectionner un BL", "danger");
      }
    },
    [dispatch, checkFour, setTable]
  );
  function AjoutLigne(event) {
    var list = [];
    if (entities.length > 0) list = [...entities];
    list[list.length] = {
      Designation: null,
      Prix: 0,
      Quantite: 0,
      Code: 0,
      Montant: 0,
      idProduit: null,
      quantite_pack: 0,
      id_atc: 0,
    };
    setEntities(list);
  }
  function deleteLigne(nb) {
    if (entities.length > 1) {
      /* 
      var liste = entities;
      liste.splice(nb, 1);
      setEntities(liste); */
      var som = somme;
      som -= parseFloat(entities[nb].Montant);
      setSomme(som.toFixed(3));
      var filtered = entities.filter(function(value, index, arr){
        return index !== parseInt(nb);
      });
      setEntities(filtered);
        notify("tr", "Supprimer avec succes", "success");
    } else {
      notify("tr", "il faut contient au moins une ligne", "warning");
    }
  }
  function setFormatDate(d) {
    var formatDate = null;
    if (d !== "" && d !== null) {
      var str = d.replaceAll("/", "");
      if (isNaN(str.trim()) === false) {
        var pos = d.indexOf("/");
        var dataFormat = "";
        var dateTrime = "";
        var dataSplit = "";
        if (pos !== -1) {
          dateTrime = d.trim();
          dataSplit = dateTrime.split("/");
          dataFormat = dataSplit[2] + "-" + dataSplit[1] + "-" + dataSplit[0];
        } else {
          dateTrime = d.trim();
          dataSplit = dateTrime.split("-");
          dataFormat = dataSplit[2] + "-" + dataSplit[1] + "-" + dataSplit[0];
        }
        var newDate = new Date(dataFormat);
        if (newDate === "Invalid Date") formatDate = null;
        else formatDate = dataFormat;
      }
    }
    return formatDate;
  }
  const saveTable = useCallback(
    async (entitiesEntete, entities, uploadFile) => {
      var verifBl = await dispatch(
        blVerif({
          numeroBL: entitiesEntete[0].numeroBL,
          fournisseur: entitiesEntete[0].Fournisseur,
          somme:somme
        })
      );
      var testT = await verifBl.payload;
      if (
        entitiesEntete[0].Client === null ||
        entitiesEntete[0].Fournisseur === null ||
        entitiesEntete[0].dateBL === null ||
        entitiesEntete[0].dateBL === "" ||
        entitiesEntete[0].iduser === null ||
        entitiesEntete[0].numeroBL === null ||
        entitiesEntete[0].action === null ||
        entitiesEntete[0].numeroBL === ""
      ) {
        notify("tr", "Vérifier vos données!", "danger");
      } else if (testT === true) {
        notify("tr", "Bl deja existe", "danger");
      } else {
        var verif = true;
        entities.forEach((data) => {
          if (data.idProduit === null) verif = false;
          if (data.Montant === "" || data.Montant === 0) verif = false;
          if (data.Quantite === "" || data.Quantite === 0) verif = false;
        });
        if (verif === false) {
          notify("tr", "Vérifier vos données!", "danger");
        } else {
          if(activeCamera === false){
            const dataArray = new FormData();
            dataArray.append("file", uploadFile);
            dataArray.append("name", uploadFile.name);
            var bl = "";
            dataArray.append("bl", bl);
            dispatch(saveFile(dataArray)).then((e) => {
              entitiesEntete[0].file = e.payload.filename;
              var nomClientSplit = entitiesEntete[0].nomClient.replaceAll(" ","");
              var numBl = nomClientSplit + "@" + entitiesEntete[0].dateBL + "@" + entities[0].idProduit + "@" + entities[0].Quantite + "@" + somme;
              entitiesEntete[0].numBl = numBl;
              dispatch(blAdded({ bl: entitiesEntete[0], ligneBl: entities})).then((e) => {
                if(e.payload===true){
                  notify("tr", "Insertion avec succes", "success");
                  setTimeout(() => {
                    window.location.reload();
                  }, 1500);
                }else{                
                  notify("tr", "Vérifier vos données!", "danger");
                }
              });
            });
          } else {
            dispatch(blAdded({ bl: entitiesEntete[0], ligneBl: entities})).then((e) => {
              if(e.payload===true){
                notify("tr", "Insertion avec succes", "success");
                setTimeout(() => {
                  window.location.reload();
                }, 1500);
              }else{                
                notify("tr", "Vérifier vos données!", "danger");
              }
            });

          }
        }
      }
    },
    [dispatch, somme,activeCamera]
  );

  const removeProduit = useCallback(async (list,select,id) => {
    list[id].idProduit = null;
    list[id].Designation = null;
    select[id] = null;
    setProduitSelect(select);
    setEntities(list);
    setTable(list, 1);
  },
    [setTable]
  );
  const removeFournisseur = useCallback(async (list,id) => {
    setFour(null,list[0].dateBL,list[0].iduser);
    setFournisseur(null);
  },
    []
  );
  function showTableWithCapture(arrayBody){
    var element = document.getElementById("table-BL");
    var element1 = document.getElementById("table-BL-header");
    element.classList.remove("hidden");
    element1.classList.remove("hidden");
    setEntities(arrayBody);
  }
  
  useEffect(() => {
    if(load === true){
      getProduit();
      getPharmacie();
      getFournisseur();
      getObjectif();
    }
    if (idrole === 3) getUtilisateur();
    if(data.length !== 0 && activeCamera === true){
      showTableWithCapture(data)
    }
  }, [
    getProduit,
    getPharmacie,
    getFournisseur,
    getUtilisateur,
    idrole,
    data,
    load,
    getObjectif,
    activeCamera
  ]);
  return (
    <>
      <Container fluid className="responsive-BL table-dynamique">
        <div className="rna-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        <Row>
          <Col md="12">
            <Card className="strpied-tabled-with-hover">
              <Card.Header>
                <Card.Title as="h4">Tranformer BL</Card.Title>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md="12">
                    <Button
                      className="btn-wd mr-1 float-right extraction"
                      id="blExt"
                      type="button"
                      variant="success"
                      onClick={(v) => {
                        var element = document.getElementById("table-BL");
                        var element1 = document.getElementById("table-BL-header");
                        element.classList.add("hidden");
                        element1.classList.add("hidden");
                        setActiveCamera(!activeCamera);
                      }}
                    >
                      <span className="btn-label">
                        <i className="fas fa-camera-retro"></i>
                      </span>
                      {activeCamera === true ?" Fermer":" Ouvrire"} Camera
                    </Button>
                  </Col>
                </Row>
                <br></br>
                {activeCamera === false?
                  <div className="text-center">
                    <form>
                      <Form.Group className="float-left">
                        <Form.Control
                          id="test"
                          name="file"
                          type="file"
                          accept="application/pdf, image/png, image/jpeg, image/jpg"
                          onChange={(e) => uploadBL(e)}
                        ></Form.Control>
                      </Form.Group>
                    </form>
                    <div className="clear"></div>
                    <br></br>
                    {extensionFile === "" ? (
                      <h4>
                        Veuillez sélectionner un document PDF/Image <br></br> Nous
                        recomandons d'utiliser PDFScaner pour la prise des photos
                      </h4>
                    ) : extensionFile === "pdf" ? (
                      <Document
                        file={pdfFile}
                        onLoadSuccess={onDocumentLoadSuccess}
                        noData={
                          <h4>
                            Veuillez sélectionner un document PDF <br></br> Nous
                            recomandons d'utiliser PDFScaner pour la prise des
                            photos
                          </h4>
                        }
                        options={pdfOptions}
                      >
                        {Array.from(new Array(numPages), (el, index) => (
                          <Page
                            scale={2}
                            key={`page_${index + 1}`}
                            pageNumber={index + 1}
                          />
                        ))}
                      </Document>
                    ) : (
                      <div className="image-bl">
                        <img src={image} alt="" />
                      </div>
                    )}
                    <br />
                  </div>
                :
                <div className="block-camera">
                  <Camera
                    setData={setData}
                    setFournisseur={setFournisseur}
                    setEntitiesEntete={setEntitiesEntete}
                    setSomme={setSomme}
                    setPackSelected={setPackSelected}
                  />
                  <br></br>
                </div>}
                <div className="text-center">
                  <img
                    id="loaderTable"
                    className="hidden"
                    src={require("../../assets/img/loader.gif").default}
                    alt="loader"
                  />
                </div>
                {activeCamera === false?
                <Button
                  className="btn-wd btn-outline mr-1 float-right extraction"
                  id="blExt"
                  type="button"
                  variant="info"
                  onClick={(v) => {
                    showTable(uploadFile);
                  }}
                >
                  <span className="btn-label">
                    <i className="fas fa-cogs"></i>
                  </span>
                  BL Extractions
                </Button>:""}
                <br></br>
                <Row className="hidden" id="table-BL-header">
                  {idrole === 3 ? (
                    <Col md="3">
                      <span>Délégué</span>
                      <Select
                        className="react-select primary"
                        classNamePrefix="react-select"
                        name="Delegue"
                        placeholder="Délégué"
                        value={userSelected}
                        onChange={(v) => {
                          setUserSelected(v);
                          var entete = entitiesEntete;
                          entete[0].iduser = v.value;
                          setEntitiesEntete(entete);
                        }}
                        options={optionUser}
                      />
                    </Col>
                  ) : (
                    ""
                  )}
                  <Col md="12">
                    <hr></hr>
                    {entitiesEntete.length > 0 ? (
                      <div>
                        <ReactTable
                          data={entitiesEntete}
                          columns={[
                            {
                              Header: "Numero BL",
                              accessor: "numeroBL",
                              Cell: ({ cell }) => (
                                <Form.Group>
                                  <Form.Control
                                    defaultValue={cell.row.values.numeroBL}
                                    placeholder="numero BL"
                                    type="text"
                                    onChange={(val) => {
                                      var entete = entitiesEntete;
                                      entete[0].numeroBL = val.target.value;
                                      setEntitiesEntete(entete);
                                    }}
                                  ></Form.Control>
                                </Form.Group>
                              ),
                            },
                            {
                              Header: "date",
                              accessor: "dateBL",
                              Cell: ({ cell }) => (
                                <Form.Group>
                                  <Form.Control
                                    defaultValue={cell.row.values.dateBL}
                                    type="date"
                                    onChange={(d) => {
                                      var entete = entitiesEntete;
                                      entete[0].dateBL = d.target.value;
                                      setEntitiesEntete(entete);
                                    }}
                                  ></Form.Control>
                                </Form.Group>
                              ),
                            },
                            {
                              Header: "Action",
                              accessor: "objectif",
                              Cell: ({ cell }) => (
                                <div className="table-bl">
                                  <Select
                                    placeholder="Action"
                                    className="react-select primary "
                                    classNamePrefix="react-select"
                                    name="objectif"
                                    value={objectifSelect}
                                    onChange={(v) => {
                                      setObjectifSelect(v);
                                      var entete = entitiesEntete;
                                      entete[0].action = v.value;
                                      setEntitiesEntete(entete);
                                      var idPacks=v.idPack;
                                      var libPacks=v.libPack;
                                      var joinIdPack = idPacks.split(",");
                                      var joinLibPack = libPacks.split(",");
                                      var arrayOption = [];
                                      arrayOption.push({
                                        value: 0,
                                        label: "Commande groupée",
                                      });
                                      for (const key in joinIdPack) {
                                        arrayOption.push({
                                          value: parseInt(joinIdPack[key]),
                                          label: joinLibPack[key],
                                        });
                                      }
                                      setOptionPack(arrayOption);
                                      getPackProd(idPacks,entities)
                                      /* joinIdPack.forEach(e=>{
                                        arrayOption.push({
                                          value: data[element].id,
                                          label: data[element].nom,
                                        });

                                      }) */
                                    }}
                                    options={optionObjectif}
                                  />
                                </div>
                              ),
                            },
                            {
                              Header: "Bricks",
                              accessor: "idIms",
                              Cell: ({ cell }) => (
                                <Form.Group>
                                  <Form.Control
                                    readOnly
                                    defaultValue={ims}
                                    placeholder="Bricks"
                                    type="text"
                                  ></Form.Control>
                                </Form.Group>
                              ),
                            },
                          ]}
                          className="-striped -highlight primary-pagination"
                        />
                        <br></br>
                        <ReactTable
                          data={entitiesEntete}
                          columns={[
                            {
                              Header: "Pharmacie",
                              accessor: "Client",
                              Cell: ({ cell }) => (
                                <div className="table-bl">
                                  <div>
                                    <Select
                                      className="react-select primary "
                                      classNamePrefix="react-select"
                                      name="Pharmacie"
                                      placeholder="Pharmacie"
                                      value={clientSelected}
                                      onChange={(v) => {
                                        var entete = entitiesEntete;
                                        entete[0].idIms = v.idIms;
                                        entete[0].Adresse = v.adresse;
                                        entete[0].Client = v.value;
                                        entete[0].nomClient = v.label;
                                        setEntitiesEntete(entete);
                                        setIms(v.libIms);
                                        setAdresse(v.adresse);
                                        setClientSelected(v);
                                      }}
                                      options={optionClient}
                                    />
                                  </div>
                                </div>
                              ),
                            },
                            {
                              Header: "Fournisseur",
                              accessor: "Fournisseur",
                              Cell: ({ cell }) => (
                                <div className="table-bl">
                                  {fournisseur === null ? (
                                    <div>
                                      <Select
                                        className="react-select primary "
                                        placeholder="Fournisseur"
                                        classNamePrefix="react-select"
                                        name="Fournisseur"
                                        value={fourSelected}
                                        onChange={(v) => {
                                          var entete = entitiesEntete;
                                          entete[0].Fournisseur = v.label;
                                          setFourSelected(v);
                                          setEntitiesEntete(entete);
                                        }}
                                        options={optionFour}
                                      />
                                    </div>
                                  ) : (
                                    <Form.Group className="fournisseurInput">
                                      <Form.Control
                                        readOnly
                                        className="green"
                                        defaultValue={fournisseur}
                                        placeholder="fournisseur"
                                        type="text"
                                      ></Form.Control>
                                      <Button
                                        onClick={() => {
                                          removeFournisseur(entitiesEntete,cell.row.id)
                                        }}
                                      >
                                        <i className="fa fa-trash"/>
                                      </Button>
                                    </Form.Group>
                                  )}
                                </div>
                              ),
                            },
                            {
                              Header: "Adresse",
                              accessor: "adresse",
                              Cell: ({ cell }) => (
                                <Form.Group>
                                  <Form.Control
                                    readOnly
                                    defaultValue={adresse}
                                    placeholder="Adresse"
                                    type="text"
                                  ></Form.Control>
                                </Form.Group>
                              ),
                            },
                          ]}
                          className="-striped -highlight primary-pagination"
                        />
                      </div>
                    ) : (
                      ""
                    )}
                  </Col>
                </Row>
                <br></br>
                <Row className="hidden" id="table-BL">
                  <Col md="12">
                    <hr></hr>
                    <br></br>
                    <ReactTable
                      data={entities}
                      columns={[
                        {
                          Header: "Designation",
                          accessor: "Designation",
                          Cell: ({ cell }) => (
                            <div>
                              {entities[cell.row.id].idProduit !== null ? (
                                <Form.Group className="desinationProduit">
                                  <Form.Control
                                    className="green"
                                    readOnly
                                    defaultValue={cell.row.values.Designation}
                                    placeholder="Designation"
                                    type="text"
                                  ></Form.Control>
                                  <Button
                                    onClick={() => {
                                      removeProduit(entities,produitSelect,cell.row.id)
                                    }}
                                  >
                                    <i
                                      className="fa fa-trash"
                                    />
                                  </Button>
                                </Form.Group>
                              ) : (
                                <div className="table-bl">
                                  {cell.row.values.Designation != null ? (
                                    <Form.Group className="desinationProduit">
                                      <Form.Control
                                        className="red"
                                        readOnly
                                        defaultValue={
                                          cell.row.values.Designation
                                        }
                                        placeholder="Designation"
                                        type="text"
                                      ></Form.Control>
                                      <Button
                                        onClick={() => {
                                          removeProduit(entities,produitSelect,cell.row.id)
                                        }}
                                      >
                                        <i
                                          className="fa fa-trash"
                                        />
                                      </Button>
                                    </Form.Group>
                                  ) : ""}
                                      <Select
                                        className="react-select primary "
                                        classNamePrefix="react-select"
                                        name="Produit"
                                        placeholder="Produit"
                                        value={produitSelect[cell.row.id]}
                                        onChange={(v) => {
                                          var e = entities;
                                          var select = produitSelect;
                                          e[cell.row.id].idProduit = v.value;
                                          e[cell.row.id].Designation = v.label;
                                          select[cell.row.id] = v;
                                          setProduitSelect(select);
                                          setEntities(e);
                                          setTable(e, 1);
                                        }}
                                        options={optionProduit}
                                      />
                                </div>
                              )}
                            </div>
                          ),
                        },
                        {
                          Header: "Packs",
                          accessor: "id_pack",
                          Cell: ({ cell }) => (
                            <div className="table-bl">
                              <Select
                                className="react-select primary "
                                classNamePrefix="react-select"
                                name="Packs"
                                placeholder="Packs"
                                value={packSelected[cell.row.id]}
                                onChange={(v) => {
                                  var e = entities;
                                  var select = packSelected;
                                  e[cell.row.id].id_pack = v.value;
                                  e[cell.row.id].quantite_pack = v.qte;
                                  /* e[cell.row.id].quantite_pack = parseFloat(v.qte - e[cell.row.id].Quantite); */
                                  select[cell.row.id] = v;
                                  setPackSelected(select);
                                  setEntities(e);
                                  setTable(e, 1);
                                }}
                                options={optionPack}
                              />
                            </div>
                          ),
                        },
                        {
                          Header: "Code",
                          accessor: "Code",
                          Cell: ({ cell }) => (
                            <div>
                              <Form.Group>
                                <Form.Control
                                  defaultValue={cell.row.values.Code}
                                  placeholder="Code"
                                  type="text"
                                ></Form.Control>
                              </Form.Group>
                            </div>
                          ),
                        },
                        {
                          Header: "Quantite",
                          accessor: "Quantite",
                          Cell: ({ cell }) => (
                            <div>
                              <Form.Group>
                                <Form.Control
                                  defaultValue={cell.row.values.Quantite}
                                  placeholder="quantité"
                                  type="Number"
                                  onBlur={(value) => {
                                    var e = entities;
                                    if (e[cell.row.id].Prix != null) {
                                      var mnt = parseFloat(value.target.value) * parseFloat(e[cell.row.id].Prix);
                                      e[cell.row.id].Montant = mnt.toFixed(3);
                                    }
                                    e[cell.row.id].Quantite = parseFloat(
                                      value.target.value
                                    );
                                    setTable(e, 1);
                                  }}
                                ></Form.Control>
                              </Form.Group>
                            </div>
                          ),
                        },
                        {
                          Header: "Prix",
                          accessor: "Prix",
                          Cell: ({ cell }) => (
                            <div>
                              <Form.Group>
                                <Form.Control
                                  defaultValue={cell.row.values.Prix}
                                  placeholder="Prix"
                                  type="Number"
                                  onBlur={(value) => {
                                    var e = entities;
                                    if (e[cell.row.id].Quantite != null) {
                                      var mnt = parseFloat(value.target.value) * parseFloat(e[cell.row.id].Quantite);
                                      e[cell.row.id].Montant = mnt.toFixed(3);
                                    }
                                    e[cell.row.id].Prix = parseFloat(
                                      value.target.value
                                    );
                                    setTable(e, 1);
                                  }}
                                ></Form.Control>
                              </Form.Group>
                            </div>
                          ),
                        },
                        {
                          Header: "Montant",
                          accessor: "Montant",
                          Cell: ({ cell }) => (
                            <div>
                              <Form.Group>
                                <Form.Control
                                  defaultValue={cell.row.values.Montant}
                                  placeholder="Montant"
                                  type="Number"
                                  onBlur={(value) => {
                                    var e = entities;
                                    e[cell.row.id].Montant = value.target.value;
                                    setTable(e, 1);
                                  }}
                                ></Form.Control>
                              </Form.Group>
                            </div>
                          ),
                        },
                        {
                          Header: "Action",
                          accessor: "id",
                          Cell: ({ cell }) => (
                            <div className="actions-right block_action">
                              <Button
                                id={"idLigneR_" + cell.row.id}
                                onClick={(ev) => {
                                  deleteLigne(cell.row.id);
                                }}
                                variant="danger"
                                size="sm"
                                className="text-danger btn-link delete"
                              >
                                <i
                                  className="fa fa-trash"
                                  id={"idLigneR_" + cell.row.id}
                                />
                              </Button>
                            </div>
                          ),
                        },
                      ]}
                      className="-striped -highlight primary-pagination"
                    />
                    <br></br>
                    <Button
                      className="btn-fill pull-left"
                      type="button"
                      variant="info"
                      nom="redac"
                      onClick={(ev) => AjoutLigne()}
                    >
                      Ajouter
                    </Button>
                  </Col>
                  <Col md="12">
                    <div className="totalMax">Total TTC : {somme} TND</div>

                    <Button
                      id="saveBL"
                      className="btn-wd btn-outline mr-1 float-right"
                      type="button"
                      variant="success"
                      onClick={() =>
                        saveTable(entitiesEntete, entities, uploadFile)
                      }
                    >
                      <span className="btn-label">
                        <i className="fas fa-check"></i>
                      </span>
                      Enregistrer
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      {image !==""?
        <div>
          <div className="cropContainer">
            <Cropper
              image={image}
              crop={crop}
              rotation={rotation}
              zoom={zoom}
              aspect={1 / 1}
              onCropChange={setCrop}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="controls">
            <div className="sliderContainer">
              <Typography
                variant="overline"
                className="sliderLabel"
              >
                Zoom
              </Typography>
              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                className="slider"
                onChange={(e, zoom) => setZoom(zoom)}
              />
            </div>
            <div className="sliderContainer">
              <Typography
                variant="overline"
                className="sliderLabel"
              >
                Rotation
              </Typography>
              <Slider
                value={rotation}
                min={0}
                max={360}
                step={1}
                aria-labelledby="Rotation"
                className="slider"
                onChange={(e, rotation) => setRotation(rotation)}
              />
            </div>
            <Button
              onClick={showCroppedImage}
              variant="contained"
              color="primary"
              className="cropButton"
            >
              Show Result
            </Button>
          </div>
        </div>
      :""}
    </>
  );
}
export default TransformerBL;
