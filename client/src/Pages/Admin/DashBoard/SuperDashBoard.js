import React,{useCallback,useState} from "react";
import Select from "react-select";
import { useDispatch } from "react-redux";
import {
  Card,
  Container,
  Row,
  Col,
  Button
} from "react-bootstrap";
import { totalCA,produitMarche,venteBLProduit,venteBLPharmacie,chartPharmacieBricks,chiffreParIms,
          suiviMensuel,chiffreParSecteur,venteBLParDelegue  } from "../../../Redux/dashReduce";
import { getAllProduitBl,getAllMarcheBl,getAllParmacieBl,getAllImsBl,getAllDelegueBl,getAllSecteurBl } from "../../../Redux/blReduce";
import jwt_decode from "jwt-decode";
import jspdf from "jspdf";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';
import { Bar,Line } from 'react-chartjs-2';
import html2canvas from "html2canvas";
import { verification } from "../../../Redux/usersReduce";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

function SuperDashBoard() {
  document.title = "Tableau de bord";
  const dispatch = useDispatch();
  var token = localStorage.getItem("x-access-token");
  var decoded = jwt_decode(token);
  const idLine = decoded.line
  const idRole = decoded.idrole
  var anneeLocal =localStorage.getItem("annee");
  /* const [limitPharmacie, setLimitPharmacie] = useState(10);
  const [limitSecteur, setLimitSecteur] = useState(10);
  const [limitProduit , setLimitProduit] = useState(10);
  const [limitBricks, setLimitBricks] = useState(10);
  const [limitDelegue, setLimitDelegue] = useState(10);
  const [limitMarche, setLimitMarche] = useState(10); */
  const [dataEvo, setDataEvo] = useState(null);
  const [dataSuivi, setDataSuivi] = useState(null);
  //chiffreParGouvernorat
  const [dataBricks, setDataBricks] = useState(null);
  //venteBLParClientParAnne
  const [dataClient, setDataClient] = useState(null);
  //venteBLParDelegueAdmin
  const [dataDelegue, setDataDelegue] = useState(null);
  //produit
  const [dataProduit, setDataProduit] = useState(null);
  //PRODUIT Marche
  const [dataMarche, setDataMarche] = useState(null);

  const [optionsQteCA] = useState([
    {
      isDisabled: true,
    },
    { value: 1, label: "Quantité",libelle:"quantite" },
    { value: 2, label: "Chiffre d'affaire (TND)",libelle:"montant" },
  ]);
  const [qteCA, setQteCA] = useState({ value: 2, label: "Chiffre d'affaire",libelle:"quantite" });

  //header page
  const [total, setTotal] = useState(0);
  const [totalClient, setTotalClient] = useState(0);
  const [totalVente, setTotalVente] = useState(0);

  const [mois, setMois] = React.useState({
    value: 0,
    label: "Tous",
  });
  const [optionsMois] = React.useState([
    {
      value: "",
      label: "Mois",
      isDisabled: true,
    },
    { value: 0, label: "Tous" },
    { value: 1, label: "janvier" },
    { value: 2, label: "février" },
    { value: 3, label: "mars" },
    { value: 4, label: "avril" },
    { value: 5, label: "mai" },
    { value: 6, label: "juin" },
    { value: 7, label: "juillet" },
    { value: 8, label: "août" },
    { value: 9, label: "septembre" },
    { value: 10, label: "octobre" },
    { value: 11, label: "novembre" },
    { value: 12, label: "décembre" },
  ]);
  
  const [labels] = React.useState(["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]);
  //produit
  const [produitSelected, setProduitSelected] = React.useState([]);
  const [optionProduit, setOptionProduit] = React.useState([
    {
      value: "",
      label: "Produit",
    },
  ]);

  //marche
  const [marcheSelected, setMarcheSelected] = React.useState([]);
  const [optionMarche, setOptionMarche] = React.useState([
    {
      value: "",
      label: "Marche",
    },
  ]);

  //Pharmacie
  const [pharmacieSelected, setPharmacieSelected] = React.useState([]);
  const [optionPharmacie, setOptionPharmacie] = React.useState([
    {
      value: "",
      label: "Pharmacie",
    },
  ]);

  //CA par pharmacies par bricks (Top 15)
  const [briksClient, setBriksClient] = useState();
  const [optionBriks, setOptionBriks] = React.useState([
    {
      value: "",
      label: "Briks",
    },
  ]);
  const [valClientBriks, setValClientBriks] = useState(null);

  //CA des BL par Bricks
  const [briksSelected, setBricksSelected] = useState([]);
  //chiffreParSecteur
  const [caParSect, setCaParSect] = useState(null);

  //user
  const [userSelected, setUserSelected] = React.useState([]);
  const [optionUser, setOptionUser] = React.useState([
    {
      value: "",
      label: "User",
    },
  ]);

  //secteur
  const [secteurSelected, setSecteurSelected] = React.useState([]);
  const [optionSecteur, setOptionSecteur] = React.useState([
    {
      value: "",
      label: "Secteur",
    },
  ]);

  //header
  const getHeader = useCallback(async (mois) => {
    var header = await dispatch(totalCA({
      year: parseInt(anneeLocal),
      idLine: parseInt(idLine),
      mois: mois.value,
      idRole:idRole
    }));
    setTotal(header.payload.montant);
    setTotalClient(header.payload.totalClient);
    setTotalVente(header.payload.totalBl);
  }, [dispatch,anneeLocal,idLine,idRole]);

  //chart produit
  const getProduitBl = useCallback(async () => {
    var produit = await dispatch(getAllProduitBl({idLine,idRole,anneeLocal}));
    var entities = produit.payload;
    setOptionProduit(entities);
  }, [dispatch,idLine,idRole,anneeLocal]);

  const getProduit = useCallback(async (mois,qteCA,prod,nb) => {
    var array = [];
    prod.forEach(e=>{
      array.push(e.value)
    })
    var chiffre = await dispatch(venteBLProduit({
      qteCA: qteCA.value,
      idLine: parseInt(idLine),
      year: parseInt(anneeLocal),
      mois: mois.value,
      idRole:idRole,
      limit:nb,
      produit:array
    }));
    var arrayProd=chiffre.payload.arrayProd;
    var arrayOption=chiffre.payload.arrayOption;
    var arrayMnt=chiffre.payload.arrayMnt;
    var objProduit = {
      labels: arrayProd,
      datasets: [
        {
          label: "Année sélectionnée",
          data: arrayMnt,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          barPercentage: 0.5,
          barThickness: 10,
          maxBarThickness: 18,
          minBarLength: 2,
        },
      ],
    };
    setDataProduit(objProduit);
    setProduitSelected(arrayOption);
  }, [dispatch,anneeLocal,idRole,idLine]);

  //chart marche
  const getMarcheBl = useCallback(async () => {
    var marche = await dispatch(getAllMarcheBl({idLine,idRole,anneeLocal}));
    var entities = marche.payload;
    setOptionMarche(entities);
  }, [dispatch,idLine,idRole,anneeLocal]);

  const getMarche = useCallback(async (mois,qteCA,marche,nb) => {
    var array = [];
    marche.forEach(e=>{
      array.push(e.value)
    })
    var chiffre = await dispatch(produitMarche({
      qteCA: qteCA.value,
      idLine: parseInt(idLine),
      year: parseInt(anneeLocal),
      mois: mois.value,
      idRole:idRole,
      marche:array,
      limit:nb
    }));
    var arrayMarche=chiffre.payload.arrayMarche;
    var arrayOption=chiffre.payload.arrayOption;
    var arrayMnt=chiffre.payload.arrayMnt;
    var objMarche = {
      labels:arrayMarche,
      datasets: [
        {
          label: 'Année sélectionnée',
          data: arrayMnt,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          barPercentage: 0.5,
          barThickness: 10,
          maxBarThickness: 18,
          minBarLength: 2,
        },
      ],
    }; 
    setDataMarche(objMarche)
    setMarcheSelected(arrayOption);
  }, [dispatch,anneeLocal,idRole,idLine]);

  //chart Pharmacie
  const getPharmacieBl = useCallback(async () => {
    var marche = await dispatch(getAllParmacieBl({idLine,idRole,anneeLocal}));
    var entities = marche.payload;
    setOptionPharmacie(entities);
  }, [dispatch,idLine,idRole,anneeLocal]);

  const getPharmacie = useCallback(async (mois,qteCA,pharmacie,nb) => {
    var array = [];
    pharmacie.forEach(e=>{
      array.push(e.value)
    })
    var chiffre = await dispatch(venteBLPharmacie({
      qteCA: qteCA.value,
      idLine: parseInt(idLine),
      year: parseInt(anneeLocal),
      mois: mois.value,
      idRole:idRole,
      idUser:0,
      pharmacie:array,
      limit:nb
    }));
    var arrayPharmacie=chiffre.payload.arrayPharmacie;
    var arrayOption=chiffre.payload.arrayOption;
    var arrayMnt=chiffre.payload.arrayMnt;
    var objClient = {
      labels: arrayPharmacie,
      datasets: [
        {
          label: "Année sélectionnée",
          data: arrayMnt,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          barPercentage: 0.5,
          barThickness: 10,
          maxBarThickness: 18,
          minBarLength: 2,
        },
      ],
    };
    setDataClient(objClient);
    setPharmacieSelected(arrayOption);
  }, [dispatch,anneeLocal,idRole,idLine]);

  //CA par pharmacies par bricks (Top 15)
  const getIms = useCallback(async () => {
    var ims = await dispatch(getAllImsBl({idLine,idRole,anneeLocal}));
    var entities = ims.payload;
    setOptionBriks(entities);
  }, [dispatch,idLine,idRole,anneeLocal]);

  const getPharmacieBricks = useCallback(async (mois,qteCA,idBriks) => {
    var chiffre = await dispatch(chartPharmacieBricks({
      qteCA: qteCA.value,
      idLine: parseInt(idLine),
      year: parseInt(anneeLocal),
      mois: mois.value,
      idRole:idRole,
      idBriks:idBriks
    }));
    var arrayIms=chiffre.payload.arrayIms;
    var arrayMnt=chiffre.payload.arrayMnt;
    var objClient = {
      labels: arrayIms,
      datasets: [
        {
          label: "Année sélectionnée",
          data: arrayMnt,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          barPercentage: 0.5,
          barThickness: 10,
          maxBarThickness: 18,
          minBarLength: 2,
        },
      ],
    };
    setValClientBriks(objClient);
    if(idBriks === 0)
      setBriksClient({ value: 0, label: "Tous" })
  }, [dispatch,anneeLocal,idRole,idLine]);

  const getBricks = useCallback(async (mois,qteCA,ims,nb) => {
    var array = [];
    ims.forEach(e=>{
      array.push(e.value)
    })
    var chiffre = await dispatch(chiffreParIms({
      qteCA: qteCA.value,
      idLine: parseInt(idLine),
      year: parseInt(anneeLocal),
      mois: mois.value,
      idRole:idRole,
      idBriks:array,
      limit:nb
    }));
    var arrayIms=chiffre.payload.arrayIms;
    var arrayOption=chiffre.payload.arrayOption;
    var arrayMnt=chiffre.payload.arrayMnt;
    var objBricks = {
      labels: arrayIms,
      datasets: [
        {
          label: "Année sélectionnée",
          data: arrayMnt,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          barPercentage: 0.5,
          barThickness: 10,
          maxBarThickness: 18,
          minBarLength: 2,
        },
      ],
    };
    setDataBricks(objBricks);
    setBricksSelected(arrayOption);
  }, [dispatch,anneeLocal,idRole,idLine]);

  //secteur
  const getSecteur = useCallback(async (mois,qteCA,sect,nb) => {
    var array = [];
    sect.forEach(e=>{
      array.push(e.value)
    })
    var chiffre = await dispatch(chiffreParSecteur({
      qteCA: qteCA.value,
      idLine: parseInt(idLine),
      year: parseInt(anneeLocal),
      mois: mois.value,
      idRole:idRole,
      secteur:array,
      limit:nb
    }));
    var arraySect =chiffre.payload.arraySect;
    var arrayMnt = chiffre.payload.arrayMnt;
    var arrayOption =chiffre.payload.arrayOption;
    setSecteurSelected(arrayOption);
    var objSecteur = {
      labels: arraySect,
      datasets: [
        {
          label: 'Année sélectionnée',
          data: arrayMnt,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          barPercentage: 0.5,
          barThickness: 10,
          maxBarThickness: 18,
          minBarLength: 2,
        },
      ],
    }; 
    setCaParSect(objSecteur)
  }, [dispatch,anneeLocal,idRole,idLine]);

  //suivi
  const getSuivi = useCallback(async (qteCA) => {
    var yearNow = parseInt(anneeLocal);
    var lastYear = yearNow - 1;
    var response = await dispatch(suiviMensuel({
      qteCA: qteCA.value,
      idLine: parseInt(idLine),
      idUser:0,
      year: yearNow,
    }));
    let dataBL = response.payload;
    var arrayYear = [];
    var arrayLastYear = [];
    labels.forEach((e) => {
      var resultNow = dataBL.filter(function (elem) {
        return elem.mounth === e && parseInt(elem.annee) === yearNow;
      });
      var resultLast = dataBL.filter(function (elem) {
        return elem.mounth === e && parseInt(elem.annee) === lastYear;
      });
      if (
        typeof resultNow[0] !== "undefined" &&
        parseFloat(resultNow[0].annee) === yearNow
      ) {
        arrayYear.push(parseFloat(resultNow[0].qteCA).toFixed(3));
      } else {
        arrayYear.push(0);
      }

      if (
        typeof resultLast[0] !== "undefined" &&
        parseFloat(resultLast[0].annee) === lastYear
      ) {
         arrayLastYear.push(resultLast[0].qteCA.toFixed(3));
      } else {
        arrayLastYear.push(0);
      }
    });
    var objEvo = {
      labels: labels,
      datasets: [
        {
          label: 'Année sélectionnée',
          data: arrayYear,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          barPercentage: 0.5,
          barThickness: 10,
          maxBarThickness: 18,
          minBarLength: 2,
        },
        {
          label: 'Année précédente',
          data: arrayLastYear,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          barPercentage: 0.5,
          barThickness: 10,
          maxBarThickness: 18,
          minBarLength: 2,
        },
      ],
    };
    var objSuivi = {
      labels: labels,
      datasets: [
        {
          label: 'Année sélectionnée',
          data: arrayYear,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ],
    };
    setDataSuivi(objSuivi)
    setDataEvo(objEvo)
  }, [dispatch,anneeLocal,idLine,labels]);

  //venteBLParDelegue
  const getBLParDelegue = useCallback(async (mois,qteCA,user,nb) => {
    var array = [];
    user.forEach(e=>{
      array.push(e.value)
    })
    var chiffre = await dispatch(venteBLParDelegue({
      qteCA: qteCA.value,
      idLine: parseInt(idLine),
      year: parseInt(anneeLocal),
      mois: mois.value,
      idRole:idRole,
      user:array,
      limit:nb
    }));
    var arrayUser=chiffre.payload.arrayUser;
    var arrayOption=chiffre.payload.arrayOption;
    var arrayMnt=chiffre.payload.arrayMnt;
    var objMarche = {
      labels:arrayUser,
      datasets: [
        {
          label: 'Année sélectionnée',
          data: arrayMnt,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          barPercentage: 0.5,
          barThickness: 10,
          maxBarThickness: 18,
          minBarLength: 2,
        },
      ],
    }; 
    setDataDelegue(objMarche);
    setUserSelected(arrayOption);
  }, [dispatch,anneeLocal,idRole,idLine]);

  //get utilisateur
  const getUtilisateur = useCallback(async () => {
    var utilisateur = await dispatch(getAllDelegueBl({idLine,idRole,anneeLocal}));
    var entities = utilisateur.payload;
    var arrayOption = [];
    entities.forEach((e) => {
      arrayOption.push({ value: e.users.id, label: e.users.nomU + " " + e.users.prenomU });
    });
    setOptionUser(arrayOption);
  }, [dispatch,idLine,idRole,anneeLocal]);

  //get utilisateur
  const getSecteurActiveBL = useCallback(async () => {
    var utilisateur = await dispatch(getAllSecteurBl({idLine,idRole,anneeLocal}));
    var entities = utilisateur.payload;
    var arrayOption = [];
    entities.forEach((e) => {
      arrayOption.push({ value: e.users.secteurs.id, label: e.users.secteurs.libelleSect });
    });
    setOptionSecteur(arrayOption);
  }, [dispatch,idLine,idRole,anneeLocal]);


  //verif token
  const verifToken = useCallback(async () => {
    var response = await dispatch(verification());
    if(response.payload === false){
      localStorage.clear();
      window.location.replace("/login");
    }
  }, [dispatch]);

  //useEffect
  React.useEffect(() => {
    verifToken();
    getProduitBl();
    getMarcheBl()
    getPharmacieBl();
    getIms();
    getUtilisateur();
    getSecteurActiveBL();
    getSuivi(qteCA);
    getHeader(mois);
    getSuivi(qteCA);
    getProduit(mois,qteCA,[],10);
    getPharmacie(mois,qteCA,[],10);
    getBricks(mois,qteCA,[],10);
    getPharmacieBricks(mois,qteCA,0);
    getMarche(mois,qteCA,[],10);
    getSecteur(mois,qteCA,[],10);
    getBLParDelegue(mois,qteCA,[],10)
  }, [getHeader,mois,getMarche,getMarcheBl,getProduit,getProduitBl,getPharmacie,getPharmacieBl,qteCA,getPharmacieBricks,idLine,
    getBLParDelegue,getBricks,getIms,getSecteur,getSecteurActiveBL,getSuivi,getUtilisateur,idLine,idRole,anneeLocal,verifToken]);

  const changeMois = useCallback(async (val) => {
    setMois(val);
  }, []);

  const changeQteCA = useCallback(async (val) => {
    setQteCA(val);
  }, []);

  window.onscroll = function () {
    var scroll = window.pageYOffset;
    var element = document.getElementById("position");
    if (element != null)
      if (scroll > 300) {
        element.classList.add("scrollMenu");
      } else {
        element.classList.remove("scrollMenu");
      }
  };
  function exportPdf() {
    var printhidden = document.getElementsByClassName("select-print");
    for (const key in printhidden) {
      if (typeof printhidden[key] === "object")
        printhidden[key].style.display = "none";
    }
    var input1 = document.getElementById("capture1");
    var input2 = document.getElementById("capture2");
    html2canvas(input1, {
      logging: true,
      letterRendering: 1,
      useCORS: true,
    }).then((canvas) => {
      const imgWidth = 208;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL("image/jpeg");
      const pdf = new jspdf("p", "mm", "a4");
      var date1 = new Date();
      var date = new Date(date1.getTime() - date1.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("Dashboard supervisuer part 1 " + date + ".pdf");
    });
    html2canvas(input2, {
      logging: true,
      letterRendering: 1,
      useCORS: true,
    }).then((canvas) => {
      const imgWidth = 208;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL("image/jpeg");
      const pdf = new jspdf("p", "mm", "a4");
      var date1 = new Date();
      var date = new Date(date1.getTime() - date1.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("Dashboard supervisuer part 2 " + date + ".pdf");
    });
    for (const key in printhidden) {
      if (typeof printhidden[key] === "object")
        printhidden[key].style.display = "block";
    }
  }
  
  return (
    <>
      <Container fluid>
        <div id="position">
          <Row>
            <Col md="6" className="pr-1">
              <label htmlFor="exampleInputEmail1">
                Quantité/Chiffre d'affaire
              </label>
              <Select
                className="react-select primary select-print"
                classNamePrefix="react-select"
                name="singleSelect"
                value={qteCA}
                onChange={changeQteCA}
                options={optionsQteCA}
                placeholder="Quantité/Chiffre d'affaire"
              />
              <br></br>
            </Col>
            <Col md="6" className="pr-1">
              <label htmlFor="exampleInputEmail1">Mois</label>
              <Select
                className="react-select primary select-print"
                classNamePrefix="react-select"
                name="singleSelect"
                value={mois}
                onChange={changeMois}
                options={optionsMois}
                placeholder="Mois"
              />
              <br></br>
            </Col>
          </Row>
        </div>
        <Row>
          <Col md="4" className="pr-1">
            <Button
              className="btn-fill"
              type="button"
              variant="info"
              onClick={exportPdf}
            >
              Imprimer <i className="fas fa-print"></i>
            </Button>
          </Col>
        </Row>

        <div id="capture1">
          <Row>
            <Col lg="4" md="6" sm="4">
              <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="fas fa-chart-line"></i>
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Total CA</p>
                        <Card.Title as="h4">
                          {total == null ? 0 : total} TND
                        </Card.Title>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
                <Card.Footer>
                <hr></hr>
                </Card.Footer>
              </Card>
            </Col>
            <Col lg="4" md="6" sm="4">
              <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="fas fa-chart-line"></i>
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Total vente</p>
                        <Card.Title as="h4">{totalVente}</Card.Title>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
                <Card.Footer>
                <hr></hr>
                </Card.Footer>
              </Card>
            </Col>
            <Col lg="4" md="6" sm="4">
              <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="fas fa-user"></i>
                      </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Total Pharmacie</p>
                        <Card.Title as="h4">{totalClient}</Card.Title>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
                <Card.Footer>
                <hr></hr>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
          <div className="chartBL">
            {/* start  Suivi  */}
            <Row>
              <Col md="12">
                <Card>
                  <Card.Header>
                    <Card.Title as="h4">
                      {qteCA.value === 1
                        ? "Suivi mensuel du QTE générée par BL"
                        : "Suivi mensuel du CA généré par BL"}
                    </Card.Title>
                  </Card.Header>
                  <Card.Body>
                    {dataSuivi != null?<Line data={dataSuivi} height={"70"}/>:""}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            {/* end  Suivi */}

            {/* start  Évolution  */}
            <Row>
              <Col md="12">
                <Card>
                  <Card.Header>
                    <Card.Title as="h4">
                      {qteCA.value === 1
                        ? "Évolution du Qte générée par BL"
                        : "Évolution du CA généré par BL"}
                    </Card.Title>
                  </Card.Header>
                  <Card.Body>
                    {dataEvo != null?<Bar data={dataEvo} height={"70"}/>:""}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            {/* end  Évolution */}

            {/* start  secteur */}
            <Row>
              <Col md="12">
                <Card>
                  <Card.Header>
                    <Row>
                      <Col md="3" className="pr-1">
                        <Card.Title as="h4">
                          {qteCA.value === 1
                            ? "Qte générée par les BL selon le secteur"
                            : "CA généré par les BL selon le secteur"}
                        </Card.Title>
                      </Col>
                      <Col md="9">
                        <Select
                          isMulti
                          className="react-select primary select-print"
                          classNamePrefix="react-select"
                          name="singleSelect"
                          value={secteurSelected}
                          onChange={(val)=>{
                            var nb = val.length;
                            /* setLimitSecteur(nb); */
                            setSecteurSelected(val)
                            getSecteur(mois,qteCA,val,nb)
                          }}
                          options={optionSecteur}
                          placeholder="secteur"
                        />
                        <br></br>
                      </Col>
                    </Row>
                  </Card.Header>
                  <Card.Body>
                    {caParSect != null?<Bar data={caParSect} height={"70"}/>:""}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            {/* end  secteur */}

            {/* start  Produit */}
            <Row>
              <Col md="12">
                <Card>
                  <Card.Header>
                    <Row>
                      <Col md="3" className="pr-1">
                        <Card.Title as="h4">
                          {qteCA.value === 1
                            ? "QTE des présentations vendus extraits des BL"
                            : "CA des présentations extraits des BL"}
                        </Card.Title>
                      </Col>
                      <Col md="9">
                        <Select
                          isMulti
                          className="react-select primary select-print"
                          classNamePrefix="react-select"
                          name="singleSelect"
                          value={produitSelected}
                          onChange={(val)=>{
                            var nb = val.length;
                            /* setLimitProduit(nb); */
                            setProduitSelected(val);
                            getProduit(mois, qteCA, val, nb);
                          }}
                          options={optionProduit}
                          placeholder="Présentations"
                        />
                        <br></br>
                      </Col>
                    </Row>
                  </Card.Header>
                  <Card.Body>
                    {dataProduit != null ? <Bar data={dataProduit} height={"70"} /> : ""}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            {/* end  Produit */}

            {/* start  Pharmacie */}
            <Row>
              <Col md="12">
                <Card>
                  <Card.Header>
                    <Row>
                      <Col md="3" className="pr-1">
                        <Card.Title as="h4">
                          {qteCA.value === 1
                            ? "QTE (BL) des présentations vendus par pharmacies"
                            : "CA (BL) des présentations vendus par pharmacies"}
                        </Card.Title>
                      </Col>
                      <Col md="9">
                        <Select
                          isMulti
                          className="react-select primary select-print"
                          classNamePrefix="react-select"
                          name="singleSelect"
                          value={pharmacieSelected}
                          onChange={(val)=>{
                            var nb = val.length;
                            /* setLimitPharmacie(val.length) */
                            setPharmacieSelected(val)
                            getPharmacie(mois,qteCA,val,nb)
                          }}
                          options={optionPharmacie}
                          placeholder="Pharmacie"
                        />
                        <br></br>
                      </Col>
                    </Row>
                  </Card.Header>
                  <Card.Body>
                    {dataClient != null ? <Bar data={dataClient} height={"70"} /> : ""}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            {/* end  Pharmacie */}
          </div>
        </div>
        
        <div className="chartBL" id="capture2">
        {/* start  Pharmacie Bricks */}
        <Row>
            <Col md="12">
              <Card>
                <Card.Header>
                  <Row>
                    <Col md="3" className="pr-1">
                      <Card.Title as="h4">
                        {qteCA.value === 1
                          ? "QTE (BL) des pharmacies par bricks"
                          : "CA (BL) des pharmacies par bricks"}
                      </Card.Title>
                    </Col>
                    <Col md="9">
                      <Select
                        className="react-select primary select-print"
                        classNamePrefix="react-select"
                        name="singleSelect"
                        value={briksClient}
                        onChange={(val)=>{
                          setBriksClient(val)
                          getPharmacieBricks(mois,qteCA,val.value)
                        }}
                        options={optionBriks}
                        placeholder="Briks"
                      />
                      <br></br>
                    </Col>
                  </Row>
                </Card.Header>
                <Card.Body>
                  {valClientBriks != null ? <Bar data={valClientBriks} height={"70"} /> : ""} 
                </Card.Body>
              </Card>
            </Col>
        </Row>
        {/* end  Pharmacie Bricks */}

        {/* start  Bricks */}
        <Row>
          <Col md="12">
            <Card>
              <Card.Header>
                <Row>
                  <Col md="3" className="pr-1">
                    <Card.Title as="h4">
                      {qteCA.value === 1
                        ? "QTE vendue par les BL selon Bricks"
                        : "CA généré par les BL selon Bricks"}
                    </Card.Title>
                  </Col>
                  <Col md="9">
                    <Select
                      isMulti
                      className="react-select primary select-print"
                      classNamePrefix="react-select"
                      name="singleSelect"
                      value={briksSelected}
                      onChange={(val)=>{
                        var nb = val.length;
                        /* setLimitBricks(nb); */
                        setBricksSelected(val)
                        getBricks(mois,qteCA,val,nb)
                      }}
                      options={optionBriks}
                      placeholder="Briks"
                    />
                    <br></br>
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body>
                {dataBricks != null ? <Bar data={dataBricks} height={"70"} /> : ""} 
              </Card.Body>
            </Card>
          </Col>
        </Row>
        {/* end  Bricks */}

        {/* start  délégué */}
        <Row>
          <Col md="12">
            <Card>
              <Card.Header>
                <Row>
                  <Col md="3" className="pr-1">
                    <Card.Title as="h4">
                      {qteCA.value === 1
                        ? "QTE vendue par les BL par délégué"
                        : "CA géneré par les BL par délégué"}
                    </Card.Title>
                  </Col>
                  <Col md="9">
                    <Select
                      isMulti
                      className="react-select primary select-print"
                      classNamePrefix="react-select"
                      name="singleSelect"
                      value={userSelected}
                      onChange={(val)=>{
                        var nb = val.length;
                       /*  setLimitDelegue(nb); */
                        setUserSelected(val)
                        getBLParDelegue(mois,qteCA,val,nb)
                      }}
                      options={optionUser}
                      placeholder="Délégué"
                    />
                    <br></br>
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body>
                {dataDelegue != null ? (<Bar data={dataDelegue} height={"70"} />) : ""}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        {/* end  délégué */}

        {/* start  Marche */}
        <Row>
          <Col md="12">
            <Card>
              <Card.Header>
                <Row>
                  <Col md="3" className="pr-1">
                    <Card.Title as="h4">
                      {qteCA.value === 1
                        ? "QTE (BL) vendue par marchè"
                        : "CA (BL) géneré par marchè"}
                    </Card.Title>
                  </Col>
                  <Col md="9">
                    <Select
                      isMulti
                      className="react-select primary select-print"
                      classNamePrefix="react-select"
                      name="singleSelect"
                      value={marcheSelected}
                      onChange={(val)=>{
                        var nb = val.length;
                        /* setLimitMarche(nb); */
                        setMarcheSelected(val);
                        getMarche(mois, qteCA, val,nb);
                      }}
                      options={optionMarche}
                      placeholder="Marche"
                    />
                    <br></br>
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body>
                {dataMarche != null ? <Bar data={dataMarche} height={"70"} /> : ""} 
              </Card.Body>
            </Card>
          </Col>
        </Row>
        {/* end  Marche */}
        </div>
      </Container>
    </>
  );
}

export default SuperDashBoard;
