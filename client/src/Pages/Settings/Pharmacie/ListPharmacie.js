import NotificationAlert from "react-notification-alert";
import ReactTable from "../../../components/ReactTable/ReactTable.js";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import React, { useEffect, useCallback } from "react";
import {
  fetchPharmacie,
  pharmacieChangeEtat,
  getPharmacieByBricks
} from "../../../Redux/pharmacieReduce";
import { getIdSecteurIms } from "../../../Redux/secteurReduce";
import { useDispatch } from "react-redux";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { verification } from "../../../Redux/usersReduce";

// core components
function ListPharmacie() {
  document.title = "Liste des pharmacies";
  const navigate = useNavigate();
  var token = localStorage.getItem("x-access-token");
  var decoded = jwt_decode(token);
  const idRole = decoded.idrole;
  const idSect = decoded.idsect;
  const dispatch = useDispatch();
  const notificationAlertRef = React.useRef(null);
  const [entities, setEntities] = React.useState([]);
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
  function ajouter() {
    navigate('/ajouterPharmacie');
    /* window.location.href = "/ajouterPharmacie"; */
  }
  function changeEtat(id, e) {
    dispatch(pharmacieChangeEtat(id)).then((e1) => {
      getPharmacie();
      switch (e) {
        case 0:
          notify("tr", "Pharmacie activer avec succes", "success");
          break;
        case 1:
          notify("tr", "Pharmacie désactiver avec succes", "success");
          break;
        default:
          break;
      }
    });
  }

  const getPharmacie = useCallback(async () => {
    var pharmacie = null;
    /* if(idRole === 2){
      var secteur = await dispatch(getIdSecteurIms(idSect));
      var idBricks = secteur.payload;
      pharmacie = await dispatch(getPharmacieByBricks({idBricks}));
    }      
    else{
      pharmacie = await dispatch(fetchPharmacie());
    } */
    
    if(idRole === 2){
      var secteur = await dispatch(getIdSecteurIms(idSect));
      var idBricks = secteur.payload;
      if(idBricks[0] === 0)
        pharmacie = await dispatch(fetchPharmacie());
      else
        pharmacie = await dispatch(getPharmacieByBricks({idBricks}));
    }      
    else{
      pharmacie = await dispatch(fetchPharmacie());
    }
    setEntities(pharmacie.payload);
  }, [dispatch,idRole,idSect]);

  //verif token
  const verifToken = useCallback(async () => {
    var response = await dispatch(verification());
    if(response.payload === false){
      localStorage.clear();
      window.location.replace("/login");
    }
  }, [dispatch]);

  useEffect(() => {
    verifToken();
    getPharmacie();
  }, [getPharmacie,verifToken]); //now shut up eslint
  return (
    <>
      <Container fluid>
        <div className="rna-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        <Row>
          {idRole === 0 ? (
            <Col md="12">
              <Button
                id="saveBL"
                className="btn-wd btn-outline mr-1 float-left"
                type="button"
                variant="info"
                onClick={ajouter}
              >
                <span className="btn-label">
                  <i className="fas fa-plus"></i>
                </span>
                Ajouter un pharmacie
              </Button>
            </Col>
          ) : ""}
          <Col md="12">
            <h4 className="title">Liste des pharmacies</h4>
            <Card>
              <Card.Body>
                <ReactTable
                  data={entities}
                  columns={[
                    {
                      Header: "Pharmacie",
                      accessor: "nom",
                    },
                    {
                      Header: "Etat",
                      accessor: "etat",
                      Cell: ({ cell }) =>
                        cell.row.values.etat === 1 ? "Activé" : "Désactive",
                    },
                    {
                      Header: "actions",
                      accessor: "id",
                      Cell: ({ cell }) => (
                        idRole === 0 ?
                        <div className="actions-right block_action">
                          <Button
                            onClick={() => {
                              navigate("/pharmacie/update/" + cell.row.values.id);
                              /* window.location.replace(
                                "/pharmacie/update/" + cell.row.values.id
                              ); */
                            }}
                            variant="warning"
                            size="sm"
                            className="text-warning btn-link edit"
                          >
                            <i className="fa fa-edit" />
                          </Button>
                          <Button
                            id={"idLigne_" + cell.row.values.id}
                            onClick={(event) => {
                              changeEtat(
                                cell.row.values.id,
                                cell.row.values.etat
                              );
                            }}
                            variant="danger"
                            size="sm"
                            className={
                              cell.row.values.etat === 1
                                ? "text-success btn-link delete"
                                : "text-danger btn-link delete"
                            }
                          >
                            <i
                              className={
                                cell.row.values.etat === 1
                                  ? "fa fa-check"
                                  : "fa fa-times"
                              }
                              id={"idLigne_" + cell.row.values.id}
                            />
                          </Button>
                        </div>:""
                      ),
                    },
                  ]}
                  className="-striped -highlight primary-pagination"
                />
                {entities.length === 0 ? (
                  <div className="text-center">Aucun donnée trouvé</div>
                ) : (
                  ""
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default ListPharmacie;
