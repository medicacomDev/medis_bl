import React, { useCallback, useEffect } from "react";
import { getBlByClientId, getBlByCmd, getBlById, getDetailBl } from "../../../../Redux/blReduce";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router";
import { Card, Container,Row,Col,Button } from "react-bootstrap";
import ReactTable from "../../../../components/ReactTable/ReactTable.js";
import SweetAlert from "react-bootstrap-sweetalert";

// core components
function DetailSuivi() {
  document.title = "Détail suivis";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useParams();
  const path = useLocation();
  var splitPath =(path.pathname.split("/"))
  const [alert, setAlert] = React.useState(null);
  var idClient = 0;
  var idAction = 0;
  var idCmd = 0;
  if(splitPath[1]==="detailSuivi"){
    idClient = location.idClient;
    idAction = location.idAction;
  } else {
    idCmd = location.idCmd;
  }
  const [entities, setEntities] = React.useState([]);
  const getPackProduit = useCallback(
    async () => {
      var client = null;
      if(splitPath[1]==="detailSuivi")
        client = await dispatch(getBlByClientId({ idClient,idAction }));
      else 
        client = await dispatch(getBlByCmd(idCmd));
      setEntities(client.payload);
    },
    [dispatch]
  );
  const detailBl = useCallback(async (idBl) => {
  var det = await dispatch(getDetailBl(idBl));
  var data = await det.payload;
  var dataBl = await dispatch(getBlById(idBl));
  var bl = await dataBl.payload;
  var s = 0;
    setAlert(
      <SweetAlert
        customClass="pop-up-bl"
        style={{ display: "block", marginTop: "-100px" }}
        title={"Détail BL"}
        onConfirm={() => hideAlert()}
        cancelBtnBsStyle="danger"
      >
        <table className="table table-bordered">
          <thead>
            <tr className="table-info">
              <th>Nom délégue</th>
              <th>Numéro BL</th>
              <th>Date BL</th>
              <th>Pharmacie</th>
              <th>Fournisseur</th>
              <th>Bricks</th>
              <th>Objectif</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{bl.users.nomU + " " + bl.users.prenomU}</td>
              <td>{bl.numeroBL}</td>
              <td>{bl.dateBl}</td>
              <td>{bl.pharmacies.nom}</td>
              <td>{bl.fournisseur}</td>
              <td>{bl.ims.libelle}</td>
              <td>{bl.actions.nom}</td>
            </tr>
          </tbody>
        </table>
        <table className="table table-bordered">
          <thead>
            <tr className="table-info">
              <th>Produit</th>
              <th>Code PCT</th>
              <th>Quantité</th>
              <th>Pack</th>
              <th>PU</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            {data.map((e) => {
              s += parseFloat(e.montant);
              return (
                <tr key={"ligne-" + e.id}>
                  <td>{e.produits.designation}</td>
                  <td>{e.produits.code}</td>
                  <td>{e.quantite}</td>
                  <td>{e.packs.nom}</td>
                  <td>{(e.montant / e.quantite).toFixed(3)}</td>
                  <td>{e.montant.toFixed(3)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <h2>{"Total: " + s.toFixed(3)}</h2>
      </SweetAlert>
    );
  }, [dispatch]);

  useEffect(() => {
    getPackProduit();
  }, [getPackProduit]); //now shut up eslint
  const hideAlert = () => {
    setAlert(null);
  };
  function paymentBl(id, idBl) {
    /*** 0. save decharge *** 1. get decharge *** 2. get file bl ***/
    navigate("/telechargerFichier/"+idBl+"/"+id);
  }
  return (
    <>
      {alert}
      <Container>
        <Row>
          <Col md="12">
            <Button
              className="btn-wd btn-outline mr-1 float-left"
              type="button"
              variant="info"
              onClick={()=>{
                var nav = localStorage.getItem("returnVis")
                navigate(nav);                
              }}
            >
              <span className="btn-label">
                <i className="fas fa-list"></i>
              </span>
              Retour à la liste
            </Button>
          </Col>
        </Row>
        <Card>
          <Card.Body>
            <ReactTable
              data={entities}
              columns={[
                {
                  Header: "Numéro BL",
                  accessor: "numeroBl",
                },
                {
                  Header: "Nom Délégué",
                  accessor: "users",
                },
                {
                  Header: "Pharmacies",
                  accessor: "pharmacie",
                },
                {
                  Header: "Objectif",
                  accessor: "action",
                },
                {
                  Header: "Total",
                  accessor: "mnt",
                },
                {
                  Header: "Date",
                  accessor: "date",
                  Cell: ({ cell }) => (
                    <div className="block_action">
                      {cell.row.values.date !== null
                        ? new Date(cell.row.values.date)
                            .toISOString()
                            .slice(0, 10)
                        : ""}
                    </div>
                  ),
                },
                {
                  Header: "détail",
                  accessor: "id",
                  Cell: ({ cell }) =>
                    (
                    <Button
                      id={"idLigne_" + cell.row.values.id}
                      onClick={(e) => {
                        paymentBl(cell.row.values.id,2);
                        localStorage.setItem("file", cell.row.original.file);
                        if(splitPath[1]==="detailSuivi")
                          localStorage.setItem("returnList", "detailSuivi/"+idClient+"/"+idAction);
                        else
                          localStorage.setItem("returnList", "detailCmd/"+idCmd);
                        /* detailBl(cell.row.values.id); */
                      }}
                      className="btn btn-info ml-1 visualiser"
                    >
                      <i
                        className="fa fa-eye"
                        id={"idLigne_" + cell.row.values.id}
                      />
                    </Button>),
                },
              ]}
              className="-striped -highlight primary-pagination"
            />
            {entities.length === 0 ? (
              <div className="text-center">Aucun présentations trouvé</div>
            ) : ""}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default DetailSuivi;
