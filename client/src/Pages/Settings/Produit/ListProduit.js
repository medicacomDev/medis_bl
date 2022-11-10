import ReactTable from "../../../components/ReactTable/ReactTable.js";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import React,{useEffect,useCallback} from "react";
import { fetchProduit,produitChangeEtat } from "../../../Redux/produitReduce";
import { useDispatch } from "react-redux";
import NotificationAlert from "react-notification-alert";
import { useNavigate } from "react-router-dom";
import { verification } from "../../../Redux/usersReduce";

// core components
function ListUser() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notificationAlertRef = React.useRef(null); 
  const [entities, setEntities] = React.useState([]);
  const notify = (place, msg, type) => {
    var options = {};
    options = {
      place: place,
      message: (
        <div>
          <div>
            {msg}
          </div>
        </div>
      ),
      type: type,
      icon: "nc-icon nc-bell-55",
      autoDismiss: 7,
    };
    notificationAlertRef.current.notificationAlert(options);
  };
  function ajouter() {
    navigate('/ajouterProduit');
    /* window.location.href = "/ajouterProduit"; */
  }
  
  function changeEtat(id,e) {
    dispatch(produitChangeEtat( id )).then(e1=>{
      getProduit();
      switch(e){
        case 0: notify("tr", "Présentations activer avec succes", "success");break; 
        case 1:notify("tr", "Présentations désactiver avec succes", "success");break;
        default:break;
      }  
    }); 
  }
  
  const getProduit = useCallback(async (titre) => {
    var marche = await dispatch(fetchProduit());
    setEntities(marche.payload);
  }, [dispatch]);

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
    getProduit()
  }, [getProduit,verifToken]) //now shut up eslint
  return (
    <>
      <Container fluid>
        <div className="rna-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        <Row>
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
              Ajouter un présentation
            </Button>
          </Col>
          <Col md="12">
            <h4 className="title">Liste des présentations</h4>
            <Card>
              <Card.Body>
                <ReactTable
                  data={entities}
                  columns={[
                    {
                      Header: "designation",
                      accessor: "designation",
                    },
                    {
                      Header: "code",
                      accessor: "code",
                    },
                    {
                      Header: "prix",
                      accessor: "prix",
                    },
                    {
                      Header: "Produits",
                      accessor: "marcheims.lib",
                    },
                    {
                      Header: "Etat",
                      accessor: "etat",
                      Cell: ({ cell }) => (cell.row.values.etat === 1?"Activé":"Désactive"),
                    },
                    {
                      Header: "actions",
                      accessor: "id",
                      Cell: ({ cell }) => (
                        <div className="actions-right block_action">
                          <Button
                            onClick={() => {
                              navigate("/produit/update/" + cell.row.values.id);
                              /* window.location.replace(
                                "/produit/update/" + cell.row.values.id
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
                              changeEtat(cell.row.values.id,cell.row.values.etat);
                            }}
                            variant="danger"
                            size="sm"
                            className={cell.row.values.etat === 1?"text-success btn-link delete":"text-danger btn-link delete"}
                          >
                            <i className={cell.row.values.etat === 1?"fa fa-check":"fa fa-times"} id={"idLigne_" + cell.row.values.id}/>
                          </Button>
                        </div>
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

export default ListUser;
