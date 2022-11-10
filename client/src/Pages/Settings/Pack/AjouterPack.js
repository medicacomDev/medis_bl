import React, { useEffect, useCallback, useState } from "react";
import NotificationAlert from "react-notification-alert";
import Select from "react-select";
import SweetAlert from "react-bootstrap-sweetalert";

// react-bootstrap components
import { Button, Card, Form, Container, Row, Col } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { getActiveAtc } from "../../../Redux/atcReduce";
import { getActivePharmacie } from "../../../Redux/pharmacieReduce";
import { fetchSegment } from "../../../Redux/segmentReduce";
import { addFils, packAdded, packGetById } from "../../../Redux/packReduce";
import { useDispatch } from "react-redux";
import ReactTable from "../../../components/ReactTable/ReactTable.js";
import { verification } from "../../../Redux/usersReduce";
import TableAtc from "./TableAtc/TableAtc";

function AjouterPack() {
  const notificationAlertRef = React.useRef(null);
  const [alert, setAlert] = React.useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useParams();
  //input
  const [nom, setNom] = React.useState("");
  const [bonification, setBonification] = React.useState(0);
  const [date, setDate] = React.useState("");
  const [id, setId] = React.useState(0);
  const [entities, setEntities] = useState([]);
  const [array, setArray] = React.useState([]);
  //produit
  const [produitSelect, setProduitSelect] = React.useState([]);
  const [optionProduit, setOptionProduit] = React.useState([]);
  //Pharmacie
  const [pharmacie, setPharmacie] = React.useState({ value: 0, label: "Tous" });
  const [optionPharmacie, setOptionPharmacie] = React.useState([
    {
      value: 0,
      label: "Pharmacie",
    },
  ]);

  //Segment
  const [segment, setSegment] = React.useState(null);
  const [optionSegment, setOptionSegment] = React.useState([
    {
      value: 0,
      label: "Segment",
    },
  ]);

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
  const hideAlert = () => {
    setAlert(null);
  };
  const confirmMessage = (nb) => {
    setAlert(
      <SweetAlert
        style={{ display: "block", marginTop: "-100px" }}
        title="Étes vous sure de supprimers?"
        onConfirm={() => deletePackProd(nb)}
        onCancel={() => hideAlert()}
        confirmBtnBsStyle="info"
        cancelBtnBsStyle="danger"
        confirmBtnText="Oui"
        cancelBtnText="Non"
        showCancel
      ></SweetAlert>
    );
  };
  function deletePackProd(nb) {
    var list = [...entities];
    var list1 = [...produitSelect];
    var list2 = [...array];
    if (entities.length > 1) {
      list.splice(parseInt(nb), 1);
      list1.splice(parseInt(nb), 1);
      list2.splice(parseInt(nb), 1);
      setEntities(list);
      setProduitSelect(list1);
      setArray(list2);
      notify("tr", "Supprimer avec succes", "success");
    } else {
      notify("tr", "il faut contient au moins une ligne", "warning");
    }
    hideAlert();
  }
  function submitForm(event) {
    var verif = true;
    var objProduit = {};
    var objMarche = {};
    var objProduitMnt = {};
    var objMarcheMnt = {};
    entities.forEach(async (data) => {
      /* var test = Object.keys(data).length;
      if (
        ( data.quantite === null ||
          data.quantite === "" ||
          parseInt(data.quantite) === 0 ||
          data.id_atc === null) &&
        test > 0
      ) {
        verif = false;
      } */
      var sommeMarche = 0;
      var sommeMntMarche = 0;
      for (const key in data.marches) {
        const element = data.marches[key];

        sommeMarche = sommeMarche + parseInt(element.quantite);
        sommeMntMarche = sommeMntMarche + parseInt(element.montant);

        objMarche[element.id_marche]=element.quantite;
        objMarcheMnt[element.id_marche]=element.montant;

        objProduit[element.id_marche] = 0;
        objProduitMnt[element.id_marche] = 0;

      }
      for (const key in data.produits) {
        const element = data.produits[key];
        var sommeProduit = objProduit[element.id_marche] + parseInt(element.quantite);
        var sommeProduitMnt = objProduitMnt[element.id_marche] + parseInt(element.montant);
        objProduit[element.id_marche]=sommeProduit
        objProduitMnt[element.id_marche]=sommeProduitMnt
      }

      if(sommeMarche>data.quantite)
        verif = false;

      if(sommeMntMarche>data.montant)
        verif = false;
    });
    
    for (const key in objProduit) {
      const elementP = objProduit[key];
      const elementM = objMarche[key];
      const elementMntM = objMarcheMnt[key];
      const elementMntP = objProduitMnt[key];
      if(elementM<elementP){
        verif = false;        
      }
      if(elementMntM<elementMntP){
        verif = false;        
      }
    }
    var valSeg = segment === null ? null : segment.value;
    var valPharmacie = pharmacie === null ? null : pharmacie.value;
    if (entities.length === 0)
      notify("tr", "Il faut selectionner au moin un gamme", "danger");
    else if (verif === false)
      notify("tr", "Vérifier montant ou quantité", "danger");
    else if (nom === "" || date === "" || bonification === "" || valSeg === null)
      notify("tr", "Vérifier vos donnée", "danger");
    else {
      dispatch(
        packAdded({
          nom: nom,
          bonification: bonification,
          date: date,
          segment: valSeg,
          idPharmacie: valPharmacie,
          id:id,
        })
      ).then(e=>{
        if(e.payload.msg ===true){
          var arrayMarches = [];
          var arrayProduits = [];
          var arrayAtc = [];
          entities.forEach(val=>{
            var objAtc = val;
            objAtc = {...objAtc,packId:(e.payload.id)}
            /* objAtc.packId=e.payload.id; */
            arrayAtc.push(objAtc);
            val.marches.forEach(val1=>{
              var objAtc1 = val1;
              /* objAtc1.packId=e.payload.id; */
              objAtc1 = {...objAtc1,packId:(e.payload.id)}
              /* objAtc1.montant=objAtc1.mnt;
              objAtc1.quantite=objAtc1.qte; */
              arrayMarches.push(objAtc1);
            })
            val.produits.forEach(val2=>{
              var objAtc2 = val2;
              /* objAtc2.packId=e.payload.id; */
              objAtc2 = {...objAtc2,packId:(e.payload.id)}
              /* objAtc2.montant=objAtc2.mnt;
              objAtc2.quantite=objAtc2.qte; */
              arrayProduits.push(objAtc2);
            })
            /* arrayProduits.push(val.produits); */
          })
          dispatch(
            addFils({arrayAtc,arrayMarches,arrayProduits})
          ).then(e1=>{
            if(e1.payload === true){
              if(isNaN(location.id) === true)
                notify("tr", "Insertion avec succes", "success")
              else
                notify("tr", "Modifier avec succes", "success");
              setTimeout(async () => {
                listePack();
              }, 1500);
            }
          })
        } else {
          notify("tr", "Problème de connexion", "danger");
        }
      });
    }
  }

  const getAtc = useCallback(async () => {
    var type = await dispatch(getActiveAtc());
    var entities = type.payload;
    var arrayOption = [];
    entities.forEach((e) => {
      arrayOption.push({ value: e.id, label: e.nom });
    });
    setOptionProduit(arrayOption);
  }, [dispatch]);

  const getPharmacie = useCallback(async () => {
    var type = await dispatch(getActivePharmacie());
    var entities = type.payload;
    var arrayOption = [];
    arrayOption.push({ value: 0, label: "Tous" });
    entities.forEach((e) => {
      arrayOption.push({ value: e.id, label: e.nom });
    });
    setOptionPharmacie(arrayOption);
  }, [dispatch]);

  const getSegment = useCallback(async () => {
    var type = await dispatch(fetchSegment());
    var entities = type.payload;
    var arrayOption = [];
    entities.forEach((e) => {
      arrayOption.push({ value: e.id, label: e.nom });
    });
    setOptionSegment(arrayOption);
  }, [dispatch]);

  //verif token
  const verifToken = useCallback(async () => {
    var response = await dispatch(verification());
    if (response.payload === false) {
      localStorage.clear();
      window.location.replace("/login");
    }
  }, [dispatch]);

  useEffect(() => {
    verifToken();
    const promise = new Promise((resolve) => {
      setTimeout(async () => {
        if (isNaN(location.id) === false) {
          var produit = await dispatch(packGetById(location.id));
          var entities = produit.payload;
          if (entities === false) {
            navigate("/listPack");
          } else {
            setId(location.id);
            resolve(entities);
          }
        } else {
          resolve(0);
        }
      }, 300);
    });

    promise.then((value) => {
      if (value !== 0) {
        setEntities(value.table);
        setBonification(value.header.bonification);
        setNom(value.header.nom);
        setDate(value.header.date)
        if (value.header.pharmacies !== null)
          setPharmacie({
            value: value.header.pharmacies.id,
            label: value.header.pharmacies.nom,
          });
        setSegment({
          value: value.header.segments.id,
          label: value.header.segments.nom,
        });
      }
    });
    getAtc();
    getSegment();
    getPharmacie();
  }, [
    getAtc,
    getSegment,
    getPharmacie,
    dispatch,
    location.id,
    navigate,
    verifToken,
  ]);

  function listePack() {
    navigate("/listPack");
  }
  function AjoutLigne(event) {
    var list = [];
    if (entities.length > 0) list = [...entities];
    list[list.length] = {
      id: null,
      packId: null,
      id_atc: null,
      quantite: 0,
      montant: 0,
      marches: [],
      produits: [],
    };
    setEntities(list);

    var list1 = [];
    if (array.length > 0) list1 = [...array];
    list1[list1.length] = [];
    setArray(list1);
  }

  return (
    <>
      {alert}
      <Container fluid className="table-dynamique">
        <div className="rna-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        <div className="section-image">
          <Container>
            <Row>
              <Col md="12">
                <Button
                  id="saveBL"
                  className="btn-wd btn-outline mr-1 float-left"
                  type="button"
                  variant="info"
                  onClick={listePack}
                >
                  <span className="btn-label">
                    <i className="fas fa-list"></i>
                  </span>
                  Retour à la liste
                </Button>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <Form action="" className="form" method="">
                  <Card>
                    <Card.Header>
                      <Card.Header>
                        <Card.Title as="h4">
                          {typeof location.id == "undefined"
                            ? "Ajouter Pack"
                            : "Modifier pack"}
                        </Card.Title>
                      </Card.Header>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col className="pr-1" md="6">
                          <Form.Group>
                            <label>Nom* </label>
                            <Form.Control
                              defaultValue={nom}
                              placeholder="Nom"
                              type="text"
                              onChange={(value) => {
                                setNom(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                        </Col>
                        <Col className="pl-1" md="6">
                          <Form.Group>
                            <label>Somme montant* </label>
                            <Form.Control
                              value={bonification}
                              placeholder="Somme montant"
                              type="text"
                              onChange={(value) => {
                                setBonification(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col className="pr-1" md="6">
                          <label>Segment* </label>
                          <Select
                            className="react-select primary"
                            classNamePrefix="react-select"
                            value={segment}
                            placeholder="segment"
                            onChange={(v) => {
                              setSegment(v);
                            }}
                            options={optionSegment}
                          />
                        </Col>
                        <Col className="pl-1" md="6">
                          <label>Pharmacie </label>
                          <Select
                            className="react-select primary"
                            classNamePrefix="react-select"
                            value={pharmacie}
                            placeholder="pharmacie"
                            onChange={(v) => {
                              setPharmacie(v);
                            }}
                            options={optionPharmacie}
                          />
                        </Col>
                      </Row>
                      <Row>
                        <Col className="pr-1" md="6">
                          <Form.Group>
                            <label>Date limite* </label>
                            <Form.Control
                              defaultValue={date}
                              placeholder="Date limite"
                              type="date"
                              onChange={(value) => {
                                setDate(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md="12">
                          <hr></hr>
                          <br></br>
                          <Button
                            className="btn-fill pull-right"
                            type="button"
                            variant="info"
                            nom="redac"
                            onClick={(ev) => AjoutLigne()}
                          >
                            <i className="fas fa-plus"></i> Ajouter gamme
                          </Button>
                          <br></br>
                          <TableAtc
                            bonification={bonification}
                            setBonification={setBonification}
                            entities={entities}
                            optionGame={optionProduit}
                            setEntities={setEntities}
                            array={array}
                            setArray={setArray}
                          ></TableAtc>
                        </Col>
                      </Row>

                      <Button
                        className="btn-fill pull-right"
                        type="button"
                        variant="info"
                        onClick={submitForm}
                      >
                        Enregistrer
                      </Button>
                      <div className="clearfix"></div>
                    </Card.Body>
                  </Card>
                </Form>
              </Col>
            </Row>
          </Container>
        </div>
      </Container>
    </>
  );
}

export default AjouterPack;
