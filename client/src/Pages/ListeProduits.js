import React,{useCallback} from "react";
import Select from "react-select";
import { useDispatch } from "react-redux";
import {
  Card,
  Container,
  Row,
  Col,
  Button
} from "react-bootstrap";
import ReactExport from "react-export-excel";
import { tableProduits,exportBl,getExport } from "../Redux/blReduce";
import jwt_decode from "jwt-decode";
import ReactTable from "../components/ReactTable/ReactTable.js";
import SweetAlert from "react-bootstrap-sweetalert";
import { verification } from "../Redux/usersReduce";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function ListeProduits() {
  document.title = "Liste des présentations";
  const dispatch = useDispatch();
  var token = localStorage.getItem("x-access-token");
  var decoded = jwt_decode(token);
  const idLine = decoded.line
  const idRole = decoded.idrole
  var dateToday = new Date();
  var produitDate = dateToday.getDate() + "/" + (dateToday.getMonth() + 1) + "/" + dateToday.getFullYear();
  var anneeLocal =localStorage.getItem("annee");
  const [alert, setAlert] = React.useState(null);
  const confirmMessage = (trimestre,anneeLocal) => {
    setAlert(
      <SweetAlert
        style={{ display: "block", marginTop: "-100px" }}
        title={"Étes vous sûre d'exporter ?"}
        onConfirm={() => exporter(trimestre,anneeLocal)}
        onCancel={() => hideAlert()}
        confirmBtnBsStyle="info"
        cancelBtnBsStyle="danger"
        confirmBtnText="Oui"
        cancelBtnText="Non"
        showCancel
      >
      </SweetAlert>
    );
  };
  const hideAlert = () => {
    setAlert(null);
  };
  const [trimestre, setTrimestre] = React.useState({
    value: 0,
    label: "Tous",
  });
  const [optionsTrimestre] = React.useState([
    {
      value: "",
      label: "Trimestre",
      isDisabled: true,
    },
    { value: 0, label: "Tous" },
    { value: 1, label: "Trimestre 1" },
    { value: 2, label: "Trimestre 2" },
    { value: 3, label: "Trimestre 3" },
    { value: 4, label: "Trimestre 4" },
  ]);
  const [data, setData] = React.useState([]);
  const [dataExport, setDataExport] = React.useState([]);

  const listeProduits = useCallback(async (trimestre,anneeLocal) => {
    var prod = await dispatch(tableProduits({
      idLine: idLine,
      idRole:idRole,
      annee: parseInt(anneeLocal),
      trimestre: trimestre.value
    }));
    setData(prod.payload);
    var user = await dispatch(getExport());
    setDataExport(user.payload)
  }, [dispatch,idLine,idRole]);

  const exporter = useCallback(async (trimestre,anneeLocal) => {
    /* var role = await dispatch(exportBl()); */
    dispatch(exportBl()).then(()=>{
      document.getElementById("export").click();
      hideAlert();
      listeProduits(trimestre,anneeLocal);
    });
  }, [dispatch,listeProduits]);

  //verif token
  const verifToken = useCallback(async () => {
    var response = await dispatch(verification());
    if(response.payload === false){
      localStorage.clear();
      window.location.replace("/login");
    }
  }, [dispatch]);
  React.useEffect(() => {
    verifToken();
    listeProduits(trimestre,anneeLocal);
  }, [listeProduits,trimestre,anneeLocal,verifToken]);

  return (
    <>
      {alert}
      <Container fluid>
        <Row>
          <Col md="12">
            <h4 className="title">Tableau recupulatif des donnèes BL</h4>
            <Card>
              <Card.Body>
                <Row>
                  <Col md="3" className="pr-1">
                    <label htmlFor="exampleInputEmail1">Trimestre</label>
                    <Select
                      className="react-select primary"
                      classNamePrefix="react-select" 
                      value={trimestre}
                      onChange={(value) => {
                        setTrimestre(value);                        
                        listeProduits(value,anneeLocal);
                      }}
                      options={optionsTrimestre}
                      placeholder="Trimestre"
                    />
                    <br></br>
                  </Col>
                  <Col md="9" className="pdfExcel">
                    <span>
                      <Button onClick={()=>confirmMessage(trimestre,anneeLocal)}>
                        Export Excel<i className="fas fa-file-excel"></i>
                      </Button>
                    </span>
                  </Col>
                  <Col md="12" className="hidden">
                    <ExcelFile
                      className="hidden"
                      element={<button id="export">Export Excel</button>}
                      filename={produitDate + "Présentations"}
                    >
                      <ExcelSheet data={data} name="Produits">
                        <ExcelColumn label="idBl" value="idBl" />
                        <ExcelColumn label="Numero BL" value="numeroBL" />
                        <ExcelColumn label="Pharmacie" value="nomClt" />
                        <ExcelColumn label="Nom délegué" value="nomDelegue" />
                        <ExcelColumn label="Bricks" value="ims" />
                        <ExcelColumn label="Fournisseur" value="fournisseur" />
                        <ExcelColumn label="Désigantion" value="designation" />
                        <ExcelColumn label="Bonification" value="bonification" />
                        <ExcelColumn label="Nom pack" value="pack" />
                        <ExcelColumn label="Jour" value="day" />
                        <ExcelColumn label="Mois" value="month" />
                        <ExcelColumn label="Année" value="annee" />
                        <ExcelColumn label="Quantite" value="qte" />
                        <ExcelColumn label="Total TTC" value="mnt" />
                        <ExcelColumn label="Date insertion" value="dateInsertion" />
                        <ExcelColumn label="Date validation" value="dateValidation" />
                      </ExcelSheet>
                    </ExcelFile>
                  </Col>
                </Row>
                <ReactTable
                  data={data}
                  columns={[
                    {
                      Header: "Numero BL",
                      accessor: "numeroBL",
                    },
                    {
                      Header: "nomDelegue",
                      accessor: "nomDelegue",
                    },
                    {
                      Header: "Pharmacie",
                      accessor: "nomClt",
                    },
                    {
                      Header: "Fournisseur",
                      accessor: "fournisseur",
                    },
                    {
                      Header: "Désignation",
                      accessor: "designation",
                    },
                    {
                      Header: "Jour",
                      accessor: "day",
                    },
                    {
                      Header: "Mois",
                      accessor: "month",
                    },
                    {
                      Header: "Annee",
                      accessor: "annee",
                    },
                    {
                      Header: "pack",
                      accessor: "pack",
                    },
                    {
                      Header: "bonification",
                      accessor: "bonification",
                    },
                    {
                      Header: "Quantite",
                      accessor: "qte",
                    },
                    {
                      Header: "Total TTC",
                      accessor: "mnt",
                    },
                    {
                      Header: "",
                      accessor: "vide",
                      sortable: false,
                      filterable: false,
                    },
                  ]}
                  className="-striped -highlight primary-pagination"
                />
                {
                  data.length === 0 ? <div className="text-center">Aucun présentations trouvé</div> : ""
                }
              </Card.Body>
            </Card>
          </Col>
          {idRole!==1?
            <Col md="12">
              <h4 className="title">Historique de téléchargement</h4>
              <Card>
                <Card.Body>                  
                  <ReactTable
                    data={dataExport}
                    columns={[
                      {
                        Header: "nom",
                        accessor: "users.nomU",
                      },
                      {
                        Header: "prenom",
                        accessor: "users.prenomU",
                      },
                      {
                        Header: "Date",
                        accessor: "createdAt",
                        Cell: ({ cell }) => (
                          <div className="block_action">
                            {cell.row.values.createdAt !== null
                              ? new Date(new Date(cell.row.values.createdAt).getTime() - (new Date(cell.row.values.createdAt).getTimezoneOffset() * 60000)).toISOString().slice(0, 16).replace("T", " à ")
                              : ""}
                          </div>
                        ),
                      },
                      {
                        Header: "",
                        accessor: "vide",
                        sortable: false,
                        filterable: false,
                      },
                    ]}
                    className="-striped -highlight primary-pagination"
                  />
                  {
                    dataExport.length === 0 ? <div className="text-center">Aucun présentations trouvé</div> : ""
                  }
                </Card.Body>
              </Card>
            </Col>
          :""}
        </Row>
      </Container>
    </>
  );
}

export default ListeProduits;
