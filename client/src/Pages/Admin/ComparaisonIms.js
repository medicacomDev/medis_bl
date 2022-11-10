import React,{useCallback} from "react";
import Select from "react-select";
import { useDispatch } from "react-redux";
import {
  Card,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import ReactExport from "react-export-excel";
import { comparaisonImsBricks,comparaisonMarcheIms } from "../../Redux/blReduce";
import { verification } from "../../Redux/usersReduce";
import ReactTable from "../../components/ReactTable/ReactTable.js";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function ListeProduits() {
  document.title = "Comparaison Ims";
  const dispatch = useDispatch();
  var dateToday = new Date();
  var produitDate = dateToday.getDate() + "/" + (dateToday.getMonth() + 1) + "/" + dateToday.getFullYear();
  var anneeLocal =localStorage.getItem("annee");
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
  const [dataBricks, setDataBricks] = React.useState([]);
  const [dataMarche, setDataMarche] = React.useState([]);

  const getBricks = useCallback(async (mois,anneeLocal) => {
    var bricks = await dispatch(comparaisonImsBricks({
      year: parseInt(anneeLocal),
      mois: mois.value
    }));
    setDataBricks(bricks.payload.list);
  }, [dispatch]);

  const getMarche = useCallback(async (mois,anneeLocal) => {
    var marche = await dispatch(comparaisonMarcheIms({
      year: parseInt(anneeLocal),
      mois: mois.value
    }));
    setDataMarche(marche.payload.list);
  }, [dispatch]);

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
    getBricks(mois,anneeLocal);
    getMarche(mois,anneeLocal);
  }, [getBricks,getMarche,anneeLocal,mois,verifToken]);

  return (
    <>
      <Container fluid>
        <Row>
          <Col md="12">
            <h4 className="title">Tableau recupulatif donnèes BL</h4>
            <Card>
              <Card.Body>
                <Row>
                  <Col md="3" className="pr-1">
                    <label htmlFor="exampleInputEmail1">Mois</label>
                    <Select
                      className="react-select primary"
                      classNamePrefix="react-select" 
                      value={mois}
                      onChange={(value) => {
                        setMois(value);
                        getMarche(value,anneeLocal);
                        getBricks(value,anneeLocal);
                      }}
                      options={optionsMois}
                      placeholder="Mois"
                    />
                    <br></br>
                  </Col>
                  <Col md="9" className="pdfExcel">
                    <ExcelFile
                      element={<button>Export Excel</button>}
                      filename={produitDate + "ImsBricks"}
                    >
                      <ExcelSheet data={dataBricks} name="Bricks">
                        <ExcelColumn label="Bricks" value="ims" />
                        <ExcelColumn label="CA BL" value="mntBl" />
                        <ExcelColumn label="CA IMS" value="mntDetail" />
                        <ExcelColumn label="Quantité BL" value="qteBl" />
                        <ExcelColumn label="Quantité IMS" value="qteDetail" />
                      </ExcelSheet>
                    </ExcelFile>
                  </Col>
                </Row>
                <ReactTable
                  data={dataBricks}
                  columns={[
                    {
                      Header: "Bricks",
                      accessor: "ims",
                      sortable: true,
                      filterable: true,
                    },
                    {
                      Header: "CA BL",
                      accessor: "mntBl",
                    },
                    {
                      Header: "CA IMS",
                      accessor: "mntDetail",
                    },
                    {
                      Header: "Quantité BL",
                      accessor: "qteBl",
                    },
                    {
                      Header: "Quantité IMS",
                      accessor: "qteDetail",
                    },
                    {
                      Header: "",
                      accessor: "vide",
                      sortable: true,
                      filterable: true,
                    },
                  ]}
                  className="-striped -highlight primary-pagination"
                />
                {
                  dataBricks.length === 0 ? <div className="text-center">Aucun présentations trouvé</div> : ""
                }
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md="12">
            <h4 className="title">Tableau recupulatif donnèes BL</h4>
            <Card>
              <Card.Body>
                <Row>
                  <Col md="3" className="pr-1">
                    <label htmlFor="exampleInputEmail1">Mois</label>
                    <Select
                      className="react-select primary"
                      classNamePrefix="react-select" 
                      value={mois}
                      onChange={(value) => {
                        setMois(value);
                        getMarche(value,anneeLocal);
                        getBricks(value,anneeLocal);
                      }}
                      options={optionsMois}
                      placeholder="Mois"
                    />
                    <br></br>
                  </Col>
                  <Col md="9" className="pdfExcel">
                    <ExcelFile
                      element={<button>Export Excel</button>}
                      filename={produitDate + "ImsMarché"}
                    >
                      <ExcelSheet data={dataMarche} name="Marché">
                        <ExcelColumn label="Produit" value="marche" />
                        <ExcelColumn label="CA BL" value="mntBl" />
                        <ExcelColumn label="CA IMS" value="mntDetail" />
                        <ExcelColumn label="Quantité BL" value="qteBl" />
                        <ExcelColumn label="Quantité IMS" value="qteDetail" />
                      </ExcelSheet>
                    </ExcelFile>
                  </Col>
                </Row>
                <ReactTable
                  data={dataMarche}
                  columns={[
                    {
                      Header: "Produit",
                      accessor: "marche",
                      sortable: true,
                      filterable: true,
                    },
                    {
                      Header: "CA BL",
                      accessor: "mntBl",
                    },
                    {
                      Header: "CA IMS",
                      accessor: "mntDetail",
                    },
                    {
                      Header: "Quantité BL",
                      accessor: "qteBl",
                    },
                    {
                      Header: "Quantité IMS",
                      accessor: "qteDetail",
                    },
                    {
                      Header: "",
                      accessor: "vide",
                      sortable: true,
                      filterable: true,
                    },
                  ]}
                  className="-striped -highlight primary-pagination"
                />
                {
                  dataBricks.length === 0 ? <div className="text-center">Aucun présentations trouvé</div> : ""
                }
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default ListeProduits;
