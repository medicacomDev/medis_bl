import NotificationAlert from "react-notification-alert";
import ReactTable from "../../../components/ReactTable/ReactTable.js";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import React,{useEffect,useCallback} from "react";
import { fetchAtc,atcChangerEtat } from "../../../Redux/atcReduce";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { verification } from "../../../Redux/usersReduce";

// core components
function ListAtc() {
  document.title = "Liste des gammes";
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
    navigate('/ajouterAtc');
    /* window.location.href = "/ajouterAtc"; */
  }
  function changeEtat(id,e) {
    dispatch(atcChangerEtat( id )).then(e1=>{
      getAtc();
      switch(e){
        case 0: notify("tr", "Activer avec succes", "success");break; 
        case 1:notify("tr", "Désactiver avec succes", "success");break;
        default:break;
      }  
    }); 
  }

  const getAtc = useCallback(async (titre) => {
    var atc = await dispatch(fetchAtc());
    setEntities(atc.payload);
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
    getAtc()
  }, [getAtc,verifToken]) //now shut up eslint
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
              Ajouter un gamme
            </Button>
          </Col> 
          <Col md="12">
            <h4 className="title">Liste des gammes</h4>
            <Card>
              <Card.Body>
                <ReactTable
                  data={entities}
                  columns={[
                    {
                      Header: "Atc",
                      accessor: "atcs.nom",
                    },
                    {
                      Header: "Produit",
                      accessor: "marche",
                    },
                    {
                      Header: "Etat",
                      accessor: "atcs.etat",
                      Cell: ({ cell }) => (cell.row.original.atcs.etat === 1?"Activé":"Désactive"),
                    },
                    {
                      Header: "actions",
                      accessor: "atcs.id",
                      Cell: ({ cell }) => (
                        <div className="actions-right block_action">
                          <Button
                            onClick={() => {
                              navigate("/atc/update/" + cell.row.original.atcs.id);
                             /*  window.location.replace("/atc/update/" + cell.row.original.atcs.id); */
                            }}
                            variant="warning"
                            size="sm"
                            className="text-warning btn-link edit"
                          >
                            <i className="fa fa-edit" />
                          </Button>
                          <Button
                            id={"idLigne_" + cell.row.original.atcs.id}
                            onClick={(event) => {
                              changeEtat(cell.row.original.atcs.id,cell.row.original.atcs.etat);   
                            }}
                            variant="danger"
                            size="sm"
                            className={cell.row.original.atcs.etat === 1?"text-success btn-link delete":"text-danger btn-link delete"}
                          >
                            <i className={cell.row.original.atcs.etat === 1?"fa fa-check":"fa fa-times"} id={"idLigne_" + cell.row.original.atcs.id}/>
                          </Button>
                        </div>
                      ),
                    },
                  ]} 
                  className="-striped -highlight primary-pagination"
                />
                {entities.length === 0 ? (
                  <div className="text-center">Aucun donnée trouvé</div>
                ) : ""}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default ListAtc;
